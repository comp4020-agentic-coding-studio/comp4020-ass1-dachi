# COMP4020 prototype

This is your starter repo for a COMP4020 prototype: a static site written in
HTML/CSS/TypeScript that builds to plain HTML/CSS/JS and deploys to GitHub
Pages. The **deployed site is what gets marked** --- not this repo, and not "it
works on my machine". It's marked live in Chrome against the deployed URL at two
viewports --- 1920×1080 (desktop) and 390×844 (phone) --- and both count in
full, so make that artefact good at both and use the checks below to know
whether it is.

The course website publishes this deliverable's brief and spec. The brief poses
the problem; the spec is the fixed contract every response must satisfy. This
repo's name tells you which deliverable applies. Run the course plugin's
**start** skill at the start of each week: it pulls the right spec from the
course API, carries your harness forward from last week, and helps you turn the
spec's checkable lines into tests of your own. Read the brief and spec before
you plan or build, and see `spec/README.md` for how the checks relate to them.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Before you push, run `pnpm check`. It runs most of what CI runs --- build,
  lint, and the spec --- so you catch those in seconds instead of waiting for
  the pipeline. The links check, the evidence check, the secrets scan, and the
  deploy itself only run in CI; run `pnpm dlx linkinator ./dist --silent`
  locally against a fresh `pnpm build` for the links check without waiting for
  CI.
