import { Link } from 'react-router-dom'
import { categories } from '../data/categories.js'
import Icon from './Icon.jsx'

/**
 * Horizontal category filter. Pass `onSelect` to filter in place, or omit it
 * to render links to /category/:slug.
 */
export default function CategoryChips({ active = 'all', onSelect, counts }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {categories.map((c) => {
        const body = (
          <>
            <Icon name={c.icon} size={16} />
            <span>{c.name}</span>
            <span className="text-xs opacity-60">{c.bn}</span>
            {counts && <span className="font-mono text-[10px] opacity-60">{counts[c.slug] ?? 0}</span>}
          </>
        )
        return onSelect ? (
          <button
            key={c.slug}
            type="button"
            className="chip"
            aria-pressed={active === c.slug}
            onClick={() => onSelect(c.slug)}
          >
            {body}
          </button>
        ) : (
          <Link
            key={c.slug}
            to={c.slug === 'all' ? '/live' : `/category/${c.slug}`}
            className="chip"
            aria-current={active === c.slug ? 'page' : undefined}
          >
            {body}
          </Link>
        )
      })}
    </div>
  )
}
