import { Router, Request, Response } from "express"
import { Queue } from "bullmq"
import { authMiddleware } from "../lib/auth"
import { makeQueue, IMAGE_QUEUE, VIDEO_QUEUE } from "../lib/queues"
import { EnqueueRequest } from "../types"

const router = Router()

const queues: Record<string, Queue> = {
  image: makeQueue(IMAGE_QUEUE),
  video: makeQueue(VIDEO_QUEUE),
}

// POST /jobs/enqueue
router.post("/enqueue", authMiddleware, async (req: Request, res: Response) => {
  const body = req.body as EnqueueRequest

  if (!body.fileId || !body.bucket || !body.path || !body.type) {
    return res
      .status(400)
      .json({ error: "Missing required fields: fileId, bucket, path, type" })
  }

  if (body.type !== "image" && body.type !== "video") {
    return res.status(400).json({ error: 'type must be "image" or "video"' })
  }

  const queue = queues[body.type]
  const job = await queue.add(body.type, body, {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 500 }, // keep last 500 completed
    removeOnFail: { count: 200 },
  })

  return res.status(202).json({ jobId: job.id, queue: body.type })
})

// GET /jobs/:queue/:id
router.get(
  "/:queue/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const q = queues[req.params.queue]
    if (!q) return res.status(400).json({ error: "Unknown queue" })

    const job = await q.getJob(req.params.id)
    if (!job) return res.status(404).json({ error: "Job not found" })

    const state = await job.getState()

    return res.json({
      id: job.id,
      state,
      progress: job.progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    })
  },
)

export { router as jobsRouter }
