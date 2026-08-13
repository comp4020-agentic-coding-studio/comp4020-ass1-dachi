# Hand-off --- assignment 1, eighth asymmetry pass: stale-announcement bug

## State

`comp4020-ass1-dachi`: ~76h to cutoff at run start (due noon Mon 17 Aug
2026), still plan/build/deepen, not finishing. Prototype ("The Forgetting
Machine") content-complete, `pnpm check` green (41/41 after this run),
`PROCESS.md` and `reflections/assignment-1.md` still correctly untouched.

## What I did this run

The previous hand-off explicitly warned against forcing an eighth
`context.ts`/`main.ts` asymmetry pass without a genuinely new lens. Found
one anyway by asking a question the earlier meter/announcement pass
(`0855fe0`) hadn't: does the eviction announcement handle the *reverse*
direction, symmetric to how the widening test (`38999e4`) already proved
the visible transcript itself does?

It didn't. `render()`'s `aria-live="polite"` `role="status"` announcement
region only updated `textContent` when `newlyEvicted.length > 0`. Widening
the window back (un-evicting messages) left whatever "N messages just fell
out" text was already there completely unchanged and now false. The region
is `sr-only` (CSS-hidden, not `aria-hidden`), so a screen-reader user
browsing linearly, not just one relying on the live-announce trigger,
could land on and hear the stale claim.

Fixed by computing `newlyRestored` symmetrically to `newlyEvicted` and
announcing "N messages became visible again" on that branch. Added a
DOM-wired regression test (fact → fill → widen, assert text flips), then
confirmed live against the built `dist/` with `agent-browser eval` (typed
fact → 10 filler clicks → "One message just fell out..." → widen select to
200 → "2 messages became visible again.") before considering it done —
not just the unit test. Pushed as
[`275c3b2`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/275c3b2)
+ [`2e1fac8`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/2e1fac8)
(CLAUDE.md lesson). `pnpm check` 41/41 green, working tree clean.

No other DOM/markup elements changed (same `sr-only` node, new text
content only), so the standing five browser-sensor families (a11y,
keyboard, resize, full walkthrough, slow-connection) weren't re-run in
full — same standing rule as before, and this change is non-visual so
none of those would exercise it differently anyway.

## Next action

Still >24h to cutoff (due noon Mon 17 Aug; ~76h at this run's start), so
per doctrine this stays plan/build/deepen for at least one more run.

- This pass shows the "no genuinely new lens left" read from the last two
  hand-offs was premature --- the productive question turned out to be
  "does this side effect handle direction X," asked per DOM-observable
  side effect, not per function. Before assuming render() is exhausted
  again, check whether any *other* side effect it produces (there were
  three: transcript membership, meter classes, announcement text) has an
  un-examined direction or an un-examined interaction with the
  window-size select specifically, since that's the one control that
  makes previously-one-way state (eviction) reversible.
- If a future run re-reads `render()` fresh and finds nothing further
  there, that's a real signal (not a forced null result) to move to
  `PROCESS.md`/reflection prep, or to stop touching `context.ts`/`main.ts`
  and let the content settle.
- Strongest `PROCESS.md` candidates so far, roughly in strength order: the
  contiguous-eviction bug (`6020844`), the case-sensitivity bug
  (`330e514`), this run's stale-announcement bug (`275c3b2`), the
  `role=group` a11y fix, the DOM-reconciliation animation rewrite. Four
  is plenty for the 400--600 word budget; this run's find is a solid
  fourth or fifth citation, not necessarily one to add on top of an
  already-full set.
- Start `PROCESS.md`/reflection only once inside roughly the last
  24--48h, or once a future run judges the commit history genuinely
  settled --- still not there at ~76h.
- `comp4020-crit2-dachi` remains finished, green, and pushed as of the
  last check; no action needed there unless its live URL status changes.
