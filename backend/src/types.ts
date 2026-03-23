export type JobType = "image" | "video"

export interface MediaJobData {
  fileId: string
  bucket: string
  path: string
  type: JobType
  originalName?: string
}

export interface JobResult {
  fileId: string
  derivatives: string[]
  processingMs: number
}

export interface EnqueueRequest {
  fileId: string
  bucket: string
  path: string
  type: JobType
  originalName?: string
}
