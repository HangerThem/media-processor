"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthScreen } from "../components/AuthScreen"
import { Sidebar } from "../components/layout/Sidebar"
import { Topbar } from "../components/layout/Topbar"
import { OverviewView } from "../components/views/OverviewView"
import { QueueView } from "../components/views/QueueView"
import { FailedJobsView } from "../components/views/FailedJobsView"
import { ActiveJobsView } from "../components/views/ActiveJobsView"
import { ToastContainer } from "../components/ui/Toast"
import { useDashboard } from "../hooks/useDashboard"
import { useToast } from "../hooks/useToast"
import { setSecret, getSecret, clearSecret, apiFetch } from "../lib/api"
import { ViewId } from "../types"

const REFRESH_INTERVAL = 15_000

export default function Page() {
  const [authed, setAuthed] = useState(() => Boolean(getSecret()))
  const [currentView, setCurrentView] = useState<ViewId>("overview")
  const { data, refresh, setImageFilter, setVideoFilter, setFailedQueue } =
    useDashboard()
  const { toasts, addToast, removeToast } = useToast()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-refresh
  useEffect(() => {
    if (!authed) return
    refresh()
    timerRef.current = setInterval(refresh, REFRESH_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [authed, refresh])

  const handleAuth = useCallback(async (secret: string): Promise<boolean> => {
    setSecret(secret)
    try {
      const res = await apiFetch("/dashboard/stats")
      if (res.ok) {
        setAuthed(true)
        return true
      }
    } catch {}
    clearSecret()
    return false
  }, [])

  const handleLogout = useCallback(() => {
    clearSecret()
    setAuthed(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const handleRetry = useCallback(
    async (queue: string, id: string) => {
      try {
        const res = await apiFetch(`/dashboard/jobs/${queue}/${id}/retry`, {
          method: "POST",
        })
        if (res.ok) {
          addToast("Job queued for retry", "success")
          refresh()
        } else addToast("Failed to retry job", "error")
      } catch {
        addToast("Network error", "error")
      }
    },
    [addToast, refresh],
  )

  const handleDelete = useCallback(
    async (queue: string, id: string) => {
      try {
        const res = await apiFetch(`/dashboard/jobs/${queue}/${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          addToast("Job deleted", "success")
          refresh()
        } else addToast("Failed to delete job", "error")
      } catch {
        addToast("Network error", "error")
      }
    },
    [addToast, refresh],
  )

  if (!authed) {
    return (
      <>
        <AuthScreen onAuth={handleAuth} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <>
      <div
        className="grid min-h-screen"
        style={{ gridTemplateColumns: "220px 1fr" }}
      >
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          navCounts={data.navCounts}
          isConnected={data.isConnected}
        />

        <div className="flex flex-col overflow-hidden">
          <Topbar
            currentView={currentView}
            isLoading={data.isLoading}
            lastRefresh={data.lastRefresh}
            onRefresh={refresh}
            onLogout={handleLogout}
          />

          <div className="p-7 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentView === "overview" && (
                <OverviewView
                  key="overview"
                  stats={data.stats}
                  imageBars={data.imageBars}
                  videoBars={data.videoBars}
                  jobs={data.overviewJobs}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                />
              )}
              {currentView === "image-jobs" && (
                <motion.div
                  key="image-jobs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <QueueView
                    title="Image jobs"
                    queue="image"
                    jobs={data.imageJobs}
                    activeFilter={data.imageFilter}
                    onFilterChange={setImageFilter}
                    onRetry={handleRetry}
                    onDelete={handleDelete}
                  />
                </motion.div>
              )}
              {currentView === "video-jobs" && (
                <motion.div
                  key="video-jobs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <QueueView
                    title="Video jobs"
                    queue="video"
                    jobs={data.videoJobs}
                    activeFilter={data.videoFilter}
                    onFilterChange={setVideoFilter}
                    onRetry={handleRetry}
                    onDelete={handleDelete}
                  />
                </motion.div>
              )}
              {currentView === "failed-jobs" && (
                <FailedJobsView
                  key="failed-jobs"
                  jobs={data.failedJobs}
                  selectedQueue={data.failedQueue}
                  onQueueChange={setFailedQueue}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                />
              )}
              {currentView === "active-jobs" && (
                <ActiveJobsView
                  key="active-jobs"
                  jobs={data.activeJobs}
                  onDelete={handleDelete}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
