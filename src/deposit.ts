import { burstCoins, flyCoin } from './coinFlight'
import { playCoin, primeAudio } from './sound'
import { actions } from './store'
import { toast } from './components/Toast'
import type { Goal, MiniGoal } from './types'

/** The one interaction the product is built around: mark done, coin flies, coin lands, pot fills, sound, word. */
export function deposit(g: Goal, m: MiniGoal, from: HTMLElement, pot: Element | null) {
  primeAudio() // inside the click, so the browser lets the sound play when the coin lands
  const res = actions.complete(g.id, m.id)
  if (!res) return
  const sound = res.finished || res.bonuses.length ? 'pour' : res.hadCoins ? 'clash' : 'drop'
  const land = () => {
    playCoin(sound)
    if (res.finished) {
      if (pot) burstCoins(pot, 18)
      toast(res.completionBonus ? `Gullak full · +${res.completionBonus} completion bonus` : `Gullak full · ${g.title}`)
    } else if (res.bonuses.length) {
      if (pot) burstCoins(pot)
      toast(`Checkpoint · +${res.bonuses.reduce((a, c) => a + c.bonus, 0)} bonus coins`)
    } else toast(`+${m.points} coins deposited`)
  }
  if (pot) flyCoin(from.getBoundingClientRect(), pot, { onArrive: land })
  else land()
}
