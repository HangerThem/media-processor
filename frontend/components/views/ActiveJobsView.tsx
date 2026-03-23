"use client"
import { motion } from "framer-motion"
import { JobsTable } from "./JobsTable"
import { Job } from "../../types"

interface ActiveJobsViewProps {
  jobs: Job[]
  onDelete: (queue: string, id: string) => void
}

export function ActiveJobsView({ jobs, onDelete }: ActiveJobsViewProps) {
  return (
    <motion.div
      key="active"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-surface border border-border rounded-[10px] overflow-hidden"
    >
      <div className="px-[18px] py-3.5 border-b border-border">
        <div className="text-[13px] font-medium">Active jobs</div>
      </div>
      <JobsTable jobs={jobs} showType onDelete={onDelete} />
    </motion.div>
  )
}
