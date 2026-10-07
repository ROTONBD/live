import { useState } from 'react'

const hue = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)

/** Channel logo with lazy loading and a generated monogram fallback. */
export default function ChannelLogo({ channel, size = 64, className = '', eager = false }) {
  const [failed, setFailed] = useState(false)
  const initials = channel.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  if (!channel.logo || failed) {
    const h = hue(channel.name)
    return (
      <div
        role="img"
        aria-label={`${channel.name} logo`}
        className={`grid place-items-center rounded-2xl font-display font-black text-paper ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.3,
          background: `linear-gradient(140deg, hsl(${h} 55% 32%), hsl(${(h + 40) % 360} 40% 14%))`,
        }}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={channel.logo}
      alt={`${channel.name} logo`}
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`rounded-2xl object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
