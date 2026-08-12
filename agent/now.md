# Hand-off --- assignment 1, meter/announcement test coverage

## State

`comp4020-ass1-dachi`: ~117h to cutoff at run start (due noon Mon 17 Aug
2026), still plan/build/deepen, not finishing. The prototype ("The
Forgetting Machine") is content-complete, `pnpm check` green (36/36 after
this run's additions), `PROCESS.md` and `reflections/assignment-1.md` still
correctly untouched --- still nowhere near "settled commit history."

## What I did this run

Followed the last hand-off's instruction directly: rather than re-running
any exhausted browser sensor (a11y, keyboard, resize, full walkthrough,
slow-connection sizing --- all untouched this run) or reopening a settled
scoping question (pin mechanic, slow-connection), I re-read `main.ts`'s
`render()` function fresh, looking for the same class of logic/test
asymmetry the previous run found in `context.ts`.

Found two: the token meter's `is-warn`/`is-full` classes (confirmed via
`styles.css` that these drive a real colour change, not decoration) and the
`aria-live` eviction-announcement text's singular/plural wording. Both are
real "visitor does something that changes what they see" behaviour with
zero test coverage. Added five DOM-wired tests to
`spec/interaction.test.ts`, driving the composer with precisely-sized
custom text (character count is a direct, exact lever on token count via
`ceil(length/4)`) to land the meter at known percentages rather than
depending on the quick-add buttons' incidental text length.

Writing those tests surfaced a real, distinct bug: the shared-DOM test
fixture (one `document`, one `import("../main")` in `beforeAll`, state
cleared via clicking the app's own reset button in `beforeEach`) never
reset the window-size `<select>`, so the pre-existing "widening the
window" test left it at `"200"` and that value silently leaked into every
test that ran after it in file order --- invisible until my new tests
depended on the 80-token default and failed with confusing numbers. Fixed
by having `beforeEach` also reset the select and dispatch `change`. This
is a real, previously-invisible test-isolation gap, not a contrived one.

Committed as two commits (spec tests + isolation fix together, since the
fix was discovered by and only needed for the new tests; then a separate
`CLAUDE.md` commit recording both lessons) and pushed:
[`0855fe0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/0855fe0),
[`a37f2fa`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/a37f2fa).
Working tree clean, 36/36 tests green, `pnpm check` fully green.

Recorded both the generalised asymmetry-hunting lesson (past pure logic
into `render()`'s DOM side effects) and the shared-fixture test-isolation
lesson in this agent's own `MEMORY.md` --- the isolation lesson especially
is likely to recur in any future prototype using the same
import-once-and-reset-via-button test pattern.

## Next action

Still well inside the plan/build/deepen window (>24h to cutoff, currently
~117h). Artefact is in strong shape: five browser-sensor families plus a
test suite now covering both eviction directions and the meter/
announcement feedback, all found via the same "re-read the actual code
next to its tests" method rather than re-running fixed checks.

- Don't re-run a11y/keyboard/resize/full-walkthrough again without a new
  code change.
- Don't reopen the pin-mechanic or slow-connection scoping questions (both
  reasoned through and recorded in the project's `CLAUDE.md`).
- Before assuming there's nothing left to build in a future run, do
  another asymmetry pass: re-read `context.ts`, `main.ts`, and their test
  files side by side once more for anything still untested (candidates not
  yet checked: the composer-preview reset to "≈ 0 tokens" after submit,
  the `factEverStated` case-sensitivity vs `canRecall`'s case-insensitivity
  --- probably not bugs, but unverified). Only fall back to a repeat sensor
  pass once a fresh read turns up nothing.
- The real remaining work before finishing is `PROCESS.md` (400--600
  words, 3--4 moments, favouring harness-level corrections over retries ---
  strong candidates now include: the `role=group` a11y fix, the
  DOM-reconciliation animation rewrite plus its pinning regression test,
  the `"them"` dead-field removal, the widening-window asymmetry find, and
  now this run's meter/announcement asymmetry find plus the shared-fixture
  isolation bug it exposed --- that last one is a genuine "corrected the
  harness, not just retried" moment worth strong consideration for
  `PROCESS.md`) and `reflections/assignment-1.md` --- both still correctly
  untouched at this distance from cutoff. Start those only once inside
  roughly the last 24--48h, or once a future run judges the commit history
  genuinely settled.
- `comp4020-crit2-dachi` remains finished, green, and pushed as of the last
  check; no action needed there unless its live URL status changes.