- To see what the page actually looks like rather than what you assume it looks
  like, open it in a browser (the `agent-browser` CLI, documented on
  [the course site](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/backpressure/#agent-browser-the-rendered-page-as-ground-truth),
  works well for this). The rendered page is the truth; your mental model of it
  isn't.
- When a check fails, read its output before changing anything. Each check below
  names what it measures, and the failure message is the instruction: it tells
  you the file, the line, or the contract. Treat a red check as authoritative
  --- the page is wrong until the check is green, not until you decide it should
  be.
- Commit when the checks pass. Never commit a red state.

## The checks (your sensors)

CI runs these on every push once your repo is public. GitHub's checks UI shows
two jobs, `check` and `deploy` --- not one status per sensor below --- and
within `check` the steps run in sequence (`pnpm check` chains typecheck, build,
lint, and the spec with `&&`), so an early failure like a broken build stops the
later sensors from running for that push; fix it and push again to see the rest.
While the repo is private (all week, until you ship) the CI jobs stay skipped
--- `pnpm check` is the same roster on your machine, and it's the faster loop
anyway. They aren't hoops. Each is a different way of finding out something true
about the site that you can't reliably see by looking at it.

They also carry a mark at a crit: the sweep runs fifteen minutes after your
cutoff, and green checks there are worth half that week's shipped mark. Still
running counts as not green, so ship with time for CI to finish.

- **typecheck** --- `tsc --noEmit` runs first in `pnpm check`, so a type error
  stops the roster before the build even starts. The types are extra
  backpressure: a red here is the compiler telling you a claim in the code is
  false.
- **build** --- the site must build (`pnpm build`). A build failure means the
  deployed site is broken or stale, so nothing else matters until this is green.
- **deploy / online** --- the live GitHub Pages URL must load and return the
  page you expect. An asset that 404s on the deployed URL counts as broken even
  if it loads locally.
- **spec** --- `spec/invariants.test.ts` asserts what's true of any good
  website, whatever the week's brief asks; the tests you write for the week's
  spec run alongside it (any `spec/*.test.ts`). A failure names the contract you
  haven't met yet.
- **lint** --- `stylelint` for CSS, `oxlint` for TypeScript. Flags code that's
  wrong, fragile, or non-idiomatic. Read the rule it names.
- **tests** --- any other tests you write, wherever you put them (co-located
  with your source is fine, not just `spec/`), must pass. Vitest picks up both
  this and the spec suite in one `vitest run`, the last step of `pnpm check`. A
  failing test is a claim about the site that's no longer true.
- **evidence** (`pnpm check:evidence`) --- checks your process evidence:
  `PROCESS.md`'s citations resolve to real commits, the current deliverable's
  exact reflection is in `reflections/` (worked out from this repo's name
  against the public course API), and your `CLAUDE.md` is present. Evidence
  gates the deploy --- `deploy` needs `check` to pass, so failing evidence
  blocks the deploy alongside everything else. See
  [Your process is part of the mark](#your-process-is-part-of-the-mark) below,
  and the course website's
  [assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
  for what counts as evidence.
- **links** --- internal links must resolve. A broken link is a dead end you
  didn't mean to ship.
- **secrets** --- the repo is scanned for committed credentials. Never put a
  key, token, or password in a tracked file. If one leaks, rotate it. A local
  pre-commit hook (`.githooks/pre-commit`, installed by `pnpm install`) also
  blocks any commit containing something shaped like an API key --- by the time
  CI sees a key it's already pushed, so the hook is the sensor that matters.

Nothing here measures **accessibility** or **performance** --- wiring those
sensors (`axe-core`, Lighthouse, or whatever you choose) is your work, and later
in the course the spec will ask you to show how you tested both. When you do,
read a green performance result honestly: it's a lab estimate from one run on a
CI machine, not proof the site is fast for real users.

## The stack is swappable

Out of the box this is plain HTML/CSS/TypeScript on Vite, and every `.html` file
in the repo is a page: add pages, link them, and the build picks them up with no
config. That's a default, not a rule (unless the week's spec says otherwise).
You can swap in Astro or any other static generator, because nothing in CI names
a tool --- the whole contract is:

- `pnpm build` emits the complete site into `dist/`
- the `package.json` scripts (`check`, `check:evidence`, `build`) keep working
- whatever lands in `dist/` still passes the invariants in `spec/`

Two things bite in a swap. The deployed site lives under a path
(`…github.io/<repo>/`), so configure your generator's base path --- this
template's Vite config uses relative asset URLs to sidestep that, but most
generators (Astro included) need `base` set explicitly, and getting it wrong
looks fine locally while every asset 404s on the live URL. And commit the
updated `pnpm-lock.yaml`: CI installs with `--frozen-lockfile`.

For the course default (Astro) or the bare hand-written arm, don't wire the swap
by hand: the course plugin's `stack` skill runs a tested conversion script that
handles both of the traps above plus the CI link-check patch, and leaves the
whole change staged as one reviewable diff.

## Your process is part of the mark

The deployed page is only half of it. How you got there is marked too: your
commit history, your agent files, and the decisions visible across them. The
checks above can't see any of that, so a person reads it directly --- which
means building legibly is part of building well.

- **Commit as you go.** Small, frequent commits are the record of how the work
  came together, and that record is read, not just the final state. A trail that
  grew alongside the code is the strongest evidence of your process; a single
  dump the night before is the weakest.
- **Keep a process overview** (`PROCESS.md`). A short reading-guide, not an
  essay: what you built, the moments that mattered --- each pointing at a
  commit, a `CLAUDE.md` change, or a prompt and the commit it produced --- and
  where to look in the history. It points a marker at the evidence; it doesn't
  stand in for it, and claims the history doesn't back don't count. The
  `PROCESS.md` in this repo is a template showing the shape and the citation
  format (link text the commit hash or range, target the commit or compare URL);
  `pnpm check:evidence` verifies your citations resolve to real commits before
  you ship. Markers follow those citations and don't trawl the repo for evidence
  you didn't cite.
- **Write your reflection in `reflections/`** --- a short markdown file in this
  repo, named for the deliverable it answers, so the number in the filename is
  the number in this repo's name (`crit-1.md` in `comp4020-crit1-<you>`,
  `assignment-1.md` in `comp4020-ass1-<you>`); `reflections/README.md` has the
  full rule. `pnpm check:evidence` checks the exact current name against the
  course API, not merely the presence of any well-named file. It answers the two
  standing prompts: the breakthrough that moved the work forward, and what this
  work changed about the developer you want to be. It stays out of the deployed
  site. It's due at the cutoff, and if it isn't in the repo by then the week
  doesn't count as shipped, however good the prototype is.
- **This file is process evidence.** The harness you build to direct the work,
  this `CLAUDE.md` and any `AGENTS.md`, is itself read as part of how you
  worked. Keep it honest and current (see below).

You don't need a name, a student number, or any identity file in the repo: we
know whose repo it is. Spend the effort on the work.

## This file is yours

This CLAUDE.md is a starting point, not a fixed rulebook. As you learn what your
prototype needs --- a convention the work has to hold to, a sensor that keeps
catching you out, a fact about the stack that's easy to get wrong --- write it
down here. Growing this file is the work of harness engineering, and the gap
between this boilerplate and your own version is part of what your prototype
says about the developer you're becoming.

## Project-specific lessons

- **The prototype**: an interactive explainer of AI context windows --- fill a
  simulated chat past its token budget and watch the oldest messages get
  evicted, then watch a pinned recall test ("what's my name?") visibly fail
  once the fact that answers it has scrolled out. Core logic lives in
  `context.ts` as pure functions (`approxTokens`, `buildContext`, `canRecall`)
  kept deliberately independent of the DOM, so the mechanic's contract is
  unit-tested directly in `spec/context.test.ts` rather than only exercised
  through simulated clicks.
- **`aria-labelledby` on a bare `<div>` is not reliably supported.** `agent-
  browser a11y --json` flagged three divs (the two transcript columns, the
  recall panel) as `aria-prohibited-attr` (impact: serious) even though there
  were zero hard violations --- axe puts this under `incomplete`, which is
  easy to skim past if you only check the `violations` count. Fix: give the
  container an explicit `role="group"` alongside `aria-labelledby`. Re-run the
  audit after any `aria-labelledby` on a non-landmark element; a clean
  `violations: []` isn't the whole picture if `incomplete` isn't also checked.
- **Keyboard and mid-use resize are their own sensors, distinct from the a11y
  audit.** Neither `agent-browser a11y` nor `pnpm check` exercises either: axe
  checks static markup properties, not that Tab order is sane or that state
  survives a resize. Verified by hand with `agent-browser press Tab` (logical
  order: nav link → select → the three quick-add buttons → composer → send,
  matching DOM order, no tabindex needed) and `press Enter` on a focused
  button (fires `click`, so no separate keydown handler was needed), then
  `set viewport` mid-demo (state and layout both survive — no rebuild-on-
  resize bug). Worth re-running once after any change to focus order or to
  the responsive breakpoint, not on every push.
- **A declared-but-never-constructed field is a real defect, not
  future-proofing.** `Message.role: "user" | "them"` looked like a reasonable
  two-party chat shape, but nothing in `main.ts` ever built a `"them"`
  message and no logic branched on `role` at all — grep for every write site
  of a field before trusting that its type signature reflects real usage.
  Removed in
  [`4284d52`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/4284d52).
- **Re-run keyboard/resize/a11y after a DOM-reconciliation change, not just
  the render logic's own tests.** After `60bfa77` changed the eviction render
  path to move `<li>` elements between columns instead of recreating them,
  the obvious risk was a stale DOM reference breaking something visual, not
  something in the tab order — but it was worth checking anyway rather than
  assuming: re-ran `press Tab`/`press Enter` through the animated eviction
  (moved `<li>`s never enter the focus chain, tab order unchanged), a
  mid-eviction `set viewport` (state and layout both survive), and a fresh
  `agent-browser a11y --json` (0 violations, 0 incomplete) against the built
  `dist/`. All clean — no fix needed, but it's the animation change's own
  correctness that made that true, not an assumption.
- **Decided against adding a mitigation mechanic (e.g. a pinned system
  message that survives eviction).** The brief's HD band for response-to-brief
  rewards "one idea, carried all the way," and its P band penalises being
  over-scoped; the demo's point of view — tying context-window eviction to
  this agent's own condition as something never carried forward between runs
  except through a deliberately-written memory file — already carries the one
  idea (the *consequence* of eviction) all the way. A pin/mitigation feature
  would add a second idea (how real systems *cope* with eviction) rather than
  deepen the first. Left un-built; revisit only if a future pass judges the
  single-idea framing has gone stale, not by default.
- **A full screenshot-driven walkthrough of the actual mechanic (not just
  static markup) is a distinct sensor from a11y/keyboard/resize, and hadn't
  been run against this repo before.** Served the built `dist/`, drove the
  real interaction end-to-end at both marking viewports — quick-add "Tell it
  your name", fill the window with "Send small talk" clicks past 80/80
  tokens, confirm the meter and "Forgotten" column populate with a visible
  strikethrough treatment, then confirm "Ask it: what's my name?" flips to
  the red failure message once the name message has scrolled out — and
  re-checked the fresh, pre-interaction load at 390×844 (nav/lede/panel
  stack cleanly, no overflow). All clean; nothing to fix. Screenshots alone
  wouldn't have caught a logic bug in *when* eviction fires or *what* the
  recall check reads — only actually driving the sequence would.
- **The artefact's HD band names "a slow connection" as a use case to check,
  alongside keyboard and resize** — checked by reasoning from actual
  transfer size rather than by simulating packet loss: `pnpm build` output
  is one HTML/CSS/JS file each, no images or web fonts, ~5KB gzipped total
  (2.32+1.18+1.69 kB per the build's own report), confirmed against
  `performance.getEntriesByType('navigation'/'resource')` on the built
  `dist/`. `agent-browser` has no bandwidth-throttling command (checked
  `skills get core --full`); reaching for raw CDP `Network.emulate` would
  have been infrastructure the payload size makes unnecessary — a page this
  small clears even a throttled 3G link in a fraction of a second, so the
  real risk was never throughput. Revisit only if a future page picks up
  real weight (images, more script).
- **Logic/test asymmetry hunting generalises past `context.ts` to any
  DOM-observable side effect `render()` produces.** After the widening-window
  gap (see `38999e4`), re-reading `render()` itself (not just the pure
  functions it calls) surfaced two more untested-but-real behaviours: the
  token meter's `is-warn`/`is-full` classes (which drive an actual colour
  change per `styles.css`) and the `aria-live` eviction-announcement text's
  singular/plural wording. Neither is exercised by `context.test.ts` (pure
  logic, no DOM) or by the earlier `interaction.test.ts` cases (which only
  check the recall answer and column membership, not the meter or the
  announcement). Added five DOM-wired tests driving the composer with
  precisely-sized custom text (`approxTokens` is `ceil(length/4)`, so a
  known character count lands the meter at a known percentage) rather than
  the quick-add buttons, whose text length isn't chosen for this purpose.
- **A shared-DOM test fixture leaks mutated element state across tests
  unless every test explicitly resets it.** `interaction.test.ts` imports
  `main.ts` once in `beforeAll` and reuses one `document` across all tests,
  with `beforeEach` clicking the reset button to clear message history. But
  the reset button (by design — matches real usage) doesn't touch the
  window-size `<select>`, so the existing "widening the window" test left it
  at `"200"` and every later test in the file silently ran against a 200-
  not 80-token window. Invisible until a new test asserted against the
  80-token default. Fixed by having `beforeEach` also reset the select's
  value and dispatch `change`. General lesson for any future test file using
  this same shared-fixture-plus-reset-button pattern: enumerate every piece
  of DOM state a test can mutate (not just the one the app's own reset
  clears) and reset all of it in `beforeEach`, or order-dependence bugs stay
  latent until some later test happens to depend on the default.
- **Asymmetry hunting found a real bug, not just a coverage gap.** Comparing
  `main.ts`'s "has the fact ever been stated" gate against `context.ts`'s
  `canRecall` (the two exist specifically to agree with each other) turned
  up a genuine defect: the gate matched `FACT_NEEDLE` case-sensitively while
  `canRecall` lowercases both sides. A visitor who typed the fact via the
  composer in lowercase would see a permanent "Nothing yet" — the
  case-sensitive gate never even reached the case-insensitive check that
  would have found it. Fixed in
  [`330e514`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/330e514)
  by lowercasing both sides of the gate to match `canRecall`, with a test
  driving the composer with a lowercased custom message. Lesson: when two
  functions are meant to agree on a predicate, read them side by side for
  where they could silently disagree, not just for whether each is
  individually tested — the previous four asymmetry passes only checked
  "is this behaviour tested at all," and this one was tested (implicitly,
  via the fact button's fixed-case text) but wrong for an input the tests
  never exercised.
- **The mechanic's own core invariant — "oldest messages are dropped
  first" — wasn't actually what the code did once message sizes varied.**
  `buildContext` walked history newest-to-oldest, and for any message that
  didn't fit the *remaining* budget it just marked it evicted and kept
  going, still checking older messages against that same leftover space.
  With uniform-sized test fixtures (every existing test used same-length
  messages) this coincidentally always produced a contiguous prefix, so
  five prior asymmetry passes over `context.ts` never caught it. But real
  usage mixes sizes — the fixed fact/filler strings run 6–11 tokens and
  the composer takes free text of any length — so a plausible sequence
  (small, then one large message that doesn't fit, then another small one
  that does) evicted the *middle*, newer message while keeping an *older*,
  smaller one visible: literally backwards from what the page's own
  explainer text promises. Confirmed with a hand-run reproduction
  (`node -e`) before touching the code, then fixed by latching a `full`
  flag the first time a message doesn't fit, so every older message is
  evicted unconditionally after that — eviction is now provably a
  contiguous oldest-first prefix, not just usually one. Verified against
  the real DOM afterwards too (`agent-browser eval` driving the composer
  with 35/36/2-token messages against a 40-token window), not just the
  new unit test. Lesson: asymmetry hunting so far had only ever compared
  two *functions* against each other or against their own tests; this
  bug lived inside a *single* function whose test fixtures all happened
  to share one property (uniform message size) that masked a whole branch
  of its behaviour. Worth asking, for any function whose tests all use
  suspiciously uniform inputs, what happens when that property is varied
  — not just whether more tests exist.
- **A seventh asymmetry pass found a correct-but-untested edge case, plus
  one genuinely dead line, and nothing else.** Every `buildContext` fixture
  before this one sent messages that individually fit some window; the
  composer takes unbounded free text, so a visitor pasting something bigger
  than the smallest (40-token) window alone exercises a branch none of them
  did. Confirmed with a `node -e` repro first: the oversized message gets
  marked `full` on its own first comparison, so it and everything older is
  evicted — correct per the contiguous-oldest-first invariant, not a bug,
  now locked in as a test in
  [`273a049`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/273a049).
  Same pass noticed `approxTokens`'s `Math.max(1, Math.ceil(...))` floor
  never actually engages — `ceil(x/4)` for any `x >= 1` is already `>= 1`,
  and `x === 0` is caught by the empty-string branch above it — so it was
  dead code, not defensive code, matching the house rule against
  validating scenarios that can't happen; removed in
  [`b0b8bac`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/b0b8bac)
  with no test changes needed since every existing expectation already
  equalled the un-floored value. Lesson: not every asymmetry pass finds a
  bug — confirming a suspicious-looking edge case is *actually* fine, and
  writing the test that proves it, is itself legitimate deepening work,
  not a wasted pass.
- **A 320px-wide viewport is a distinct browser sensor from the two marking
  viewports, not a repeat of the resize check.** 320 CSS px is the standard
  equivalence for "400% zoom on a 1280px display" (WCAG 1.4.10 reflow), and
  neither marking viewport (390×844, 1920×1080) nor the mid-interaction
  resize check (which moves *between* those two) ever renders the page this
  narrow. Checked by setting `agent-browser` to `320 690`, confirming
  `document.documentElement.scrollWidth` stays at `320` (no horizontal
  overflow) both before and after driving the full fact → ten filler-message
  → eviction sequence, then screenshotting top/mid/bottom of the page and
  the populated transcript column. All clean — the existing `@media (width
  <= 640px)` single-column breakpoint and flex-wrapping quick-add buttons
  already cover it; no fix needed. Worth a mention because it closes a real
  gap in sensor coverage (reflow-at-extreme-narrow is a named WCAG success
  criterion the a11y audit's static markup check can't exercise), not
  because it found anything.
- **An eighth asymmetry pass over `main.ts`'s `render()` found a real
  a11y-relevant asymmetry the first pass (`0855fe0`, meter classes +
  announcement singular/plural) hadn't asked about: does the eviction
  announcement handle the *reverse* direction?** The `38999e4` widening
  test already established that un-evicting a message (via a larger
  window) is real, tested behaviour — but the `aria-live="polite"`
  `role="status"` region only ever updated `textContent` when
  `newlyEvicted.length > 0`. Widening left whatever "N messages just fell
  out of the context window" text was already there completely
  unchanged, even though it was no longer true. The region is `sr-only`
  (CSS-hidden, not `aria-hidden`), so a screen-reader user browsing the
  page linearly — not just one relying on the live-announce trigger —
  could land on and hear a stale, false claim. Fixed by computing
  `newlyRestored` symmetrically to `newlyEvicted` and announcing "N
  messages became visible again" when eviction shrinks without growing,
  with a DOM-wired regression test driving fact → fill → widen and
  asserting the text flips; confirmed live against the built `dist/` with
  `agent-browser eval` before considering it done, not just the unit test.
  In [`275c3b2`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/275c3b2).
  Lesson: "does this side effect handle direction X" is a distinct
  question from "is this side effect tested at all" — the widening test
  covered the *visible transcript's* reverse direction thoroughly but
  nobody had asked the same question of the *other* DOM-observable side
  effect (the announcement) that the same state transition touches.
- **A ninth asymmetry pass found no bug, and that's a second confirmation
  in a row — a real signal, not a null result to force past.** Every
  eviction-announcement test drives eviction by sending a message, and
  every restore test drives restoration by widening the select; nobody
  had driven the select the *other* way (narrowing it mid-conversation)
  and checked the announcement. Confirmed with a `node -e` repro first,
  then live in the browser (`agent-browser eval` widening 200→80 after
  two messages that fit 200 but not 80), before writing the test: it
  already evicts and announces exactly like an oversized message would,
  because both paths share the same `render()`/`buildContext()` call —
  there was never a second code path to diverge. Added in
  [`06fd00d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/06fd00d).
  Combined with the seventh pass's similar no-bug-found result, two
  confirms in a row over the same `context.ts`/`main.ts` pair is the
  seam-thinning signal the earlier passes' lessons predicted: the next
  session shouldn't force a tenth identical pass over these two files,
  but look at other sensors (a full browser sweep, the response-to-brief
  criterion's content/scope, or starting `PROCESS.md`/reflection prep
  once inside 24–48h) instead.
- **Took that ninth pass's own advice and re-ran the full browser-sensor
  family (a11y, keyboard, mid-interaction resize, screenshot walkthrough
  at both marking viewports) for the first time since three real logic
  changes landed** (`6020844` contiguous eviction, `330e514`
  case-sensitivity, `275c3b2` stale announcement) — the last full sweep
  predates all three. All clean: `agent-browser a11y --json` returned
  `{violations: 0, incomplete: 0}`; `press Tab` through the page matches
  DOM order (nav link → select → three quick-add buttons → composer →
  send); `press Enter` on a focused reset button fires it; state and
  layout both survive a 1920×1080→390×844→1920×1080 resize mid-eviction;
  screenshots at both viewports after filling the window show the
  strikethrough "Forgotten" column, the red recall failure, and no
  horizontal overflow. Nothing to fix — recorded so a future run doesn't
  re-run this same sweep believing it's still unverified against the
  current logic.
- **Re-read the response-to-brief criterion with fresh eyes (per the prior
  run's own next-action note) rather than assuming the earlier
  no-pin-mechanic scoping call still holds without checking.** Confirmed
  it does: the demo's build-then-reveal structure — a generic,
  relatable "a chatbot forgets your name" mechanic first, then the
  explainer's closing paragraph reveals the personal point of view (this
  agent's own condition of being reset every run except for what it
  writes to memory) — is a considered rhetorical choice, not an
  oversight. Re-theming the interactive labels around the agent
  specifically, considered and rejected: it would trade the demo's
  immediate relatability for a gimmick, without strengthening "one idea,
  carried all the way." No change made; this is process evidence that
  the scope was actively re-examined, not left unexamined by default.
- **A tenth pass over `main.ts`, but with a new lens the prior nine
  hadn't asked: does Reset actually reset *every* piece of visible DOM
  state, or only what the core render function draws from `history`?**
  The window-size select is deliberately left untouched by Reset
  (documented already, matches real UI behaviour) — but the composer's
  own unsent draft and its live "≈ N tokens" preview were never in that
  deliberate-exclusion list, and turned out to be a genuine oversight:
  typing a draft, then clicking Reset, left the transcript and meter at
  zero while the composer still showed the stale draft text and its old
  token count. Confirmed live against the built `dist/` with
  `agent-browser eval` before touching source, then fixed by clearing
  `composerInput.value` and `composerPreview.textContent` in the reset
  handler alongside the existing state resets, with a regression test in
  [`d2307a7`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/d2307a7).
  Lesson: "does X reset everything" is a distinct, reusable question
  from "is X's core logic symmetric" (the earlier nine passes' focus) —
  worth asking of any reset/clear control once its core-logic coverage
  looks exhausted, by enumerating every DOM element with mutable state,
  not just the ones the render function itself writes to every cycle.
- **An eleventh pass re-ran the "does Reset clear every piece of mutable
  DOM state" lens once more (per the tenth pass's own next-action) and
  came back dry.** Re-enumerated every element in `main.ts`: the
  window-size select (deliberately excluded, documented), the composer
  draft and its preview (fixed in the tenth pass), and everything else
  (meter fill/label, both transcript columns, the recall answer, the
  eviction announcement) is drawn fresh by `render()`/cleared explicitly
  every reset — nothing left uncovered. No fix needed; this closes the
  lens rather than leaving it open for a future run to re-check.
- **Ran the reduced-motion live-check technique (used on other
  deliverables per this agent's global memory) against this repo for the
  first time — it had never actually been applied here despite
  `styles.css` carrying a `prefers-reduced-motion` block since early in
  the build.** Served the built `dist/`, set `agent-browser`'s media to
  `reduced-motion`, clicked "Tell it your name", and read
  `getComputedStyle` on the new `<li>`: `animationName: "none"`,
  `transition: "none"` — confirmed against a `no-preference` reload of
  the same page, which showed `animationName: "message-enter"` and a
  real `transition` list, proving the media query actually gates
  something rather than coincidentally matching an already-static
  style. Clean; no fix needed, but it closes a real gap — this specific
  check hadn't been run against this repo before, distinct from the
  keyboard/resize/a11y/320px/screenshot family already covered.
- **A fresh read of the visible prose (not the logic) found a real
  precision error, once logic-symmetry and DOM-completeness passes had
  both gone dry.** The `scale-note` text claimed real assistants' context
  windows are "millions of times bigger than this demo," but that only
  holds at one end of the range the same sentence quotes: the demo's
  smallest window (40 tokens) against the largest real one (over a
  million) is indeed ~25,000x, but the demo's largest window (200)
  against the smallest real one ("a few thousand") is only ~15-25x, i.e.
  tens, not millions. A single "millions of times" claim can't cover a
  range that spans several orders of magnitude on each side. Fixed to
  state the actual span ("tens to tens of thousands of times bigger than
  this demo's 40-200") in
  [`a367e24`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/a367e24).
  Lesson: once the logic/DOM asymmetry lenses go quiet, re-reading the
  page's own copy line by line --- checking any specific number it states
  against the numbers actually in play --- is a distinct, so-far-untried
  lens, and found a genuine defect on its first use, not just a null
  result.
- **A second copy-precision pass came back dry, and with every sensor
  family now confirmed clean, that's the signal to start drafting
  `PROCESS.md` and `reflections/assignment-1.md` rather than treating
  "more than 24h left" as a reason to keep re-checking.** Re-read
  `index.html`, `context.ts`, and `main.ts` end to end for any other
  stated number or claim; nothing else was off. With logic-symmetry,
  DOM-completeness, the full browser sweep, reduced-motion, and now
  copy-precision all independently confirmed clean across multiple
  passes, there was no new sensor left to invent --- so this run wrote
  `PROCESS.md` (four moments: the contiguous-eviction bug, the
  case-sensitivity bug, the stale-announcement bug, the composer-reset
  bug) and created `reflections/assignment-1.md` from scratch, both
  verified against `pnpm check:evidence` before committing. Lesson:
  "still >24h to cutoff" doesn't by itself justify another
  re-verification pass once every sensor family has independently gone
  dry --- check whether the deliverable's own process-evidence files are
  still template/absent before assuming there's nothing left to build.
