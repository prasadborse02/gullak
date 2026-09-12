import { useRef, useState } from 'react'
import { Gullak } from '../components/Gullak'
import { PaceBadge } from '../components/PaceBadge'
import { Icon } from '../components/Icon'
import { toast } from '../components/Toast'
import { confirm } from '../components/Confirm'
import { deposit } from '../deposit'
import { bonusEarned, capacity, daysEarly, daysLeft, doneCount, earned, fmtDate, fmtStamp, fraction, nextAction, pace, rupee } from '../logic'
import { actions, useStore } from '../store'
import { go } from '../router'
import type { MiniGoal } from '../types'

export function GoalDetail({ id }: { id: string }) {
  const s = useStore()
  const g = s.goals.find((x) => x.id === id)
  const pot = useRef<SVGSVGElement>(null)
  const [quick, setQuick] = useState({ title: '', points: 50 })

  if (!g) return <p className="text-ink-2">This Gullak no longer exists. <a className="underline" href="#/">Back to your Gullaks</a></p>

  const cap = capacity(g), got = earned(g), left = daysLeft(g), next = nextAction(g), done = doneCount(g), total = g.miniGoals.length
  const full = !!g.completedAt

  const undo = (m: MiniGoal) => {
    const r = actions.uncomplete(g.id, m.id)
    if (!r) return
    toast(`Took back ${m.points} coins${r.bonusReverted ? ` and a ${r.bonusReverted} bonus` : ''} · ${m.title}`, { undo: () => { actions.complete(g.id, m.id) } })
  }
  const remove = (m: MiniGoal) => {
    const r = actions.deleteMini(g.id, m.id)
    if (r) toast(`Removed ${m.title}`, { undo: () => actions.restoreMini(g.id, r.mini, r.index) })
  }
  const removeGoal = async () => {
    const ok = await confirm({
      title: `Delete “${g.title}”?`,
      body: 'Coins already in your wallet stay there. The goal and its mini-goals go.',
      confirmLabel: 'Delete goal',
      danger: true,
    })
    if (ok) { actions.deleteGoal(g.id); go('/') }
  }

  const phases = [...new Set(g.miniGoals.map((m) => m.phase ?? ''))]
  const nodes = [
    ...[...g.checkpoints].sort((a, b) => a.atCount - b.atCount).map((c) => ({ id: c.id, at: c.atCount, bonus: c.bonus, done: !!c.awardedAt, label: `${c.atCount}/${total}` })),
    ...(g.completionBonus > 0 ? [{ id: 'full', at: total, bonus: g.completionBonus, done: !!g.completionBonusAwardedAt, label: 'Full' }] : []),
  ]
  const goalTx = s.transactions.filter((t) => t.goalId === g.id)
  const wallet = goalTx.reduce((a, t) => a + t.amount, 0)
  const stamps = goalTx.filter((t) => t.kind === 'deposit').map((t) => t.at).sort()
  const early = daysEarly(g)

  return (
    <div className="space-y-6">
      <nav className="flex items-center justify-between text-sm" aria-label="Goal">
        <a href="#/" className="inline-flex items-center gap-1 text-ink-2 hover:text-ink py-2"><Icon name="back" size={16} />Back</a>
        <div className="flex gap-1">
          <a href={`#/goal/${g.id}/edit`} className="btn-ghost">Edit</a>
          <button onClick={removeGoal} className="btn-ghost">Delete</button>
        </div>
      </nav>

      <section className="card p-5 md:p-8 md:grid md:grid-cols-[auto_1fr] md:gap-8 md:items-center">
        <Gullak ref={pot} fraction={fraction(g)} done={full} size={200} className="mx-auto w-[120px] h-auto md:w-[200px]" />
        <div className="min-w-0 mt-4 md:mt-0 text-center md:text-left">
          <PaceBadge pace={pace(g)} />
          <h1 className="font-display text-3xl leading-tight mt-2 text-balance">{g.title}</h1>
          {g.description && <p className="text-ink-2 mt-1 leading-relaxed">{g.description}</p>}
          <p className="mt-4 num">
            <span className="text-4xl font-bold">{got}</span>
            <span className="text-ink-3"> / {cap} coins</span>
            {!full && got > 0 && cap > got && <span className="text-ink-2 text-sm"> · {cap - got} to go</span>}
          </p>

          {next && !full && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-clay/25 bg-clay-soft/40 p-3 pl-4 text-left">
              <div className="flex-1 min-w-0">
                <p className="caption text-clay-text">Next deposit</p>
                <p className="font-semibold truncate">{next.title}</p>
                <p className="caption num">{next.points} coins{next.dueDate ? ` · due ${fmtDate(next.dueDate)}` : ''}</p>
              </div>
              <button onClick={(e) => deposit(g, next, e.currentTarget, pot.current)} className="btn-primary shrink-0" aria-label={`Deposit coins for ${next.title}`}>Deposit coins</button>
            </div>
          )}

          <dl className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
            <div><dt className="caption">Deadline</dt><dd className="num font-semibold">{fmtDate(g.deadline)}</dd></div>
            {!full && <div><dt className="caption">Days left</dt><dd className="num font-semibold">{left >= 0 ? left : `${-left} days over`}</dd></div>}
            {!full && <div><dt className="caption">Bonus earned</dt><dd className="num font-semibold text-coin-2">+{bonusEarned(g)}</dd></div>}
          </dl>
        </div>
      </section>

      {full && (
        <section className="card p-6 md:p-8 border-coin/50">
          <h2 className="font-display text-2xl text-balance">Broke open {fmtStamp(g.completedAt!)}</h2>
          <p className="text-ink-2 mt-1">
            {early > 0 ? `${early} days before the deadline` : early === 0 ? 'Right on the deadline' : `${-early} days after the deadline`} · {cap} coins in {total} deposits
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <div><dt className="caption">Bonus</dt><dd className="num text-xl font-bold text-coin-2">+{bonusEarned(g)}</dd></div>
            {stamps.length > 0 && <div><dt className="caption">First deposit</dt><dd className="num font-semibold">{fmtStamp(stamps[0])}</dd></div>}
            {stamps.length > 0 && <div><dt className="caption">Last deposit</dt><dd className="num font-semibold">{fmtStamp(stamps[stamps.length - 1])}</dd></div>}
          </dl>
          <p className="mt-5 text-ink-2">This Gullak put <span className="num font-semibold text-ink">{rupee(wallet)}</span> in your wallet.</p>
          <a href="#/wallet" className="btn-primary mt-4">Spend from wallet</a>
        </section>
      )}

      {nodes.length > 0 && (
        <section className="card p-5">
          <h2 className="font-semibold">Checkpoints</h2>
          <div className="relative mx-4 mt-5 mb-12">
            <div className="h-0.5 rounded bg-line" />
            <div className="absolute left-0 top-0 h-0.5 rounded bg-coin transition-[width] duration-700" style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
            {nodes.map((n) => (
              <div key={n.id} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${(n.at / Math.max(1, total)) * 100}%`, top: -11 }}>
                <span className={'h-6 w-6 rounded-full grid place-items-center border-2 ' + (n.done ? 'bg-coin border-coin text-ink' : 'bg-paper border-line text-ink-3')}>
                  {n.done ? <Icon name="check" size={14} /> : <span className="num text-xs font-bold leading-none">{n.at}</span>}
                </span>
                <span className="num mt-1 text-xs text-ink-2 whitespace-nowrap">{n.label}</span>
                <span className="num text-xs font-semibold text-coin-2">+{n.bonus}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Mini-goals</h2>
          <span className="num text-sm text-ink-2">{done} of {total} done</span>
        </div>
        {phases.map((ph) => (
          <div key={ph} className="space-y-1.5">
            {ph && <h3 className="text-sm font-semibold text-ink-2 pt-2">{ph}</h3>}
            {g.miniGoals.filter((m) => (m.phase ?? '') === ph).map((m) => (
              <div key={m.id} className={'card group p-3 flex items-center gap-3 ' + (m.completedAt ? 'opacity-75' : '')}>
                <button
                  onClick={(e) => (m.completedAt ? undo(m) : deposit(g, m, e.currentTarget, pot.current))}
                  aria-label={m.completedAt ? `Take back ${m.title}` : `Complete ${m.title}`}
                  className={'h-10 w-10 shrink-0 rounded-full border-2 grid place-items-center transition ' + (m.completedAt ? 'bg-coin border-coin text-ink' : 'border-line hover:border-coin hover:bg-coin-soft')}
                >{m.completedAt && <Icon name="check" size={16} />}</button>
                <div className="flex-1 min-w-0">
                  <p className={'font-medium truncate ' + (m.completedAt ? 'line-through text-ink-2' : '')}>{m.title}</p>
                  <p className="caption num truncate">
                    {m.points} coins
                    {m.dueDate ? ` · due ${fmtDate(m.dueDate)}` : ''}
                    {m.priority !== 'medium' ? ` · ${m.priority}` : ''}
                    {m.description ? ` · ${m.description}` : ''}
                  </p>
                </div>
                {!full && (
                  <div className="hidden md:flex -mr-1 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                    <button onClick={() => actions.moveMini(g.id, m.id, -1)} className="btn-icon" aria-label={`Move ${m.title} up`}><Icon name="up" size={16} /></button>
                    <button onClick={() => actions.moveMini(g.id, m.id, 1)} className="btn-icon" aria-label={`Move ${m.title} down`}><Icon name="down" size={16} /></button>
                    <button onClick={() => remove(m)} className="btn-icon" aria-label={`Remove ${m.title}`}><Icon name="x" size={16} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        {!full && (
          <form
            onSubmit={(e) => { e.preventDefault(); if (!quick.title.trim()) return; actions.addMini(g.id, { title: quick.title.trim(), points: quick.points, priority: 'medium' }); setQuick({ title: '', points: 50 }) }}
            className="flex gap-2"
          >
            <input className="input" placeholder="Add a mini-goal" value={quick.title} onChange={(e) => setQuick({ ...quick, title: e.target.value })} aria-label="New mini-goal" />
            <input type="number" min={0} className="input num w-24" value={quick.points} onChange={(e) => setQuick({ ...quick, points: +e.target.value || 0 })} aria-label="Coins" />
            <button className="btn-soft shrink-0">Add</button>
          </form>
        )}
      </section>
    </div>
  )
}
