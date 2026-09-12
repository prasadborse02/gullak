const paths = {
  up: 'M12 19V5m0 0l-6 6m6-6l6 6',
  down: 'M12 5v14m0 0l6-6m-6 6l-6-6',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  back: 'M15 5l-7 7 7 7',
  plus: 'M12 5v14M5 12h14',
  sun: 'M12 4v2m0 12v2M4 12h2m12 0h2M6.3 6.3l1.4 1.4m8.6 8.6l1.4 1.4M6.3 17.7l1.4-1.4m8.6-8.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  moon: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z',
  sound: 'M4 10v4h3l4 4V6L7 10H4zm11-1a4 4 0 010 6m2.5-9a8 8 0 010 12',
  muted: 'M4 10v4h3l4 4V6L7 10H4zm12 1l4 4m0-4l-4 4',
  settings: 'M4 7h10m4 0h2M4 17h2m4 0h10M14 4.5v5M8 14.5v5',
  palette: 'M12 22a10 10 0 110-20 10 10 0 0110 10c0 1.7-1.3 3-3 3h-1.5a1.5 1.5 0 00-1 2.6c.4.4.5.8.5 1.2A3 3 0 0112 22zM7.5 10.5h.01M12 7.5h.01M16.5 10.5h.01',
} as const

export type IconName = keyof typeof paths

/** One stroke weight, one size, drawn. No unicode glyphs standing in for icons. */
export const Icon = ({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d={paths[name]} />
  </svg>
)
