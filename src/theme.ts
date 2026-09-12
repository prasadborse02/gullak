import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type Palette = 'clay' | 'ledger' | 'quiet'

export const palettes: { id: Palette; name: string; line: string }[] = [
  { id: 'clay', name: 'The Clay Shelf', line: 'A terracotta pot on a warm shelf. Cream paper by day, lamp-lit by night.' },
  { id: 'ledger', name: 'The Childhood Ledger', line: 'Ruled notebook paper and ink blue. Flat, squared, every coin tallied.' },
  { id: 'quiet', name: 'The Quiet Piggy Bank', line: 'Stone and fog. Almost no colour until a coin drops.' },
]

const THEME_KEY = 'gullak:theme'
const PALETTE_KEY = 'gullak:palette'
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const sub = (l: () => void) => (listeners.add(l), () => listeners.delete(l))

const readTheme = (): Theme => {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'dark' || t === 'light' ? t : 'system'
  } catch { return 'system' }
}
const readPalette = (): Palette | null => {
  try {
    const p = localStorage.getItem(PALETTE_KEY)
    return p === 'clay' || p === 'ledger' || p === 'quiet' ? p : null
  } catch { return null }
}

export const setTheme = (t: Theme) => {
  try { t === 'system' ? localStorage.removeItem(THEME_KEY) : localStorage.setItem(THEME_KEY, t) } catch { /* private mode */ }
  if (t === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = t
  emit()
}

export const setPalette = (p: Palette) => {
  try { localStorage.setItem(PALETTE_KEY, p) } catch { /* private mode */ }
  if (p === 'clay') delete document.documentElement.dataset.palette
  else document.documentElement.dataset.palette = p
  emit()
}

export const useTheme = () => useSyncExternalStore(sub, readTheme)
/** null until the user has chosen once; the first-run picker keys off that. */
export const usePalette = () => useSyncExternalStore(sub, readPalette)

/** What is actually on screen right now, resolving 'system'. */
export const resolvedTheme = (t: Theme) =>
  t === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t
