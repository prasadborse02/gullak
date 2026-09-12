import { useEffect, useSyncExternalStore } from 'react'

type ToastMsg = { id: number; text: string; undo?: () => void; ms: number; error?: boolean }

let current: ToastMsg | null = null
let seq = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Show one message. Undo and error toasts stay 5s (errors also get a dismiss); plain ones 2.6s. */
export function toast(text: string, opts: { undo?: () => void; error?: boolean } = {}) {
  current = { id: ++seq, text, undo: opts.undo, error: opts.error, ms: opts.undo || opts.error ? 5000 : 2600 }
  emit()
}
const dismiss = () => { current = null; emit() }

export function ToastHost() {
  const t = useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => current)
  useEffect(() => {
    if (!t) return
    const h = setTimeout(() => { if (current?.id === t.id) { current = null; emit() } }, t.ms)
    return () => clearTimeout(h)
  }, [t])
  return (
    <div
      role={t?.error ? 'alert' : 'status'}
      aria-live={t?.error ? 'assertive' : 'polite'}
      className="fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:bottom-8"
    >
      {t && (
        <div key={t.id} className={'pointer-events-auto flex items-center gap-3 rounded-full pl-5 pr-2 py-2 text-sm font-semibold shadow-lg max-w-full animate-rise ' + (t.error ? 'bg-clay text-paper' : 'bg-ink text-cream')}>
          <span className="truncate">{t.text}</span>
          {t.undo ? (
            <button onClick={() => { t.undo?.(); dismiss() }} className="rounded-full bg-cream/15 hover:bg-cream/25 px-3 py-1 text-cream focus-visible:outline-cream">Undo</button>
          ) : t.error ? (
            <button onClick={dismiss} className="rounded-full bg-paper/20 hover:bg-paper/30 px-3 py-1 text-paper focus-visible:outline-paper">Dismiss</button>
          ) : <span className="w-3" />}
        </div>
      )}
    </div>
  )
}
