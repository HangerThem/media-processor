"use client"
import { motion } from "framer-motion"
import { LogoIcon } from "../ui/LogoIcon"
import { ViewId } from "../../types"

interface NavItem {
  id: ViewId
  label: string
  badge?: string
  icon: React.ReactNode
}

interface SidebarProps {
  currentView: ViewId
  onViewChange: (view: ViewId) => void
  navCounts: { image: string; video: string; failed: string; active: string }
  isConnected: boolean
}

const OverviewIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    className="w-3.5 h-3.5 opacity-70 flex-shrink-0"
  >
    <rect
      x="2"
      y="2"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <rect
      x="9"
      y="2"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <rect
      x="2"
      y="9"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <rect
      x="9"
      y="9"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  </svg>
)

const ImageIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    className="w-3.5 h-3.5 opacity-70 flex-shrink-0"
  >
    <rect
      x="2"
      y="2"
      width="12"
      height="10"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <circle cx="5.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M2 11l3.5-3 3 3 2-2 3.5 3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
)

const VideoIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    className="w-3.5 h-3.5 opacity-70 flex-shrink-0"
  >
    <rect
      x="1"
      y="3"
      width="10"
      height="10"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M11 6.5l4-2v7l-4-2V6.5z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
)

const FailedIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    className="w-3.5 h-3.5 opacity-70 flex-shrink-0"
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M8 5v3.5M8 10.5v.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
)

const ActiveIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    className="w-3.5 h-3.5 opacity-70 flex-shrink-0"
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M6 5.5l5 2.5-5 2.5V5.5z" fill="currentColor" />
  </svg>
)

export function Sidebar({
  currentView,
  onViewChange,
  navCounts,
  isConnected,
}: SidebarProps) {
  const sections: { label: string; items: NavItem[] }[] = [
    {
      label: "Overview",
      items: [
        {
          id: "overview" as ViewId,
          label: "Overview",
          icon: <OverviewIcon />,
          badge: undefined,
        },
      ],
    },
    {
      label: "Queues",
      items: [
        {
          id: "image-jobs" as ViewId,
          label: "Images",
          icon: <ImageIcon />,
          badge: navCounts.image,
        },
        {
          id: "video-jobs" as ViewId,
          label: "Videos",
          icon: <VideoIcon />,
          badge: navCounts.video,
        },
      ],
    },
    {
      label: "Filter",
      items: [
        {
          id: "failed-jobs" as ViewId,
          label: "Failed",
          icon: <FailedIcon />,
          badge: navCounts.failed,
        },
        {
          id: "active-jobs" as ViewId,
          label: "Active",
          icon: <ActiveIcon />,
          badge: navCounts.active,
        },
      ],
    },
  ]

  return (
    <aside className="bg-surface border-r border-border flex flex-col sticky top-0 h-screen w-[220px] flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-[18px] border-b border-border flex items-center gap-2.5">
        <LogoIcon />
        <div>
          <div className="font-medium text-[13px] tracking-[0.02em]">
            media-service
          </div>
          <div className="text-[11px] text-muted font-mono">v1.0.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 py-3 flex-1 overflow-y-auto">
        {sections.map((section, si) => (
          <div key={section.label} className="mb-5">
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted px-3 mb-1">
              {section.label}
            </div>
            {section.items.map((item, ii) => {
              const isActive = currentView === item.id
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.05 + ii * 0.04, duration: 0.2 }}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-[7px] rounded-[6px] text-[12.5px] transition-all duration-100 text-left ${
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface2 hover:text-text"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge !== undefined && (
                    <span
                      className={`ml-auto font-mono text-[10px] px-1.5 py-[1px] rounded-[10px] min-w-[22px] text-center border ${
                        isActive
                          ? "bg-accent/15 border-accent/30 text-accent"
                          : "bg-surface2 border-border text-muted"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <motion.span
          animate={
            isConnected
              ? {
                  boxShadow: [
                    "0 0 0 2px rgba(61,214,140,0.2)",
                    "0 0 0 4px rgba(61,214,140,0.1)",
                    "0 0 0 2px rgba(61,214,140,0.2)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${isConnected ? "bg-green" : "bg-red"}`}
        />
        <span className="text-[11px] text-muted">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </aside>
  )
}
