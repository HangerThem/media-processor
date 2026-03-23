"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "../ui/Badge"
import { Job, JobState, QueueName } from "../../types"
import { relativeTime } from "../../lib/api"

interface JobsTableProps {
  jobs: Job[]
  showType?: boolean
  queue?: QueueName | null
  showReason?: boolean
  onRetry?: (queue: string, id: string) => void
  onDelete?: (queue: string, id: string) => void
}

function getDuration(job: Job): string {
  if (job.finishedOn && job.processedOn) {
    return `${((job.finishedOn - job.processedOn) / 1000).toFixed(1)}s`
  }
  if (job.result?.processingMs) {
    return `${(job.result.processingMs / 1000).toFixed(1)}s`
  }
  return "—"
}

function getTime(job: Job): string {
  if (job.finishedOn) return relativeTime(job.finishedOn)
  if (job.processedOn) return `started ${relativeTime(job.processedOn)}`
  return relativeTime(job.timestamp)
}

export function JobsTable({
  jobs,
  showType = false,
  queue = null,
  showReason = false,
  onRetry,
  onDelete,
}: JobsTableProps) {
  if (!jobs.length) {
    return (
      <div className="py-12 text-center text-muted text-xs">No jobs found</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em] whitespace-nowrap">
              Job ID
            </th>
            {showType && (
              <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em]">
                Type
              </th>
            )}
            <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em]">
              File ID
            </th>
            <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em]">
              Status
            </th>
            <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em]">
              Progress
            </th>
            {showReason && (
              <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em]">
                Reason
              </th>
            )}
            <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em] whitespace-nowrap">
              Duration
            </th>
            <th className="px-[18px] py-[9px] text-left text-[10.5px] font-medium text-muted uppercase tracking-[0.06em]">
              Time
            </th>
            <th className="px-[18px] py-[9px]" />
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {jobs.map((job, i) => {
              const state = job.state ?? "unknown"
              const q = queue ?? job.data?.type ?? "?"
              const progress =
                typeof job.progress === "number" ? job.progress : 0

              return (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.15 }}
                  className="border-b border-border last:border-0 hover:bg-white/[0.015] group"
                >
                  <td className="px-[18px] py-[10px] align-middle">
                    <span className="font-mono text-[11px] text-muted">
                      #{job.id}
                    </span>
                  </td>
                  {showType && (
                    <td className="px-[18px] py-[10px] align-middle">
                      <Badge variant={job.name as "image" | "video"}>
                        {job.name}
                      </Badge>
                    </td>
                  )}
                  <td className="px-[18px] py-[10px] align-middle">
                    <span
                      className="font-mono text-[11px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap block"
                      title={job.data?.fileId}
                    >
                      {job.data?.fileId ?? "—"}
                    </span>
                  </td>
                  <td className="px-[18px] py-[10px] align-middle">
                    <Badge variant={state as JobState}>{state}</Badge>
                  </td>
                  <td className="px-[18px] py-[10px] align-middle min-w-[80px]">
                    <div className="h-1 bg-surface2 rounded-sm overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full bg-accent rounded-sm"
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted mt-0.5 block">
                      {progress}%
                    </span>
                  </td>
                  {showReason && (
                    <td className="px-[18px] py-[10px] align-middle">
                      <span
                        className="font-mono text-[10px] text-red max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap block"
                        title={job.failedReason}
                      >
                        {job.failedReason ?? "—"}
                      </span>
                    </td>
                  )}
                  <td className="px-[18px] py-[10px] align-middle font-mono text-[11px] text-muted whitespace-nowrap">
                    {getDuration(job)}
                  </td>
                  <td className="px-[18px] py-[10px] align-middle font-mono text-[11px] text-muted whitespace-nowrap">
                    {getTime(job)}
                  </td>
                  <td className="px-[18px] py-[10px] align-middle">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                      {state === "failed" && onRetry && (
                        <button
                          onClick={() => onRetry(q, String(job.id))}
                          className="px-2 py-[3px] rounded text-[11px] cursor-pointer border border-border bg-surface2 text-muted hover:border-green/40 hover:text-green transition-colors duration-100 font-sans"
                        >
                          Retry
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(q, String(job.id))}
                          className="px-2 py-[3px] rounded text-[11px] cursor-pointer border border-border bg-surface2 text-muted hover:border-red/40 hover:text-red transition-colors duration-100 font-sans"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
