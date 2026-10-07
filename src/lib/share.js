import { site } from '../config/site.js'

export const channelUrl = (channel) => `${site.url}/watch/${channel.id}`

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

/** Native share sheet when available, otherwise copy the link. Returns 'shared' | 'copied' | 'failed'. */
export async function shareChannel(channel) {
  const url = channelUrl(channel)
  if (navigator.share) {
    try {
      await navigator.share({ title: `${channel.name} live on ${site.name}`, url })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  return (await copyText(url)) ? 'copied' : 'failed'
}
