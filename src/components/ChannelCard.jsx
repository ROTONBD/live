import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getProgramInfo } from '../lib/time.js'
import ChannelLogo from './ChannelLogo.jsx'
import Icon from './Icon.jsx'
import LiveBadge from './LiveBadge.jsx'
import ProgressBar from './ProgressBar.jsx'

function ChannelCard({ channel, now, index = 0 }) {
  const { isFavorite, toggleFavorite } = useApp()
  const fav = isFavorite(channel.id)
  const info = getProgramInfo(channel, now)
  const to = `/watch/${channel.id}`

  return (
    <article
      className="group relative flex animate-rise flex-col overflow-hidden rounded-[22px] border border-white/[0.07] bg-ink-850 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.9)]"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      {/* Screen */}
      <Link
        to={to}
        aria-label={`Watch ${channel.name}`}
        className="relative grid aspect-[16/11] place-items-center overflow-hidden bg-ink-800"
      >
        <div className="scanlines absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink-850 to-transparent" />
        <ChannelLogo
          channel={channel}
          size={76}
          className={`relative transition duration-500 group-hover:scale-110 ${channel.isLive ? '' : 'opacity-50 grayscale'}`}
        />
        <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid size-14 place-items-center rounded-full bg-paper/95 text-ink-950 shadow-xl">
            <Icon name="play" size={22} className="translate-x-0.5" />
          </span>
        </span>
        <LiveBadge live={channel.isLive} className="absolute top-3 left-3" />
      </Link>

      <button
        type="button"
        onClick={() => toggleFavorite(channel)}
        aria-pressed={fav}
        aria-label={fav ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
        className={`absolute top-2 right-2 grid size-10 place-items-center rounded-full backdrop-blur transition active:scale-90 ${
          fav ? 'bg-signal/20 text-signal' : 'bg-ink-950/50 text-paper/80 hover:text-paper'
        }`}
      >
        <Icon name="heart" size={18} filled={fav} />
      </button>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] leading-tight font-bold sm:text-base">
            <Link to={to} className="hover:text-amber">
              {channel.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-mute">
            {channel.category}
            {channel.nameBn && <span className="text-dim"> · {channel.nameBn}</span>}
          </p>
        </div>

        {info.now && channel.isLive && (
          <div className="hidden sm:block">
            <p className="truncate text-xs text-paper/80">
              <span className="font-mono text-[10px] tracking-widest text-signal uppercase">Now</span>{' '}
              {info.now.title}
            </p>
            <ProgressBar value={info.progress} className="mt-2" />
          </div>
        )}

        <Link
          to={to}
          className={`mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
            channel.isLive
              ? 'bg-white/[0.06] text-paper group-hover:bg-signal group-hover:text-ink-950'
              : 'bg-white/[0.03] text-dim'
          }`}
        >
          <Icon name={channel.isLive ? 'play' : 'signalOff'} size={channel.isLive ? 14 : 16} />
          {channel.isLive ? 'Watch' : 'Offline'}
        </Link>
      </div>
    </article>
  )
}

export default memo(ChannelCard)
