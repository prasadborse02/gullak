// Runs with: npm test
import assert from 'node:assert/strict'
import { bonusEarned, capacity, earned, fraction, isState, localDate, migrate, nextCheckpoint, pace, rupee, setCurrencySymbol } from './logic.ts'
import type { Goal } from './types.ts'

const g: Goal = {
  id: 'g', title: 't', description: '', startDate: '2026-01-01', deadline: '2026-01-11', createdAt: '', completedAt: null,
  completionBonus: 200, completionBonusAwardedAt: null,
  miniGoals: [
    { id: 'a', title: 'a', points: 100, priority: 'medium', completedAt: '2026-01-02' },
    { id: 'b', title: 'b', points: 300, priority: 'medium', completedAt: null },
  ],
  checkpoints: [{ id: 'c1', atCount: 1, bonus: 50, awardedAt: 'x' }, { id: 'c2', atCount: 2, bonus: 100, awardedAt: null }],
}
assert.equal(capacity(g), 400)
assert.equal(earned(g), 100)
assert.equal(fraction(g), 0.25)
assert.equal(nextCheckpoint(g)?.id, 'c2')
assert.equal(bonusEarned(g), 50)
assert.equal(bonusEarned({ ...g, completionBonusAwardedAt: 'x' }), 250)
assert.equal(pace(g, new Date('2026-01-02T12:00:00')), 'ahead')   // 15% elapsed, 25% done
assert.equal(pace(g, new Date('2026-01-03T12:00:00')), 'on')      // 25% elapsed
assert.equal(pace(g, new Date('2026-01-08T12:00:00')), 'behind')
assert.equal(pace(g, new Date('2026-02-01')), 'overdue')
assert.equal(pace({ ...g, completedAt: 'x' }), 'completed')

// Local date, not UTC: 00:40 on the 13th must be the 13th, whatever the zone.
const d = new Date(2026, 8, 13, 0, 40)
assert.equal(localDate(d), '2026-09-13')

// Old saves without the completion-bonus fields still load.
const legacy = { ...g } as Partial<Goal>
delete legacy.completionBonus
delete legacy.completionBonusAwardedAt
const m = migrate({ version: 1, rate: 1, goals: [legacy as Goal], transactions: [], rewards: [] } as unknown as Parameters<typeof migrate>[0])
assert.equal(m.goals[0].completionBonus, 0)
assert.equal(m.goals[0].completionBonusAwardedAt, null)
assert.equal(m.currency, '₹')

// Currency symbol follows the setting; negatives keep the minus outside the symbol.
assert.equal(rupee(1250), '₹1,250')
setCurrencySymbol('$')
assert.equal(rupee(-50), '−$50')
setCurrencySymbol('₹')

assert.ok(isState({ version: 1, rate: 1, goals: [g], transactions: [], rewards: [] }))
assert.ok(!isState({ version: 2 }))
assert.ok(!isState({ version: 1, rate: 1, goals: [{}], transactions: [], rewards: [] }))
console.log('logic ok')
