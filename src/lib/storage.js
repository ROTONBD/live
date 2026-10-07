import { useCallback, useEffect, useState } from 'react'

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/** useState that persists to localStorage and syncs across tabs. */
export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or disabled — keep working in memory */
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setValue(read(key, fallback))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback((v) => setValue(v), [])
  return [value, update]
}
