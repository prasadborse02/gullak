import { forwardRef } from 'react'

type Props = { fraction: number; size?: number; done?: boolean; className?: string }

/** Clay Gullak. One drawing, fill level drives every state:
 *  empty → filling → near full (glow) → full (done: golden rim + lid). */
export const Gullak = forwardRef<SVGSVGElement, Props>(function Gullak({ fraction, size = 160, done, className }, ref) {
  const f = Math.max(0, Math.min(1, fraction))
  const top = 172, bottom = 30 // body spans y=30..172 in viewBox
  const level = top - (top - bottom) * f
  const near = !done && f >= 0.85
  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={[className, near ? 'animate-glow' : ''].join(' ')}
      style={{ animationIterationCount: near ? 'infinite' : undefined, animationDuration: near ? '2.6s' : undefined }}
      aria-label={`Gullak ${Math.round(f * 100)}% full`}
      role="img"
    >
      <defs>
        <clipPath id="gullak-body">
          <path d="M100 30 C150 30 176 66 176 108 C176 150 146 174 100 174 C54 174 24 150 24 108 C24 66 50 30 100 30 Z" />
        </clipPath>
        <linearGradient id="gullak-clay" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d97a52" />
          <stop offset="1" stopColor="#b3532d" />
        </linearGradient>
        <linearGradient id="gullak-coin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5d27a" />
          <stop offset="1" stopColor="#d59a2e" />
        </linearGradient>
        <linearGradient id="gullak-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* base */}
      <ellipse cx="100" cy="178" rx="46" ry="8" fill="#2a211c" opacity=".12" />
      <rect x="66" y="166" width="68" height="14" rx="6" fill="#8f4324" />

      {/* body */}
      <path
        d="M100 30 C150 30 176 66 176 108 C176 150 146 174 100 174 C54 174 24 150 24 108 C24 66 50 30 100 30 Z"
        fill="url(#gullak-clay)"
      />
      {/* fill level (coins) */}
      <g clipPath="url(#gullak-body)">
        <rect x="0" y={level} width="200" height="200" fill="url(#gullak-coin)" style={{ transition: 'y 700ms cubic-bezier(.2,.8,.2,1)' }} />
        <path
          d={`M0 ${level} Q 40 ${level - 5} 80 ${level} T 160 ${level} T 240 ${level} V200 H0 Z`}
          fill="#f7dc8f"
          opacity=".55"
          style={{ transition: 'd 700ms cubic-bezier(.2,.8,.2,1)' }}
        />
        {/* stacked coin lines */}
        {Array.from({ length: 12 }).map((_, i) => {
          const y = 172 - i * 12
          return y > level ? <line key={i} x1="0" x2="200" y1={y} y2={y} stroke="#b8832a" strokeOpacity=".28" strokeWidth="1.5" /> : null
        })}
        {/* inner shading + shine */}
        <path d="M100 30 C150 30 176 66 176 108 C176 150 146 174 100 174 C54 174 24 150 24 108 C24 66 50 30 100 30 Z" fill="none" stroke="#7a3518" strokeOpacity=".35" strokeWidth="6" />
        <ellipse cx="66" cy="78" rx="18" ry="34" fill="url(#gullak-shine)" transform="rotate(-18 66 78)" />
      </g>

      {/* handcrafted rim texture */}
      <path d="M44 120 C60 130 140 130 156 120" fill="none" stroke="#8f4324" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 100 C60 108 140 108 160 100" fill="none" stroke="#8f4324" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />

      {/* neck + slot */}
      <rect x="74" y="20" width="52" height="16" rx="6" fill="#a84e2c" />
      <rect x="86" y="24" width="28" height="4" rx="2" fill="#2a211c" opacity=".7" />

      {done && (
        <>
          <path d="M100 30 C150 30 176 66 176 108 C176 150 146 174 100 174 C54 174 24 150 24 108 C24 66 50 30 100 30 Z" fill="none" stroke="#e0a93d" strokeWidth="4" />
          <circle cx="100" cy="27" r="10" fill="#e0a93d" stroke="#fffaf2" strokeWidth="3" />
          <path d="M95 27 l4 4 l7 -8" fill="none" stroke="#fffaf2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
})
