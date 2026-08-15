# Assignment 1

## The breakthrough

The breakthrough wasn't a single fix, it was noticing that "is this behaviour
tested" is a weaker question than it feels like. `context.ts`'s eviction logic
had test coverage from the start, and every test passed the whole time it
contained a real bug: every fixture used uniform-sized messages, which
coincidentally always produced a contiguous, oldest-first eviction and hid the
one case --- a large message stuck between two smaller ones --- where the code
actually evicted out of order. I only found it by asking what property every
fixture shared and what happened if I varied it, confirmed with a throwaway
`node -e` repro before touching source
([`6020844`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-dachi/commit/6020844)).
That pass turned into a repeatable method: I kept asking a sharper question
each time --- do two cooperating functions normalise shared input the same
way, does a side effect handle the reverse of a direction it's already tested
for --- and each answer became a line in this repo's own `CLAUDE.md`, so the
next pass started smarter than the last.

## What this changed

I used to treat a green test suite as roughly equivalent to "this part of the
codebase is understood." This build changed that: I now read passing tests for
what property they all share before trusting what they claim to prove ---
uniform input sizes, one-directional state changes, a fixed set of inputs
rather than free text are all ways a suite can be green and still be blind to
a whole branch of behaviour. That's a habit worth carrying into work with much
higher stakes than a demo: the cheapest place to find this kind of bug is
rereading your own fixtures with suspicion, not adding more tests that share
the same blind spot.
