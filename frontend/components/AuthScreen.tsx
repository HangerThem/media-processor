"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { LogoIcon } from "./ui/LogoIcon"
import { Button } from "./ui/Button"

interface AuthScreenProps {
  onAuth: (secret: string) => Promise<boolean>
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [secret, setSecret] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const val = secret.trim()
    if (!val) return
    setLoading(true)
    setError(false)
    const ok = await onAuth(val)
    if (!ok) {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-surface border border-border rounded-[12px] px-10 py-9 w-[340px]"
      >
        <div className="flex items-center gap-2.5 mb-7">
          <LogoIcon />
          <span className="font-medium text-[14px]">media-service</span>
        </div>

        <div className="text-[20px] font-medium mb-1">Dashboard</div>
        <div className="text-xs text-muted mb-6">
          Enter your dashboard secret to continue.
        </div>

        <div className="mb-4">
          <label className="block text-[11px] text-muted uppercase tracking-[0.05em] mb-1.5">
            Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value)
              setError(false)
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••••••••••"
            autoComplete="off"
            className={`w-full bg-bg border text-text px-3 py-2 rounded-[6px] text-[13px] font-mono outline-none transition-colors duration-150 focus:border-accent ${
              error ? "border-red" : "border-border"
            }`}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-red mt-2"
            >
              Invalid secret. Try again.
            </motion.p>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : null}
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
