# Hand-off --- assignment 1, build run, v1 shipped locally

## State

`comp4020-ass1-dachi`: 165h to cutoff at run start (due noon Mon 17 Aug
2026) --- comfortably in the doctrine's "plan/build/deepen" window, not
finishing yet. Brief: "Build an interactive explainer of something you
think more people should know or understand" --- one strong idea, one
mechanic, static/client-side, deployed to GitHub Pages. Heavily
process-weighted (45% legibility, 35% response to brief, 20% working
artefact); `PROCESS.md` needs 400--600 words, three or four moments,
favouring harness-level corrections over retries.

Chose **context windows and token eviction** --- why AI chat systems
"forget" mid-conversation. Genuinely personal: it's the same mechanism
behind my own `memory/now.md` architecture (nothing survives a run
except what's deliberately written down). Built as **The Forgetting
Machine**: a simulated chat where messages accumulate against an
adjustable token budget; once full, oldest messages are evicted
first-in-first-out; a pinned "what's my name?" recall test visibly
flips from answered to "forgotten" once the fact that answers it has
been evicted.

Working tree clean, 8 commits ahead of `origin/main`, **not pushed**
--- push is a finishing-steps action, deferred per doctrine given
165h on the clock this run.

## What I did this run

1. `context.ts`: pure, DOM-free simulation logic --- `approxTokens`
   (~4 chars/token, the same public rule of thumb model vendors use),
   `buildContext` (FIFO eviction against a token budget), `canRecall`.
   Unit tested in `spec/context.test.ts` (8 tests) before any UI existed.
2. Replaced the starter `index.html`/`main.ts`/`styles.css` with the
   real page: intro copy stating the point of view, the interactive
   demo (window-size select, token meter, quick-add buttons for a
   seeded fact + cycling filler lines, free-text composer, two-column
   visible/forgotten transcript, live-region eviction announcements,
   recall-test panel), and an explainer section closing with the
   personal tie-in to how I work across runs.
3. `spec/interaction.test.ts`: a second, DOM-level test file
   (`@vitest-environment jsdom`, reusing `index.html`'s actual `<main>`
   markup) that imports `main.ts` for real and drives it via
   click/input/submit events --- covers the wiring the pure logic
   tests can't see. 5 tests. Full suite: 28/28 green across 4 files.
4. `pnpm check` green: typecheck, build, oxlint, stylelint, vitest.
   Fixed four stylelint issues along the way (selector ordering via a
   shared `.field-label` class instead of competing element selectors,
   `clip` → `clip-path: inset(50%)`, `max-width` → range syntax).
5. Verified live in `agent-browser` at both marking viewports
   (1920×1080, 390×844): exercised the actual mechanic (added the fact,
   sent filler until eviction, confirmed the recall answer flips and
   the evicted message renders struck-through), confirmed the two-column
   layout collapses to one column under 640px with no overflow.
6. `agent-browser a11y --json` at both viewports: found `aria-
   prohibited-attr` (impact: serious) under `incomplete` on three
   `aria-labelledby` divs with no role; fixed with `role="group"`;
   re-audited to `violations: []`, `incomplete: []` at both viewports.
   Recorded this as a durable a11y lesson in `MEMORY.md` (a third
   `incomplete` shape alongside the two `color-contrast` ones already
   there) and in the project's own `CLAUDE.md`.
7. Committed in 9 logical chunks (pure logic+tests, drop starter test,
   styles, page+behaviour, a11y fix, CLAUDE.md lesson, interaction
   test, README fix) rather than one dump.

Deliberately deferred, per doctrine and past experience: `PROCESS.md`
and `reflections/assignment-1.md` --- writing these before the commit
history is close to settled just means rewriting them later. The
starter `PROCESS.md` template is still unmodified in the repo.

## Next action

If cutoff is still >24h away: re-fetch the course source (don't assume
unchanged), re-take-stock with `git log`, and look for genuine
deepening work rather than a fourth identical re-verification pass.
Candidates, roughly in order of value:
- More realistic tokenization: the current ~4-chars/token approximation
  is honest but coarse; consider whether a tiny illustrative BPE-style
  merge demo would strengthen "what's really going on" without
  scope-creeping past "one mechanic" (the eviction demo is the one
  mechanic; a second demo would violate the brief's "and nothing else").
  Lean against adding it unless it replaces rather than adds.
- A second window-size preset comparison made concrete: e.g. computing
  "at GPT-4's real window, you'd need ~N messages like these before
  eviction starts" dynamically from the current conversation, to
  ground the "millions of times bigger" claim in the scale-note with a
  number tied to what the visitor actually typed.
- Double-check the a11y/viewport verification still holds if any
  further content changes land --- rerun `agent-browser a11y --json`
  and screenshots at both viewports after any structural HTML change,
  not just once.
- Reduced-motion check: the token meter has a `transition` on width/
  background-color. Worth a `agent-browser set media reduced-motion`
  live check (`getComputedStyle` on `.meter-fill`) if this stays as
  the only animation --- not yet done this run.

If cutoff is <24h away: this is the finishing run.
1. Re-run `pnpm check` on the current tree to confirm still green.
2. Write `PROCESS.md` for real, 400--600 words, three or four moments.
   Strong candidates already in the history: the `aria-labelledby`/
   `role="group"` fix (a11y check caught a real WCAG-adjacent gap,
   fixed at the harness level via a durable `CLAUDE.md` note, not a
   retry); the decision to unit-test `context.ts` as pure functions
   before writing any DOM code, then add a second DOM-level test file
   specifically because the pure tests couldn't catch wiring bugs.
3. Write `reflections/assignment-1.md` (150--300 words, both standing
   prompts) --- this doubles as the week 4 retro material per the
   brief, so the breakthrough half needs to carry real weight.
4. Run `pnpm check:evidence` before committing PROCESS.md/reflection.
5. Push. Then verify the *live* GitHub Pages URL, not just local
   build, at both viewports --- use the core interaction, resize
   mid-use, tab through (this is literally the marking method stated
   in the spec).

No open risks or flaky-check concerns from this run --- `pnpm check`
and the a11y/screenshot verification were all clean on the first or
second try, nothing environment-specific like the crit-2 linkinator
issue showed up here.
