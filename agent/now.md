# Hand-off --- assignment 1, a real bug found inside one function

## State

`comp4020-ass1-dachi`: ~99h to cutoff at run start (due noon Mon 17 Aug
2026), still plan/build/deepen, not finishing. Prototype ("The Forgetting
Machine") content-complete, `pnpm check` green (39/39 after this run),
`PROCESS.md` and `reflections/assignment-1.md` still correctly untouched.

## What I did this run

Followed the previous hand-off's named next action: check `buildContext`'s
behaviour when a message's own size interacts oddly with the window
budget. This turned into a real bug, not just a coverage gap: `buildContext`
walks history newest-to-oldest, and for any message that doesn't fit the
*remaining* budget it marks it evicted but keeps checking older messages
against that same leftover space, rather than stopping. Every existing test
fixture used uniform-sized messages, which coincidentally always produced a
contiguous prefix and hid this for five prior asymmetry passes. With real
mixed sizes (the fixed fact/filler strings run 6--11 tokens; composer free
text is unbounded) a plausible sequence --- small, then one message too big
to fit, then another small one that does fit in the still-unused budget ---
evicts the *newer*, larger middle message while keeping an *older*, smaller
one visible. That's backwards from the page's own explainer claim
("oldest messages are dropped first").

Confirmed with a hand-run `node -e` reproduction before touching any code,
fixed by latching a `full` flag the first time a message doesn't fit so
everything older is evicted unconditionally after that, added a unit test
encoding the contiguous-prefix invariant, then re-verified against the real
DOM with `agent-browser eval` driving the composer through 35/36/2-token
messages against a 40-token window on the built `dist/` (correct, contiguous
result, no crash). Committed as `6020844` (fix + test) and `d2e6a7d`
(CLAUDE.md lesson). Pushed both; working tree clean, 39/39 tests,
`pnpm check` fully green.

## Next action

Still well inside plan/build/deepen (>24h to cutoff, due noon Mon 17 Aug).
Six rounds of test/logic asymmetry hunting have now run: five found gaps
between cooperating functions/tests, this sixth found a bug hiding inside a
*single* function whose own test fixtures shared a property (uniform
message size) that masked a whole behaviour branch. That's a genuinely new
angle, not exhausted yet:

- A candidate for a future pass, not yet checked: `approxTokens`'s
  `Math.max(1, ...)` floor combined with the meter's percentage math at very
  small windows (window=40, single 1-token message = 2.5% width) --- reasoned
  through informally this run and looks fine (no divide-by-zero, no clamp
  issue), but not yet backed by an explicit test the way the eviction
  contiguity invariant now is.
- More generally: for any other pure function in `context.ts`/`main.ts`
  whose existing tests all happen to share an unexamined property (not just
  uniform size --- e.g. all-ASCII text, all-positive numbers, all messages
  from the fixed fact/filler set rather than composer free text), ask what
  varying that property does before assuming "well tested" means "correctly
  general."
- Five browser-sensor families (a11y, keyboard, resize, full walkthrough,
  slow-connection sizing) all still stand from `0205305` and earlier ---
  this run's fix was pure logic in `context.ts`/`spec/context.test.ts` with
  no DOM/markup change, so none of those needed re-running per the existing
  "only re-run after a DOM-observable change" rule. Don't re-run them again
  without a new DOM-affecting change since `0205305`.
- Don't reopen the pin-mechanic or slow-connection scoping questions (both
  reasoned through and recorded in the project's `CLAUDE.md`).
- The real remaining work before finishing is `PROCESS.md` (400--600 words,
  3--4 moments) and `reflections/assignment-1.md` --- both still correctly
  untouched at this distance from cutoff. This run's contiguous-eviction bug
  is now the strongest PROCESS.md candidate of all the asymmetry finds so
  far --- it's a defect in the demo's own central, explicitly-stated claim,
  caught by a genuinely new diagnostic move (varying a property every
  existing test fixture shared), not just "found via testing." Alongside it:
  the `role=group` a11y fix, the DOM-reconciliation animation rewrite, the
  `"them"` dead-field removal, and the case-sensitivity bug. Start
  PROCESS.md/reflection only once inside roughly the last 24--48h, or once a
  future run judges the commit history genuinely settled.
- `comp4020-crit2-dachi` remains finished, green, and pushed as of the last
  check; no action needed there unless its live URL status changes.
