---
target: new goal page
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/prasad/dev/prasad02/gullak/src/screens/GoalForm.tsx"
target_fingerprint: "sha256:26416ea0119de8ea9a8ab68b54f2b06148d100c7b67abc99026139ae4787feea"
target_path: /Users/prasad/dev/prasad02/gullak/src/screens/GoalForm.tsx
timestamp: 2026-09-13T01-59-28Z
slug: src-screens-goalform-tsx
---
# Critique: New goal page (src/screens/GoalForm.tsx)

Method: dual-agent (A: design review · B: detector + browser evidence). Chrome extension not connected; both agents used headless Playwright Chromium at 1280 and 400px, light and dark, Clay Shelf.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Only validity signal is a faded submit and a grey caption far below the field it refers to |
| 2 | Match System / Real World | 3 | "Phase" unexplained; "Measurable goal" is coaching disguised as a label |
| 3 | User Control and Freedom | 2 | Cancel on a typed draft leaves without asking; refresh loses the draft; row delete has no undo |
| 4 | Consistency and Standards | 3 | Disabled icon buttons render identical to live ones (index.css:167 lacks the disabled rule .btn has) |
| 5 | Error Prevention | 2 | Suggest then Add yields duplicate "After 2 of 3" rows; "After 1 of 0, bonus" is reachable |
| 6 | Recognition Rather Than Recall | 3 | "After 2 of 3" asks which mini-goal is number 2; filled rows lose their number |
| 7 | Flexibility and Efficiency | 3 | Good defaults and seeding; Add mini-goal leaves focus on the button |
| 8 | Aesthetic and Minimalist Design | 3 | Nine always-visible icon buttons on an empty form |
| 9 | Error Recovery | 1 | One problem at a time, bottom of page, no field marked, no aria-invalid |
| 10 | Help and Documentation | 3 | Checkpoint caption is three sentences at 90 characters per line |
| **Total** | | **25/40** | **Solid, unfinished** |

## Design Specificity Verdict

LLM assessment: half-authored. First and last words are Gullak's ("What are you saving for?", placeholder "Run a marathon in 2 hours", "Create Gullak"). Between them a generic three-card CRUD form. No pot on the page; "150 coins total" is a corner caption. Any OKR tool could ship this unchanged.

Deterministic scan: CLI detector clean on GoalForm.tsx and Icon.tsx (0 findings). In-page detector: 7 anti-patterns. 3× gpt-thin-border-wide-shadow on the form cards = DESIGN.md shelf-lift token (negative spread, 12% alpha; detector does not weigh it). 1× line-length ~90 chars on the checkpoint caption (GoalForm.tsx:142) is real. Remaining hits are stylesheet-level for elements not on this page (closed Settings dialog, Ledger stripes, GoalDetail width transition, bump easing token). cream-palette is a deliberate brand choice.

Visual overlays: none. Injection ran in headless Playwright; no [Human] tab. Live server port 8400 started and stopped.

## Overall Impression

Calm, well-spaced, honest, right opening voice; then admin. Biggest opportunity is the commit moment: the user sets a coin economy without seeing the pot, and the submit sits at 40% opacity with its reason out of sight.

## What's Working

- Opening line and placeholder (GoalForm.tsx:71, :76): one display moment, one concrete example.
- Checkpoint row as a sentence ("After [1] of 3, bonus [50]", :144).
- Disclosure summary that becomes the value (:120).

## Priority Issues

- [P1] Validation in the wrong place and voice. GoalForm.tsx:156 shows only problems[0] in grey caption next to the buttons; field unmarked; ~1,070px below the field on desktop, ~1,400px on phone where the button row wraps to three lines. Live region mounts with its text; disabled submit is skipped by Tab. Fix: per-field messages with aria-invalid/aria-describedby, permanent live region, summary on its own line above buttons on phone. Command: /impeccable harden.
- [P1] Mini-goal rows on phone tall and button-heavy. At 400px: title+coins, then a 44px line of up/down/remove, then disclosure ≈130px per empty row; submit at y=1,432 on a 1,584px page. Fix: only remove inline after coins at all widths; move reorder into the disclosure or drop from create. Command: /impeccable adapt.
- [P2] Disabled icon buttons look enabled. index.css:167 .btn-icon lacks disabled:opacity-40 disabled:pointer-events-none. Command: /impeccable polish.
- [P2] Checkpoint arithmetic reaches nonsense states. Add always picks ceil(n/2) (:152) so Suggest+Add duplicates; submit only range-filters (:59); Add enabled at zero minis → "After 1 of 0, bonus". Fix: smallest unused count, disable Add at zero, dedupe on submit. Command: /impeccable harden.
- [P2] No pot, no reassurance at commit. Use the Gullak component (52–88px) beside "150 coins total" at fraction 0; add a state-derived line left of Cancel: "Holds 150 coins · full by 13 Oct · +200 when done". Command: /impeccable delight.

## Persona Red Flags

- First-timer: "the moment the pot is full" with no pot on screen; three-sentence checkpoint caption; "Phase" unexplained; economy set before a coin's worth is shown.
- Phone quick planner: 1,584px page dominated by arrows; due-date input in disclosure 103px wide truncates placeholder; deadline mistake only fades the button, reason 1,400px away.
- Keyboard/screen reader: labels and focus rings correct; disabled submit unreachable by Tab; date inputs cost 4 stops each; Add mini-goal leaves focus 5 stops from the new row.
- Author on phone (PRODUCT.md): mini due-date max={deadline} (:124) silently greys days with no explanation; no clink after Create Gullak.

## Minor Observations

- "Why it matters (optional)" is the only optional flag though bonus/phase/due/priority are optional too.
- Disclosure chevron reuses the move-down glyph.
- "Suggest" at 40% ghost reads as a label; nothing says why it is off.
- Number fields accept -50; clearing then typing yields 075 (:111).
- Out-of-range checkpoints silently dropped on submit in edit.
- Edit heading wraps to three lines on phone with long titles.
- Dark mode correct.

## Questions to Consider

- What if the form showed the empty pot filling as coins are assigned?
- Does the create form need reorder at all?
- What would "Create Gullak" feel like as the first deposit ceremony?
