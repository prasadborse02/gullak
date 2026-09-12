import { useRef } from 'react'
import { Gullak } from '../components/Gullak'
import { PaceBadge } from '../components/PaceBadge'
import { Icon } from '../components/Icon'
import { toast } from '../components/Toast'
import { confirm } from '../components/Confirm'
import { deposit } from '../deposit'
import { balance, capacity, daysLeft, doneCount, earned, fmtDate, fraction, nextAction, pace, rupee } from '../logic'
import { actions, useStore } from '../store'
import { go } from '../router'
import type { Goal } from '../types'

function GoalCard({ g }: { g: Goal }) {
  const pot = useRef<SVGSVGElement>(null)
  const cap = capacity(g), got = earned(g), left = daysLeft(g), next = nextAction(g)
  const href = `#/goal/${g.id}`
  return (
    <article className="card p-5 flex gap-4 w-full min-w-0 animate-rise">
      <a href={href} aria-label={`Open ${g.title}`} className="shrink-0 -ml-1 rounded-xl">
        <Gullak ref={pot} fraction={fraction(g)} size={96} />
      </a>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg leading-tight text-ink line-clamp-2 text-balance">
          <a href={href} className="hover:underline decoration-coin decoration-2 underline-offset-4">{g.title}</a>
        </h2>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 num">
          <span className="text-2xl font-bold text-ink">{got}<span className="text-sm font-normal text-ink-3"> / {cap} coins</span></span>
          <PaceBadge pace={pace(g)} />
        </p>
        <p className="caption num mt-1">
          {fmtDate(g.deadline)} · {left >= 0 ? `${left} days left` : `${-left} days over`} · {doneCount(g)} of {g.miniGoals.length} done
        </p>
        {next && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-cream-2/70 p-2 pl-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{next.title}</p>
              <p className="caption num">{next.points} coins{next.dueDate ? ` · due ${fmtDate(next.dueDate)}` : ''}</p>
            </div>
            <button onClick={(e) => deposit(g, next, e.currentTarget, pot.current)} className="btn-primary shrink-0" aria-label={`Deposit coins for ${next.title}`}>Deposit</button>
          </div>
        )}
      </div>
    </article>
  )
}

export function Dashboard() {
  const s = useStore()
  const active = s.goals.filter((g) => !g.completedAt)
  const file = useRef<HTMLInputElement>(null)

  const exportJSON = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([actions.exportJSON()], { type: 'application/json' }))
    a.download = `gullak-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importJSON = async (f?: File) => {
    if (!f) return
    const parsed = actions.parseImport(await f.text())
    const next = parsed.state
    if (!next) return toast(parsed.error ?? 'Could not read that file.', { error: true })
    const ok = await confirm({
      title: 'Replace everything with this backup?',
      body: `The file holds ${next.goals.length} goals and ${next.transactions.length} wallet entries. Your current ${s.goals.length} goals and ${s.transactions.length} entries will be downloaded as a backup first, then replaced.`,
      confirmLabel: 'Download current, then replace',
      danger: true,
    })
    if (!ok) return
    if (s.goals.length || s.transactions.length) exportJSON()
    actions.applyImport(next)
    toast('Backup restored')
  }

  const broken = s.goals.filter((g) => g.completedAt).length
  const headline =
    active.length > 0
      ? `${active.length} Gullak${active.length === 1 ? '' : 's'} waiting for a deposit`
      : broken > 0
        ? `You broke ${broken === 1 ? 'one' : broken} open. Start the next?`
        : 'Small deposits. Big dreams.'

  return (
    <div className="space-y-6">
      <section className="flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl text-ink text-balance">{headline}</h1>
        {active.length > 0 && <button onClick={() => go('/new')} className="btn-primary shrink-0"><Icon name="plus" size={16} />New goal</button>}
      </section>

      {active.length === 0 ? (
        <div className="card p-10 text-center">
          <Gullak fraction={broken ? 1 : 0} done={broken > 0} size={140} className="mx-auto" />
          {broken ? (
            <>
              <h2 className="font-display text-xl mt-4">Every Gullak is broken open</h2>
              <p className="text-ink-2 mt-1 max-w-sm mx-auto leading-relaxed">{rupee(balance(s))} sits in your wallet. Pick the next thing you really want and start filling again.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button onClick={() => go('/new')} className="btn-primary">Start the next goal</button>
                <a href="#/completed" className="btn-soft">See what you finished</a>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl mt-4">Your Gullak is empty</h2>
              <p className="text-ink-2 mt-1 max-w-sm mx-auto leading-relaxed">Pick something you really want. Break it into small pieces. Every piece you finish drops a coin in.</p>
              <button onClick={() => go('/new')} className="btn-primary mt-5">Start a goal</button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {active.map((g) => <GoalCard key={g.id} g={g} />)}
        </div>
      )}

      <a href="#/wallet" className="card w-full p-4 flex items-center gap-4 text-left hover:border-coin/60 transition">
        <div className="h-11 w-11 rounded-full bg-coin-soft grid place-items-center text-coin-2 font-semibold" style={{ fontSize: s.currency.length > 1 ? 12 : 20 }} aria-hidden="true">{s.currency}</div>
        <div className="flex-1">
          <p className="caption">Reward wallet</p>
          <p className="num text-2xl font-bold text-ink leading-tight">{rupee(balance(s))}</p>
        </div>
        <span className="text-sm font-medium text-ink-2">Spend</span>
      </a>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3 pt-6">
        <span>Everything stays on this device.</span>
        <button onClick={exportJSON} className="py-2 underline underline-offset-2 hover:text-ink">Export backup</button>
        <button onClick={() => file.current?.click()} className="py-2 underline underline-offset-2 hover:text-ink">Import backup</button>
        <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { importJSON(e.target.files?.[0]); e.target.value = '' }} />
      </footer>
    </div>
  )
}
