import { paceLabel, type Pace } from '../logic'

const tone: Record<Pace, string> = {
  completed: 'bg-coin-soft text-coin-2',
  ahead: 'bg-leaf-soft text-leaf',
  on: 'bg-sky-soft text-sky',
  behind: 'bg-clay-soft text-clay-text',
  overdue: 'bg-cream-2 text-ink-2',
  'not-started': 'bg-cream-2 text-ink-2',
}

export const PaceBadge = ({ pace }: { pace: Pace }) => (
  <span className={'inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ' + tone[pace]}>{paceLabel[pace]}</span>
)
