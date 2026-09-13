import { useSyncExternalStore } from 'react'
import type { Checkpoint, Goal, MiniGoal, Reward, State, Transaction } from './types'
import { doneCount, isState, migrate, onTime, setCurrencySymbol, uid } from './logic'

const KEY = 'gullak:v1'

const empty = (): State => ({
  version: 1,
  rate: 1,
  currency: '₹',
  goals: [],
  transactions: [],
  rewards: [
    { id: uid(), name: 'Diet Coke', cost: 50 },
    { id: uid(), name: 'Coffee out', cost: 150 },
    { id: uid(), name: 'Movie night', cost: 400 },
  ],
})

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return isState(parsed) ? migrate(parsed) : empty()
  } catch {
    return empty()
  }
}

let state: State = load()
setCurrencySymbol(state.currency)
const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  setCurrencySymbol(state.currency)
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}

export const useStore = () =>
  useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  )

export const getState = () => state

const now = () => new Date().toISOString()

const tx = (s: State, kind: Transaction['kind'], points: number, note: string, goalId?: string): Transaction => ({
  id: uid(),
  at: now(),
  kind,
  points,
  amount: points * s.rate,
  note,
  goalId,
})

const updateGoal = (id: string, f: (g: Goal) => Goal) =>
  set({ ...state, goals: state.goals.map((g) => (g.id === id ? f(g) : g)) })

export type CompleteResult = {
  points: number
  bonuses: Checkpoint[]
  completionBonus: number
  finished: boolean
  hadCoins: boolean
  late: boolean // past the deadline: coins deposited, no bonus
}

