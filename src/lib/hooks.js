import { useEffect, useState } from 'react'
import { site } from '../config/site.js'

/** Re-renders every `ms` so program progress bars and clocks stay current. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Per-page <title>, description, canonical and Open Graph tags. */
export function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${site.name}` : `${site.name} — Live Bangla TV Online`
    const desc = description || site.description
    const url = site.url + window.location.pathname
    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:site_name', site.name)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    if (image) {
      const abs = image.startsWith('http') ? image : site.url + image
      setMeta('property', 'og:image', abs)
    }
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [title, description, image])
}
