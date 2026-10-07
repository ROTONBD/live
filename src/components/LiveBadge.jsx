export default function LiveBadge({ live = true, className = '' }) {
  if (!live)
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md bg-ink-700/90 px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-mute uppercase ${className}`}
      >
        <span className="size-1.5 rounded-full bg-dim" />
        Offline
      </span>
    )
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-signal px-2 py-1 font-mono text-[10px] font-bold tracking-[0.16em] text-ink-950 uppercase ${className}`}
    >
      <span className="size-1.5 animate-pulse-dot rounded-full bg-ink-950" />
      Live
    </span>
  )
}
