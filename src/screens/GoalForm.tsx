import { useState } from 'react'
import { plusDays, today, uid } from '../logic'
import { actions, useStore } from '../store'
import { go } from '../router'
import { Icon } from '../components/Icon'
import type { Checkpoint, Goal, MiniGoal, Priority } from '../types'

type Draft = Omit<Goal, 'id' | 'createdAt' | 'completedAt' | 'completionBonusAwardedAt'>

const blankMini = (): MiniGoal => ({ id: uid(), title: '', points: 50, priority: 'medium', completedAt: null })

const seed = (): Draft => ({
  title: '',
  description: '',
  startDate: today(),
  deadline: plusDays(30),
  miniGoals: [blankMini(), blankMini(), blankMini()],
  checkpoints: [],
  completionBonus: 200,
})

export function GoalForm({ id }: { id?: string }) {
  const s = useStore()
  const existing = id ? s.goals.find((g) => g.id === id) : undefined
  const [d, setD] = useState<Draft>(() => (existing ? structuredClone(existing) : seed()))
  const patch = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))
  const setMini = (i: number, p: Partial<MiniGoal>) => patch({ miniGoals: d.miniGoals.map((m, j) => (j === i ? { ...m, ...p } : m)) })
  const moveMini = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= d.miniGoals.length) return
    const arr = [...d.miniGoals]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    patch({ miniGoals: arr })
  }
  const setCp = (i: number, p: Partial<Checkpoint>) => patch({ checkpoints: d.checkpoints.map((c, j) => (j === i ? { ...c, ...p } : c)) })

  const minis = d.miniGoals.filter((m) => m.title.trim())
  const total = minis.reduce((a, m) => a + m.points, 0)
  const problems = [
    !d.title.trim() && 'Name the goal.',
    minis.length === 0 && 'Add at least one mini-goal.',
    d.deadline < d.startDate && 'The deadline is before the start date.',
  ].filter(Boolean) as string[]
  const valid = problems.length === 0

  const suggestCheckpoints = () => {
    const n = minis.length
    const pts = [Math.ceil(n / 3), Math.ceil((2 * n) / 3)].filter((v, i, a) => v > 0 && v < n && a.indexOf(v) === i)
    patch({ checkpoints: pts.map((atCount, i) => ({ id: uid(), atCount, bonus: [50, 100][i] ?? 100, awardedAt: null })) })
  }

  const submit = () => {
    if (!valid) return
    const clean: Draft = {
      ...d,
      title: d.title.trim(),
      completionBonus: Math.max(0, d.completionBonus),
      miniGoals: minis.map((m) => ({ ...m, title: m.title.trim(), points: Math.max(0, m.points) })),
      checkpoints: d.checkpoints.filter((c) => c.atCount > 0 && c.atCount <= minis.length).sort((a, b) => a.atCount - b.atCount),
    }
    if (existing) {
      actions.updateGoal(existing.id, clean)
      go(`/goal/${existing.id}`)
    } else go(`/goal/${actions.addGoal(clean)}`)
  }

  const phases = [...new Set(d.miniGoals.map((m) => m.phase).filter(Boolean))] as string[]

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl text-balance">{existing ? `Edit · ${existing.title}` : 'What are you saving for?'}</h1>

      <section className="card p-5 space-y-4">
        <div>
          <label className="label" htmlFor="title">Measurable goal</label>
          <input id="title" className="input text-lg" placeholder="Run a marathon in 2 hours" value={d.title} onChange={(e) => patch({ title: e.target.value })} required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="desc">Why it matters <span className="font-normal text-ink-3">(optional)</span></label>
          <textarea id="desc" className="input" rows={2} value={d.description} onChange={(e) => patch({ description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="start">Start</label>
            <input id="start" type="date" className="input" value={d.startDate} onChange={(e) => patch({ startDate: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="end">Realistic deadline</label>
            <input id="end" type="date" className="input" value={d.deadline} min={d.startDate} onChange={(e) => patch({ deadline: e.target.value })} required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="completion">Completion bonus</label>
          <div className="flex items-center gap-3">
            <input id="completion" type="number" min={0} className="input num w-32" value={d.completionBonus} onChange={(e) => patch({ completionBonus: +e.target.value || 0 })} />
            <span className="caption">extra coins the moment the pot is full</span>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-ink">Mini-goals</h2>
          <span className="num text-sm text-ink-2">{total} coins total</span>
        </div>
        <p className="caption mt-0.5">Each one you finish deposits its coins. Give bigger work more coins.</p>
        <ol className="mt-3 divide-y divide-line">
          {d.miniGoals.map((m, i) => (
            <li key={m.id} className="py-3 grid gap-2 grid-cols-[1fr_4.5rem] sm:grid-cols-[1fr_5rem_auto]">
              <input className="input" placeholder={i === 0 ? 'First piece of the work' : `Mini-goal ${i + 1}`} value={m.title} onChange={(e) => setMini(i, { title: e.target.value })} aria-label={`Mini-goal ${i + 1} title`} />
              <input type="number" min={0} className="input num" value={m.points} onChange={(e) => setMini(i, { points: +e.target.value || 0 })} aria-label={`Mini-goal ${i + 1} coins`} />
              <div className="flex -mr-2 col-span-2 sm:col-span-1 justify-end">
                <button type="button" onClick={() => moveMini(i, -1)} className="btn-icon" aria-label={`Move mini-goal ${i + 1} up`} disabled={i === 0}><Icon name="up" size={16} /></button>
                <button type="button" onClick={() => moveMini(i, 1)} className="btn-icon" aria-label={`Move mini-goal ${i + 1} down`} disabled={i === d.miniGoals.length - 1}><Icon name="down" size={16} /></button>
                <button type="button" onClick={() => patch({ miniGoals: d.miniGoals.filter((_, j) => j !== i) })} className="btn-icon" aria-label={`Remove mini-goal ${i + 1}`}><Icon name="x" /></button>
              </div>
              <details className="col-span-full group">
                <summary className="cursor-pointer text-sm text-ink-2 hover:text-ink list-none inline-flex items-center gap-1 py-1">
                  <Icon name="down" size={14} className="transition group-open:rotate-180" />
                  {m.phase || m.dueDate || m.priority !== 'medium' ? [m.phase, m.dueDate, m.priority !== 'medium' ? m.priority : ''].filter(Boolean).join(' · ') : 'Phase, due date, priority'}
                </summary>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <input list="phases" className="input text-sm" placeholder="Phase" value={m.phase ?? ''} onChange={(e) => setMini(i, { phase: e.target.value || undefined })} aria-label={`Mini-goal ${i + 1} phase`} />
                  <input type="date" className="input text-sm" value={m.dueDate ?? ''} min={d.startDate} max={d.deadline} onChange={(e) => setMini(i, { dueDate: e.target.value || undefined })} aria-label={`Mini-goal ${i + 1} due date`} />
                  <select className="input text-sm" value={m.priority} onChange={(e) => setMini(i, { priority: e.target.value as Priority })} aria-label={`Mini-goal ${i + 1} priority`}>
                    <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                </div>
              </details>
            </li>
          ))}
        </ol>
        <datalist id="phases">{phases.map((p) => <option key={p} value={p} />)}</datalist>
        <button type="button" onClick={() => patch({ miniGoals: [...d.miniGoals, blankMini()] })} className="btn-soft mt-2"><Icon name="plus" size={16} />Add mini-goal</button>
      </section>

      <section className="card p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-ink">Checkpoints</h2>
          <button type="button" onClick={suggestCheckpoints} className="btn-ghost -mr-2" disabled={minis.length < 3}>Suggest</button>
        </div>
        <p className="caption -mt-2">Bonus coins when you reach a count of finished mini-goals. Each pays once. The completion bonus above covers the end.</p>
        {d.checkpoints.map((c, i) => (
          <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-2">After</span>
            <input type="number" min={1} max={Math.max(1, minis.length)} className="input num w-20" value={c.atCount} onChange={(e) => setCp(i, { atCount: +e.target.value || 1 })} aria-label={`Checkpoint ${i + 1} mini-goal count`} />
            <span className="text-ink-2 num">of {minis.length}, bonus</span>
            <input type="number" min={0} className="input num w-24" value={c.bonus} onChange={(e) => setCp(i, { bonus: +e.target.value || 0 })} aria-label={`Checkpoint ${i + 1} bonus coins`} />
            <button type="button" onClick={() => patch({ checkpoints: d.checkpoints.filter((_, j) => j !== i) })} className="btn-icon" aria-label={`Remove checkpoint ${i + 1}`}><Icon name="x" /></button>
          </div>
        ))}
        <button type="button" onClick={() => patch({ checkpoints: [...d.checkpoints, { id: uid(), atCount: Math.max(1, Math.ceil(minis.length / 2)), bonus: 100, awardedAt: null }] })} className="btn-soft"><Icon name="plus" size={16} />Add checkpoint</button>
      </section>

      <div className="flex flex-wrap items-center gap-3 justify-end">
        {!valid && <p className="caption mr-auto" aria-live="polite">{problems[0]}</p>}
        <button type="button" onClick={() => go(existing ? `/goal/${existing.id}` : '/')} className="btn-ghost">Cancel</button>
        <button type="submit" className="btn-primary" disabled={!valid}>{existing ? 'Save changes' : 'Create Gullak'}</button>
      </div>
    </form>
  )
}
