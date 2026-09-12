import { Gullak } from './Gullak'
import { Icon } from './Icon'
import { palettes, resolvedTheme, setPalette, setTheme, useTheme, usePalette, type Palette } from '../theme'

/** Three ways Gullak can look, shown as live previews. Picking applies immediately. */
export function ThemePicker() {
  const theme = useTheme()
  const chosen = usePalette() ?? 'clay'
  const mode = resolvedTheme(theme)
  return (
    <div className="space-y-5">
      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="sr-only">Theme</legend>
        {palettes.map((p) => {
          const active = p.id === chosen
          return (
            <label
              key={p.id}
              data-palette={p.id === 'clay' ? undefined : p.id}
              data-theme={mode}
              className={'cursor-pointer rounded-2xl border-2 p-1 transition bg-cream ' + (active ? 'border-coin' : 'border-line hover:border-ink-3')}
            >
              <input type="radio" name="palette" value={p.id} checked={active} onChange={() => setPalette(p.id as Palette)} className="sr-only" />
              <Preview />
              <div className="px-3 pt-3 pb-2">
                <p className="font-display text-base text-ink flex items-center gap-2">
                  {p.name}
                  {active && <Icon name="check" size={14} className="text-coin-2" />}
                </p>
                <p className="caption mt-0.5 leading-snug">{p.line}</p>
              </div>
            </label>
          )
        })}
      </fieldset>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-ink-2">Light or dark</span>
        <div className="inline-flex rounded-full border border-line bg-paper p-0.5">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTheme(t)} aria-pressed={theme === t} className={'rounded-full px-3 py-1 text-sm font-medium capitalize transition ' + (theme === t ? 'bg-ink text-cream' : 'text-ink-2 hover:text-ink')}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** A miniature of the goal card, rendered in the label's own palette. */
function Preview() {
  return (
    <div className="card p-3 flex items-center gap-3" aria-hidden="true" style={{ backgroundImage: 'var(--paper-rule)' }}>
      <Gullak fraction={0.55} size={52} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm text-ink truncate">Run a marathon</p>
        <p className="num text-ink"><span className="font-bold">176</span><span className="text-xs text-ink-3"> / 320</span></p>
        <span className="mt-1 inline-block rounded-full bg-clay text-paper text-xs font-semibold px-2 py-0.5 leading-tight">Deposit</span>
      </div>
    </div>
  )
}
