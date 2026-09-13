---
target: new goal page
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/prasad/dev/prasad02/gullak/src/screens/GoalForm.tsx"
target_fingerprint: "sha256:a10be9a0050abfe1a8985d015dac3c8a52d24735961ee4b7691554d5161f5776"
target_path: /Users/prasad/dev/prasad02/gullak/src/screens/GoalForm.tsx
timestamp: 2026-09-13T02-14-51Z
slug: src-screens-goalform-tsx
---
# Critique: New goal page (src/screens/GoalForm.tsx), run 2

Method: dual-agent (A: design review · B: detector + browser evidence). Chrome extension not connected; both agents used headless Playwright Chromium at 1280 and 400px, light and dark, Clay Shelf.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Coin total and commit line update live; Suggest and Add checkpoint sit disabled with no reason given |
| 2 | Match System / Real World | 3 | "Completion bonus" explained via the pot before coins are introduced |
| 3 | User Control and Freedom | 2 | No dirty guard on Cancel or tab bar; Enter in a mini-goal title submits the form |
| 4 | Consistency and Standards | 2 | Global focus outline stacks on the input clay ring; arrow glyph doubles as disclosure chevron |
| 5 | Error Prevention | 2 | Checkpoint at the full count allowed; double-pays the completion bonus |
| 6 | Recognition Rather Than Recall | 2 | Coins column has no unit; open disclosure shows an unlabeled "Medium" select |
| 7 | Flexibility and Efficiency | 3 | Good defaults and Suggest; no keyboard path to a new row |
| 8 | Aesthetic and Minimalist Design | 3 | Calm three-card form; pot at 36px reads as a dot |
| 9 | Error Recovery | 3 | Messages concrete and in voice; mini-goal error ~300px below the focused field |
| 10 | Help and Documentation | 2 | No help for phase/priority; disabled buttons never say why |
| **Total** | | **25/40** | **Solid, unfinished** |

## Design Specificity Verdict

LLM: authored at the edges (heading, pot beside "Holds 0 coins", commit line "Holds 150 coins · full by 13 Oct · +200 when done"), generic admin form in the middle. Pot inert at 0 and 36px (below DESIGN.md 52px minimum).

Deterministic: CLI detector clean (0). In-page detector: 6 patterns; 1 in scope (gpt-thin-border-wide-shadow on the three .card sections = shelf-lift token with negative spread, index.css:162). Others out of scope: closed Settings dialog + preview card, Ledger stripes, GoalDetail width transition, bump easing, deliberate cream background.

Overlays: none (Playwright fallback). Live server 8400 started and stopped.

## Overall Impression

Score held at 25 while the problems changed. Last round's blockers are gone. A regression from the fix surfaced: Suggest then Add now creates a checkpoint at the full count that double-pays the finish and overprints on GoalDetail. Draft safety and keyboard focus are the other gaps.

## What's Working

- Commit row (GoalForm.tsx:168): plan restated as a saving outcome, only when valid.
- Error timing model (:27, :40): empty-field errors after first attempt; bad deadline immediately; row warnings name consequences.
- Self-summarising disclosure (:123).

## Priority Issues

- [P1] Checkpoint at the full count allowed and collides with the completion bonus. nextCount ranges to minis.length (:42), input max matches (:153), save keeps it (:63). Suggest + one Add → "After 3 of 3, bonus 100"; GoalDetail draws the 3/3 and Full nodes at the same x, labels overprint. Fix: cap at minis.length − 1 in all three places; row warning "That's the full pot. The completion bonus already pays there." Command: /impeccable harden.
- [P1] Draft unguarded. Cancel navigates without confirm (:174); header/tab bar live 67px below Create at 400w; useState only so a backgrounded PWA loses it. Fix: mirror draft to sessionStorage (gullak:draft:new / :<id>), hydrate in initializer, clear on submit; confirm() on dirty Cancel. Command: /impeccable harden.
- [P2] Keyboard focus dropped to body: Remove mini-goal, Remove checkpoint, final Add checkpoint (disables itself under focus). Add mini-goal leaves new row 4 Shift+Tabs away. Fix: focus new row after add, previous row after remove; don't disable Add checkpoint while focused. Command: /impeccable harden.
- [P2] Mini-goal error detached from its field. aria-describedby on the <ol> (:117) is inert; message renders after all rows ~300px below the focused input. Fix: message under row 1, aria-describedby on mini-1. Command: /impeccable polish.
- [P2] Dark-mode error text 4.0:1. text-clay-2 at :82, :97, :140, :157, :158; use text-clay-text (dark #e8a48a, light identical). Command: /impeccable polish.

## Persona Red Flags

- First-timer: bonus explained before coins; "50" with no unit; unlabeled "Medium"; Add checkpoint invites a double finish bonus; lands on overprinted labels.
- Phone quick planner: Enter on row 2 submits a half-planned goal; "Wallet" tab 67px under Create loses the draft with no confirm.
- Keyboard/screen reader: logical tab order, first failed Create announced; remove-row drops focus to body; mini-goal error has no description on the focused input; live region names only the first problem.
- Author on phone: backgrounded PWA loses the draft; default 200 bonus vs 150 seeded pot rewards the finish more than the work.

## Minor Observations

- Pot at 36px below the 52px minimum.
- Global :focus-visible outline (index.css:152) stacks on .input clay ring: dark box around clay box in every capture.
- Disclosure uses the full "down" arrow; open state reads like a sort control. Add a chevron to Icon.tsx.
- Form max-w-2xl (672) vs 896 detail page; cards widen on Create.
- Placeholder "Run a marathon in 2 hours" under "Realistic deadline".
- Checkpoint bonus accepts negatives (noValidate, no clamp at :155).
- Disabled Suggest at 40% ghost reads as decoration.
- .btn transition includes outline-color so button focus rings fade in.

## Questions to Consider

- What if the header pot filled as coins are assigned?
- Should Enter in a mini-goal title add the next row instead of submitting?
- Is a default completion bonus larger than the seeded pot the right first impression?
