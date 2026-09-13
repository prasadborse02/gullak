import type { Goal, State } from './types'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
export const DAY = 86_400_000

/** Local calendar date as YYYY-MM-DD. Never slice toISOString(): that is UTC and is yesterday before 05:30 IST. */
export const localDate = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
export const today = () => localDate()
export const plusDays = (n: number) => localDate(new Date(Date.now() + n * DAY))

export const capacity = (g: Goal) => g.miniGoals.reduce((s, m) => s + m.points, 0)
export const earned = (g: Goal) => g.miniGoals.filter((m) => m.completedAt).reduce((s, m) => s + m.points, 0)
export const doneCount = (g: Goal) => g.miniGoals.filter((m) => m.completedAt).length
export const bonusEarned = (g: Goal) =>
  g.checkpoints.filter((c) => c.awardedAt).reduce((s, c) => s + c.bonus, 0) + (g.completionBonusAwardedAt ? g.completionBonus : 0)
export const fraction = (g: Goal) => (capacity(g) ? Math.min(1, earned(g) / capacity(g)) : 0)

export const nextCheckpoint = (g: Goal) =>
  [...g.checkpoints].sort((a, b) => a.atCount - b.atCount).find((c) => !c.awardedAt && c.atCount > doneCount(g)) ?? null

export const daysLeft = (g: Goal, now = new Date()) =>
  Math.ceil((new Date(g.deadline + 'T23:59:59').getTime() - now.getTime()) / DAY)

/** Bonuses (checkpoints and completion) only pay while the goal is inside its timeline. Deposits always count. */
export const onTime = (g: Goal, now = new Date()) => now.getTime() <= new Date(g.deadline + 'T23:59:59').getTime()

/** Signed whole days between the completion stamp and the deadline: positive = early. */
export const daysEarly = (g: Goal) =>
  g.completedAt ? Math.round((new Date(g.deadline + 'T23:59:59').getTime() - new Date(g.completedAt).getTime()) / DAY) : 0

export type Pace = 'completed' | 'ahead' | 'on' | 'behind' | 'overdue' | 'not-started'

export function pace(g: Goal, now = new Date()): Pace {
  if (g.completedAt) return 'completed'
  const start = new Date(g.startDate + 'T00:00:00').getTime()
  const end = new Date(g.deadline + 'T23:59:59').getTime()
  const t = now.getTime()
  if (t > end) return 'overdue'
  if (t < start) return 'not-started'
  const expected = end > start ? (t - start) / (end - start) : 1
  const actual = fraction(g)
  if (actual >= expected + 0.05) return 'ahead'
  if (actual <= expected - 0.05) return 'behind'
  return 'on'
}

export const paceLabel: Record<Pace, string> = {
  completed: 'Completed',
  ahead: 'Ahead of pace',
  on: 'On pace',
  behind: 'Behind pace',
  overdue: 'Past deadline',
  'not-started': 'Starts soon',
}

export const nextAction = (g: Goal) => {
  const open = g.miniGoals.filter((m) => !m.completedAt)
  const rank = { high: 0, medium: 1, low: 2 }
  return (
    [...open].sort(
      (a, b) =>
        (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || rank[a.priority] - rank[b.priority],
    )[0] ?? null
  )
}

export const balance = (s: State) => s.transactions.reduce((sum, t) => sum + t.amount, 0)
export const currencies = ['₹', '$', '€', '£', '¥', '₩', 'CHF', 'A$', 'C$'] as const
/** Module-level so the pure formatter needs no store import; the store keeps it in sync. */
let symbol = '₹'
export const setCurrencySymbol = (c: string) => { symbol = c || '₹' }
export const rupee = (n: number) => (n < 0 ? '−' : '') + symbol + Math.round(Math.abs(n)).toLocaleString('en-IN')

export const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
/** For ISO timestamps (transactions, completedAt): formats in local time. */
export const fmtStamp = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** Fills in fields added after a user's data was first saved. */
export const migrate = (s: State): State => ({
  ...s,
  currency: typeof s.currency === 'string' && s.currency ? s.currency : '₹',
  goals: s.goals.map((g) => ({
    ...g,
    completionBonus: typeof g.completionBonus === 'number' ? g.completionBonus : 0,
    completionBonusAwardedAt: g.completionBonusAwardedAt ?? null,
  })),
})

// ponytail: structural guard only; enough to reject foreign JSON without a schema lib
export function isState(x: unknown): x is State {
  if (!x || typeof x !== 'object') return false
  const s = x as Record<string, unknown>
  return (
    s.version === 1 &&
    typeof s.rate === 'number' &&
    Array.isArray(s.goals) &&
    Array.isArray(s.transactions) &&
    Array.isArray(s.rewards) &&
    (s.goals as unknown[]).every(
      (g) =>
        !!g &&
        typeof g === 'object' &&
        typeof (g as Goal).id === 'string' &&
        typeof (g as Goal).title === 'string' &&
        Array.isArray((g as Goal).miniGoals) &&
        Array.isArray((g as Goal).checkpoints),
    )
  )
}
