import { useEffect, useState } from 'react'
import { fmtDate, plusDays, today, uid } from '../logic'
import { actions, useStore } from '../store'
import { go } from '../router'
import { Icon } from '../components/Icon'
import { Gullak } from '../components/Gullak'
import { confirm } from '../components/Confirm'
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
  const draftKey = `gullak:draft:${id ?? 'new'}`
  const [d, setD] = useState<Draft>(() => {
    try { const raw = sessionStorage.getItem(draftKey); if (raw) return JSON.parse(raw) } catch { /* fall through */ }
    return existing ? structuredClone(existing) : seed()
  })
  // ponytail: sessionStorage survives a backgrounded PWA and a reload, not a closed tab; enough for a plan in progress
  useEffect(() => { try { sessionStorage.setItem(draftKey, JSON.stringify(d)) } catch { /* private mode */ } }, [d, draftKey])
  const dirty = existing
    ? JSON.stringify(d) !== JSON.stringify(existing)
    : !!(d.title || d.description || d.miniGoals.some((m) => m.title) || d.checkpoints.length)
  const [tried, setTried] = useState(false) // empty-field errors only appear after the first Create attempt
  const patch = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))
  const focus = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus())
  const addMini = () => { patch({ miniGoals: [...d.miniGoals, blankMini()] }); focus(`mini-${d.miniGoals.length + 1}`) }
  const removeMini = (i: number) => { patch({ miniGoals: d.miniGoals.filter((_, j) => j !== i) }); focus(d.miniGoals.length > 1 ? `mini-${Math.max(1, i)}` : 'add-mini') }
  const addCp = () => { const c = { id: uid(), atCount: nextCount ?? 1, bonus: 100, awardedAt: null }; patch({ checkpoints: [...d.checkpoints, c] }); focus(`cp-${c.id}`) }
  const removeCp = (i: number) => { patch({ checkpoints: d.checkpoints.filter((_, j) => j !== i) }); focus(i > 0 ? `cp-${d.checkpoints[i - 1].id}` : 'add-cp') }
  const setMini = (i: number, p: Partial<MiniGoal>) => patch({ miniGoals: d.miniGoals.map((m, j) => (j === i ? { ...m, ...p } : m)) })
  const setCp = (i: number, p: Partial<Checkpoint>) => patch({ checkpoints: d.checkpoints.map((c, j) => (j === i ? { ...c, ...p } : c)) })

  const minis = d.miniGoals.filter((m) => m.title.trim())
  const total = minis.reduce((a, m) => a + m.points, 0)
  const errs = {
    title: !d.title.trim() ? 'Name the goal.' : '',
    minis: minis.length === 0 ? 'Add at least one mini-goal with a title.' : '',
    end: d.deadline < d.startDate ? 'The deadline is before the start date.' : '',
  }
  const valid = !errs.title && !errs.minis && !errs.end
  const shown = { title: tried && errs.title, minis: tried && errs.minis, end: errs.end } // a bad deadline is wrong the moment it is set
  const usedCounts = new Set(d.checkpoints.map((c) => c.atCount))
  const lastCount = minis.length - 1 // the full pot is the completion bonus's job
  const nextCount = Array.from({ length: Math.max(0, lastCount) }, (_, i) => i + 1).find((n) => !usedCounts.has(n))

  const suggestCheckpoints = () => {
    const n = minis.length
    const pts = [Math.ceil(n / 3), Math.ceil((2 * n) / 3)].filter((v, i, a) => v > 0 && v < n && a.indexOf(v) === i)
    patch({ checkpoints: pts.map((atCount, i) => ({ id: uid(), atCount, bonus: [50, 100][i] ?? 100, awardedAt: null })) })
  }

  const submit = () => {
    if (!valid) {
      setTried(true)
      document.getElementById(errs.title ? 'title' : errs.minis ? 'mini-1' : 'end')?.focus()
      return
    }
    const seen = new Set<number>()
    const clean: Draft = {
      ...d,
      title: d.title.trim(),
      completionBonus: Math.max(0, d.completionBonus),
      miniGoals: minis.map((m) => ({ ...m, title: m.title.trim(), points: Math.max(0, m.points) })),
      checkpoints: d.checkpoints
        .filter((c) => c.atCount > 0 && c.atCount < minis.length && !seen.has(c.atCount) && seen.add(c.atCount))
        .sort((a, b) => a.atCount - b.atCount),
    }
    sessionStorage.removeItem(draftKey)
    if (existing) {
      actions.updateGoal(existing.id, clean)
      go(`/goal/${existing.id}`)
    } else go(`/goal/${actions.addGoal(clean)}`)
  }

  const cancel = async () => {
    if (dirty && !(await confirm({ title: existing ? 'Discard these changes?' : 'Discard this Gullak?', body: 'Nothing has been saved yet.', confirmLabel: 'Discard', danger: true }))) return
    sessionStorage.removeItem(draftKey)
    go(existing ? `/goal/${existing.id}` : '/')
  }

  const phases = [...new Set(d.miniGoals.map((m) => m.phase).filter(Boolean))] as string[]

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl text-balance">{existing ? `Edit · ${existing.title}` : 'What are you saving for?'}</h1>

      <section className="card p-5 space-y-4">
        <div>
          <label className="label" htmlFor="title">Measurable goal</label>
          <input id="title" className="input text-lg" placeholder="Run a marathon in 2 hours" value={d.title} onChange={(e) => patch({ title: e.target.value })} required autoFocus aria-invalid={!!shown.title} aria-describedby={shown.title ? 'title-err' : undefined} />
          {shown.title && <p id="title-err" className="mt-1 text-sm text-clay-text">{errs.title}</p>}
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
            <input id="end" type="date" className="input" value={d.deadline} min={d.startDate} onChange={(e) => patch({ deadline: e.target.value })} required aria-invalid={!!shown.end} aria-describedby={shown.end ? 'end-err' : undefined} />
          </div>
          {shown.end && <p id="end-err" className="col-span-2 -mt-1 text-sm text-clay-text">{errs.end}</p>}
        </div>
        <div>
          <label className="label" htmlFor="completion">Completion bonus</label>
          <div className="flex items-center gap-3">
            <input id="completion" type="number" min={0} className="input num w-32" value={d.completionBonus} onChange={(e) => patch({ completionBonus: Math.max(0, +e.target.value || 0) })} />
            <span className="caption">extra coins the moment the pot is full</span>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">Mini-goals</h2>
          <div className="flex items-center gap-2 text-sm text-ink-2">
            <Gullak fraction={0} size={36} className="shrink-0" />
            <span className="num">Holds {total} coins</span>
          </div>
        </div>
        <p className="caption mt-0.5 max-w-prose">Each one you finish deposits its coins. Give bigger work more coins.</p>
        <ol className="mt-3 divide-y divide-line">
          {d.miniGoals.map((m, i) => (
            <li key={m.id} className="py-3 grid gap-2 grid-cols-[1fr_4.5rem_auto] sm:grid-cols-[1fr_5rem_auto]">
              <input id={`mini-${i + 1}`} className="input" placeholder={i === 0 ? 'First piece of the work' : `Mini-goal ${i + 1}`} value={m.title} onChange={(e) => setMini(i, { title: e.target.value })} aria-label={`Mini-goal ${i + 1} title`} aria-invalid={i === 0 && !!shown.minis} aria-describedby={i === 0 && shown.minis ? 'minis-err' : undefined}
                onKeyDown={(e) => { if (e.key !== 'Enter') return; e.preventDefault(); if (i === d.miniGoals.length - 1) addMini(); else focus(`mini-${i + 2}`) }} />
              <input type="number" min={0} className="input num" value={m.points} onChange={(e) => setMini(i, { points: Math.max(0, +e.target.value || 0) })} aria-label={`Mini-goal ${i + 1} coins`} />
              <button type="button" onClick={() => removeMini(i)} className="btn-icon -mr-2" aria-label={`Remove mini-goal ${i + 1}`}><Icon name="x" /></button>
              {i === 0 && shown.minis && <p id="minis-err" className="col-span-full text-sm text-clay-text">{errs.minis}</p>}
              <details className="col-span-full group">
                <summary className="cursor-pointer text-sm text-ink-2 hover:text-ink list-none inline-flex items-center gap-1 py-1">
                  <Icon name="down" size={14} className="transition group-open:rotate-180" />
                  {m.phase || m.dueDate || m.priority !== 'medium' ? [m.phase, m.dueDate, m.priority !== 'medium' ? m.priority : ''].filter(Boolean).join(' · ') : 'Phase, due date, priority'}
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
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
        {d.miniGoals.length === 0 && shown.minis && <p id="minis-err" className="mt-2 text-sm text-clay-text">{errs.minis}</p>}
        <button id="add-mini" type="button" onClick={addMini} className="btn-soft mt-2"><Icon name="plus" size={16} />Add mini-goal</button>
      </section>

      <section className="card p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-ink">Checkpoints</h2>
          <button type="button" onClick={suggestCheckpoints} className="btn-ghost -mr-2" disabled={minis.length < 3}>Suggest</button>
        </div>
        <p className="caption -mt-2 max-w-prose">Bonus coins the moment you finish that many mini-goals, if it happens before the deadline. Each pays once.</p>
        {d.checkpoints.map((c, i) => (
          <div key={c.id} className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-ink-2">After</span>
            <input id={`cp-${c.id}`} type="number" min={1} max={Math.max(1, lastCount)} className="input num w-16" value={c.atCount} onChange={(e) => setCp(i, { atCount: +e.target.value || 1 })} aria-label={`Checkpoint ${i + 1} mini-goal count`} />
            <span className="text-ink-2 num">of {minis.length}, bonus</span>
            <input type="number" min={0} className="input num w-20" value={c.bonus} onChange={(e) => setCp(i, { bonus: Math.max(0, +e.target.value || 0) })} aria-label={`Checkpoint ${i + 1} bonus coins`} />
            <button type="button" onClick={() => removeCp(i)} className="btn-icon" aria-label={`Remove checkpoint ${i + 1}`}><Icon name="x" /></button>
            {c.atCount >= minis.length && <span className="text-clay-text basis-full">{c.atCount === minis.length ? 'That is the full pot. The completion bonus already pays there, so this one is dropped on save.' : `Only ${minis.length} mini-goals have a title, so this one is dropped on save.`}</span>}
            {d.checkpoints.findIndex((x) => x.atCount === c.atCount) !== i && <span className="text-clay-text basis-full">Same count as an earlier checkpoint. Only one pays.</span>}
          </div>
        ))}
        <button id="add-cp" type="button" onClick={addCp} className="btn-soft" disabled={!nextCount}><Icon name="plus" size={16} />Add checkpoint</button>
      </section>

      <div>
        {/* Always mounted so screen readers hear a failed Create; the field messages carry it visually. */}
        <p aria-live="polite" className="sr-only">{tried && !valid ? errs.title || errs.minis || errs.end : ''}</p>
        <div className="flex flex-wrap items-center gap-3">
          {valid && (
            <p className="caption num w-full sm:w-auto sm:mr-auto">
              Holds {total} coins · full by {fmtDate(d.deadline)}{d.completionBonus > 0 ? ` · +${d.completionBonus} when done` : ''}
            </p>
          )}
          <div className="ml-auto flex gap-3">
            <button type="button" onClick={cancel} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{existing ? 'Save changes' : 'Create Gullak'}</button>
          </div>
        </div>
      </div>
    </form>
  )
}
