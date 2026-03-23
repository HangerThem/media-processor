import { Router, Request, Response } from "express"
import { Queue } from "bullmq"
import { makeQueue, IMAGE_QUEUE, VIDEO_QUEUE } from "../lib/queues"

const router = Router()

// Dashboard routes are protected by a separate dashboard secret
// so they can be read by the dashboard without sharing the enqueue secret
function dashAuth(req: Request, res: Response, next: () => void) {
  const token = req.headers["x-dashboard-secret"] as string | undefined
  const validTokens = [
    process.env.QUEUE_SECRET,
    process.env.DASHBOARD_SECRET,
  ].filter(Boolean)
  if (!token || !validTokens.includes(token)) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

const queues: Record<string, Queue> = {
  image: makeQueue(IMAGE_QUEUE),
  video: makeQueue(VIDEO_QUEUE),
}

async function getQueueStats(queue: Queue, name: string) {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ])

  return { name, waiting, active, completed, failed, delayed }
}

async function getRecentJobs(
  queue: Queue,
  states: ("completed" | "failed" | "active" | "waiting")[],
) {
  const jobs = await Promise.all(
    states.map((state) => queue.getJobs([state], 0, 20)),
  )
  return jobs
    .flat()
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    .slice(0, 30)
}

// GET /dashboard/stats
router.get("/stats", dashAuth, async (_req: Request, res: Response) => {
  const [imageStats, videoStats] = await Promise.all([
    getQueueStats(queues.image, "image"),
    getQueueStats(queues.video, "video"),
  ])

  return res.json({
    queues: [imageStats, videoStats],
    timestamp: Date.now(),
  })
})

// GET /dashboard/jobs?queue=image&state=failed
router.get("/jobs", dashAuth, async (req: Request, res: Response) => {
  const queueName = (req.query.queue as string) || "image"
  const state =
    (req.query.state as "completed" | "failed" | "active" | "waiting") ||
    "completed"
  const queue = queues[queueName]
  if (!queue) return res.status(400).json({ error: "Unknown queue" })

  const jobs = await queue.getJobs([state], 0, 50)
  const serialized = await Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      name: job.name,
      state: await job.getState(),
      progress: job.progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    })),
  )

  return res.json(serialized)
})

// POST /dashboard/jobs/:queue/:id/retry
router.post(
  "/jobs/:queue/:id/retry",
  dashAuth,
  async (req: Request, res: Response) => {
    const queue = queues[req.params.queue]
    if (!queue) return res.status(400).json({ error: "Unknown queue" })

    const job = await queue.getJob(req.params.id)
    if (!job) return res.status(404).json({ error: "Job not found" })

    await job.retry()
    return res.json({ ok: true })
  },
)

// DELETE /dashboard/jobs/:queue/:id
router.delete(
  "/jobs/:queue/:id",
  dashAuth,
  async (req: Request, res: Response) => {
    const queue = queues[req.params.queue]
    if (!queue) return res.status(400).json({ error: "Unknown queue" })

    const job = await queue.getJob(req.params.id)
    if (!job) return res.status(404).json({ error: "Job not found" })

    await job.remove()
    return res.json({ ok: true })
  },
)

export { router as dashboardRouter }
