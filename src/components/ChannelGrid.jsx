import { useApp } from '../context/AppContext.jsx'
import { useNow } from '../lib/hooks.js'
import ChannelCard from './ChannelCard.jsx'
import EmptyState from './EmptyState.jsx'

export const gridClass =
  'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'

export function GridSkeleton({ count = 10 }) {
  return (
    <div className={gridClass} aria-busy="true" aria-label="Loading channels">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-[22px] border border-white/[0.05] bg-ink-850">
          <div className="skeleton aspect-[16/11]" />
          <div className="space-y-2.5 p-4">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton mt-3 h-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ChannelGrid({ channels, empty, skeletonCount }) {
  const { status, error, reload } = useApp()
  const now = useNow()

  if (status === 'loading') return <GridSkeleton count={skeletonCount} />
  if (status === 'error')
    return (
      <EmptyState
        icon="alert"
        title="Couldn't load the channel list"
        body={error}
        action="Try again"
        onAction={reload}
      />
    )
  if (!channels.length)
    return (
      <EmptyState
        icon="tv"
        title="No channels here yet"
        body="Try another category or search term."
        {...empty}
      />
    )

  return (
    <div className={gridClass}>
      {channels.map((ch, i) => (
        <ChannelCard key={ch.id} channel={ch} now={now} index={i} />
      ))}
    </div>
  )
}
