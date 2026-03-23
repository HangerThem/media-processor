import clsx from 'clsx'
import { motion } from 'framer-motion'

interface ButtonProps {
  variant?: 'default' | 'primary'
  onClick?: () => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

export function Button({ variant = 'default', onClick, disabled, className, children, type = 'button', fullWidth }: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs cursor-pointer border transition-colors duration-100 whitespace-nowrap font-sans',
        variant === 'primary'
          ? 'bg-accent border-accent text-white hover:bg-accent2 hover:border-accent2'
          : 'bg-surface2 border-border2 text-text hover:bg-[#252528]',
        fullWidth && 'w-full justify-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  )
}
