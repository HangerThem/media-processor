import sharp from "sharp"
import { Job } from "bullmq"
import { getSupabase } from "../lib/supabase"
import { MediaJobData, JobResult } from "../types"
import { prisma } from "../lib/prisma"

export async function processImage(job: Job<MediaJobData>): Promise<JobResult> {
  const start = Date.now()
  const { fileId, bucket, path } = job.data
  const supabase = getSupabase()

  await job.updateProgress(10)

  // 1. Download original
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(path)
  if (downloadError)
    throw new Error(`Download failed: ${downloadError.message}`)

  const buffer = Buffer.from(await fileData.arrayBuffer())
  const meta = await sharp(buffer).metadata()

  await job.updateProgress(30)

  // 2. Generate preview (max 1200px wide, WebP)
  const previewBuffer = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true })

  await job.updateProgress(55)

  // 3. Generate thumbnail (200x200 cover crop)
  const thumbBuffer = await sharp(buffer)
    .resize({ width: 200, height: 200, fit: "cover", position: "attention" })
    .webp({ quality: 75 })
    .toBuffer({ resolveWithObject: true })

  await job.updateProgress(70)

  // 4. Upload derivatives
  const previewPath = `derivatives/${fileId}/preview.webp`
  const thumbPath = `derivatives/${fileId}/thumbnail.webp`

  const [previewUpload, thumbUpload] = await Promise.all([
    supabase.storage.from(bucket).upload(previewPath, previewBuffer.data, {
      contentType: "image/webp",
      upsert: true,
    }),
    supabase.storage.from(bucket).upload(thumbPath, thumbBuffer.data, {
      contentType: "image/webp",
      upsert: true,
    }),
  ])

  if (previewUpload.error)
    throw new Error(`Preview upload failed: ${previewUpload.error.message}`)
  if (thumbUpload.error)
    throw new Error(`Thumbnail upload failed: ${thumbUpload.error.message}`)

  await job.updateProgress(88)

  // 5. Record derivatives in DB
  const res = await prisma.fileDerivative.createMany({
    data: [
      {
        type: "preview",
        storagePath: previewPath,
        mimeType: "image/webp",
        size: previewBuffer.data.length,
        width: meta.width,
        height: meta.height,
        sourceId: fileId,
      },
      {
        type: "thumbnail",
        storagePath: thumbPath,
        mimeType: "image/webp",
        size: thumbBuffer.data.length,
        width: 200,
        height: 200,
        sourceId: fileId,
      },
    ],
  })

  if (res.count !== 2) throw new Error("Failed to record derivatives in DB")

  await job.updateProgress(100)

  return {
    fileId,
    derivatives: [previewPath, thumbPath],
    processingMs: Date.now() - start,
  }
}
