# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is the author: one person fighting procrastination on a few self-chosen goals at a time (training, learning, creative or health projects). The situation is a private check-in, several times a day, on a phone installed as a home-screen app and on a laptop browser tab alongside work. Both contexts matter equally.

The product is built around the author's own use first, but is expected to be published for other individuals later. Copy must read correctly to a stranger meeting the metaphor for the first time, while staying personal rather than corporate.

## Product Purpose

Gullak turns goal attainment into saving. A goal is broken into mini-goals, each worth a user-set number of coins. Finishing a mini-goal deposits its coins into that goal's Gullak (progress) and into a reward wallet (spendable value). Checkpoints add one-time bonus coins. When the Gullak is full the goal is complete, and wallet value can be spent on small self-chosen rewards.

Success is a finished goal that the user can look back on as a sequence of small deposits, and a wallet history that shows they rewarded themselves only for real progress.

## Positioning

The childhood Indian clay Gullak, applied to progress instead of money. The mechanism a generic task manager cannot truthfully copy: two separate accumulations from one act of work (goal progress and personal reward value), an accumulation that is visible as fill rather than as a checklist, and a reward economy the user prices themselves.

Core line: **Small deposits. Big dreams.**

## Operating Context

- Local-first. No login, no backend, no sync. All state lives in the browser (localStorage) with JSON export and import for backup and moving devices.
- Used on phone (installed PWA, short check-ins) and desktop (browser tab during work). Mobile-first responsive, desktop must be excellent, not an afterthought.
- Typical session: open, see which Gullak needs a deposit, mark one mini-goal done, watch the coin drop, leave. Occasionally: plan a new goal, or spend from the wallet.
- Rewards are small real-world treats the user defines (a Diet Coke, a coffee out, a movie night).

## Capabilities and Constraints

Confirmed and implemented:

- Multiple concurrent goals, each with title, description, start date, deadline, mini-goals (title, description, points, due date, phase, priority), checkpoints (at N completed mini-goals, bonus coins), completion state.
- Completing a mini-goal deposits coins to the goal and the wallet. Taking it back removes that deposit from the wallet history rather than adding an undo line, and reverts any checkpoint or completion bonus the completion had unlocked. Completing again re-earns them once. Points are never awarded twice at the same time.
- Each goal carries a completion bonus (default 200 coins) paid once when the pot is full. Adding work to a full pot reopens it; the bonus already paid stays paid.
- Every deposit plays a synthesized coin sound (Web Audio, no assets): a single drop into an empty pot, coins clashing when the pot already holds some, a pour for checkpoints and a full pot. A header toggle mutes it and the choice persists.
- Three visual themes chosen on first launch and changeable from the header Settings dialog (which also holds light/dark and the coin-sound switch): The Clay Shelf (default), The Childhood Ledger, The Quiet Piggy Bank. Each has light and dark; dark follows the system by default and a header toggle overrides. The pot's terracotta and the coin's brass never change. See DESIGN.md.
- Destructive actions are guarded in-app: import shows counts and downloads the current data first; spend confirms and offers a 5-second undo; mini-goal and reward deletes and take-backs offer undo; goal delete confirms.
- Reduced-motion users get the state change, sound, and toast without the coin arc.
- Fonts (Nunito, Fraunces) are self-hosted so the app works offline.
- Pace feedback: ahead, on pace, behind, past deadline, completed. Feedback, never guilt.
- Reward wallet with configurable coin-to-currency rate, a currency symbol chosen in Settings (₹ default; ₹ $ € £ ¥ ₩ CHF A$ C$ or a custom symbol), user-defined rewards, spending, and a full transaction history. The symbol travels with the data in backups.
- Screens: Dashboard, Create/Edit goal, Goal detail (with a receipt once broken open), Wallet, Completed. No settings screen, no enterprise surfaces.
- Coins can be deposited from the dashboard card as well as the goal page.
- Terminology: goal, mini-goal, coins (progress points), Gullak (per-goal container), wallet (spendable value), checkpoint, deposit, reward.

Constraints:

- Rewarded only for meaningful progress. No streaks, badges, leaderboards, login rewards, or guilt notifications.
- Stack is fixed: Vite, React, TypeScript, Tailwind v4, no runtime dependencies beyond React.
- Animation must be short, subtle, rewarding, non-childish, never blocking.

Undecided:

- PWA install manifest and offline caching (expected usage implies it; not yet built).

## Brand Commitments

- Name: Gullak.
- Tagline: "Small deposits. Big dreams."
- The Gullak is a stylized Indian clay piggy bank (rounded terracotta, coin slot, no face), never a western pig icon. One primary illustration with a small set of fill states.
- Two font families maximum: a humanist rounded sans for UI, a soft serif for display moments only.
- Personality: nostalgic, focused, rewarding, calm, personal.

## Evidence on Hand

- The full original product brief (goal system, points, checkpoints, wallet, pace, screens, visual language) as delivered in the initial build request.
- No testimonials, users, metrics, or press. Do not fabricate any.
- No logo asset beyond the inline SVG Gullak and favicon in the codebase.

## Product Principles

1. Every rewarded moment traces back to real work. Nothing else earns coins.
2. Progress is visible as accumulation, not as a percentage on a checklist.
3. The next action is never buried under analytics. Answer first: what am I working toward, how much have I saved, what do I do next, am I on pace.
4. Goal progress and reward value are two clearly separate accounts fed by one act.
5. Calm over dense. Fewer numbers, fewer levels, generous space.

## Accessibility & Inclusion

No specific standard was established. Baseline expectations: keyboard-operable controls, labelled inputs, readable contrast on the cream palette, and motion that never carries information a static state does not also show.
