# Hand-off --- assignment 1, build/deepen run

## State

`comp4020-ass1-dachi`: 148h to cutoff at run start (due noon Mon 17 Aug
2026), so plan/build/deepen, not finishing. The prototype ("The Forgetting
Machine" --- an interactive explainer of AI context windows: fill a
simulated chat past its token budget, watch the oldest messages evict, watch
a pinned recall test fail once the fact that answers it has scrolled out)
was already content-complete and `pnpm check` green (28/28) from prior runs,
with the accessibility (`role="group"`) and keyboard/resize sensor passes
already recorded in the project's `CLAUDE.md`. `PROCESS.md` and
`reflections/assignment-1.md` are still untouched --- correctly, per the
doctrine's "don't write these until the commit history is close to settled"
rule; 148h out is nowhere near settled.

## What I did this run

1. Fetched the course source (`api/assessments/assignment-1.json`) and
   confirmed the brief and marking bands: process 45%, artefact 20%,
   response-to-brief 35%; `PROCESS.md` needs 400--600 words and 3--4 moments,
   favouring harness-level corrections over retries; due noon Mon 17 Aug.
2. Read the existing `main.ts`/`context.ts`/`index.html`/`styles.css`/spec
   suite. Found one real gap against the artefact rubric's HD band ("holds up
   under use it wasn't designed for") and the brief's own promised UX
   ("small enough that you can watch it happen"): the transcript columns were
   rebuilt with `replaceChildren` on every render, so a message crossing the
   visible/forgotten boundary was destroyed and recreated, not transitioned
   --- it teleported instead of visibly "happening".
3. Rewrote the render path in `main.ts` to reconcile `<li>` elements by
   message id across two `Map`s (`visibleEls`/`evictedEls`), moving a node
   between columns when it crosses the boundary instead of tearing it down,
   with a one-shot entrance animation for genuinely new messages
   ([`60bfa77`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/60bfa77)).
   Added matching CSS transitions/keyframes in `styles.css`, gated behind
   `prefers-reduced-motion` (same commit).
4. Verified for real, not assumed: `pnpm check` green throughout; served the
   actual `dist/` build via `vite preview` and drove it with `agent-browser`
   --- forced eviction via `eval`, confirmed the moved `<li>` has the real
   `transition-duration: 0.35s` computed style, confirmed
   `set media reduced-motion` collapses it to `0s`, screenshotted both
   marking viewports (1920×1080, 390×844) clean. Killed the preview server
   afterwards.
5. Added a regression test pinning down the behaviour the animation actually
   depends on: the `<li>` that crosses from visible to evicted is the *same*
   DOM node, not a fresh one
   ([`da6e6da`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/da6e6da))
   --- without it, a regression to `replaceChildren` would only be visible by
   eye, not caught by `pnpm check`. 29/29 tests green.
6. Pushed both commits to `origin/main`. Working tree clean.

## Next action

Still well inside the plan/build/deepen window (~148h - this run's wall time
left). No new durable environment/working-style lesson came out of this run
worth adding to `MEMORY.md` --- it was a straightforward build task, not a
harness-level correction, so I left that file untouched. Genuinely
not-yet-run sensors for a future run, in rough priority order: a keyboard-only
pass specifically over the *new* animated elements (existing keyboard
verification predates this change and covered focus order, not the new
transition classes --- unlikely to matter since animation doesn't touch
tabindex/focus, but not yet confirmed); and, separately, whether the response-
to-brief criterion ("a pointed, surprising answer... one idea, carried all the
way") would be strengthened or diluted by any further mechanic (e.g. a pinned/
system-message that survives eviction, mirroring how real systems mitigate
this) --- weigh that against the brief's explicit warning about over-scoping
before building it, don't build it by default. `PROCESS.md` and
`reflections/assignment-1.md` should stay untouched until the work is close
to settled, per doctrine and past experience (crit 2: writing them early just
means rewriting them later).
