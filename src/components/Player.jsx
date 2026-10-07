import { useCallback, useEffect, useRef, useState } from 'react'
import { streamType } from '../lib/channels.js'
import ChannelLogo from './ChannelLogo.jsx'
import Icon from './Icon.jsx'
import LiveBadge from './LiveBadge.jsx'

const VOL_KEY = 'legent:volume'

const savedVolume = () => {
  try {
    const v = JSON.parse(localStorage.getItem(VOL_KEY))
    return v && typeof v.volume === 'number' ? v : { volume: 1, muted: false }
  } catch {
    return { volume: 1, muted: false }
  }
}

const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement

/**
 * HTML5 player with HLS.js (loaded on demand), native HLS on Safari/iOS and
 * plain MP4 support. Custom controls, quality selection, PiP and keyboard
 * shortcuts: Space/K play, M mute, F fullscreen, P picture-in-picture, ↑/↓ volume.
 */
export default function Player({ channel, program }) {
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const hideTimer = useRef()
  const recoverTries = useRef(0)

  const [state, setState] = useState('loading') // loading | playing | paused | error
  const [buffering, setBuffering] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [{ volume, muted }, setVol] = useState(savedVolume)
  const [needsUnmute, setNeedsUnmute] = useState(false)
  const [levels, setLevels] = useState([]) // [{ index, height, bitrate }]
  const [level, setLevel] = useState(-1)
  const [activeHeight, setActiveHeight] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [pip, setPip] = useState(false)
  const [showUi, setShowUi] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const offline = !channel.isLive || !channel.streamUrl
  const pipSupported = typeof document !== 'undefined' && document.pictureInPictureEnabled

  // ── Load stream ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (offline) return
    const video = videoRef.current
    let cancelled = false
    recoverTries.current = 0
    setState('loading')
    setErrorMsg('')
    setLevels([])
    setLevel(-1)
    setActiveHeight(null)

    const fail = (msg) => {
      if (cancelled) return
      setState('error')
      setErrorMsg(msg)
    }

    const start = async () => {
      try {
        await video.play()
      } catch (e) {
        if (e?.name === 'NotAllowedError' && !video.muted) {
          // Autoplay with sound blocked — start muted and offer to unmute.
          video.muted = true
          setNeedsUnmute(true)
          try {
            await video.play()
          } catch {
            setState('paused')
          }
        } else if (e?.name !== 'AbortError') {
          setState('paused')
        }
      }
    }

    const type = streamType(channel.streamUrl)
    const nativeHls = video.canPlayType('application/vnd.apple.mpegurl')

    if (type === 'hls' && !nativeHls) {
      import('hls.js').then(({ default: Hls }) => {
        if (cancelled) return
        if (!Hls.isSupported()) return fail('This browser cannot play live HLS streams.')
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30 })
        hlsRef.current = hls
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setLevels(
            data.levels
              .map((l, index) => ({ index, height: l.height, bitrate: l.bitrate }))
              .filter((l) => l.height)
              .sort((a, b) => b.height - a.height),
          )
          start()
        })
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => setActiveHeight(hls.levels[d.level]?.height ?? null))
        hls.on(Hls.Events.ERROR, (_, d) => {
          if (!d.fatal) return
          if (recoverTries.current < 2) {
            recoverTries.current += 1
            if (d.type === Hls.ErrorTypes.NETWORK_ERROR) return hls.startLoad()
            if (d.type === Hls.ErrorTypes.MEDIA_ERROR) return hls.recoverMediaError()
          }
          hls.destroy()
          hlsRef.current = null
          fail('The stream is unavailable right now. It may be offline or blocked in your region.')
        })
        hls.loadSource(channel.streamUrl)
        hls.attachMedia(video)
      }, () => fail('The video engine failed to load. Check your connection and retry.'))
    } else {
      video.src = channel.streamUrl
      video.load()
      start()
    }

    return () => {
      cancelled = true
      hlsRef.current?.destroy()
      hlsRef.current = null
      video.removeAttribute('src')
      video.load()
    }
  }, [channel.streamUrl, offline, reloadKey])

  // ── Sync volume to the element & storage ──────────────────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
    v.muted = muted
    try {
      localStorage.setItem(VOL_KEY, JSON.stringify({ volume, muted }))
    } catch {
      /* ignore */
    }
  }, [volume, muted])

  // ── Fullscreen / PiP listeners ────────────────────────────────────────────
  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(fsElement()))
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    const v = videoRef.current
    const on = () => setPip(true)
    const off = () => setPip(false)
    v?.addEventListener('enterpictureinpicture', on)
    v?.addEventListener('leavepictureinpicture', off)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
      v?.removeEventListener('enterpictureinpicture', on)
      v?.removeEventListener('leavepictureinpicture', off)
    }
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v || offline) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [offline])

  const toggleMute = useCallback(() => {
    setNeedsUnmute(false)
    setVol((s) => ({ volume: s.muted && s.volume === 0 ? 0.6 : s.volume, muted: !s.muted }))
  }, [])

  const nudgeVolume = useCallback((delta) => {
    setNeedsUnmute(false)
    setVol((s) => {
      const v = Math.min(1, Math.max(0, Math.round((s.volume + delta) * 100) / 100))
      return { volume: v, muted: v === 0 }
    })
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current
    const v = videoRef.current
    if (fsElement()) {
      ;(document.exitFullscreen || document.webkitExitFullscreen)?.call(document)
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
      screen.orientation?.lock?.('landscape').catch(() => {})
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
    } else if (v?.webkitEnterFullscreen) {
      v.webkitEnterFullscreen() // iPhone
    }
  }, [])

  const togglePip = useCallback(async () => {
    const v = videoRef.current
    if (!v || !pipSupported) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await v.requestPictureInPicture()
    } catch {
      /* not allowed yet */
    }
  }, [pipSupported])

  const chooseLevel = (index) => {
    setLevel(index)
    if (hlsRef.current) hlsRef.current.currentLevel = index
    setMenuOpen(false)
  }

  const poke = useCallback(() => {
    setShowUi(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) {
        setShowUi(false)
        setMenuOpen(false)
      }
    }, 3200)
  }, [])

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      const map = {
        ' ': togglePlay,
        k: togglePlay,
        m: toggleMute,
        f: toggleFullscreen,
        p: togglePip,
        arrowup: () => nudgeVolume(0.1),
        arrowdown: () => nudgeVolume(-0.1),
      }
      if (!map[k]) return
      if (k === ' ' && tag === 'BUTTON') return // let buttons handle Space themselves
      e.preventDefault()
      map[k]()
      poke()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, toggleMute, toggleFullscreen, togglePip, nudgeVolume, poke])

  const effectiveVolume = muted ? 0 : volume
  const uiVisible = showUi || state !== 'playing' || menuOpen
  const qualityLabel = level === -1 ? `Auto${activeHeight ? ` · ${activeHeight}p` : ''}` : `${levels.find((l) => l.index === level)?.height}p`

  return (
    <div
      ref={wrapRef}
      onMouseMove={poke}
      onTouchStart={poke}
      onMouseLeave={() => state === 'playing' && setShowUi(false)}
      className={`group/player relative aspect-video w-full overflow-hidden bg-ink-950 select-none ${
        fullscreen ? '' : 'rounded-none sm:rounded-3xl sm:border sm:border-white/[0.07]'
      } ${uiVisible ? '' : 'cursor-none'}`}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full bg-ink-950 object-contain"
        playsInline
        preload="auto"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlaying={() => {
          setState('playing')
          setBuffering(false)
          poke()
        }}
        onPause={() => setState((s) => (s === 'error' ? s : 'paused'))}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onError={() => {
          if (!hlsRef.current) {
            setState('error')
            setErrorMsg('The stream is unavailable right now. It may be offline or blocked in your region.')
          }
        }}
        aria-label={`${channel.name} live stream`}
      />

      {/* Offline */}
      {offline && (
        <div className="absolute inset-0 grid place-items-center bg-ink-900 p-6 text-center">
          <div className="scanlines absolute inset-0" />
          <div className="relative flex flex-col items-center">
            <ChannelLogo channel={channel} size={84} className="opacity-60 grayscale" eager />
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800 px-4 py-1.5 font-mono text-xs tracking-[0.2em] text-mute uppercase">
              <Icon name="signalOff" size={14} /> Channel offline
            </p>
            <p className="mt-3 max-w-sm text-sm text-mute">
              {channel.name} isn’t broadcasting right now. Add it to Favorites and check back soon.
            </p>
          </div>
        </div>
      )}

      {/* Loading / buffering */}
      {!offline && (state === 'loading' || buffering) && state !== 'error' && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-4">
            <span className="size-14 animate-spin-slow rounded-full border-[3px] border-white/15 border-t-signal" />
            <span className="font-mono text-[11px] tracking-[0.25em] text-mute uppercase">
              {state === 'loading' ? 'Tuning in' : 'Buffering'}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && !offline && (
        <div className="absolute inset-0 grid place-items-center bg-ink-900/95 p-6 text-center">
          <div className="flex max-w-sm flex-col items-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-signal/15 text-signal">
              <Icon name="alert" size={26} />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">Stream unavailable</h3>
            <p className="mt-1.5 text-sm text-mute">{errorMsg}</p>
            <button type="button" className="btn btn-signal mt-5" onClick={() => setReloadKey((k) => k + 1)}>
              <Icon name="refresh" size={16} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Big play button when paused */}
      {!offline && state === 'paused' && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink-950 shadow-2xl transition hover:scale-105 active:scale-95"
        >
          <Icon name="play" size={32} className="translate-x-0.5" />
        </button>
      )}

      {/* Tap to unmute */}
      {needsUnmute && state === 'playing' && (
        <button
          type="button"
          onClick={() => {
            setNeedsUnmute(false)
            setVol((s) => ({ volume: s.volume || 0.8, muted: false }))
          }}
          className="absolute top-16 right-4 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink-950 shadow-xl sm:top-20"
        >
          <Icon name="mute" size={16} /> Tap to unmute
        </button>
      )}

      {/* Top bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-start gap-3 bg-linear-to-b from-ink-950/85 to-transparent p-3 transition duration-300 sm:p-5 ${
          uiVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ChannelLogo channel={channel} size={40} eager className="hidden sm:block" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LiveBadge live={!offline} />
            <p className="truncate font-display text-sm font-bold sm:text-base">{channel.name}</p>
          </div>
          {program?.title && !offline && (
            <p className="mt-1 truncate text-xs text-paper/75 sm:text-sm">{program.title}</p>
          )}
        </div>
      </div>

      {/* Controls */}
      {!offline && state !== 'error' && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-950/90 via-ink-950/40 to-transparent px-2 pt-10 pb-2 transition duration-300 sm:px-4 sm:pb-3 ${
            uiVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <CtrlButton label={state === 'playing' ? 'Pause (K)' : 'Play (K)'} onClick={togglePlay}>
              <Icon name={state === 'playing' ? 'pause' : 'play'} size={20} />
            </CtrlButton>

            <div className="group/vol flex items-center">
              <CtrlButton label={muted || volume === 0 ? 'Unmute (M)' : 'Mute (M)'} onClick={toggleMute}>
                <Icon name={muted || volume === 0 ? 'mute' : 'volume'} size={20} />
              </CtrlButton>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={effectiveVolume}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setNeedsUnmute(false)
                  setVol({ volume: v, muted: v === 0 })
                }}
                aria-label="Volume"
                className="vol ml-1 hidden w-0 opacity-0 transition-all duration-300 group-hover/vol:w-24 group-hover/vol:opacity-100 focus:w-24 focus:opacity-100 sm:block"
                style={{ '--v': `${effectiveVolume * 100}%` }}
              />
            </div>

            <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.2em] text-signal uppercase">
              <span className="live-dot" /> Live
            </span>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {levels.length > 1 && (
                <div className="relative">
                  <CtrlButton
                    label="Quality"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <Icon name="settings" size={19} />
                    <span className="ml-1.5 hidden font-mono text-[11px] sm:inline">{qualityLabel}</span>
                  </CtrlButton>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 bottom-12 min-w-40 animate-rise overflow-hidden rounded-2xl border border-white/10 bg-ink-850/95 p-1.5 shadow-2xl backdrop-blur"
                    >
                      <p className="eyebrow px-3 pt-2 pb-1.5">Quality</p>
                      {[{ index: -1, height: null }, ...levels].map((l) => (
                        <button
                          key={l.index}
                          role="menuitemradio"
                          aria-checked={level === l.index}
                          type="button"
                          onClick={() => chooseLevel(l.index)}
                          className="flex w-full items-center justify-between gap-6 rounded-xl px-3 py-2 text-left text-sm hover:bg-white/[0.07]"
                        >
                          <span>{l.index === -1 ? 'Auto' : `${l.height}p`}</span>
                          {level === l.index && <Icon name="check" size={16} className="text-signal" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {pipSupported && (
                <CtrlButton label="Picture-in-picture (P)" onClick={togglePip} active={pip}>
                  <Icon name="pip" size={19} />
                </CtrlButton>
              )}
              <CtrlButton label={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} onClick={toggleFullscreen}>
                <Icon name={fullscreen ? 'shrink' : 'expand'} size={19} />
              </CtrlButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CtrlButton({ label, onClick, children, active, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-2.5 transition hover:bg-white/15 active:scale-90 ${
        active ? 'text-signal' : 'text-paper'
      }`}
      {...rest}
    >
      {children}
    </button>
  )
}