export const actions = {
  addGoal(g: Omit<Goal, 'id' | 'createdAt' | 'completedAt' | 'completionBonusAwardedAt'>) {
    const goal: Goal = { ...g, id: uid(), createdAt: now(), completedAt: null, completionBonusAwardedAt: null }
    set({ ...state, goals: [goal, ...state.goals] })
    return goal.id
  },
  updateGoal(id: string, patch: Partial<Goal>) {
    updateGoal(id, (g) => ({ ...g, ...patch }))
  },
  deleteGoal(id: string) {
    set({ ...state, goals: state.goals.filter((g) => g.id !== id) })
  },
  /** Adding work to a full pot reopens it. The completion bonus already paid stays paid. */
  addMini(goalId: string, m: Omit<MiniGoal, 'id' | 'completedAt'>, at?: number) {
    updateGoal(goalId, (g) => {
      const arr = [...g.miniGoals]
      arr.splice(at ?? arr.length, 0, { ...m, id: uid(), completedAt: null })
      return { ...g, miniGoals: arr, completedAt: null }
    })
  },
  updateMini(goalId: string, id: string, patch: Partial<MiniGoal>) {
    updateGoal(goalId, (g) => ({ ...g, miniGoals: g.miniGoals.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
  },
  /** Returns what it removed so the caller can offer Undo. */
  deleteMini(goalId: string, id: string): { mini: MiniGoal; index: number } | null {
    const g = state.goals.find((x) => x.id === goalId)
    const index = g?.miniGoals.findIndex((m) => m.id === id) ?? -1
    if (!g || index < 0) return null
    const mini = g.miniGoals[index]
    updateGoal(goalId, (x) => ({ ...x, miniGoals: x.miniGoals.filter((m) => m.id !== id) }))
    return { mini, index }
  },
  restoreMini(goalId: string, mini: MiniGoal, index: number) {
    updateGoal(goalId, (g) => {
      const arr = [...g.miniGoals]
      arr.splice(Math.min(index, arr.length), 0, mini)
      return { ...g, miniGoals: arr }
    })
  },
  moveMini(goalId: string, id: string, dir: -1 | 1) {
    updateGoal(goalId, (g) => {
      const i = g.miniGoals.findIndex((m) => m.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= g.miniGoals.length) return g
      const arr = [...g.miniGoals]
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return { ...g, miniGoals: arr }
    })
  },

  /** Marks complete, deposits coins, awards newly reached checkpoints and the completion bonus exactly once.
   *  Bonuses only pay inside the goal's timeline; a late completion still deposits its coins. */
  complete(goalId: string, miniId: string): CompleteResult | null {
    const g = state.goals.find((x) => x.id === goalId)
    const m = g?.miniGoals.find((x) => x.id === miniId)
    if (!g || !m || m.completedAt) return null // never award twice
    const at = now()
    const hadCoins = doneCount(g) > 0
    const miniGoals = g.miniGoals.map((x) => (x.id === miniId ? { ...x, completedAt: at } : x))
    const count = doneCount({ ...g, miniGoals })
    const late = !onTime(g)
    const bonuses = late ? [] : g.checkpoints.filter((c) => !c.awardedAt && c.atCount <= count)
    const checkpoints = g.checkpoints.map((c) => (bonuses.includes(c) ? { ...c, awardedAt: at } : c))
    const finished = count === miniGoals.length
    const payCompletion = !late && finished && g.completionBonus > 0 && !g.completionBonusAwardedAt
    const txs = [
      { ...tx(state, 'deposit', m.points, m.title, goalId), miniId },
      ...bonuses.map((c) => ({ ...tx(state, 'bonus', c.bonus, `Checkpoint ${c.atCount}/${g.miniGoals.length} · ${g.title}`, goalId), bonusOf: c.id })),
      ...(payCompletion ? [{ ...tx(state, 'bonus', g.completionBonus, `Gullak full · ${g.title}`, goalId), bonusOf: 'completion' }] : []),
    ]
    set({
      ...state,
      goals: state.goals.map((x) =>
        x.id === goalId
          ? {
              ...x,
              miniGoals,
              checkpoints,
              completedAt: finished ? at : x.completedAt,
              completionBonusAwardedAt: payCompletion ? at : x.completionBonusAwardedAt,
            }
          : x,
      ),
      transactions: [...txs, ...state.transactions],
    })
    return { points: m.points, bonuses, completionBonus: payCompletion ? g.completionBonus : 0, finished, hadCoins, late }
  },

  /** Take back a completion. The deposit and any bonus this completion had unlocked are removed from
   *  the wallet, so the history never shows an undo. Completing again earns them again, once. */
  uncomplete(goalId: string, miniId: string): { points: number; bonusReverted: number } | null {
    const g = state.goals.find((x) => x.id === goalId)
    const m = g?.miniGoals.find((x) => x.id === miniId)
    if (!g || !m || !m.completedAt) return null
    const miniGoals = g.miniGoals.map((y) => (y.id === miniId ? { ...y, completedAt: null } : y))
    const count = doneCount({ ...g, miniGoals })
    const revoked = g.checkpoints.filter((c) => c.awardedAt && c.atCount > count)
    const revokeCompletion = !!g.completionBonusAwardedAt && count < miniGoals.length
    const drop = new Set<string>()
    const deposit =
      state.transactions.find((t) => t.kind === 'deposit' && t.miniId === miniId) ??
      state.transactions.find((t) => t.kind === 'deposit' && t.goalId === goalId && t.note === m.title) // saves from before miniId existed
    if (deposit) drop.add(deposit.id)
    for (const c of revoked) {
      const t =
        state.transactions.find((x) => x.kind === 'bonus' && x.bonusOf === c.id) ??
        state.transactions.find((x) => x.kind === 'bonus' && x.goalId === goalId && x.note.startsWith(`Checkpoint ${c.atCount}/`))
      if (t) drop.add(t.id)
    }
    if (revokeCompletion) {
      const t =
        state.transactions.find((x) => x.kind === 'bonus' && x.bonusOf === 'completion' && x.goalId === goalId) ??
        state.transactions.find((x) => x.kind === 'bonus' && x.goalId === goalId && x.note.startsWith('Gullak full'))
      if (t) drop.add(t.id)
    }
    set({
      ...state,
      goals: state.goals.map((x) =>
        x.id === goalId
          ? {
              ...x,
              completedAt: null,
              completionBonusAwardedAt: revokeCompletion ? null : x.completionBonusAwardedAt,
              miniGoals,
              checkpoints: x.checkpoints.map((c) => (revoked.includes(c) ? { ...c, awardedAt: null } : c)),
            }
          : x,
      ),
      transactions: state.transactions.filter((t) => !drop.has(t.id)),
    })
    return { points: m.points, bonusReverted: revoked.reduce((a, c) => a + c.bonus, 0) + (revokeCompletion ? g.completionBonus : 0) }
  },

  spend(reward: Reward): Transaction {
    const t: Transaction = { id: uid(), at: now(), kind: 'spend', points: 0, amount: -reward.cost, note: reward.name }
    set({ ...state, transactions: [t, ...state.transactions] })
    return t
  },
  /** Removes a transaction outright. Only used by the short Undo window after a spend. */
  removeTx(id: string) {
    set({ ...state, transactions: state.transactions.filter((t) => t.id !== id) })
  },
  addReward(r: Omit<Reward, 'id'>, at?: number) {
    const arr = [...state.rewards]
    arr.splice(at ?? arr.length, 0, { ...r, id: uid() })
    set({ ...state, rewards: arr })
  },
  deleteReward(id: string): { reward: Reward; index: number } | null {
    const index = state.rewards.findIndex((r) => r.id === id)
    if (index < 0) return null
    const reward = state.rewards[index]
    set({ ...state, rewards: state.rewards.filter((r) => r.id !== id) })
    return { reward, index }
  },
  setRate(rate: number) {
    set({ ...state, rate: Math.max(0.1, rate) })
  },
  setCurrency(currency: string) {
    set({ ...state, currency: currency.trim().slice(0, 4) || '₹' })
  },
  exportJSON: () => JSON.stringify(state, null, 2),
  /** Step 1 of import: validate without touching anything. */
  parseImport(text: string): { state: State; error: null } | { state: null; error: string } {
    try {
      const parsed = JSON.parse(text)
      if (!isState(parsed)) return { state: null, error: 'That file is not a Gullak backup.' }
      return { state: migrate(parsed), error: null }
    } catch {
      return { state: null, error: 'Could not read that file as JSON.' }
    }
  },
  /** Step 2 of import: replace everything. Callers confirm first. */
  applyImport(next: State) {
    set(next)
  },
}
