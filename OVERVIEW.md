# Gullak — Overview

Small deposits. Big dreams.

Gullak is a local-first personal goal bank. You break a goal into mini-goals, give each one a coin value, and every finished piece drops coins into that goal's clay pot and into a reward wallet you can spend on yourself. It runs entirely in the browser with no account and no server.

## Features

### Goals
- Create any number of goals at once, each with a title, a short "why", a start date, a realistic deadline, and a completion bonus.
- Break a goal into mini-goals, each with a coin value and optional description, phase, due date, and priority.
- Reorder, edit, and remove mini-goals. Adding a mini-goal to a finished goal reopens it.
- Set checkpoints at any count of finished mini-goals, each with its own bonus. A "Suggest" button places two at a third and two thirds.
- Every goal is drawn as a terracotta Gullak whose fill level is the coins earned so far. The pot glows near full and earns a brass rim and lid when done.

### Deposits
- Mark a mini-goal done from the goal page or straight from its dashboard card. A coin flies from the button into the pot, the pot bumps, a synthesized clink plays, and a message names the coins.
- Checkpoints and a full pot add a burst of coins and pay their bonus once.
- Take a deposit back at any time. The deposit and any bonus it unlocked are removed from the wallet, with no undo line left in the history. Completing again re-earns them once. Nothing is ever paid twice at the same time.
- Sounds change with the pot's state: a single drop into an empty pot, coins clashing when there are already coins, a pour for checkpoints and completion. Sound can be muted in Settings. Reduced-motion users get the state change, sound, and message without the flying coin.

### Pace
- Each goal shows Ahead of pace, On pace, Behind pace, Past deadline, or Completed, computed from elapsed time against coins earned. It is feedback, not guilt.
- The dashboard opens with a state line ("2 Gullaks waiting for a deposit", "You broke one open. Start the next?") and each card shows the next action with its own Deposit button, the deadline, days left, and count done.

### Completion
- When the last mini-goal is done the pot fills, the completion bonus pays, and the goal page shows a receipt: the date it broke open, days before or after the deadline, bonus earned, first and last deposit dates, and how much it put in the wallet, with a button to go spend.
- Finished goals move to the Completed screen.

### Reward wallet
- Every coin deposited also lands in the wallet as spendable value at a rate you set (default 1 coin = ₹1, adjustable for future deposits).
- Define your own rewards with a price. Spend confirms first, shows the balance after, and offers a five-second undo.
- A full history lists every deposit, bonus, and spend with dates.
- The currency symbol is chosen in Settings: ₹ by default, or $, €, £, ¥, ₩, CHF, A$, C$, or a custom symbol.

### Themes and settings
- Three visual themes, chosen on first launch and changeable any time from Settings: The Clay Shelf (cream paper, terracotta, brass), The Childhood Ledger (ruled notebook paper, ink blue, flat), and The Quiet Piggy Bank (stone, fog, ash). Each has a light and dark mode; dark follows the system unless overridden.
- Settings also holds the coin-sound switch and the currency.

### Safety
- Import replaces everything, so it shows the counts on both sides and downloads your current data first.
- Deleting a goal confirms in-app and never touches coins already in the wallet. Removing a mini-goal or reward offers undo.
- Keyboard operable throughout, with a skip link, visible focus rings, labelled controls, and live-region announcements for deposits.

## How data is stored

Everything lives in the browser's `localStorage` for the site's origin. Nothing is sent anywhere.

| Key | Contents |
|---|---|
| `gullak:v1` | One JSON document: goals with mini-goals and checkpoints, the wallet transaction history, rewards, the coin-to-currency rate, and the currency symbol. |
| `gullak:palette` | Chosen theme: `clay`, `ledger`, or `quiet`. |
| `gullak:theme` | `light` or `dark`. Absent means follow the system. |
| `gullak:muted` | `1` when coin sounds are off. |

- The main document is rewritten on every change and read once at startup. Older saves are migrated in place when new fields are added.
- The wallet balance is never stored; it is the sum of the transaction history, so history and balance can't disagree.
- Data is tied to one browser profile on one device. A different browser or a phone holds a separate copy.
- **Export backup** on the dashboard downloads the document as a dated JSON file. **Import backup** restores it after confirmation. Files that aren't a Gullak backup are refused.
- Clearing the site's data in the browser, or running `localStorage.clear()` in the console, resets the app to first launch.

## Browser stack

| Layer | Choice |
|---|---|
| Framework | React 19 with TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4, with design tokens as CSS custom properties scoped by `data-palette` and `data-theme` attributes |
| Routing | Hash routes (`#/`, `#/new`, `#/goal/:id`, `#/wallet`, `#/completed`), no router library |
| State | A small external store with `useSyncExternalStore`, persisted to `localStorage` |
| Illustration | One inline SVG pot whose fill is driven by a single number |
| Motion | CSS keyframes for the bump, glow, and entrances; the Web Animations API for the coin arc and burst |
| Sound | Web Audio API, synthesized at runtime; no audio files |
| Dialogs | Native `<dialog>` element |
| Fonts | Nunito (UI) and Fraunces (display), self-hosted as variable WOFF2 |
| Runtime dependencies | React and React DOM only |
| Dev tooling | TypeScript, Playwright (headless Chromium) for the end-to-end smoke test, tsx for the logic self-check |

## Running it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/, deployable to any static host
npm test         # logic self-check
npm run e2e      # full walkthrough in headless Chromium against the dev server
```

Product truth lives in `PRODUCT.md`; the visual system in `DESIGN.md`.
