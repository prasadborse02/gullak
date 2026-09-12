/** Coin flies from a source rect to a target element along an arc, then the target bumps. */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function flyCoin(from: DOMRect, to: Element, opts: { count?: number; onArrive?: () => void } = {}) {
  const { count = 1, onArrive } = opts
  if (reduced()) { onArrive?.(); return } // the state change is the message; the arc is decoration
  const t = to.getBoundingClientRect()
  const sx = from.left + from.width / 2 - 11, sy = from.top + from.height / 2 - 11
  const ex = t.left + t.width / 2 - 11, ey = t.top + t.height * 0.16
  const cx = (sx + ex) / 2, cy = Math.min(sy, ey) - 90
  for (let k = 0; k < count; k++) {
    const el = document.createElement('div')
    el.className = 'coin-fly'
    el.style.left = sx + 'px'
    el.style.top = sy + 'px'
    document.body.appendChild(el)
    const frames = Array.from({ length: 13 }, (_, i) => {
      const u = i / 12
      const x = (1 - u) ** 2 * sx + 2 * (1 - u) * u * cx + u ** 2 * ex
      const y = (1 - u) ** 2 * sy + 2 * (1 - u) * u * cy + u ** 2 * ey
      return { transform: `translate(${x - sx}px, ${y - sy}px) scale(${1 - u * 0.4}) rotateY(${u * 540}deg)`, opacity: u > 0.9 ? 0 : 1 }
    })
    const a = el.animate(frames, { duration: 620, delay: k * 70, easing: 'cubic-bezier(.3,.1,.5,1)', fill: 'forwards' })
    a.onfinish = () => {
      el.remove()
      if (k === count - 1) {
        to.classList.remove('animate-bump'); void (to as HTMLElement).offsetWidth; to.classList.add('animate-bump')
        onArrive?.()
      }
    }
  }
}

/** Checkpoint / completion celebration: coins burst out of the target and settle. */
export function burstCoins(target: Element, n = 12) {
  if (reduced()) return
  const t = target.getBoundingClientRect()
  const cx = t.left + t.width / 2 - 11, cy = t.top + t.height * 0.25
  target.classList.remove('animate-glow'); void (target as HTMLElement).offsetWidth; target.classList.add('animate-glow')
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div')
    el.className = 'coin-fly'
    el.style.left = cx + 'px'
    el.style.top = cy + 'px'
    document.body.appendChild(el)
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9
    const dist = 90 + Math.random() * 110
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist
    el.animate(
      [
        { transform: 'translate(0,0) scale(.6)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.15}px, ${dy + 160}px) scale(.8) rotate(${dx}deg)`, opacity: 0 },
      ],
      { duration: 1000 + Math.random() * 300, delay: Math.random() * 120, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' },
    ).onfinish = () => el.remove()
  }
}
