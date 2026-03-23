import "dotenv/config"
import { Worker, Job } from "bullmq"
import { processImage } from "./processors/image"
import { processVideo } from "./processors/video"
import { MediaJobData, JobResult } from "./types"
import { IMAGE_QUEUE, VIDEO_QUEUE } from "./lib/queues"
import { getSupabase } from "./lib/supabase"

function makeConnection() {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    ...(process.env.REDIS_PASSWORD
      ? { password: process.env.REDIS_PASSWORD }
      : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
}

function makeWorker(
  queueName: string,
  processor: (job: Job<MediaJobData>) => Promise<JobResult>,
) {
  const worker = new Worker<MediaJobData, JobResult>(queueName, processor, {
    connection: makeConnection(),
    concurrency: queueName === VIDEO_QUEUE ? 2 : 4,
    limiter: { max: 20, duration: 1000 },
  })

  worker.on("active", (job) => {
    console.log(
      `[${queueName}] ▶ job ${job.id} started (file: ${job.data.fileId})`,
    )
  })

  worker.on("progress", (job, progress) => {
    console.log(`[${queueName}] ⟳ job ${job.id} ${progress}%`)
  })

  worker.on("completed", (job, result) => {
    console.log(
      `[${queueName}] ✓ job ${job.id} done in ${result.processingMs}ms`,
    )
  })

  worker.on("failed", (job, err) => {
    console.error(`[${queueName}] ✗ job ${job?.id} failed: ${err.message}`)
  })

  worker.on("error", (err) => {
    console.error(`[${queueName}] worker error:`, err.message)
  })

  return worker
}

const imageWorker = makeWorker(IMAGE_QUEUE, processImage)
const videoWorker = makeWorker(VIDEO_QUEUE, processVideo)

async function shutdown() {
  console.log("Shutting down workers...")
  await Promise.all([imageWorker.close(), videoWorker.close()])
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

console.log(`Workers started — image concurrency: 4, video concurrency: 2`)