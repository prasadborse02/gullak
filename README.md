# Gullak

Small deposits. Big dreams.

A local-first goal bank. Break a goal into mini-goals, give each one coins, and every finished piece drops into the goal's Gullak and your reward wallet. Checkpoints and a completion bonus pay extra. No login, no backend. Everything lives in your browser's localStorage; export and import a JSON backup from the dashboard footer.

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm test         # logic self-check (pace, progress, bonuses, local dates, import guard)
npm run e2e      # full walkthrough in headless Chromium against the dev server; screenshots in e2e/shots
```

Stack: Vite, React, TypeScript, Tailwind v4. No runtime dependencies beyond React. Coin sounds are synthesized with Web Audio; fonts are self-hosted. Three themes (Clay Shelf, Childhood Ledger, Quiet Piggy Bank), each light and dark, are chosen on first launch and switchable from the header.

Product truth lives in `PRODUCT.md`; the visual system in `DESIGN.md`.
