import { Gullak } from '../components/Gullak'
import { bonusEarned, capacity, fmtDate, fmtStamp } from '../logic'
import { useStore } from '../store'

export function Completed() {
  const s = useStore()
  const done = s.goals.filter((g) => g.completedAt).sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-balance">Gullaks you broke open</h1>

      {done.length === 0 ? (
        <p className="text-ink-2">Nothing here yet. Fill a Gullak all the way and it will move here.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {done.map((g) => (
            <a key={g.id} href={`#/goal/${g.id}`} className="card p-5 flex gap-4 w-full min-w-0 hover:border-coin/60 transition">
              <Gullak fraction={1} done size={88} className="shrink-0" />
              <div className="min-w-0">
                <h2 className="font-display text-lg leading-tight line-clamp-2">{g.title}</h2>
                <p className="num text-sm text-ink-2 mt-1">{capacity(g)} coins · +{bonusEarned(g)} bonus</p>
                <p className="caption num mt-1">Broke open {fmtStamp(g.completedAt!)} · deadline {fmtDate(g.deadline)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
