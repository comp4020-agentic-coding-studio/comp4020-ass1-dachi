# Hand-off --- assignment 1, copy-precision pass

## State

`comp4020-ass1-dachi`: 45h to cutoff at run start (due noon Mon 17 Aug
2026), still plan/build/deepen, not finishing. Prototype ("The Forgetting
Machine") content-complete, `pnpm check` green (43/43), `PROCESS.md` and
`reflections/assignment-1.md` still correctly untouched (template/absent)
--- per doctrine's literal 24h split, deliberately left that way.

## What I did this run

1. Re-fetched the course source; brief/spec unchanged from all prior runs.
   `git status` clean, up to date with origin at run start.
2. Took the prior run's own recommended next lens: a fresh read of the
   page's visible prose (not the logic), since logic-symmetry and
   DOM-completeness asymmetry hunting had both gone dry two runs running.
3. Found a real precision error on the first try: the `scale-note` text
   claimed real assistants' context windows are "millions of times
   bigger than this demo," but that only holds at one end of the range
   the same sentence states --- the demo's largest window (200 tokens)
   against the smallest real one ("a few thousand") is only ~15--25x,
   not millions. Fixed to state the actual span ("tens to tens of
   thousands of times bigger") in
   [`a367e24`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/a367e24).
   Re-ran `pnpm check` after the edit --- still 43/43 green, no test
   depended on the old wording.
4. Read the rest of the lede, explainer, and `context.ts`'s comments with
   the same fresh-eyes lens --- no further issues found there.
5. Documented the fix and the new "read the copy for stated numbers"
   lens in this repo's own `CLAUDE.md`, committed as
   [`218aa83`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/218aa83).

Working tree clean, both commits pushed. `pnpm check` 43/43 green
throughout.

## Next action

Still >24h to cutoff (45h at this run's start), so this stays
plan/build/deepen for at least one more run. Sensor-family status:

- Logic-symmetry asymmetry hunting over `context.ts`/`main.ts`: dry for
  three runs running now.
- DOM-completeness ("does Reset clear everything"): dry, last checked
  two runs ago.
- Full browser sweep (a11y, keyboard, resize, 320px reflow, screenshot
  walkthrough): clean, checked three runs ago (after the three most
  recent logic fixes) --- still current, no logic has changed since.
- Reduced-motion live-check: clean, checked two runs ago.
- Copy-precision read (new this run): found and fixed one real issue on
  first use. Worth one more pass next run since it just proved
  productive, but if that pass comes back dry, treat it like the other
  families and stop re-running it every time.
- Response-to-brief scoping (no pin/mitigation mechanic): confirmed
  several runs ago, still holds.

A future run should, in order of preference:
1. Re-run the copy-precision read once more (it just found something
   the first time it was tried; check whether it's a seam or a one-off).
2. If that and everything else above is dry, this is very likely the
   point to start treating `PROCESS.md`/`reflections/assignment-1.md`
   drafting as legitimate deepening work rather than waiting for
   strictly <24h --- the commit history is rich and settled. Strongest
   `PROCESS.md` candidates, roughly in strength order: the
   contiguous-eviction bug (`6020844`), the case-sensitivity bug
   (`330e514`), the stale-announcement bug (`275c3b2`), and the
   composer-reset bug (`d2307a7`) --- pick three or four for the
   400--600 word budget, not all of them. Note `reflections/
   assignment-1.md` doesn't exist yet at all (not just an untouched
   template) --- it needs to be created fresh, named exactly that per
   `reflections/README.md`.
3. `gh auth` and `/ship` remain unavailable in this environment
   (confirmed previously); don't plan a next action around either.
   Pushing the clean tree is the whole of my part in shipping.

`comp4020-crit2-dachi` remains finished, green, and pushed as of the last
check; no action needed there unless its live URL status changes.
