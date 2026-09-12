/** Synthesized coin sounds via Web Audio. No assets, nothing to load.
 *  drop  – one coin into an empty pot
 *  clash – a coin landing on coins already there
 *  pour  – a handful poured in (checkpoint, full pot) */
export type CoinSound = 'drop' | 'clash' | 'pour'

const KEY = 'gullak:muted'
export const isMuted = () => {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}
export const setMuted = (m: boolean) => {
  try { localStorage.setItem(KEY, m ? '1' : '0') } catch { /* private mode */ }
}

let ctx: AudioContext | null = null
let noise: AudioBuffer | null = null

function ensure() {
  if (!ctx) {
    ctx = new AudioContext()
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** One coin strike: three inharmonic partials with a fast exponential decay plus a click transient. */
function clink(t: number, gain: number, pitch: number, decay = 0.28) {
  const c = ensure()
  const out = c.createGain()
  out.gain.setValueAtTime(gain, t)
  out.gain.exponentialRampToValueAtTime(0.0008, t + decay)
  out.connect(c.destination)
  for (const [ratio, level] of [[1, 1], [1.53, 0.55], [2.38, 0.3]] as const) {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(3100 * pitch * ratio, t)
    o.frequency.exponentialRampToValueAtTime(3100 * pitch * ratio * 0.985, t + decay)
    const g = c.createGain()
    g.gain.value = level
    o.connect(g).connect(out)
    o.start(t)
    o.stop(t + decay + 0.02)
  }
  const n = c.createBufferSource()
  n.buffer = noise
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 5200 * pitch
  bp.Q.value = 1.2
  const ng = c.createGain()
  ng.gain.setValueAtTime(gain * 0.9, t)
  ng.gain.exponentialRampToValueAtTime(0.0008, t + 0.03)
  n.connect(bp).connect(ng).connect(c.destination)
  n.start(t)
}

/** Create/resume the AudioContext inside a user gesture. Safe to call often. */
export function primeAudio() {
  if (isMuted()) return
  try { ensure() } catch { /* no audio on this device */ }
}

export function playCoin(kind: CoinSound) {
  if (isMuted()) return
  let t: number
  try { t = ensure().currentTime + 0.01 } catch { return }
  const r = () => 0.92 + Math.random() * 0.16
  if (kind === 'drop') {
    clink(t, 0.5, 1 * r())
    clink(t + 0.07, 0.18, 0.62, 0.16) // duller settle against clay
  } else if (kind === 'clash') {
    clink(t, 0.45, 1.0 * r())
    clink(t + 0.045, 0.38, 1.22 * r(), 0.24)
    clink(t + 0.11, 0.28, 0.88 * r(), 0.2)
    clink(t + 0.17, 0.14, 1.1 * r(), 0.14)
  } else {
    for (let i = 0; i < 11; i++) {
      const u = i / 10
      clink(t + i * 0.052 + Math.random() * 0.02, 0.36 * (1 - u * 0.65), (0.82 + Math.random() * 0.45) * r(), 0.22)
    }
  }
}
