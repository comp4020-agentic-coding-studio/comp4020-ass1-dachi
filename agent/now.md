# Hand-off --- assignment 1, PROCESS.md + reflection drafted

## State

`comp4020-ass1-dachi`: 39h to cutoff at run start (due noon Mon 17 Aug
2026), still plan/build/deepen by the clock, but this run treated the
sensor-family exhaustion signal as the cue to start drafting evidence docs
rather than waiting for <24h. `pnpm check` green (43/43) throughout,
`pnpm check:evidence` green, `pnpm dlx linkinator ./dist --silent` clean.
Both pushed; `git status` clean at end of run.

## What I did this run

1. Re-fetched the course source; brief/spec unchanged from all prior runs.
2. Re-ran the copy-precision lens (fresh this last run, found a real bug
   first time) over `index.html`, `context.ts`, `main.ts` end to end --- came
   back dry this time.
3. With copy-precision now dry alongside every other sensor family
   (logic-symmetry, DOM-completeness, full browser sweep, reduced-motion,
   response-to-brief scoping --- all confirmed clean across multiple prior
   runs), decided there was nothing left to build or re-verify, and that
   >24h-to-cutoff shouldn't by itself justify a further re-verification
   pass when the deliverable's own process-evidence files
   (`PROCESS.md`, `reflections/assignment-1.md`) were still
   template/absent.
4. Wrote `PROCESS.md` (579 words, within the 400--600 budget): four
   moments --- the contiguous-eviction bug
   ([`6020844`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/6020844)),
   the case-sensitivity bug
   ([`330e514`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/330e514)),
   the stale-announcement bug
   ([`275c3b2`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/275c3b2)),
   and the composer-reset bug
   ([`d2307a7`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/d2307a7)).
5. Created `reflections/assignment-1.md` from scratch (294 words): the
   breakthrough is the "green tests can still hide a bug if every fixture
   shares an unexamined property" lesson from the contiguous-eviction fix,
   and how it turned into a repeatable asymmetry-hunting method.
6. Ran `pnpm check` (43/43) and `pnpm check:evidence` (both citations
   resolve, reflection filename matches the course API) before committing
   ([`c574b98`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/c574b98)).
7. Documented the dry second copy-precision pass and the drafting decision
   in this repo's own `CLAUDE.md`
   ([`a269410`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/a269410)).
8. Ran `pnpm dlx linkinator ./dist --silent` against a fresh build ---
   clean, 3 links scanned. Pushed both commits.

## Next action

Still >24h to cutoff (39h at this run's start), so more runs remain before
the doctrine's <24h "finish" mode. Sensor-family status, all now checked at
least once this run or recently:

- Logic-symmetry, DOM-completeness, full browser sweep, reduced-motion,
  response-to-brief scoping: all dry/clean, checked across several prior
  runs. Copy-precision: found one bug on first use, dry on second use this
  run --- likely also thinning now, matching the earlier logic-symmetry
  pattern (two dry passes in a row is treated as a seam-thinning signal
  elsewhere in this project's history).
- `PROCESS.md` and `reflections/assignment-1.md`: both now drafted and
  evidence-check-clean, but not yet given a final close read against the
  actual shipped commit history --- worth one more pass nearer the cutoff
  to confirm no citation has drifted and the four chosen moments are still
  the strongest available, especially if any further logic fix lands
  between now and shipping.

A future run should, in order of preference:
1. If any new sensor pass (browser or logic) turns up a real fix between
   now and cutoff, consider whether it displaces one of the four
   `PROCESS.md` moments for a stronger one --- don't just bolt a fifth
   moment on; the spec caps this at three or four for a reason.
2. Otherwise, once inside 24h, move fully into doctrine's finishing-steps
   checklist: a final full local `pnpm check`, a final `linkinator` run
   against a fresh build, re-read `PROCESS.md` on GitHub itself (per its
   own "open this file and look at it" instruction), then leave it shipped.
3. `gh auth` and `/ship` remain unavailable in this environment (confirmed
   previously); don't plan a next action around either. Pushing the clean
   tree is the whole of my part in shipping.

`comp4020-crit2-dachi` remains finished, green, and pushed as of the last
check; no action needed there unless its live URL status changes.
