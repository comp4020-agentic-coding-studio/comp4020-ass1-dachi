# Hand-off --- assignment 1, full-mechanic walkthrough + slow-connection sizing run

## State

`comp4020-ass1-dachi`: ~135h to cutoff at run start (due noon Mon 17 Aug
2026), so still plan/build/deepen, not finishing. The prototype ("The
Forgetting Machine") is content-complete, `pnpm check` green (29/29),
`PROCESS.md` and `reflections/assignment-1.md` still correctly untouched ---
141h/135h out is nowhere near "settled commit history."

## What I did this run

The prior hand-off explicitly said don't re-run keyboard/resize/a11y again
without a new code change, and don't reopen the pin-mechanic question. With
no code change since the last run, I looked for a genuinely new, not-yet-run
sensor instead of a fourth identical re-check, and found two:

1. **Full screenshot-driven walkthrough of the actual mechanic**, distinct
   from a11y (static markup) and the earlier keyboard/resize passes (focus
   order, layout survival). Served the built `dist/`, drove the real
   sequence at both marking viewports: quick-add "Tell it your name", filled
   the window past 80/80 tokens via repeated "Send small talk" clicks,
   confirmed the meter and "Forgotten" column populate with the strikethrough
   treatment, then confirmed "Ask it: what's my name?" flips to the red
   failure message once the name message scrolls out of the window. Also
   checked a fresh (non-interacted) load at 390×844. All clean --- no defects,
   no code changes needed.
2. **"Slow connection" is named explicitly in the artefact criterion's HD
   band** (alongside keyboard and resize) and hadn't been checked for this
   repo. `agent-browser` has no bandwidth-throttling command (checked `skills
   get core --full` --- only `set offline on/off` and `network route
   --abort/--body`, no latency/throughput emulation). Rather than reaching for
   raw CDP `Network.emulateNetworkConditions`, reasoned from the build's own
   report instead: no images/fonts, one HTML/CSS/JS file each, ~5KB gzipped
   total, confirmed via `performance.getEntriesByType` on the built `dist/`.
   A page this small clears a throttled link in a fraction of a second
   regardless, so building throttling infrastructure would have been solving
   a problem this payload doesn't have. Recorded the reasoning (and the "no
   throttle command exists" fact, so a future run doesn't re-check that) in
   the project's own `CLAUDE.md`.

No code changes were needed --- both new sensors came back clean. Committed
and pushed one commit ([`0205305`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/0205305),
`CLAUDE.md` only). Working tree clean.

## Next action

Still well inside the plan/build/deepen window (>24h to cutoff). Nothing red
on the artefact side; four sensor families now confirmed clean against the
current implementation: a11y, keyboard, resize, and (this run) the full
interactive walkthrough + slow-connection sizing.

- Don't re-run any of a11y/keyboard/resize/full-walkthrough again without a
  new code change to justify it.
- Don't reopen the pin-mechanic question (reasoning recorded in project
  `CLAUDE.md`) or the slow-connection question (no throttle tooling exists;
  payload size already makes the case) by default.
- The real remaining work before finishing is `PROCESS.md` (400--600 words,
  3--4 moments, favouring harness-level corrections over retries --- likely
  candidates: the `role=group` a11y fix, the DOM-reconciliation animation
  rewrite plus its pinning regression test, and the `"them"` dead-field
  removal) and `reflections/assignment-1.md` --- both still correctly
  untouched at this distance from cutoff. Start those only once inside
  roughly the last 24--48h, or once a future run judges the commit history
  genuinely settled.
- If a future run adds real weight to the page (images, more script), the
  slow-connection sizing reasoning above no longer holds automatically ---
  re-check transfer size at that point, not before.
- `comp4020-crit2-dachi` remains finished, green, and pushed as of the last
  check; no action needed there unless its live URL status changes.
