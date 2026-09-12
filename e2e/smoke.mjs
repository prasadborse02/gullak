// End-to-end smoke test against a running dev server (npm run dev), then: node e2e/smoke.mjs
// Drives the whole loop in light and dark, desktop and phone, and fails on console errors,
// horizontal overflow, or the primary action being below the first phone viewport.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:5173/'
const OUT = 'e2e/shots'
mkdirSync(OUT, { recursive: true })

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
const shot = (name, opts = {}) => p.screenshot({ path: `${OUT}/${name}.png`, ...opts })
const settings = async (fn) => { await p.click('button[aria-label="Settings"]'); await p.waitForTimeout(250); await fn(p.getByRole('dialog')); await p.getByRole('dialog').getByRole('button', { name: 'Done' }).click(); await p.waitForTimeout(250) }
const setMode = (m) => settings((d) => d.getByRole('button', { name: new RegExp('^' + m + '$', 'i') }).click())
const noHScroll = async (label) => {
  const over = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (over) throw new Error(`horizontal overflow on ${label}`)
}

await p.goto(URL)
await p.waitForTimeout(400)
await shot('00-first-run')
await p.click('text=Continue')
await p.waitForTimeout(300)
await shot('01-empty')

// Create a goal with 4 mini-goals, suggested checkpoints, completion bonus 200
await p.click('text=Start a goal')
await p.fill('#title', 'Run a marathon in 2 hours')
await p.fill('#desc', 'Sub-2 at the December race.')
await p.click('text=Add mini-goal')
const names = ['Long run 20 km', 'Interval session', 'Recovery run', 'Race simulation']
for (let i = 0; i < 4; i++) {
  await p.fill(`input[aria-label="Mini-goal ${i + 1} title"]`, names[i])
  await p.fill(`input[aria-label="Mini-goal ${i + 1} coins"]`, String([100, 50, 20, 150][i]))
}
await p.click('text=Suggest')
await shot('02-form', { fullPage: true })
await p.click('text=Create Gullak')
await p.waitForTimeout(400)
const goalHash = await p.evaluate(() => location.hash)
await shot('03-detail-empty')

// Deposit from the goal page; checkpoint at 2/4
await p.click('text=Deposit coins')
await p.waitForTimeout(300)
await shot('04-coin-flight')
await p.waitForTimeout(600)
await p.click('text=Deposit coins')
await p.waitForTimeout(1200)
await shot('05-checkpoint', { fullPage: true })

// Take back the deposit that crossed the 2/4 checkpoint: its +50 bonus must go too. Redo must re-earn it once.
await p.click('button[aria-label="Take back Interval session"]')
await p.waitForTimeout(200)
const afterTakeBack = await p.evaluate(() => JSON.parse(localStorage.getItem('gullak:v1')).transactions.reduce((a, t) => a + t.amount, 0))
if (afterTakeBack !== 100) throw new Error(`take-back should leave ₹100 (long run only), got ₹${afterTakeBack}`)
await p.click('button[aria-label="Complete Interval session"]')
await p.waitForTimeout(900)
const afterRedo = await p.evaluate(() => JSON.parse(localStorage.getItem('gullak:v1')).transactions.reduce((a, t) => a + t.amount, 0))
if (afterRedo !== 200) throw new Error(`redo should give ₹200, got ₹${afterRedo}`)

// The take-back must have removed its deposit line, not added an "Undo" line
const undoLines = await p.evaluate(() => JSON.parse(localStorage.getItem('gullak:v1')).transactions.filter((t) => t.kind === 'reversal' || t.note.startsWith('Undo')).length)
if (undoLines !== 0) throw new Error('take-back left a reversal line in history')

// Deposit from the dashboard card
await p.click('header a[href="#/"]')
await p.waitForTimeout(300)
await shot('06-dashboard')
await p.click('button[aria-label^="Deposit coins for"]')
await p.waitForTimeout(1000)

// Finish the goal → completion bonus
await p.click('a[aria-label^="Open"]')
await p.waitForTimeout(300)
await p.click('text=Deposit coins')
await p.waitForTimeout(1500)
await shot('07-full', { fullPage: true })
const receipt = await p.textContent('text=Broke open')
if (!receipt) throw new Error('no completion receipt')

// Wallet: confirm dialog, spend, undo
await p.click('text=Spend from wallet')
await p.waitForTimeout(300)
const balBefore = await p.locator('.num.font-display').first().textContent()
await p.getByRole('button', { name: /^Spend ₹50 on Diet Coke$/ }).click()
await p.waitForTimeout(200)
await shot('08-confirm')
await p.getByRole('dialog').getByRole('button', { name: /^Spend/ }).click()
await p.waitForTimeout(300)
const balAfter = await p.locator('.num.font-display').first().textContent()
await p.getByRole('button', { name: 'Undo' }).click()
await p.waitForTimeout(200)
const balUndone = await p.locator('.num.font-display').first().textContent()
if (balUndone !== balBefore) throw new Error(`undo failed: ${balBefore} → ${balAfter} → ${balUndone}`)
await shot('09-wallet', { fullPage: true })

