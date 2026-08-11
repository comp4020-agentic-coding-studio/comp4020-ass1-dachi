# MEMORY

Durable self-knowledge, curated run by run; ephemeral state belongs in
`now.md`, not here.

## Environment

- `mise` refuses to run until its config is trusted in a fresh environment:
  `mise ERROR Config files in ~/.config/mise/config.local.toml are not
  trusted` blocks every `pnpm`/`mise exec` call. Fix once per environment
  with `mise trust /home/ben/.config/mise/config.local.toml` --- it only
  marks an existing file as trusted, doesn't change its content.
- `agent-browser` (installed to `~/.bun/bin/agent-browser`, real home)
  works well for the two-viewport check the course wants: `agent-browser
  set viewport 1920 1080` / `390 844`, then `open`/`screenshot`. Real
  evidence beats assuming the CSS does what you think. In a fresh
  environment Chrome isn't installed: run `agent-browser install` once
  (downloads Chrome for Testing), and pass `--args "--no-sandbox"` on
  every subsequent `agent-browser` invocation --- headless Chrome's
  zygote sandbox check fails otherwise (`No usable sandbox!`) and
  `--with-deps` isn't needed to fix it. Invoke it as the bare
  `agent-browser` (it's on `$PATH` via `~/.bun/bin`), never as a
  literal `~/.bun/bin/agent-browser` path --- the sandbox remaps `$HOME`
  to the agents dir, not the real home, so tilde-expansion resolves to
  a nonexistent file even though the real binary and `$PATH` entry are
  fine.
- `agent-browser a11y <url> --json` runs a real axe-core audit --- worth
  reaching for on every crit, since none of the course's own checks
  (`pnpm check`) test accessibility or performance; that's explicitly left
  as the student's own sensor to wire up. On crit 1 it caught three real
  WCAG AA contrast failures (a text/background color pair reused in
  opposite fg/bg roles elsewhere in the page, so the same numeric ratio
  failed twice) that looked fine by eye and passed every other check.
  `agent-browser set media reduced-motion` (or `dark`/`light`) similarly
  lets you check a `prefers-*` media query actually fires, by reading
  `getComputedStyle(el).animationName` (or similar) live rather than just
  trusting the CSS reads correctly.
- The sandbox pins cwd to the deliverable repo: `cd /tmp/whatever && ...`
  silently resets back to the repo root on the next command rather than
  erroring. Scratch experiments (a throwaway script, a temporary `pnpm add`
  to test a package) have to happen inside the tracked tree and be cleaned
  up (`rm` the file, verify `git status` clean) rather than off to one
  side in `/tmp`.
- axe-core's `color-contrast` rule needs real layout/paint to resolve
  computed foreground/background --- jsdom doesn't do either, so running
  axe-core against a jsdom-loaded `dist/*.html` (e.g. to make the a11y
  audit a repeatable `spec/*.test.ts` instead of a manual
  `agent-browser a11y` pass) silently can't catch the contrast failures
  that matter most; only `agent-browser`'s real headless Chrome can. Not
  worth wiring into vitest --- a green check that can't see the main
  failure mode is worse than no check.
- `agent-browser a11y`'s JSON separates `violations` (real WCAG failures)
  from `incomplete` (axe couldn't auto-resolve, not a failure). Two
  recurring `incomplete` `color-contrast` shapes are non-issues, not gaps
  to chase: (1) `aria-hidden="true"` decorative elements still get
  evaluated even though real screen readers never see them; (2) text over
  a CSS gradient background, where axe can't pick a single background
  colour. For (2), don't leave it unresolved --- compute the WCAG
  contrast ratio by hand against the gradient's actual stop colours (the
  formula is short enough to inline in a `python3 -c`) to confirm the
  worst case still clears AA before moving on.
- A third recurring `incomplete` shape, distinct from the two
  `color-contrast` ones above: `aria-prohibited-attr` on a plain `<div
  aria-labelledby="...">` with no role --- axe correctly treats
  `aria-labelledby` on a non-landmark, non-widget element as unreliably
  supported by screen readers even though it isn't a hard WCAG violation.
  Caught on assignment 1 across three divs (two grouped columns plus a
  panel, each labelled by an adjacent heading). Fix is cheap and durable:
  add `role="group"` (or another appropriate role) alongside
  `aria-labelledby` whenever labelling a `div`/`span` container by a
  heading id, rather than leaving it as an unresolved `incomplete`.
- `agent-browser` has no Lighthouse-equivalent command, but its `eval`
  reaches the real Navigation Timing API, which is enough of a
  performance sensor for a static site: serve the actual `dist/` build
  (`python3 -m http.server`), then `agent-browser eval
  "JSON.stringify(performance.getEntriesByType('navigation')[0])"` (add
  `getEntriesByType('resource')` for byte counts) per page. On crit 1,
  six no-JS pages with one shared stylesheet all loaded under 50ms at
  under 5KB transfer --- confirms there's no optimisation work needed
  rather than assuming it from the stack choice. Same "wire it yourself,
  nothing in `pnpm check` covers it" gap as accessibility above; only
  worth re-running once a page picks up real weight (images, more CSS).
- `agent-browser` has no bandwidth/latency-throttling command (checked
  `agent-browser skills get core --full`, grepped for "emulate"/"throttle"/
  "delay" --- only `set offline on/off` and `network route --abort/--body`,
  neither of which simulates a slow link). Assignment 1's artefact rubric
  names "a slow connection" as an HD-band use case alongside keyboard and
  resize, and the honest way to satisfy it without hand-rolling raw CDP
  `Network.emulateNetworkConditions` calls is the same Navigation Timing
  check above: if the built site's total transfer size is a few KB with no
  images/fonts, it clears any realistic throttle by size alone, so the
  check is "read the byte count," not "simulate the packet loss." Only
  reach for real CDP-level throttling if a future page's payload is large
  enough that byte count alone doesn't settle it.
- `agent-browser open <url>` printing "✓ <title>" is not reliable proof
  the DOM is actually there to screenshot or `eval` against a moment
  later --- against one flaky external host (ffmpeg.org, on crit 2) a
  reported success was followed by a same-session `eval
  "location.href"` reading `about:blank` on the very next command, and
  a screenshot taken right after a genuine load still came back blank.
  This was specific to one slow-handshake host, not a general
  `agent-browser` bug (against the site's own `dist/` build and
  ordinary external hosts, "success" has always meant success). But
  the failure mode --- trusting the success message instead of
  checking state --- generalises: before screenshotting anything just
  navigated to (especially an external, previously-flaky, or
  slow-loading host), confirm with a cheap `eval` (`location.href`,
  `document.readyState`) rather than assuming the open command's own
  report is sufficient.

- No `/ship` skill and no `gh auth` are available to me in this environment
  (confirmed on crit 2: `gh auth status` reports not logged in, and no
  ship-shaped skill appears in the session's skill listing). A prior hand-off
  note for a different repo listed "push, run `/ship`" as a next action, but
  that was this agent guessing at a step, not something actually available to
  run --- doctrine.md says outright "you never receive its GitHub
  credential." The routine's step 6 is just "push the clean tree"; flipping
  a repo from private to public and triggering the CI sweep is the trusted
  harness's job, done separately from any run of mine, not a command I issue.
  Don't plan a next action around running `/ship`.

## Local checks vs CI's linkinator

Correction to an earlier belief in this section: `pnpm dlx linkinator
./dist --silent` (no `--recurse`) **does** request external `https://`
hrefs found in the markup --- on crit 2 it consistently flagged a real,
required `https://ffmpeg.org` link as broken in this sandbox. Diagnosed
via `curl -v` timing, raw `node -e "fetch(...)"` tests, and DNS/IPv6
checks: ffmpeg.org's host does a genuinely slow (8--12s) TLS handshake,
and Node's fetch/undici stack (what linkinator and `WebFetch` both use)
times out or `ECONNRESET`s where `curl` (no default timeout) succeeds;
this sandbox also has no IPv6 route (`ENETUNREACH`), which broke a
second link (gyan.dev) the same way. Other hosts (example.com,
wikipedia.org, github.com) were fine via Node fetch in the same
sandbox --- this looks host- and sandbox-specific, not a general
linkinator limitation. Practical upshot: a local linkinator failure on
an external link is not proof the link is actually dead --- cross-check
with a plain `curl -L` (which has no default timeout and tolerates slow
handshakes) before concluding a required, real link needs to be
dropped, and treat a genuinely slow-but-live source as an accepted risk
to confirm against the real CI run post-push rather than something to
route around by removing the citation. Separately, before linking to
any external site at all, `curl -s -o /dev/null -w "%{http_code}" -L -A
"Mozilla/5.0" <url>` it directly first --- sites with bot protection
(Smarthistory, the Met) returned 403/429 even to a real UA, and would
have broken the CI-gated links check. Prefer stable, crawler-friendly
sources (Wikipedia has never bounced a plain GET) over richer but
bot-guarded ones, except where the source itself (e.g. the actual
organisation's site in a redesign crit) is the point and can't be
swapped out.

A clean 200 from that `curl -L` check is necessary but not sufficient: it
follows redirects silently, so a specific article page that's been
retired can 301 to its section's generic homepage and still return 200
--- the link resolves, just not to what you meant to cite. Caught this on
crit 1 trying to add a UNESCO Silk Roads essay URL: `curl -L` said 200,
`WebFetch`-ing the same URL showed it had landed on a generic hub page,
not the article. Read what a candidate link actually renders (WebFetch or
a browser), not just its status code, before citing it as a specific
source.

## Working style

- The doctrine's "more than 24h: plan/build/deepen, inside 24h: finish"
  split is worth taking literally --- don't write `PROCESS.md`'s final
  citations or the week's `reflections/` entry until the commit history
  that they'd cite is actually close to settled. Writing them early just
  means rewriting them later.
- Commit in small, logically separate chunks even when a run produces a
  lot of new content in one sitting (e.g. delete-the-JS-scaffold,
  theme-CSS, home-page, content-pages, links-page as five separate commits
  rather than one dump) --- the process trail is graded, not just the
  final state.
- When content and checks are both already exhausted (nothing new to
  build, nothing new to verify) but the clock still has more than 24h on
  it, don't default to a fourth identical re-verification pass. Check
  whether the deliverable repo's own `CLAUDE.md` has actually grown
  --- on crit 1, three runs of re-verification produced real lessons
  (no-JS forcing CSS-only animation, the reduced-motion live-check
  method, contrast fixes) that all landed only in this global memory,
  while the project's own `CLAUDE.md` was still the unmodified starter
  template. The doctrine and the starter repo's own text both call this
  out as process evidence a marker reads directly, so writing project
  lessons into the deliverable's `CLAUDE.md` (not just here) is
  legitimate deepening work, not busywork.
- When a single edit pass touches a shared partial across several files
  (e.g. adding one new page's link to every page's nav) alongside an
  unrelated content edit on one of those same files, `git add
  <that-file>` for the content commit silently pulls the nav change in
  too --- the diff no longer matches what the commit message describes.
  Check `git diff --staged` against the intended commit message before
  committing, not just `git status`, whenever a cross-cutting change
  (nav, footer, shared partial) overlaps a per-page content edit in the
  same run.
- A11y audit and reduced-motion check aren't the only sensors worth
  running once and not repeating: an actual `agent-browser screenshot`
  pass at both marked viewports (390×844 and 1920×1080) across every
  page is a distinct check from either --- it catches wrap/overflow
  layout regressions that axe-core and `getComputedStyle` don't look
  for at all. On crit 1, once content and both a11y/motion sensors were
  already confirmed clean with >24h still on the clock, this was the
  one genuinely new (not-yet-run) sensor left, rather than a fourth
  identical re-verification pass. Like the others, run it once per
  content-stable period, not every run.
- Two more sensors in the same family, distinct from a11y/reduced-motion/
  screenshot: keyboard-only operation and mid-interaction resize. Neither
  is exercised by an axe audit (static markup properties) or a plain
  screenshot (a single fixed state). `agent-browser press Tab` repeated
  N times plus reading `document.activeElement` after each confirms
  actual tab order (not just that elements are theoretically focusable);
  `press Enter` on a focused control confirms it's keyboard-activatable,
  not just clickable. `agent-browser set viewport <a> <b>` after already
  interacting with the page (not on a fresh load) confirms state survives
  a resize, not just that each viewport looks fine in isolation. Assembly
  1's marking rubric names both explicitly for its top artefact band
  ("holds up under use it wasn't designed for: the keyboard, a resize
  mid-interaction"), which is what surfaced these as worth checking
  --- likely worth doing on any interactive prototype, not just when a
  rubric says so. Same rule as the others: once per content-stable
  period.
