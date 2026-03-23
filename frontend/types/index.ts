export type ViewId = 'overview' | 'image-jobs' | 'video-jobs' | 'failed-jobs' | 'active-jobs'
export type JobState = 'completed' | 'active' | 'waiting' | 'failed' | 'delayed' | 'unknown'
export type QueueName = 'image' | 'video'

export interface Job {
  id: string | number
  name: string
  state: JobState
  progress: number
  data?: {
    fileId?: string
    type?: string
  }
  result?: {
    processingMs?: number
  }
  timestamp: number
  processedOn?: number
  finishedOn?: number
  failedReason?: string
}

export interface QueueStats {
  name: string
  completed: number
  active: number
  waiting: number
  failed: number
}

export interface DashboardStats {
  queues: QueueStats[]
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}
