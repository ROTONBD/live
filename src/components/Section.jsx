import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function Section({ eyebrow, title, to, linkLabel = 'See all', action, children, className = '' }) {
  return (
    <section className={`shell mt-14 ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h2>
        </div>
        {to && (
          <Link
            to={to}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-mute transition hover:text-paper"
          >
            {linkLabel}
            <Icon name="arrowRight" size={16} className="transition group-hover:translate-x-0.5" />
          </Link>
        )}
        {action}
      </div>
      {children}
    </section>
  )
}
