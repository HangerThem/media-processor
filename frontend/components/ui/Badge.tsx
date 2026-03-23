import clsx from 'clsx'

type BadgeVariant = 'completed' | 'failed' | 'active' | 'waiting' | 'delayed' | 'image' | 'video' | 'unknown'

const variants: Record<BadgeVariant, string> = {
  completed: 'bg-green/10 text-green',
  failed: 'bg-red/10 text-red',
  active: 'bg-blue/10 text-blue',
  waiting: 'bg-amber/10 text-amber',
  delayed: 'bg-accent/10 text-accent',
  image: 'bg-blue/10 text-blue',
  video: 'bg-accent/10 text-accent',
  unknown: 'bg-surface2 text-muted',
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-[7px] py-[2px] rounded font-mono text-[10.5px] font-medium',
      variants[variant] ?? variants.unknown
    )}>
      {children}
    </span>
  )
}