// Expected total: 320 coins + 50 + 100 checkpoints + 200 completion = ₹670
if (balBefore !== '₹670') throw new Error(`expected ₹670, got ${balBefore}`)

await p.click('text=Completed')
await p.waitForTimeout(300)
await shot('10-completed')

// Persistence
await p.reload()
await p.waitForTimeout(500)
const bal = await p.evaluate(() => JSON.parse(localStorage.getItem('gullak:v1')).transactions.reduce((a, t) => a + t.amount, 0))
if (bal !== 670) throw new Error(`persisted balance ${bal}`)

// Dark theme
await p.goto(URL)
await p.waitForTimeout(300)
await setMode('Dark')
await shot('11-dark-dashboard')
await p.goto(URL + goalHash)
await p.waitForTimeout(300)
await shot('12-dark-detail', { fullPage: true })
await p.click('text=Delete')
await p.waitForTimeout(300)
await shot('12b-dark-confirm')
await p.keyboard.press('Escape')
await p.waitForTimeout(200)
// reduced motion: the deposit must still land (no coin element, state changes)
const rm = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const rp = await rm.newPage()
await rp.goto(URL); await rp.click('text=Continue'); await rp.goto(URL + '#/new'); await rp.fill('#title', 'Quiet goal'); await rp.fill('input[aria-label="Mini-goal 1 title"]', 'One'); await rp.click('text=Create Gullak'); await rp.waitForTimeout(300)
await rp.click('text=Deposit coins'); await rp.waitForTimeout(150)
const coins = await rp.locator('.coin-fly').count()
const doneTxt = await rp.textContent('text=of 1 done')
if (coins !== 0 || !doneTxt?.includes('1 of 1')) throw new Error(`reduced motion: coins=${coins} done=${doneTxt}`)
await rm.close()

// Phone: second goal so there is an active card; primary action must sit inside the first viewport
await p.setViewportSize({ width: 390, height: 844 })
await p.goto(URL + '#/new')
await p.waitForTimeout(300)
await p.fill('#title', 'Read 12 books this year')
for (let i = 0; i < 3; i++) await p.fill(`input[aria-label="Mini-goal ${i + 1} title"]`, `Book ${i + 1}`)
await shot('13-mobile-form', { fullPage: true })
await p.click('text=Create Gullak')
await p.waitForTimeout(400)
const dep = await p.locator('button[aria-label^="Deposit coins for"]').boundingBox()
if (!dep || dep.y + dep.height > 844) throw new Error(`Deposit button below the fold on phone: y=${dep?.y}`)
await shot('14-mobile-detail')
await noHScroll('mobile detail')
await p.click('text=Deposit coins')
await p.waitForTimeout(1200)
await shot('15-mobile-toast')
await p.goto(URL + '#/')
await p.waitForTimeout(300)
await shot('16-mobile-dashboard', { fullPage: true })
await noHScroll('mobile dashboard')
await p.goto(URL + '#/completed')
await p.waitForTimeout(300)
await noHScroll('mobile completed')
await p.goto(URL + '#/wallet')
await p.waitForTimeout(300)
await noHScroll('mobile wallet')
await shot('17-mobile-wallet', { fullPage: true })

// Light again for the phone dashboard
await setMode('Light')
await p.goto(URL + '#/')
await p.waitForTimeout(300)
await shot('18-mobile-light')

// The other two themes, desktop light, via the header dialog
await p.setViewportSize({ width: 1280, height: 900 })
await p.goto(URL + '#/')
await p.waitForTimeout(300)
await p.click('button[aria-label="Settings"]')
await p.waitForTimeout(300)
await shot('19-theme-dialog')
await p.click('text=The Childhood Ledger')
await p.getByRole('dialog').getByRole('button', { name: 'Done' }).click()
await p.waitForTimeout(300)
await shot('20-ledger-dashboard')
await p.goto(URL + goalHash)
await p.waitForTimeout(300)
await shot('21-ledger-detail')
await settings((d) => d.getByText('The Quiet Piggy Bank').click())
await shot('22-quiet-detail')
// Currency: switch to $ in Settings, wallet must show $ everywhere, and persist
await settings((d) => d.getByLabel('Currency symbol').selectOption('$'))
await p.goto(URL + '#/wallet')
await p.waitForTimeout(300)
const balText = await p.locator('.num.font-display').first().textContent()
if (!balText.startsWith('$')) throw new Error('currency not applied: ' + balText)
await shot('24-wallet-dollar')
await settings((d) => d.getByLabel('Currency symbol').selectOption('₹'))
await setMode('Dark')
await shot('23-quiet-dark-detail')
const pal = await p.evaluate(() => localStorage.getItem('gullak:palette'))
if (pal !== 'quiet') throw new Error('palette not persisted: ' + pal)

await b.close()
if (errs.length) { console.error('console errors:', errs); process.exit(1) }
console.log('smoke ok · balance', balBefore)
