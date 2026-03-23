"use client"

import { useState, useCallback, useRef } from "react"
import { apiFetch, fmt } from "../lib/api"
import { DashboardStats, Job, QueueName, JobState, QueueStats } from "../types"

export interface QueueBarData {
  label: string
  count: number
  color: string
  pct: number
}

export interface QueueCardData {
  status: string
  bars: QueueBarData[]
}

export interface NavCounts {
  image: string
  video: string
  failed: string
  active: string
}

export interface StatsData {
  completed: string
  active: string
  waiting: string
  failed: string
}

export interface DashboardData {
  stats: StatsData
  imageBars: QueueCardData | null
  videoBars: QueueCardData | null
  navCounts: NavCounts
  overviewJobs: Job[]
  imageJobs: Job[]
  videoJobs: Job[]
  failedJobs: Job[]
  activeJobs: Job[]
  isConnected: boolean
  isLoading: boolean
  lastRefresh: Date | null
  imageFilter: JobState
  videoFilter: JobState
  failedQueue: QueueName
}

function computeQueueCard(q: QueueStats): QueueCardData {
  const total = Math.max(q.completed + q.failed + q.waiting + q.active, 1)
  const bars: QueueBarData[] = [
    {
      label: "Completed",
      count: q.completed,
      color: "green",
      pct: (q.completed / total) * 100,
    },
    {
      label: "Active",
      count: q.active,
      color: "blue",
      pct: (q.active / total) * 100,
    },
    {
      label: "Waiting",
      count: q.waiting,
      color: "amber",
      pct: (q.waiting / total) * 100,
    },
    {
      label: "Failed",
      count: q.failed,
      color: "red",
      pct: (q.failed / total) * 100,
    },
  ]
  const status = q.active > 0 ? "processing" : q.waiting > 0 ? "queued" : "idle"
  return { bars, status }
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: { completed: "—", active: "—", waiting: "—", failed: "—" },
    imageBars: null,
    videoBars: null,
    navCounts: { image: "—", video: "—", failed: "—", active: "—" },
    overviewJobs: [],
    imageJobs: [],
    videoJobs: [],
    failedJobs: [],
    activeJobs: [],
    isConnected: false,
    isLoading: false,
    lastRefresh: null,
    imageFilter: "completed",
    videoFilter: "completed",
    failedQueue: "image",
  })

  const imageFilterRef = useRef<JobState>("completed")
  const videoFilterRef = useRef<JobState>("completed")
  const failedQueueRef = useRef<QueueName>("image")

  const loadStats = useCallback(async () => {
    const res = await apiFetch("/dashboard/stats")
    if (!res.ok) throw new Error("stats failed")
    const statsData: DashboardStats = await res.json()

    let totalCompleted = 0,
      totalActive = 0,
      totalWaiting = 0,
      totalFailed = 0
    let imageCard: QueueCardData | null = null
    let videoCard: QueueCardData | null = null

    for (const q of statsData.queues) {
      totalCompleted += q.completed
      totalActive += q.active
      totalWaiting += q.waiting
      totalFailed += q.failed
      if (q.name === "image") imageCard = computeQueueCard(q)
      if (q.name === "video") videoCard = computeQueueCard(q)
    }

    setData((prev) => ({
      ...prev,
      stats: {
        completed: fmt(totalCompleted),
        active: fmt(totalActive),
        waiting: fmt(totalWaiting),
        failed: fmt(totalFailed),
      },
      imageBars: imageCard,
      videoBars: videoCard,
      navCounts: {
        image: fmt(
          statsData.queues.find((q) => q.name === "image")?.waiting ?? 0,
        ),
        video: fmt(
          statsData.queues.find((q) => q.name === "video")?.waiting ?? 0,
        ),
        failed: fmt(totalFailed),
        active: fmt(totalActive),
      },
      isConnected: true,
    }))
  }, [])

  const loadOverviewJobs = useCallback(async () => {
    const [imgRes, vidRes] = await Promise.all([
      apiFetch("/dashboard/jobs?queue=image&state=completed"),
      apiFetch("/dashboard/jobs?queue=video&state=completed"),
    ])
    const [imgJobs, vidJobs]: [Job[], Job[]] = await Promise.all([
      imgRes.json(),
      vidRes.json(),
    ])
    const jobs = [...imgJobs, ...vidJobs]
      .sort(
        (a, b) => (b.finishedOn ?? b.timestamp) - (a.finishedOn ?? a.timestamp),
      )
      .slice(0, 30)
    setData((prev) => ({ ...prev, overviewJobs: jobs }))
  }, [])

  const loadQueueJobs = useCallback(
    async (queue: QueueName, state: JobState) => {
      const res = await apiFetch(
        `/dashboard/jobs?queue=${queue}&state=${state}`,
      )
      const jobs: Job[] = await res.json()
      if (queue === "image") setData((prev) => ({ ...prev, imageJobs: jobs }))
      else setData((prev) => ({ ...prev, videoJobs: jobs }))
    },
    [],
  )

  const loadFailedJobs = useCallback(async (queue?: QueueName) => {
    const q = queue ?? failedQueueRef.current
    const res = await apiFetch(`/dashboard/jobs?queue=${q}&state=failed`)
    const jobs: Job[] = await res.json()
    setData((prev) => ({ ...prev, failedJobs: jobs }))
  }, [])

  const loadActiveJobs = useCallback(async () => {
    const [imgRes, vidRes] = await Promise.all([
      apiFetch("/dashboard/jobs?queue=image&state=active"),
      apiFetch("/dashboard/jobs?queue=video&state=active"),
    ])
    const [i, v]: [Job[], Job[]] = await Promise.all([
      imgRes.json(),
      vidRes.json(),
    ])
    const jobs = [...i, ...v].sort(
      (a, b) => (a.processedOn ?? 0) - (b.processedOn ?? 0),
    )
    setData((prev) => ({ ...prev, activeJobs: jobs }))
  }, [])

  const refresh = useCallback(async () => {
    setData((prev) => ({ ...prev, isLoading: true }))
    try {
      await Promise.all([
        loadStats(),
        loadOverviewJobs(),
        loadQueueJobs("image", imageFilterRef.current),
        loadQueueJobs("video", videoFilterRef.current),
        loadFailedJobs(),
        loadActiveJobs(),
      ])
      setData((prev) => ({
        ...prev,
        lastRefresh: new Date(),
        isConnected: true,
      }))
    } catch {
      setData((prev) => ({ ...prev, isConnected: false }))
    } finally {
      setData((prev) => ({ ...prev, isLoading: false }))
    }
  }, [
    loadStats,
    loadOverviewJobs,
    loadQueueJobs,
    loadFailedJobs,
    loadActiveJobs,
  ])

  const setImageFilter = useCallback(
    (state: JobState) => {
      imageFilterRef.current = state
      setData((prev) => ({ ...prev, imageFilter: state }))
      loadQueueJobs("image", state)
    },
    [loadQueueJobs],
  )

  const setVideoFilter = useCallback(
    (state: JobState) => {
      videoFilterRef.current = state
      setData((prev) => ({ ...prev, videoFilter: state }))
      loadQueueJobs("video", state)
    },
    [loadQueueJobs],
  )

  const setFailedQueue = useCallback(
    (queue: QueueName) => {
      failedQueueRef.current = queue
      setData((prev) => ({ ...prev, failedQueue: queue }))
      loadFailedJobs(queue)
    },
    [loadFailedJobs],
  )

  return { data, refresh, setImageFilter, setVideoFilter, setFailedQueue }
}
