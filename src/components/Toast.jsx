import { useApp } from '../context/AppContext.jsx'
import Icon from './Icon.jsx'

export default function Toast() {
  const { toast } = useApp()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8"
    >
      {toast && (
        <div
          key={toast.key}
          className="flex animate-rise items-center gap-2.5 rounded-full border border-white/10 bg-ink-800/95 px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur"
        >
          <Icon name="check" size={16} className="text-moss" />
          {toast.message}
        </div>
      )}
    </div>
  )
}
