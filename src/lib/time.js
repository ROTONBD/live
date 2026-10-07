import { site } from '../config/site.js'

const toMin = (hhmm) => {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Minutes since midnight in the broadcast time zone. */
export function nowMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: site.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const h = Number(parts.find((p) => p.type === 'hour').value)
  const m = Number(parts.find((p) => p.type === 'minute').value)
  return h * 60 + m
}

/** "22:30" → "10:30 PM" */
export function formatTime(hhmm) {
  if (!hhmm) return ''
  const total = toMin(hhmm)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

export function clockLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: site.timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function progressBetween(start, end, now) {
  let s = toMin(start)
  let e = toMin(end)
  let n = now
  if (e <= s) e += 1440 // crosses midnight
  if (n < s) n += 1440
  if (n < s || n > e) return null
  return Math.min(1, Math.max(0, (n - s) / (e - s)))
}

/**
 * Work out what is on now and next for a channel.
 * Uses `schedule` when present, otherwise `currentProgram` / `nextProgram`.
 * Returns { now, next, progress, upcoming } where progress is 0–1 or null.
 */
export function getProgramInfo(channel, date = new Date()) {
  const now = nowMinutes(date)
  const sched = Array.isArray(channel.schedule) ? channel.schedule : null

  if (sched && sched.length) {
    const slots = [...sched]
      .map((s) => ({ ...s, m: toMin(s.start) }))
      .sort((a, b) => a.m - b.m)
    let idx = slots.findLastIndex((s) => s.m <= now)
    if (idx === -1) idx = slots.length - 1 // before first slot → still in last one from yesterday
    const at = (i) => slots[(i + slots.length) % slots.length]
    const cur = at(idx)
    const nxt = at(idx + 1)
    const curProg = { title: cur.title, start: cur.start, end: nxt.start }
    const nextProg = { title: nxt.title, start: nxt.start, end: at(idx + 2).start }
    const upcoming = [1, 2, 3, 4].map((k) => {
      const a = at(idx + k)
      return { title: a.title, start: a.start, end: at(idx + k + 1).start }
    })
    return {
      now: curProg,
      next: nextProg,
      progress: progressBetween(curProg.start, curProg.end, now),
      upcoming,
    }
  }

  const cur = channel.currentProgram || null
  const nxt = channel.nextProgram || null
  return {
    now: cur,
    next: nxt,
    progress: cur ? progressBetween(cur.start, cur.end, now) : null,
    upcoming: nxt ? [nxt] : [],
  }
}
