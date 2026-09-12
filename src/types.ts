export type Priority = 'low' | 'medium' | 'high'

export type MiniGoal = {
  id: string
  title: string
  description?: string
  points: number
  dueDate?: string
  phase?: string
  priority: Priority
  completedAt: string | null
}

export type Checkpoint = {
  id: string
  atCount: number // completed mini-goal count that triggers this
  bonus: number
  awardedAt: string | null
}

export type Goal = {
  id: string
  title: string
  description: string
  startDate: string // YYYY-MM-DD, local
  deadline: string // YYYY-MM-DD, local
  miniGoals: MiniGoal[]
  checkpoints: Checkpoint[]
  completionBonus: number // extra coins when the pot is full
  completionBonusAwardedAt: string | null
  createdAt: string
  completedAt: string | null
}

export type TxKind = 'deposit' | 'bonus' | 'spend' | 'reversal'

export type Transaction = {
  id: string
  at: string
  kind: TxKind
  points: number // signed; ₹ value = points * rate at time of tx
  amount: number // signed ₹
  note: string
  goalId?: string
  miniId?: string // set on deposits so a take-back can remove exactly that entry
  bonusOf?: string // checkpoint id, or 'completion', so a take-back can revert exactly that bonus
}

export type Reward = { id: string; name: string; cost: number }

export type State = {
  version: 1
  rate: number // currency units per coin
  currency: string // symbol shown before amounts, e.g. ₹ $ €
  goals: Goal[]
  transactions: Transaction[]
  rewards: Reward[]
}
