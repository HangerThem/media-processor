import { Queue, QueueEvents } from "bullmq"
import Redis from "ioredis"

let _redis: Redis | null = null

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
    _redis.on("error", (err) => console.error("[Redis]", err.message))
  }
  return _redis
}

function getBullConnection() {
  return {
    url: REDIS_URL,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
  }
}

export function makeQueue(name: string) {
  return new Queue(name, { connection: getBullConnection() })
}

export function makeQueueEvents(name: string) {
  return new QueueEvents(name, {
    connection: getBullConnection(),
  })
}

export const IMAGE_QUEUE = "media.image"
export const VIDEO_QUEUE = "media.video"
