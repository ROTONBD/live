import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function EmptyState({ icon = 'tv', title, body, action, to, onAction }) {
  return (
    <div className="panel relative flex flex-col items-center overflow-hidden px-6 py-16 text-center">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mb-5 grid size-16 place-items-center rounded-2xl border border-white/10 bg-ink-800">
        <Icon name={icon} size={28} className="text-amber" />
      </div>
      <h3 className="relative font-display text-xl font-bold">{title}</h3>
      {body && <p className="relative mt-2 max-w-md text-sm text-mute">{body}</p>}
      {action && to && (
        <Link to={to} className="btn btn-ghost relative mt-6">
          {action} <Icon name="arrowRight" size={16} />
        </Link>
      )}
      {action && onAction && (
        <button type="button" onClick={onAction} className="btn btn-ghost relative mt-6">
          {action}
        </button>
      )}
    </div>
  )
}
