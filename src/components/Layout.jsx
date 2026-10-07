import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { site } from '../config/site.js'
import { useApp } from '../context/AppContext.jsx'
import Icon from './Icon.jsx'
import Toast from './Toast.jsx'

const primaryNav = [
  { to: '/', label: 'Home', end: true },
  { to: '/live', label: 'Live TV' },
  { to: '/categories', label: 'Categories' },
  { to: '/category/sports', label: 'Sports' },
  { to: '/category/news', label: 'News' },
  { to: '/category/entertainment', label: 'Entertainment' },
  { to: '/guide', label: 'Guide' },
]

const bottomNav = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/live', label: 'Live TV', icon: 'tv' },
  { to: '/categories', label: 'Categories', icon: 'grid' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/favorites', label: 'Favorites', icon: 'heart' },
]

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label={`${site.name} home`}>
      {site.logoImage ? (
        <img src={site.logoImage} alt={site.name} className="h-8 w-auto" />
      ) : (
        <>
          <span className="relative grid size-9 place-items-center rounded-xl bg-signal text-ink-950 transition group-hover:rotate-[-6deg]">
            <Icon name="tv" size={20} strokeWidth={2.2} />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 animate-pulse-dot rounded-full border-2 border-ink-900 bg-amber" />
          </span>
          <span className="font-display text-[19px] leading-none font-black tracking-tight">
            <span className="text-signal">{site.logoAccent}</span> {site.logoText}
          </span>
        </>
      )}
    </Link>
  )
}

function HeaderSearch() {
  const navigate = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!location.pathname.startsWith('/search')) setQ('')
  }, [location.pathname])

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      }}
      className="relative hidden w-full max-w-[260px] md:block"
    >
      <Icon name="search" size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dim" />
      <input
        ref={ref}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search channels…"
        aria-label="Search channels"
        className="h-11 w-full rounded-full border border-white/10 bg-ink-850/80 pr-10 pl-10 text-sm placeholder:text-dim focus:border-amber/60 focus:outline-none"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-white/15 px-1.5 font-mono text-[10px] text-dim">
        /
      </kbd>
    </form>
  )
}

function Header() {
  const { favorites } = useApp()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition duration-300 ${
        scrolled ? 'border-b border-white/[0.06] bg-ink-900/85 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="shell flex h-16 items-center gap-6 lg:h-[72px]">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white/[0.07] text-paper' : 'text-mute hover:text-paper'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-2 lg:flex-none">
          <HeaderSearch />
          <Link to="/search" className="icon-btn md:hidden" aria-label="Search">
            <Icon name="search" size={19} />
          </Link>
          <NavLink
            to="/favorites"
            className={({ isActive }) => `icon-btn relative ${isActive ? 'border-signal/50 text-signal' : ''}`}
            aria-label={`Favorites (${favorites.length})`}
          >
            <Icon name="heart" size={19} filled={favorites.length > 0} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-signal px-1 font-mono text-[10px] font-bold text-ink-950">
                {favorites.length}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-ink-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {bottomNav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition active:scale-95 ${
                  isActive ? 'text-signal' : 'text-mute'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`grid h-7 w-12 place-items-center rounded-full transition ${isActive ? 'bg-signal/15' : ''}`}>
                    <Icon name={item.icon} size={21} filled={isActive && item.icon === 'heart'} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  const cols = [
    {
      title: 'Watch',
      links: [
        ['/live', 'All channels'],
        ['/category/news', 'News'],
        ['/category/sports', 'Sports'],
        ['/category/entertainment', 'Entertainment'],
        ['/guide', 'Program guide'],
      ],
    },
    {
      title: 'Company',
      links: [
        ['/about', 'About'],
        ['/contact', 'Contact'],
        ['/admin', 'Channel manager'],
      ],
    },
    {
      title: 'Legal',
      links: [
        ['/privacy', 'Privacy Policy'],
        ['/terms', 'Terms of Service'],
      ],
    },
  ]
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-950/60 pb-24 lg:pb-0">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-mute">{site.tagline}</p>
          <p className="mt-4 text-xs leading-relaxed text-dim">
            {site.name} only plays streams supplied by authorised broadcasters. Channel names belong to their
            respective owners.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h3 className="eyebrow mb-4">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-paper/80 transition hover:text-signal">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.05]">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="font-mono tracking-wider">Made for every screen · ঢাকা</p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-paper px-4 py-2 text-ink-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <Toast />
    </div>
  )
}
