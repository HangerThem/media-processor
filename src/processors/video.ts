import { execFile } from "child_process"
import { promisify } from "util"
import { writeFile, readFile, mkdir, rm, stat } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"
import { Job } from "bullmq"
import { getSupabase } from "../lib/supabase"
import { MediaJobData, JobResult } from "../types"
import { prisma } from "../lib/prisma"

const execFileAsync = promisify(execFile)

async function ffprobe(
  inputPath: string,
): Promise<{ duration: number; width: number; height: number }> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_streams",
    inputPath,
  ])
  const data = JSON.parse(stdout)
  const video = data.streams.find((s: any) => s.codec_type === "video")
  return {
    duration: parseFloat(video?.duration ?? "0"),
    width: video?.width ?? 0,
    height: video?.height ?? 0,
  }
}

export async function processVideo(job: Job<MediaJobData>): Promise<JobResult> {
  const start = Date.now()
  const { fileId, bucket, path } = job.data
  const supabase = getSupabase()

  const tmpDir = join(tmpdir(), `media-${fileId}`)
  await mkdir(tmpDir, { recursive: true })

  const inputPath = join(tmpDir, "input.video")
  const thumbPath = join(tmpDir, "thumbnail.webp")
  const previewPath = join(tmpDir, "preview.mp4")

  try {
    await job.updateProgress(5)

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path)
    if (downloadError)
      throw new Error(`Download failed: ${downloadError.message}`)

    await writeFile(inputPath, Buffer.from(await fileData.arrayBuffer()))

    await job.updateProgress(20)

    const meta = await ffprobe(inputPath)

    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: "processing",
        width: meta.width,
        height: meta.height,
        duration: meta.duration,
      },
    })

    await job.updateProgress(30)

    const thumbAt = Math.min(1, meta.duration * 0.1).toFixed(2)

    await execFileAsync("ffmpeg", [
      "-ss",
      thumbAt,
      "-i",
      inputPath,
      "-frames:v",
      "1",
      "-vf",
      "scale=640:-2",
      "-y",
      thumbPath,
    ])

    await job.updateProgress(55)

    const previewDuration = Math.min(5, meta.duration)
    await execFileAsync("ffmpeg", [
      "-i",
      inputPath,
      "-t",
      String(previewDuration),
      "-vf",
      "scale=-2:'min(720,ih)'",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "28",
      "-movflags",
      "+faststart",
      "-y",
      previewPath,
    ])

    await job.updateProgress(75)

    const [thumbData, previewData] = await Promise.all([
      readFile(thumbPath),
      readFile(previewPath),
    ])

    const previewStat = await stat(previewPath)

    const storedThumbPath = `derivatives/${fileId}/thumbnail.webp`
    const storedPreviewPath = `derivatives/${fileId}/preview.mp4`

    const [thumbUpload, previewUpload] = await Promise.all([
      supabase.storage.from(bucket).upload(storedThumbPath, thumbData, {
        contentType: "image/webp",
        upsert: true,
      }),
      supabase.storage.from(bucket).upload(storedPreviewPath, previewData, {
        contentType: "video/mp4",
        upsert: true,
      }),
    ])

    if (thumbUpload.error)
      throw new Error(`Thumb upload failed: ${thumbUpload.error.message}`)
    if (previewUpload.error)
      throw new Error(`Preview upload failed: ${previewUpload.error.message}`)

    await job.updateProgress(90)

    const res = await prisma.fileDerivative.createMany({
      data: [
        {
          type: "thumbnail",
          storagePath: storedThumbPath,
          mimeType: "image/webp",
          size: thumbData.length,
          width: 640,
          height: Math.round((meta.height / meta.width) * 640),
          sourceId: fileId,
        },
        {
          type: "preview",
          storagePath: storedPreviewPath,
          mimeType: "video/mp4",
          size: previewStat.size,
          width: Math.round((meta.width / meta.height) * 720),
          height: 720,
          sourceId: fileId,
        },
      ],
    })

    if (res.count !== 2) throw new Error("Failed to record derivatives in DB")

    await prisma.file.update({
      where: { id: fileId },
      data: { status: "completed" },
    })

    await job.updateProgress(100)

    return {
      fileId,
      derivatives: [storedThumbPath, storedPreviewPath],
      processingMs: Date.now() - start,
    }
  } catch (err) {
    await prisma.file.update({
      where: { id: fileId },
      data: { status: "failed" },
    })

    throw err
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
