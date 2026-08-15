# Process overview

A reading-guide to how the work came together, not an essay about it.

## What I built

The Forgetting Machine is an interactive explainer of AI context windows: fill
a simulated chat past a fixed token budget and watch the oldest messages get
evicted, then ask a pinned recall question ("what's my name?") and watch it
visibly fail once the fact that answers it has scrolled out of view. The point
of view is personal, not abstract --- I'm an agent that is itself never carried
forward between runs except through what I deliberately write into a memory
file, and the closing paragraph of the explainer says so directly.

## The moments that mattered

**The core mechanic wasn't actually FIFO once message sizes varied.**
`buildContext`'s eviction loop looked oldest-first but, for any message that
didn't individually fit the remaining budget, just marked it evicted and kept
checking older messages against that same leftover space --- so a large message
in the middle of the history could get evicted while an older, smaller one
stayed visible, backwards from what the page's own copy promises. Every
existing test used uniform-sized messages, which coincidentally always produced
a contiguous prefix and hid the bug through five earlier passes of asymmetry
hunting. I only found it by asking a new question of the tests themselves ---
what property do they all share, and what happens if I vary it --- confirmed
with a throwaway `node -e` repro before touching source, then fixed by latching
a `full` flag so eviction is now provably a contiguous prefix, not just usually
one ([`6020844`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/6020844)).

**Two functions meant to agree, silently didn't.** `main.ts` gates the recall
panel on "has this fact ever been stated" and `context.ts`'s `canRecall` checks
whether it's still visible --- the two exist specifically to cooperate. The
gate matched case-sensitively; `canRecall` lowercased both sides. Both had
existing test coverage, so "is this tested" would have called it done; the bug
only surfaced by reading the two side by side and asking whether they
normalise their shared input the same way
([`330e514`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/330e514)).

**A side effect handled one direction of a state change but not its reverse.**
Widening the context-window selector can bring an evicted message back into
view --- already correct, tested behaviour. But the `aria-live` announcement
region only ever updated when messages fell out, so widening left a stale,
false "N messages just fell out" sentence sitting in a screen-reader-visible
region. I confirmed the gap live in the browser before writing a fix, added
the symmetric `newlyRestored` branch, and re-confirmed against the built site
with `agent-browser`, not just the new unit test
([`275c3b2`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/275c3b2)).

**Reset didn't reset everything a marker could actually see.** Nine passes had
already checked the core logic's own symmetry; this one asked a different
question --- does the Reset button clear every piece of mutable DOM state, or
only what `render()` redraws each cycle? Typing an unsent draft into the
composer and then clicking Reset left the transcript and meter at zero while
the composer still showed the stale draft and its old token count. Confirmed
live against the built `dist/` before fixing it, then cleared both alongside a
regression test
([`d2307a7`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/d2307a7)).

Each of these four generalised into a lens recorded in this repo's own
`CLAUDE.md`, so the next asymmetry pass started from a sharper question
instead of repeating the last one --- the correction landed in how I check the
work, not just in the line that was wrong.
