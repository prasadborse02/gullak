---
name: Gullak
description: A clay Gullak for progress. Small deposits, big dreams.
colors:
  cream-paper: "#f6efe4"
  cream-paper-deep: "#efe5d5"
  card-paper: "#fffaf2"
  charcoal-ink: "#2a211c"
  ink-muted: "#6b5d53"
  ink-caption: "#75675c"
  hairline: "#e4d8c6"
  terracotta-clay: "#b5522d"
  terracotta-deep: "#9a4526"
  terracotta-text: "#9a4526"
  terracotta-wash: "#f3d9cc"
  brass-coin: "#e0a93d"
  brass-text: "#805913"
  brass-wash: "#f9e9c3"
  leaf: "#3d6547"
  leaf-wash: "#dceadf"
  sky: "#3b5c85"
  sky-wash: "#dbe5f1"
  lamp-lit-dark: "#1c1714"
  lamp-lit-card: "#241e1a"
  lamp-lit-ink: "#f3ebe0"
  lamp-lit-clay: "#d0704a"
  lamp-lit-brass-text: "#e3b258"
  ledger-paper: "#f7f4ec"
  ledger-ink-blue: "#2b3a67"
  ledger-rule: "#cfd6e4"
  ledger-dark-paper: "#161a24"
  ledger-dark-blue: "#7f95d1"
  quiet-stone: "#f5f4f1"
  quiet-ash: "#6e5a50"
  quiet-fog: "#e2dfd9"
  quiet-dark-stone: "#171615"
  quiet-dark-ash: "#b09a8d"
  brass-highlight: "#f7d77a"
  coin-sheen: "rgba(255,255,255,.35)"
  scrim: "rgba(20,14,10,.55)"
typography:
  display:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
  headline:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  numeral:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  xs: "4px"
  pill: "9999px"
  xl: "1.25rem"
  2xl: "1.75rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta-clay}"
    textColor: "{colors.card-paper}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-deep}"
  button-soft:
    backgroundColor: "{colors.cream-paper-deep}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    size: "44px"
  card:
    backgroundColor: "{colors.card-paper}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  input:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
    typography: "{typography.body}"
  pace-badge:
    backgroundColor: "{colors.leaf-wash}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  toast:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.cream-paper}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 20px"
---

# Design System: Gullak

## Overview

**Creative North Star: "The Clay Shelf"** (default), with two sibling worlds the user may choose instead: **"The Childhood Ledger"** and **"The Quiet Piggy Bank"**.

Gullak is a terracotta pot on a warm shelf. Everything on screen is the paper, wood, brass, and clay around that pot. The pot is the only illustration and the only progress indicator; there is no progress bar and no percentage anywhere. Coins are drawn into it, its fill rises, and when it is full it earns a brass rim and a lid. By day the shelf is cream paper; by night the same shelf is lamp-lit, so the dark theme changes the paper and ink but never the clay or the brass. The whole interface is calm so that the one loud moment, a coin landing with a clink, stays loud.

The user picks a world on first launch and can change it from the header at any time. The Ledger keeps the pot but sets it on ruled notebook paper with ink-blue controls, flat cards, and squared corners: a child tallying coins. The Quiet Piggy Bank drains the chroma to stone, fog, and ash, flat and generous, so that the brass coin is the only colour that ever arrives. All three share the same type, the same components, the same motion, and the same pot; they differ only in tokens.

The system rejects the productivity-SaaS defaults it could have borrowed: no progress bars, no percentages, no eyebrow labels above headings, no unicode glyphs as icons, no gradient text, no streaks or badges. Nothing on screen rewards anything except a deposit.

**Key Characteristics:**
- One illustration, the pot, drawn once and driven by a single number.
- Two type families only: Fraunces for the few display moments, Nunito for everything else.
- Clay and brass are constant across all six palettes; paper and ink move.
- Every text token clears 4.5:1 on its own surface in every palette and mode.
- One authored motion: coin leaves the button, arcs into the slot, the pot bumps, the sound lands.
- Soft, tactile, certain components: pills that press, cards with a whisper of lift, inputs that glow clay on focus.

## Colors

The palette names the materials of the shelf: paper, ink, clay, brass. Each of the three worlds has a light and a dark set; tokens keep the same names across all six so components never change.

