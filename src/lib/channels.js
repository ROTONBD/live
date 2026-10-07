import { categories } from '../data/categories.js'

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿]+/g, '-')
    .replace(/^-+|-+$/g, '')

export { slugify }

/** Fill defaults so the UI never has to guard against missing fields. */
export function normalizeChannel(raw) {
  const name = raw.name || 'Untitled channel'
  const streamUrl = (raw.streamUrl || '').trim()
  return {
    tags: [],
    description: '',
    logo: '',
    nameBn: '',
    featured: false,
    ...raw,
    id: raw.id || slugify(name),
    name,
    category: raw.category || 'Entertainment',
    streamUrl,
    // A channel without a stream can never be live.
    isLive: Boolean(raw.isLive ?? true) && Boolean(streamUrl),
  }
}

export function inCategory(channel, slug) {
  if (!slug || slug === 'all') return true
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) return false
  const target = cat.name.toLowerCase()
  return (
    channel.category.toLowerCase() === target ||
    channel.tags.some((t) => t.toLowerCase() === target)
  )
}

export function searchChannels(list, query) {
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list
    .map((ch) => {
      const hay = [ch.name, ch.nameBn, ch.category, ...ch.tags].join(' ').toLowerCase()
      if (!hay.includes(q)) return null
      // Rank: name prefix > name contains > category/tag match.
      const n = ch.name.toLowerCase()
      const score = n.startsWith(q) ? 0 : n.includes(q) || ch.nameBn.includes(q) ? 1 : 2
      return { ch, score }
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .map((r) => r.ch)
}

export function streamType(url = '') {
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.m3u8') || clean.includes('.m3u8')) return 'hls'
  if (/\.(mp4|webm|ogg|mov)$/.test(clean)) return 'file'
  return 'hls'
}
