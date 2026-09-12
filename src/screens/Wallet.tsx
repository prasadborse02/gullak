import { useState } from 'react'
import { balance, fmtStamp, rupee } from '../logic'
import { actions, useStore } from '../store'
import { Icon } from '../components/Icon'
import { toast } from '../components/Toast'
import { confirm } from '../components/Confirm'
import type { Reward, Transaction } from '../types'

const tone: Record<Transaction['kind'], string> = { deposit: 'text-leaf', bonus: 'text-coin-2', spend: 'text-clay-text', reversal: 'text-ink-3' }

export function Wallet() {
  const s = useStore()
  const bal = balance(s)
  const [r, setR] = useState({ name: '', cost: 100 })

  const spend = async (rw: Reward) => {
    if (rw.cost > bal) return
    const ok = await confirm({
      title: `Spend ${rupee(rw.cost)} on ${rw.name}?`,
      body: `Your balance after: ${rupee(bal - rw.cost)}.`,
      confirmLabel: `Spend ${rupee(rw.cost)}`,
    })
    if (!ok) return
    const t = actions.spend(rw)
    toast(`Enjoy your ${rw.name}.`, { undo: () => actions.removeTx(t.id) })
  }
  const removeReward = (rw: Reward) => {
    const res = actions.deleteReward(rw.id)
    if (res) toast(`Removed ${rw.name}`, { undo: () => actions.addReward(res.reward, res.index) })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start">
        <div className="space-y-6">
          <section className="space-y-3">
            <h1 className="font-semibold">Balance</h1>
            <div className="card p-6 bg-gradient-to-br from-paper to-coin-soft/60">
            <p className="num font-display text-5xl font-semibold text-ink">{rupee(bal)}</p>
            <label className="mt-5 flex items-center justify-between gap-3 text-sm text-ink-2 border-t border-line/70 pt-4">
              <span>1 coin is worth <span className="caption">(future deposits)</span></span>
              <span className="inline-flex items-center rounded-lg border border-line bg-paper px-2 text-ink">
                {s.currency}<input type="number" min={0.1} step={0.1} className="num w-14 bg-transparent py-1 text-right focus:outline-none" value={s.rate} onChange={(e) => actions.setRate(+e.target.value || 0.1)} aria-label={`${s.currency} per coin`} />
              </span>
            </label>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold">Rewards</h2>
            <ul className="card divide-y divide-line">
              {s.rewards.map((rw) => (
                <li key={rw.id} className="flex items-center gap-3 pl-4 pr-2 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{rw.name}</p>
                    <p className="caption num">{rupee(rw.cost)}</p>
                  </div>
                  <button onClick={() => spend(rw)} disabled={rw.cost > bal} className="btn-primary" aria-label={`Spend ${rupee(rw.cost)} on ${rw.name}`}>Spend</button>
                  <button onClick={() => removeReward(rw)} className="btn-icon" aria-label={`Remove ${rw.name}`}><Icon name="x" size={16} /></button>
                </li>
              ))}
              {s.rewards.length === 0 && <li className="caption px-4 py-3">No rewards yet. Add something small you would enjoy.</li>}
            </ul>
            <form onSubmit={(e) => { e.preventDefault(); if (!r.name.trim() || r.cost <= 0) return; actions.addReward({ name: r.name.trim(), cost: r.cost }); setR({ name: '', cost: 100 }) }} className="flex gap-2">
              <input className="input" placeholder="Add a reward" value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} aria-label="Reward name" />
              <span className="inline-flex items-center gap-0.5 rounded-xl border border-line bg-paper px-2 shrink-0">{s.currency}<input type="number" min={1} className="num w-16 bg-transparent py-2 focus:outline-none" value={r.cost} onChange={(e) => setR({ ...r, cost: +e.target.value || 0 })} aria-label="Cost" /></span>
              <button className="btn-soft shrink-0">Add</button>
            </form>
          </section>
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold">History</h2>
          {s.transactions.length === 0 ? (
            <p className="caption">No coins yet. Finish a mini-goal to make your first deposit.</p>
          ) : (
            <ol className="card divide-y divide-line">
              {s.transactions.map((t) => (
                <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto_4.5rem] items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="truncate">{t.note}</span>
                  <span className="caption num">{fmtStamp(t.at)}</span>
                  <span className={'num font-bold text-right ' + tone[t.kind]}>{t.amount > 0 ? '+' : ''}{rupee(t.amount)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
