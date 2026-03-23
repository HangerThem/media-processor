"use client"
import { motion } from "framer-motion"
import { JobsTable } from "./JobsTable"
import { Job, QueueName } from "../../types"

interface FailedJobsViewProps {
  jobs: Job[]
  selectedQueue: QueueName
  onQueueChange: (q: QueueName) => void
  onRetry: (queue: string, id: string) => void
  onDelete: (queue: string, id: string) => void
}

export function FailedJobsView({
  jobs,
  selectedQueue,
  onQueueChange,
  onRetry,
  onDelete,
}: FailedJobsViewProps) {
  return (
    <motion.div
      key="failed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-surface border border-border rounded-[10px] overflow-hidden"
    >
      <div className="px-[18px] py-3.5 border-b border-border flex items-center justify-between gap-3">
        <div className="text-[13px] font-medium">Failed jobs</div>
        <select
          value={selectedQueue}
          onChange={(e) => onQueueChange(e.target.value as QueueName)}
          className="bg-surface2 border border-border text-text px-2 py-1 rounded text-[11px] font-sans cursor-pointer outline-none"
        >
          <option value="image">Image queue</option>
          <option value="video">Video queue</option>
        </select>
      </div>
      <JobsTable
        jobs={jobs}
        queue={selectedQueue}
        showReason
        onRetry={onRetry}
        onDelete={onDelete}
      />
    </motion.div>
  )
}
