"use client"
import { AnimatePresence, motion } from "framer-motion"
import { Toast as ToastType } from "../../types"

interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onRemove(toast.id)}
            className={`bg-surface2 border rounded-lg px-3.5 py-2.5 text-xs flex items-center gap-2 min-w-[200px] cursor-pointer ${
              toast.type === "success" ? "border-green/30" : "border-red/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${toast.type === "success" ? "bg-green" : "bg-red"}`}
            />
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
