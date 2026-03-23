"use client"
import { motion } from "framer-motion"
import { JobsTable } from "./JobsTable"
import { Job } from "../../types"
import { QueueCardData } from "../../hooks/useDashboard"

interface StatCardProps {
  label: string
  value: string
  sub: string
  color: string
  index: number
}

function StatCard({ label, value, sub, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
      className="bg-surface border border-border rounded-[10px] px-[18px] py-4"
    >
      <div className="text-[11px] text-muted uppercase tracking-[0.06em] mb-2">
        {label}
      </div>
      <div
        className={`font-mono text-[26px] font-medium leading-none ${color}`}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted mt-1.5 font-mono">{sub}</div>
    </motion.div>
  )
}

const BAR_COLORS: Record<string, string> = {
  green: "bg-green",
  blue: "bg-blue",
  amber: "bg-amber",
  red: "bg-red",
}

interface QueueCardProps {
  name: string
  icon: string
  iconBg: string
  statusVariant: string
  data: QueueCardData | null
  index: number
}

function QueueCard({
  name,
  icon,
  iconBg,
  statusVariant,
  data,
  index,
}: QueueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 + index * 0.08, duration: 0.25 }}
      className="bg-surface border border-border rounded-[10px] px-5 py-[18px]"
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <div
            className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-xs ${iconBg}`}
          >
            {icon}
          </div>
          {name}
        </div>
        {data && (
          <span
            className={`inline-flex items-center px-[7px] py-[2px] rounded font-mono text-[10.5px] font-medium ${statusVariant}`}
          >
            {data.status}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {data?.bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2.5">
            <span className="w-[72px] text-[11px] text-muted flex-shrink-0">
              {bar.label}
            </span>
            <div className="flex-1 h-[5px] bg-surface2 rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(bar.pct, bar.count > 0 ? 3 : 0)}%`,
                }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
                className={`h-full rounded-sm ${BAR_COLORS[bar.color]}`}
              />
            </div>
            <span className="font-mono text-[11px] text-muted w-8 text-right">
              {bar.count}
            </span>
          </div>
        ))}
        {!data && (
          <div className="text-[11px] text-muted font-mono">Loading...</div>
        )}
      </div>
    </motion.div>
  )
}

interface OverviewViewProps {
  stats: { completed: string; active: string; waiting: string; failed: string }
  imageBars: QueueCardData | null
  videoBars: QueueCardData | null
  jobs: Job[]
  onRetry: (queue: string, id: string) => void
  onDelete: (queue: string, id: string) => void
}

export function OverviewView({
  stats,
  imageBars,
  videoBars,
  jobs,
  onRetry,
  onDelete,
}: OverviewViewProps) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total completed"
          value={stats.completed}
          sub="all time"
          color="text-green"
          index={0}
        />
        <StatCard
          label="Active now"
          value={stats.active}
          sub="processing"
          color="text-blue"
          index={1}
        />
        <StatCard
          label="Waiting"
          value={stats.waiting}
          sub="in queue"
          color="text-amber"
          index={2}
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          sub="needs attention"
          color="text-red"
          index={3}
        />
      </div>

      {/* Queue cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <QueueCard
          name="Image queue"
          icon="🖼"
          iconBg="bg-blue/15"
          statusVariant="bg-blue/10 text-blue"
          data={imageBars}
          index={0}
        />
        <QueueCard
          name="Video queue"
          icon="🎬"
          iconBg="bg-accent/15"
          statusVariant="bg-accent/10 text-accent"
          data={videoBars}
          index={1}
        />
      </div>

      {/* Jobs table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.25 }}
        className="bg-surface border border-border rounded-[10px] overflow-hidden"
      >
        <div className="px-[18px] py-3.5 border-b border-border">
          <div className="text-[13px] font-medium">Recent jobs</div>
        </div>
        <JobsTable jobs={jobs} showType onRetry={onRetry} onDelete={onDelete} />
      </motion.div>
    </motion.div>
  )
}
