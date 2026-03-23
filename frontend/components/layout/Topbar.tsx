"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/Button"
import { ViewId } from "../../types"

const VIEW_META: Record<ViewId, { title: string; sub: string }> = {
  overview: { title: "Overview", sub: "Queue health and throughput" },
  "image-jobs": { title: "Image Jobs", sub: "Image processing queue" },
  "video-jobs": { title: "Video Jobs", sub: "Video processing queue" },
  "failed-jobs": { title: "Failed Jobs", sub: "Jobs requiring attention" },
  "active-jobs": { title: "Active Jobs", sub: "Currently processing" },
}

interface TopbarProps {
  currentView: ViewId
  isLoading: boolean
  lastRefresh: Date | null
  onRefresh: () => void
  onLogout: () => void
}

const RefreshIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
    <path
      d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M13.5 2.5V5h-2.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
    <path
      d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function formatLastRefresh(d: Date | null): string {
  if (!d) return "—"
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function Topbar({
  currentView,
  isLoading,
  lastRefresh,
  onRefresh,
  onLogout,
}: TopbarProps) {
  const meta = VIEW_META[currentView]

  return (
    <div className="px-7 py-4 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
        >
          <div className="text-[14px] font-medium">{meta.title}</div>
          <div className="text-[11px] text-muted mt-[1px] font-mono">
            {meta.sub}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
          <motion.span
            animate={{ background: isLoading ? "#3dd68c" : "#7a7a85" }}
            className="w-1.5 h-1.5 rounded-full"
          />
          <span>{formatLastRefresh(lastRefresh)}</span>
        </div>
        <Button onClick={onRefresh} disabled={isLoading}>
          {isLoading ? <span className="spinner" /> : <RefreshIcon />}
          Refresh
        </Button>
        <Button onClick={onLogout}>
          <LogoutIcon />
          Logout
        </Button>
      </div>
    </div>
  )
}
