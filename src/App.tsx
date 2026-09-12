import { useRef, useState } from 'react'
import { useHash } from './router'
import { Dashboard } from './screens/Dashboard'
import { GoalForm } from './screens/GoalForm'
import { GoalDetail } from './screens/GoalDetail'
import { Wallet } from './screens/Wallet'
import { Completed } from './screens/Completed'
import { ToastHost } from './components/Toast'
import { ConfirmHost } from './components/Confirm'
import { Icon } from './components/Icon'
import { setPalette, usePalette } from './theme'
import { ThemePicker } from './components/ThemePicker'
import { isMuted, setMuted } from './sound'
import { currencies } from './logic'
import { actions, useStore } from './store'

// The wordmark is home. Phones show all three in the bottom bar; desktop shows the two beside the wordmark.
const tabs = [
  ['/', 'Gullak'],
  ['/wallet', 'Wallet'],
  ['/completed', 'Completed'],
] as const

export default function App() {
  const path = useHash()
  const [muted, setM] = useState(isMuted)
  const store = useStore()
  const custom = !(currencies as readonly string[]).includes(store.currency)
  const palette = usePalette()
  const themeDialog = useRef<HTMLDialogElement>(null)

  const goal = path.match(/^\/goal\/([^/]+)(\/edit)?$/)
  const screen = goal
    ? goal[2] ? <GoalForm key={goal[1]} id={goal[1]} /> : <GoalDetail id={goal[1]} />
    : path === '/new' ? <GoalForm key="new" />
    : path === '/wallet' ? <Wallet />
    : path === '/completed' ? <Completed />
    : <Dashboard />

  const toggleMute = () => { setMuted(!muted); setM(!muted) }

  if (palette === null) return <FirstRun />

  return (
    <div className="min-h-dvh flex flex-col">
      <a href="#main" className="skip">Skip to content</a>
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-4xl px-4 h-14 flex items-center gap-4">
          <a href="#/" aria-current={path === '/' ? 'page' : undefined} className="font-display text-xl font-semibold tracking-tight text-ink">Gullak</a>
          <nav className="hidden md:flex gap-1 text-sm" aria-label="Primary">
            {tabs.slice(1).map(([p, l]) => (
              <a key={p} href={'#' + p} aria-current={path === p ? 'page' : undefined} className={'rounded-full px-3 py-1.5 font-medium transition ' + (path === p ? 'bg-ink text-cream' : 'text-ink-2 hover:bg-cream-2 hover:text-ink')}>{l}</a>
            ))}
          </nav>
          <button onClick={() => themeDialog.current?.showModal()} className="btn-icon ml-auto -mr-2" aria-label="Settings" title="Settings">
            <Icon name="settings" />
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 md:pb-10 flex-1 focus:outline-none">{screen}</main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur border-t border-line grid grid-cols-3 text-xs pb-[env(safe-area-inset-bottom)]" aria-label="Primary">
        {tabs.map(([p, l]) => (
          <a key={p} href={'#' + p} aria-current={path === p ? 'page' : undefined} className={'py-3.5 text-center font-semibold ' + (path === p ? 'text-clay-text' : 'text-ink-2')}>{l}</a>
        ))}
      </nav>
      <ToastHost />
      <ConfirmHost />
      <dialog ref={themeDialog} className="m-auto w-[min(94vw,44rem)] rounded-2xl border border-line bg-paper text-ink p-6 shadow-2xl backdrop:bg-transparent animate-rise" aria-labelledby="settings-title">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 id="settings-title" className="font-display text-xl">Settings</h2>
          <button onClick={() => themeDialog.current?.close()} className="btn-icon -mr-2 -mt-2" aria-label="Close"><Icon name="x" /></button>
        </div>
        <ThemePicker />
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="font-semibold text-sm">Coin sounds</p>
            <p className="caption">A clink when coins land in the pot.</p>
          </div>
          <button onClick={toggleMute} role="switch" aria-checked={!muted} className={'relative h-7 w-12 rounded-full transition ' + (muted ? 'bg-line' : 'bg-clay')} aria-label="Coin sounds">
            <span className={'absolute top-1 h-5 w-5 rounded-full bg-paper shadow transition ' + (muted ? 'left-1' : 'left-6')} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="font-semibold text-sm">Currency</p>
            <p className="caption">Shown before wallet amounts. Coins stay coins.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={custom ? 'other' : store.currency}
              onChange={(e) => actions.setCurrency(e.target.value === 'other' ? '' : e.target.value)}
              className="input w-auto py-1.5 text-sm"
              aria-label="Currency symbol"
            >
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="other">Other</option>
            </select>
            {custom && (
              <input
                className="input w-16 py-1.5 text-sm text-center"
                value={store.currency}
                maxLength={4}
                onChange={(e) => actions.setCurrency(e.target.value)}
                aria-label="Custom currency symbol"
                placeholder="Rs"
              />
            )}
          </div>
        </div>
        <div className="mt-5 flex justify-end"><button onClick={() => themeDialog.current?.close()} className="btn-primary">Done</button></div>
      </dialog>
    </div>
  )
}

/** First launch: pick a look before anything else. Everything here is live. */
function FirstRun() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6 animate-rise">
        <div className="text-center">
          <h1 className="font-display text-3xl text-balance">Small deposits. Big dreams.</h1>
          <p className="text-ink-2 mt-2">Gullak is your progress bank. First, choose how it should look. You can change this any time.</p>
        </div>
        <ThemePicker />
        <div className="flex justify-center">
          <button onClick={() => setPalette((document.documentElement.dataset.palette as 'ledger' | 'quiet' | undefined) ?? 'clay')} className="btn-primary px-6">Continue</button>
        </div>
      </div>
    </main>
  )
}