### Primary
- **Terracotta Clay** (#b5522d): the only saturated action colour. Primary buttons, the focus border on inputs, the "Next deposit" border. In dark it warms to **Lamp-lit Clay** (#d0704a) so paper-coloured button text keeps 4.5:1.
- **Terracotta Deep** (#9a4526): hover state of primary, and text on Terracotta Wash.
- **Terracotta Wash** (#f3d9cc): the tint behind the next-deposit block and the "behind pace" badge.

### Secondary
- **Brass Coin** (#e0a93d): the coin. Fill of the pot, checkpoint nodes when reached, the selected theme border, the selection highlight. Identical in every palette and mode.
- **Brass Text** (#805913 light, #e3b258 dark): bonus figures, checkpoint bonuses, the ₹ badge. Never used as a surface.
- **Brass Wash** (#f9e9c3): tint behind the ₹ badge and the "completed" pace badge.
- **Brass Highlight** (#f7d77a) and **Coin Sheen** (rgba(255,255,255,.35)): only inside the flying coin's radial gradient and its inset rim. Never on UI.

### Tertiary
- **Leaf** (#3d6547 on #dceadf) and **Sky** (#3b5c85 on #dbe5f1): pace badges only. Ahead of pace is leaf; on pace is sky. Never elsewhere.

### Neutral
- **Cream Paper** (#f6efe4): page background. **Cream Paper Deep** (#efe5d5): soft buttons, the inset next-action block on cards.
- **Card Paper** (#fffaf2): every card, input, and dialog.
- **Charcoal Ink** (#2a211c): headings, numbers, body. **Ink Muted** (#6b5d53): secondary text and labels. **Ink Caption** (#75675c): captions and metadata, the lightest text allowed.
- **Hairline** (#e4d8c6): card borders, dividers, the unfilled checkpoint track.
- Dark: **Lamp-lit Dark** (#1c1714) page, **Lamp-lit Card** (#241e1a), **Lamp-lit Ink** (#f3ebe0).
- **Scrim** (rgba(20,14,10,.55)): the fixed dialog backdrop in every palette and mode, so dark never turns pale behind a dialog.

### The Childhood Ledger
- **Ledger Paper** (#f7f4ec) with a repeating rule every 32px in ink blue at 10%. **Ink Blue** (#2b3a67) replaces clay as the action colour; **Ledger Rule** (#cfd6e4) is the hairline. Shadows are off; corners drop to 0.75rem. Dark: **Ledger Dark Paper** (#161a24), **Ledger Dark Blue** (#7f95d1).

### The Quiet Piggy Bank
- **Stone** (#f5f4f1) page, **Ash** (#6e5a50) as the action colour, **Fog** (#e2dfd9) hairline. Brass softens to #d9b25c. Shadows are off. Dark: **Dark Stone** (#171615), **Dark Ash** (#b09a8d).

### Named Rules
**The Constant Clay Rule.** The pot is terracotta and the coin is brass in every palette and every mode. Themes change the room, never the object.

**The One Loud Colour Rule.** Clay (or its palette equivalent) appears on at most one primary action per viewport. Everything else is paper and ink.

**The Brass Means Earned Rule.** Brass appears only where coins have landed: the pot fill, a reached checkpoint, a bonus figure, the full-pot rim. It never decorates.

## Typography

**Display Font:** Fraunces (with Georgia fallback), weights 500–600, self-hosted variable woff2.
**Body Font:** Nunito (with system-ui fallback), weights 400–700, self-hosted variable woff2.

**Character:** A soft serif with a little swash for the moments that deserve ceremony, over a rounded humanist sans that stays out of the way. It reads as Indian stationery, not a dashboard.

### Hierarchy
- **Display** (600, 1.875rem, 1.2): page headings and the goal title. One per screen. Balanced wrapping (`text-balance`).
- **Headline** (600, 1.5rem, 1.25): "Broke open 13 Sept" on the receipt; the dialog title at 1.25rem.
- **Title** (600, 1.125rem, 1.25): goal card titles; clamps to two lines.
- **Numeral** (700, 2.25rem, tabular): the coin count on the goal page; 1.5rem on cards; the wallet balance at 3rem in Fraunces. Always tabular figures.
- **Body** (400, 1rem, 1.625): descriptions, dialog copy, receipts.
- **Label** (600, 0.875rem): form labels, section headings, button text.
- **Micro** (600, 0.75rem): checkpoint node numerals, pace badges, the theme-preview pill. The smallest size allowed; never for reading text.
- **Caption** (400, 0.875rem, Ink Caption): metadata lines, stat labels, helper text.

### Named Rules
**The Two Faces Rule.** Fraunces appears on headings, goal titles, the wallet balance, and dialog titles. Nowhere else. Nunito does all the work.

**The No Eyebrow Rule.** Nothing sits above a heading in small caps. The heading carries its own weight. Stat labels sit below their value's context as captions, never as kickers.

**The Tabular Numbers Rule.** Every coin count, rupee figure, date, and ratio uses tabular numerals (`.num`), so columns of figures never shimmer.

## Layout

Single column, `max-width: 56rem` (896px), 16px side gutters, centred. The header is 56px, sticky, translucent cream with a hairline. On phones a three-tab bar is fixed to the bottom with safe-area padding; on desktop the same tabs live in the header as pills.

Priority within a screen follows the product principle: progress, next action, deadline, details. The goal page is one hero card holding the pot, pace, title, coin count, the next deposit with its button, then deadline and days left. The Deposit button sits inside the first phone viewport. Cards stack in one column on phones and two columns from 768px.

Rhythm: 24px between sections (`space-y-6`), 16px between cards in a grid, 20px card padding (32px on desktop hero cards), 12px inside inset blocks. Tight groups, generous separations, more space above a heading than below.

## Elevation & Depth

Hybrid, and palette-dependent. The Clay Shelf lifts cards a whisper: a 1px hairline plus a soft offset shadow that reads as paper resting on a shelf. The Ledger and Quiet palettes are flat: the shadow token is transparent and depth comes from hairlines and tonal steps (page cream, card paper, inset cream-deep). Dialogs sit on a fixed dark scrim in every palette and mode.

### Shadow Vocabulary
- **Shelf lift** (`box-shadow: 0 1px 0 var(--color-shadow), 0 10px 24px -14px var(--color-shadow)`, shadow = rgba(42,33,28,.12) light, rgba(0,0,0,.45) dark): every `.card` in the Clay Shelf. Transparent in Ledger and Quiet.
- **Dialog** (`shadow-2xl`): the confirm and theme dialogs.
- **Toast** (`shadow-lg`): the single message pill.

### Named Rules
**The No Glow Rule.** Shadows always carry an offset and a blur. The only zero-offset glow is the pot's own brass glow at 85% full and on checkpoint, and it is motion, not a resting state.

## Shapes

Round where the hand touches, square where the eye reads. Buttons are full pills. Cards are 1.75rem in Clay, 1.25rem in Quiet, 0.75rem in Ledger. Inputs are 1.25rem (0.5rem in Ledger). The pot is a rounded ellipse with a short neck and a flat slot. Icons are drawn stroke paths at 2px, one weight, 16–18px, never unicode glyphs. Borders are 1px hairlines everywhere; a 2px border marks only the selected theme and the check circle. Focus outlines take a 4px radius (`rounded.xs`) so they hug text links and pills alike.

## Components

Soft, tactile, certain. Handmade but never wobbly.

### Buttons
- **Shape:** full pill (9999px), 10px vertical padding, 16px horizontal, 14px semibold, 36–44px tall.
- **Primary:** Terracotta Clay fill, Card Paper text. Hover to Terracotta Deep. Active scales to 0.98.
- **Soft:** Cream Paper Deep fill, Charcoal Ink text. Hover to Hairline.
- **Ghost:** transparent, Ink Muted text. Hover fills Cream Paper Deep.
- **Danger:** fixed charcoal (#2a211c) with cream text in both themes, only inside confirm dialogs.
- **Icon:** 44×44 circle, Ink Muted stroke icon, hover fills Cream Paper Deep.
- **Focus:** 2px Charcoal Ink outline, 3px offset, on every control.

### Pace Badge (chips)
- **Style:** pill, 12px semibold, tinted wash with matching deep text. Ahead = leaf on leaf-wash; on pace = sky on sky-wash; behind = terracotta-text on terracotta-wash; completed = brass-text on brass-wash; past deadline and not-started = ink-muted on cream-deep.

### Cards
- **Corner:** `rounded-2xl` (palette token). **Background:** Card Paper. **Border:** 1px Hairline. **Shadow:** Shelf lift (Clay only). **Padding:** 20px; 32px on the desktop hero. Nested blocks inside a card use Cream Paper Deep at 70% or Terracotta Wash at 40% with a 0.75rem radius and no border, never a second card.

### Inputs
- **Style:** Card Paper, 1px Hairline, `rounded-xl`, 8px 12px, 16px text, Ink Caption placeholder.
- **Focus:** border turns Terracotta Clay with a 2px clay ring at 30%. Caret and accent are clay.
- **Number fields** use tabular numerals. Native date inputs are kept.

### Navigation
- Three destinations only: Gullak (home), Wallet, Completed. Desktop: the wordmark is home and two text pills sit beside it; the current pill is Charcoal Ink fill with cream text, `aria-current="page"`. Phone: the same three as equal tabs fixed to the bottom, 14px semibold, current in Terracotta Text. A "Skip to content" link is the first focusable element.
- The header holds only the wordmark, the two pills, and one Settings icon button on the right. Settings is a dialog: theme picker, light/dark/system, coin sounds. New goal lives on the dashboard, once.

### The Pot (signature)
One SVG, `Gullak.tsx`. Terracotta body with a clay gradient, neck and slot, clipped brass fill whose level is `earned / capacity`, coin lines that appear as the level rises, a soft glow loop from 85%, and a brass rim with a check lid when done. Sizes: 52 (preview), 88–96 (cards), 120 (phone hero), 140 (empty state), 200 (desktop hero). `role="img"` with the percentage as its label.

### The Deposit (signature interaction)
Click → state commits → a 22px brass coin leaves the button along a quadratic arc → lands on the slot → the pot bumps 420ms → a synthesized clink plays (drop, clash, or pour by pot state) → a toast names the coins. Checkpoints and a full pot add a coin burst and glow. With reduced motion, the coin and burst are skipped and the sound and toast still land.

### Toast
Single pill, bottom-anchored above the tab bar on phones and 32px from the bottom on desktop, Charcoal Ink on Cream (Terracotta Clay on Card Paper for errors). Undo and error toasts hold 5s with a button; plain ones 2.6s. `role="status"`, `aria-live="polite"`; errors `role="alert"`.

### Confirm Dialog
Native `<dialog>` on a fixed dark scrim, Card Paper, `rounded-2xl`, 24px padding, Fraunces title, Cancel focused by default, Escape closes. Used for delete goal, spend, and import.

### Theme Picker
Three radio cards, each a live miniature of a goal card rendered in its own palette via scoped `data-palette` and `data-theme` attributes, with a light/dark/system segmented control. Shown full-screen on first launch and in a dialog from the header palette button.

## Do's and Don'ts

### Do:
- **Do** let the pot be the only progress indicator. Show the coin count as a number beside it.
- **Do** put the next deposit and its button inside the first phone viewport on the goal page.
- **Do** guard every destructive or irreversible action with an in-app confirm or an undo toast. Import shows counts and downloads the current data first.
- **Do** keep every text token at or above 4.5:1 on its own surface, in all six palettes.
- **Do** derive dates from local time, format with `en-IN`, and set numerals tabular.
- **Do** use `.card`, `.btn-*`, `.input`, `.caption`, `.label` and the colour tokens; never a raw hex in a component.
- **Do** scope new theme tokens under `[data-palette]` so the picker previews stay live.

### Don't:
- **Don't** add a progress bar, ring, or percentage anywhere. The pot is the bar.
- **Don't** put a small-caps label above a heading.
- **Don't** use unicode arrows or ✕ as icons; add a path to `Icon.tsx`.
- **Don't** change the pot's terracotta or the coin's brass in any palette.
- **Don't** nest a bordered card inside a card; use a tinted inset block.
- **Don't** call `window.alert` or `window.confirm`; use the toast and the confirm dialog.
- **Don't** reward anything but a deposit: no streaks, badges, leaderboards, or login coins.
- **Don't** play a sound outside the deposit chain, and always honour the mute toggle.
