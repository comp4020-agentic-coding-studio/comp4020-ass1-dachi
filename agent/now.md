# Hand-off --- assignment 1, widening-window test coverage

## State

`comp4020-ass1-dachi`: ~124h to cutoff at run start (due noon Mon 17 Aug
2026), so still plan/build/deepen, not finishing. The prototype ("The
Forgetting Machine") is content-complete, `pnpm check` green (31/31 after
this run's additions), `PROCESS.md` and `reflections/assignment-1.md` still
correctly untouched --- 124h out is nowhere near "settled commit history."

## What I did this run

Every browser-level sensor was already exhausted per the last two
hand-offs (a11y, keyboard, resize, full mechanic walkthrough,
slow-connection sizing) and re-running any of them without a code change
would just repeat a prior result --- so I didn't. Instead I re-read the
core logic (`context.ts`, `main.ts`'s `reconcileList`) and its existing test
files side by side, looking for an asymmetry rather than a re-verification.

Found one: `context.test.ts`/`interaction.test.ts` thoroughly tested
*shrinking* the context window (eviction), but never asserted the reverse
--- widening the window after eviction to bring a message back into view.
The code already handled this correctly (`reconcileList` is symmetric,
`windowSelect`'s `change` listener just re-renders from the same history),
but nothing named that behaviour as a contract. Added:

1. `context.test.ts`: a pure-logic case confirming `buildContext` with a
   wider window returns a message that a narrower window had evicted.
2. `interaction.test.ts`: a DOM-wired case --- fill past 80 tokens, confirm
   "forgotten," then select the 200-token option and confirm the recall
   answer flips back to "Iris" and the evicted column empties.

Both passed immediately (no bug found --- the code was already right), but
the behaviour is now a named, checked contract rather than an implicit
side-effect. Committed and pushed
([`38999e4`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/38999e4),
spec files only). Working tree clean, 31/31 tests green.

Recorded the general lesson (look for logic/test asymmetry, not just
re-running exhausted sensors, once sensors are exhausted) in this agent's
own `MEMORY.md` --- this was a genuinely new class of "deepen" work, not
specific enough to this one prototype to belong only in the project's
`CLAUDE.md`.

## Next action

Still well inside the plan/build/deepen window (>24h to cutoff, currently
~124h). Artefact is in strong shape: five sensor families (a11y, keyboard,
resize, full walkthrough, slow-connection) plus now a widened test suite
covering both eviction directions.

- Don't re-run a11y/keyboard/resize/full-walkthrough again without a new
  code change.
- Don't reopen the pin-mechanic question or the slow-connection question
  (both reasoned through and recorded in the project's `CLAUDE.md`).
- Before assuming there's nothing left to build in a future run, check for
  more logic/test asymmetries the same way this run did (e.g. re-read
  `context.ts` and its test file together) rather than defaulting straight
  to "nothing to do" or a repeat sensor pass.
- The real remaining work before finishing is `PROCESS.md` (400--600
  words, 3--4 moments, favouring harness-level corrections over retries ---
  likely candidates: the `role=group` a11y fix, the DOM-reconciliation
  animation rewrite plus its pinning regression test, the `"them"`
  dead-field removal, and now this run's asymmetric-coverage test) and
  `reflections/assignment-1.md` --- both still correctly untouched at this
  distance from cutoff. Start those only once inside roughly the last
  24--48h, or once a future run judges the commit history genuinely
  settled.
- `comp4020-crit2-dachi` remains finished, green, and pushed as of the last
  check; no action needed there unless its live URL status changes.
