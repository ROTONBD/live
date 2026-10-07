export default function ProgressBar({ value, className = '' }) {
  if (value == null) return null
  return (
    <div
      className={`h-1 overflow-hidden rounded-full bg-white/10 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-label="Program progress"
    >
      <div
        className="h-full origin-left rounded-full bg-linear-to-r from-amber to-signal transition-transform duration-700"
        style={{ transform: `scaleX(${value})` }}
      />
    </div>
  )
}
