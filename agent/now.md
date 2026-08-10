# Hand-off --- assignment 1, build/deepen run

## State

`comp4020-ass1-dachi`: 159h to cutoff at run start (due noon Mon 17 Aug
2026), so this run's job was plan/build/deepen, not finish. The prototype
was already content-complete from prior runs: **The Forgetting Machine**,
a one-idea interactive explainer of AI context windows --- fill a
simulated chat past its token budget, watch the oldest messages evict,
watch a pinned recall test ("what's my name?") visibly fail once the fact
that answers it has scrolled out. `context.ts` holds the pure eviction/
recall logic (unit-tested in `spec/context.test.ts`); `main.ts` wires it
to the real DOM (covered separately by `spec/interaction.test.ts`, which
re-parses `index.html` so it breaks if markup and script drift apart).
`pnpm check` was already green (28/28 tests) and the aria-labelledby/
role=group a11y fix was already landed, at run start. Repo is pushed to
`origin/main` but still private (not yet `/ship`ped) --- expected this far
out, nothing to act on yet.

## What I did this run

1. Re-fetched the course source (`assessments/assignment-1.json`). Brief
   unchanged: one strong idea and nothing else, deployed + client-side,
   works at both viewports, a real state-changing interaction, process
   evidence (`PROCESS.md` 400--600 words / 3--4 harness-level moments,
   `CLAUDE.md`, `reflections/assignment-1.md`). Marking weights: process
   45%, response-to-brief 35%, artefact 20%. Noted for the finishing run:
   the HD artefact band explicitly names keyboard use and mid-interaction
   resize, not just the two fixed viewports.
2. Grepped every write site of `Message.role` and found `"them"` was
   declared in the type but never constructed and never branched on
   anywhere --- dead speculative shape. Removed it
   ([`4284d52`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/4284d52)).
   `pnpm check` stayed green (28/28) after.
3. Ran the two a11y/layout sensors already established as this project's
   pattern --- `agent-browser a11y --json` (0 violations, 0 incomplete at
   both 1920×1080 and 390×844) and a screenshot pass at both viewports,
   including mid-demo (some messages evicted, meter red, recall showing
   "forgotten") --- both clean, no drift since the last a11y fix landed.
4. Ran two sensors this project's `CLAUDE.md` hadn't recorded trying
   before: keyboard-only operation (`agent-browser press Tab` through the
   whole page --- nav link → select → three quick-add buttons → composer
   → send, in logical DOM order with no tabindex hacks needed; `press
   Enter` on a focused quick-add button fires the click handler with no
   extra code) and a live viewport resize mid-interaction (desktop → phone
   with messages already evicted --- state and layout both survived, no
   rebuild-on-resize bug). Both genuinely new checks, not a repeat of the
   prior a11y-only pass; recorded in the project's `CLAUDE.md`
   ([`eb54414`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/eb54414)).
5. Did not touch `PROCESS.md` or `reflections/assignment-1.md` --- both
   are still the unfilled template, correctly deferred per the pacing
   rule (>24h out, don't write final citations before the history they'd
   cite has settled). The dead-role removal and the keyboard/resize
   verification are both strong PROCESS.md candidates already
   (harness-level correction + a check wired up, not a retry) --- worth
   remembering when that file gets written for real.

## Next action (assignment 1)

If cutoff is still >24h away: re-fetch the course source, take stock of
git history, and look for genuine new work --- deepening the single idea
(e.g. an aria-live announcement text check I haven't manually verified
yet, though it's already wired in `main.ts`) or a real gap, not a fifth
identical re-verification pass. Content and the established sensors
(a11y, keyboard, resize, screenshots) are all currently clean; don't
re-run them again next visit unless something in the code actually
changed since this run.

If cutoff is <24h away: this is the finishing run.
1. Confirm `pnpm check` still green; re-run the a11y/keyboard/resize
   sensors once more only if code changed since this hand-off.
2. Write `PROCESS.md` for real: 400--600 words, **3--4 moments**, favouring
   harness-level corrections over retries. Strong candidates already in
   history: the `aria-labelledby`→`role="group"` a11y fix (a rule that
   changed the harness, `CLAUDE.md`, not just the markup); the dead
   `"them"`-role removal (grep-every-write-site as a habit, not a retry);
   the DOM-level `interaction.test.ts` added to cover what the pure
   `context.test.ts` couldn't see (main.ts's actual wiring).
3. Write `reflections/assignment-1.md` (150--300 words, both standing
   prompts --- this is also what the week 4 retro reads, so make the
   breakthrough half concrete).
4. Run `pnpm check:evidence` before committing PROCESS.md/reflection.
5. Push, run `/ship` (repo is still private), then verify the *live*
   GitHub Pages URL at both viewports, not just local build.

No open risks. This is a plain local Vite dev server + `agent-browser`
against `localhost` --- none of the crit-2 ffmpeg.org-specific network
flakiness applies here.
