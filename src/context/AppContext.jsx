import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { site } from '../config/site.js'
import { normalizeChannel } from '../lib/channels.js'
import { useLocalStorage } from '../lib/storage.js'

const AppContext = createContext(null)

const FAV_KEY = 'legent:favorites'
const RECENT_KEY = 'legent:recent'
const LOCAL_KEY = 'legent:local-channels'
const MAX_RECENT = 12

async function loadChannels() {
  if (site.channelsUrl) {
    const res = await fetch(site.channelsUrl, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Channel list request failed (${res.status})`)
    const data = await res.json()
    return Array.isArray(data) ? data : data.channels || []
  }
  // Code-split so the channel list doesn't block the first paint.
  const mod = await import('../data/channels.js')
  return mod.default
}

export function AppProvider({ children }) {
  const [base, setBase] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useLocalStorage(FAV_KEY, [])
  const [recent, setRecent] = useLocalStorage(RECENT_KEY, [])
  // Channels drafted on /admin are kept in this browser only, for previewing.
  const [localChannels, setLocalChannels] = useLocalStorage(LOCAL_KEY, [])
  const [toast, setToast] = useState(null)
  const toastTimer = useRef()

  const reload = useCallback(() => {
    setStatus('loading')
    loadChannels()
      .then((list) => {
        setBase(list)
        setStatus('ready')
      })
      .catch((e) => {
        setError(e.message || 'Could not load channels')
        setStatus('error')
      })
  }, [])

  useEffect(reload, [reload])

  const channels = useMemo(() => {
    const seen = new Set()
    return [...localChannels.map((c) => ({ ...c, isLocal: true })), ...base]
      .map(normalizeChannel)
      .filter((c) => (seen.has(c.id) ? false : seen.add(c.id)))
  }, [base, localChannels])

  const byId = useMemo(() => new Map(channels.map((c) => [c.id, c])), [channels])

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current)
    setToast({ message, key: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites])

  const toggleFavorite = useCallback(
    (channel) => {
      const has = favorites.includes(channel.id)
      setFavorites(has ? favorites.filter((f) => f !== channel.id) : [channel.id, ...favorites])
      notify(has ? `Removed ${channel.name} from Favorites` : `Added ${channel.name} to Favorites`)
    },
    [favorites, setFavorites, notify],
  )

  const addRecent = useCallback(
    (id) => setRecent((prev) => [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT)),
    [setRecent],
  )

  const clearRecent = useCallback(() => setRecent([]), [setRecent])

  const value = {
    channels,
    byId,
    status,
    error,
    reload,
    favorites: favorites.map((id) => byId.get(id)).filter(Boolean),
    isFavorite,
    toggleFavorite,
    recent: recent.map((id) => byId.get(id)).filter(Boolean),
    addRecent,
    clearRecent,
    localChannels,
    setLocalChannels,
    toast,
    notify,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
