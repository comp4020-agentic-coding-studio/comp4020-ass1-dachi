import { describe, expect, it } from "vitest";
import { approxTokens, buildContext, canRecall, type Message } from "../context";

// This is the week's core-interaction contract: a fixed-size window forces
// the oldest messages out first, and a fact only in an evicted message can
// no longer be recalled. These are unit tests of the pure logic driving
// main.ts, independent of the DOM wiring.

function msg(id: number, text: string): Message {
  return { id, text, tokens: approxTokens(text) };
}

describe("approxTokens", () => {
  it("treats empty or whitespace-only text as zero tokens", () => {
    expect(approxTokens("")).toBe(0);
    expect(approxTokens("   ")).toBe(0);
  });

  it("counts roughly one token per four characters", () => {
    expect(approxTokens("a")).toBe(1);
    expect(approxTokens("a".repeat(8))).toBe(2);
    expect(approxTokens("a".repeat(9))).toBe(3);
  });
});

describe("buildContext", () => {
  it("keeps everything when the whole history fits", () => {
    const history = [msg(1, "hi"), msg(2, "there")];
    const { visible, evicted } = buildContext(history, 100);
    expect(visible).toHaveLength(2);
    expect(evicted).toHaveLength(0);
  });

  it("evicts the oldest messages first once the window is full", () => {
    // Each message is 20 chars -> 5 tokens; a window of 5 fits only the
    // single newest message.
    const history = [msg(1, "a".repeat(20)), msg(2, "b".repeat(20)), msg(3, "c".repeat(20))];
    const { visible, evicted } = buildContext(history, 5);
    expect(evicted.map((m) => m.id)).toEqual([1, 2]);
    expect(visible.map((m) => m.id)).toEqual([3]);
  });

  it("never exceeds the window's token budget", () => {
    const history = Array.from({ length: 20 }, (_, i) => msg(i, `message number ${i}`));
    const windowSize = 30;
    const { usedTokens } = buildContext(history, windowSize);
    expect(usedTokens).toBeLessThanOrEqual(windowSize);
  });

  it("shrinking the window evicts more, not fewer, messages", () => {
    const history = [msg(1, "a".repeat(20)), msg(2, "b".repeat(20)), msg(3, "c".repeat(20))];
    const wide = buildContext(history, 20);
    const narrow = buildContext(history, 8);
    expect(narrow.evicted.length).toBeGreaterThanOrEqual(wide.evicted.length);
  });
});

describe("canRecall", () => {
  it("finds a fact still inside the visible window", () => {
    const visible = [msg(1, "my name is Ben")];
    expect(canRecall(visible, "Ben")).toBe(true);
  });

  it("cannot find a fact that has scrolled out of the visible window", () => {
    const visible = [msg(2, "what's the weather like")];
    expect(canRecall(visible, "Ben")).toBe(false);
  });
});
