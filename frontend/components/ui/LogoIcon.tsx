export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={`w-7 h-7 bg-accent rounded-[6px] flex items-center justify-center flex-shrink-0 ${className ?? ''}`}>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5">
        <path d="M2 12L8 4L14 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="12" r="1.5" fill="white" />
      </svg>
    </div>
  )
}
