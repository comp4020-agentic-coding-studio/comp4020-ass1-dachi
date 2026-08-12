# Hand-off --- assignment 1, a real bug found by asymmetry hunting

## State

`comp4020-ass1-dachi`: ~111h to cutoff at run start (due noon Mon 17 Aug
2026), still plan/build/deepen, not finishing. Prototype ("The Forgetting
Machine") content-complete, `pnpm check` green (38/38 after this run),
`PROCESS.md` and `reflections/assignment-1.md` still correctly untouched.

## What I did this run

Followed the previous hand-off's named next action: a fifth asymmetry pass
over `context.ts`/`main.ts` against their tests, specifically the two
candidates it flagged as unverified (not yet known bugs) --- the
composer-preview reset to "≈ 0 tokens" after submit, and
`factEverStated`'s case-sensitivity vs `canRecall`'s case-insensitivity.

The second one was a **real bug**, not just a coverage gap: `main.ts`'s
"has the fact ever been stated" gate matched `FACT_NEEDLE` case-
sensitively, while `context.ts`'s `canRecall` (which only runs once that
gate passes) lowercases both sides. A visitor who typed the fact via the
free-text composer in lowercase ("my name is iris") would see a permanent
"Nothing yet" forever --- the case-sensitive gate would never even reach
the case-insensitive check that would have found it. This was invisible
before because the only way the demo's own UI states the fact is the
quick-add button, which always sends the fixed-case string "Iris" ---
the bug only reachable via the composer, an input surface the existing
tests exercised for other reasons but never with this specific content.

Fixed by lowercasing both sides of the gate to match `canRecall`
(`330e514`), with a DOM test driving the composer with a lowercased
custom message. Also added the composer-preview-reset test that had been
flagged unverified but turned out correct as written (`14d6257`). Recorded
the bug and the generalised lesson --- side-by-side reading for where two
functions meant to *agree* on a predicate could silently *disagree*, not
just whether each is individually tested --- in this repo's own
`CLAUDE.md` (`80be074`). Pushed all three commits; working tree clean,
38/38 tests, `pnpm check` fully green.

## Next action

Still well inside plan/build/deepen (>24h to cutoff). Five browser-sensor
families (a11y, keyboard, resize, full walkthrough, slow-connection sizing)
and now five rounds of test/logic asymmetry hunting have all run clean or
turned up real fixes. This run's find (a real bug, not just a gap) is a
stronger signal that the asymmetry-hunting method still has yield than
"still finding gaps" was --- worth at least one more pass before assuming
the well is dry:

- A future run's asymmetry pass candidates, not yet checked: `buildContext`'s
  behaviour when a single message's own token count exceeds the window size
  entirely (does it silently evict everything, leaving the window at 0 used
  tokens? probably correct given the loop structure, but unverified by any
  test); whether `approxTokens`'s `Math.max(1, ...)` floor (never 0 tokens
  for non-empty text) interacts correctly with the meter's percentage math
  at very small custom messages.
- Don't re-run a11y/keyboard/resize/full-walkthrough again without a new
  code change since the last full-walkthrough pass (still `0205305`).
- Don't reopen the pin-mechanic or slow-connection scoping questions (both
  reasoned through and recorded in the project's `CLAUDE.md`).
- The real remaining work before finishing is `PROCESS.md` (400--600 words,
  3--4 moments) and `reflections/assignment-1.md` --- both still correctly
  untouched at this distance from cutoff. This run's case-sensitivity bug
  fix is now a strong PROCESS.md candidate alongside the earlier
  `role=group` a11y fix, the DOM-reconciliation animation rewrite, the
  `"them"` dead-field removal, and the two earlier asymmetry finds (widening
  window, meter/announcement + shared-fixture isolation bug) --- it's the
  cleanest "found a real defect via method, not luck" moment so far. Start
  PROCESS.md/reflection only once inside roughly the last 24--48h, or once a
  future run judges the commit history genuinely settled.
- `comp4020-crit2-dachi` remains finished, green, and pushed as of the last
  check; no action needed there unless its live URL status changes.
