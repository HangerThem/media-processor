"use client"
import { motion } from "framer-motion"
import { JobsTable } from "./JobsTable"
import { Job, JobState, QueueName } from "../../types"

const FILTER_TABS: { label: string; state: JobState }[] = [
  { label: "Completed", state: "completed" },
  { label: "Active", state: "active" },
  { label: "Waiting", state: "waiting" },
  { label: "Failed", state: "failed" },
]

interface QueueViewProps {
  title: string
  queue: QueueName
  jobs: Job[]
  activeFilter: JobState
  onFilterChange: (state: JobState) => void
  onRetry: (queue: string, id: string) => void
  onDelete: (queue: string, id: string) => void
}

export function QueueView({
  title,
  queue,
  jobs,
  activeFilter,
  onFilterChange,
  onRetry,
  onDelete,
}: QueueViewProps) {
  return (
    <motion.div
      key={queue}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-surface border border-border rounded-[10px] overflow-hidden"
    >
      <div className="px-[18px] py-3.5 border-b border-border flex items-center justify-between gap-3">
        <div className="text-[13px] font-medium">{title}</div>
        <div className="flex gap-0.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.state}
              onClick={() => onFilterChange(tab.state)}
              className={`px-2.5 py-1 rounded text-[11px] cursor-pointer border font-sans transition-all duration-100 ${
                activeFilter === tab.state
                  ? "bg-surface2 border-border text-text"
                  : "border-transparent bg-transparent text-muted hover:bg-surface2 hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <JobsTable
        jobs={jobs}
        queue={queue}
        showReason={activeFilter === "failed"}
        onRetry={onRetry}
        onDelete={onDelete}
      />
    </motion.div>
  )
}
