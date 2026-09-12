import { useEffect, useRef, useSyncExternalStore } from 'react'

type Req = {
  title: string
  body?: string
  confirmLabel: string
  danger?: boolean
  resolve: (ok: boolean) => void
}

let current: Req | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** In-app replacement for window.confirm. Resolves false on Escape or Cancel. */
export const confirm = (opts: Omit<Req, 'resolve'>) =>
  new Promise<boolean>((resolve) => {
    current = { ...opts, resolve }
    emit()
  })

export function ConfirmHost() {
  const req = useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => current)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (req && ref.current && !ref.current.open) ref.current.showModal()
  }, [req])
  if (!req) return null
  const done = (ok: boolean) => {
    req.resolve(ok)
    current = null
    emit()
  }
  return (
    <dialog
      ref={ref}
      onClose={() => done(false)}
      onCancel={(e) => { e.preventDefault(); done(false) }}
      className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-line bg-paper text-ink p-6 shadow-2xl backdrop:bg-transparent animate-rise"
      aria-labelledby="confirm-title"
      aria-describedby={req.body ? 'confirm-body' : undefined}
    >
      <h2 id="confirm-title" className="font-display text-xl leading-snug">{req.title}</h2>
      {req.body && <p id="confirm-body" className="mt-2 text-ink-2 leading-relaxed">{req.body}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={() => done(false)} className="btn-ghost" autoFocus>Cancel</button>
        <button onClick={() => done(true)} className={req.danger ? 'btn-danger' : 'btn-primary'}>{req.confirmLabel}</button>
      </div>
    </dialog>
  )
}
