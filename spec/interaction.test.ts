// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

// context.test.ts covers the eviction/recall contract as pure logic. This
// file covers the other half: that main.ts actually wires clicking/typing in
// the real page to that logic, which the pure tests can't see on their own.
// index.html's <main> markup is reused so this breaks if the two drift apart.
const source = readFileSync("index.html", "utf8");
const mainMarkup = new JSDOM(source).window.document.querySelector("main")!.outerHTML;

function click(selector: string): void {
  document.querySelector<HTMLElement>(selector)?.click();
}

function text(selector: string): string | undefined {
  return document.querySelector<HTMLElement>(selector)?.textContent ?? undefined;
}

describe("the context-window demo, wired up", () => {
  beforeAll(async () => {
    document.body.innerHTML = mainMarkup;
    // main.ts attaches its listeners once at import time against these
    // elements, so the DOM is set up before this single import rather than
    // per test — the reset button (already part of the real UI) is what
    // clears state between tests below.
    await import("../main");
  });

  beforeEach(() => {
    click('[data-testid="reset-demo"]');
    // The reset button only clears history (matching real UI behaviour —
    // resetting a demo mid-conversation shouldn't silently change your window
    // size choice too), so a test that changes the select, like the widening
    // one below, would otherwise leak its value into every later test.
    const select = document.querySelector<HTMLSelectElement>('[data-testid="window-size-select"]')!;
    select.value = "80";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

  it("says nothing has been shared before any message is sent", () => {
    expect(text('[data-testid="recall-answer"]')).toMatch(/nothing yet/i);
  });

  it("adding the fact message makes it recallable", () => {
    click('[data-testid="quick-add-fact"]');
    expect(text('[data-testid="recall-answer"]')).toMatch(/iris/i);
    expect(document.querySelectorAll('[data-testid="visible-messages"] li')).toHaveLength(1);
  });

  it("filling the window past capacity evicts the fact and breaks recall", () => {
    click('[data-testid="quick-add-fact"]');
    for (let i = 0; i < 10; i++) click('[data-testid="quick-add-filler"]');

    expect(text('[data-testid="recall-answer"]')).toMatch(/forgotten/i);
    expect(document.querySelectorAll('[data-testid="evicted-messages"] li').length).toBeGreaterThan(0);
  });

  it("typing a custom message and sending it adds it to the visible transcript", () => {
    const input = document.querySelector<HTMLTextAreaElement>('[data-testid="composer-input"]')!;
    input.value = "Hello from a real visitor";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(text('[data-testid="composer-preview"]')).toContain("tokens");

    document.querySelector<HTMLFormElement>('[data-testid="composer-form"]')!.requestSubmit();
    expect(text('[data-testid="visible-messages"]')).toContain("Hello from a real visitor");
    expect(input.value).toBe("");
  });

  it("resets the token preview to zero once a typed message is sent", () => {
    const input = document.querySelector<HTMLTextAreaElement>('[data-testid="composer-input"]')!;
    input.value = "Some text long enough to preview a non-zero count";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(text('[data-testid="composer-preview"]')).not.toContain("≈ 0 tokens");

    document.querySelector<HTMLFormElement>('[data-testid="composer-form"]')!.requestSubmit();
    expect(text('[data-testid="composer-preview"]')).toBe("≈ 0 tokens");
  });

  it("recognises the fact even typed in lowercase, matching the case-insensitive recall check", () => {
    // main.ts's "has the fact ever been stated" gate and context.ts's
    // canRecall must agree on case-sensitivity, or a visitor who types the
    // fact in lowercase sees a permanent "nothing yet" even though the fact
    // is genuinely visible.
    const input = document.querySelector<HTMLTextAreaElement>('[data-testid="composer-input"]')!;
    input.value = "my name is iris";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector<HTMLFormElement>('[data-testid="composer-form"]')!.requestSubmit();

    expect(text('[data-testid="recall-answer"]')).toMatch(/iris/i);
  });

  it("moves the same DOM node across the boundary instead of recreating it", () => {
    // The eviction transition (styles.css) only has something to animate if
    // the element crossing from "still in context" to "forgotten" is the
    // same node, reused -- not a fresh one a naive create-then-destroy
    // render would produce.
    click('[data-testid="quick-add-fact"]');
    const factLi = document.querySelector('[data-testid="visible-messages"] li');
    for (let i = 0; i < 10; i++) click('[data-testid="quick-add-filler"]');
    expect(document.querySelector('[data-testid="evicted-messages"] li')).toBe(factLi);
  });

  it("reset clears the transcript and the recall test", () => {
    click('[data-testid="quick-add-fact"]');
    click('[data-testid="reset-demo"]');
    expect(document.querySelectorAll('[data-testid="visible-messages"] li')).toHaveLength(0);
    expect(text('[data-testid="recall-answer"]')).toMatch(/nothing yet/i);
  });

  it("reset also clears an unsent draft in the composer", () => {
    // The composer's own "input" listener only updates the preview when the
    // visitor types; reset has to clear both the textarea and the preview
    // itself, or an unsent draft survives a reset that zeroed everything
    // else (the transcript, the meter) right next to it.
    const input = document.querySelector<HTMLTextAreaElement>('[data-testid="composer-input"]')!;
    input.value = "an unsent draft";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(text('[data-testid="composer-preview"]')).not.toBe("≈ 0 tokens");

    click('[data-testid="reset-demo"]');

    expect(input.value).toBe("");
    expect(text('[data-testid="composer-preview"]')).toBe("≈ 0 tokens");
  });

  it("widening the window after eviction restores the forgotten fact", () => {
    // The window-size select isn't one-shot: main.ts re-renders from the
    // same history on "change", so picking a bigger window after the fact
    // has already scrolled out should bring it back rather than requiring
    // a reset.
    click('[data-testid="quick-add-fact"]');
    for (let i = 0; i < 10; i++) click('[data-testid="quick-add-filler"]');
    expect(text('[data-testid="recall-answer"]')).toMatch(/forgotten/i);

    const select = document.querySelector<HTMLSelectElement>('[data-testid="window-size-select"]')!;
    select.value = "200";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(text('[data-testid="recall-answer"]')).toMatch(/iris/i);
    expect(document.querySelectorAll('[data-testid="evicted-messages"] li')).toHaveLength(0);
  });

  // The 80-token default window makes an exact percentage easy to hit: a
  // message of N characters is ceil(N/4) tokens (see approxTokens), so
  // sending one custom message of a chosen length lands the meter at a known
  // occupancy without depending on the filler text's own length.
  function sendCustom(charLength: number): void {
    const input = document.querySelector<HTMLTextAreaElement>('[data-testid="composer-input"]')!;
    input.value = "a".repeat(charLength);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector<HTMLFormElement>('[data-testid="composer-form"]')!.requestSubmit();
  }

  function meterClasses(): DOMTokenList {
    return document.querySelector('[data-testid="token-meter-fill"]')!.classList;
  }

  it("leaves the meter unmarked well below the window's budget", () => {
    sendCustom(160); // 40 tokens of 80 -> 50%
    expect(meterClasses().contains("is-warn")).toBe(false);
    expect(meterClasses().contains("is-full")).toBe(false);
  });

  it("marks the meter as warning once usage crosses 70%", () => {
    sendCustom(240); // 60 tokens of 80 -> 75%
    expect(meterClasses().contains("is-warn")).toBe(true);
    expect(meterClasses().contains("is-full")).toBe(false);
  });

  it("marks the meter as full once usage crosses 95%", () => {
    sendCustom(312); // 78 tokens of 80 -> 97.5%
    expect(meterClasses().contains("is-full")).toBe(true);
    expect(meterClasses().contains("is-warn")).toBe(false);
  });

  it("announces a single eviction in the singular", () => {
    sendCustom(280); // 70 tokens, fits alone
    sendCustom(80); // 20 tokens; pushes the first message out on its own
    expect(text('[data-testid="eviction-announcement"]')).toMatch(/^one message just fell/i);
  });

  it("announces a simultaneous multi-message eviction in the plural", () => {
    sendCustom(40); // message A, 10 tokens
    sendCustom(40); // message B, 10 tokens
    sendCustom(300); // message C, 75 tokens; evicts A and B in the same render
    expect(text('[data-testid="eviction-announcement"]')).toMatch(/^2 messages just fell/i);
  });

  it("replaces a stale eviction announcement once widening brings messages back", () => {
    // Without this, the sr-only aria-live region would keep announcing "N
    // messages just fell out" even after widening restored them — a stale,
    // now-false claim a screen-reader user browsing the page could still
    // land on and hear.
    click('[data-testid="quick-add-fact"]');
    for (let i = 0; i < 10; i++) click('[data-testid="quick-add-filler"]');
    expect(text('[data-testid="eviction-announcement"]')).toMatch(/just fell/i);

    const select = document.querySelector<HTMLSelectElement>('[data-testid="window-size-select"]')!;
    select.value = "200";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(text('[data-testid="eviction-announcement"]')).toMatch(/became visible again/i);
  });

  it("shrinking the window via the select evicts and announces, same as an oversized message would", () => {
    // Every eviction-announcement test above triggers eviction by sending a
    // message; every restore test above triggers restoration by widening the
    // select. Nothing yet drives the select the *other* way mid-conversation
    // — narrowing it should evict exactly like a new oversized message does,
    // since both paths go through the same render()/buildContext() call.
    const select = document.querySelector<HTMLSelectElement>('[data-testid="window-size-select"]')!;
    select.value = "200";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    sendCustom(40); // message A, 10 tokens
    sendCustom(320); // message B, 80 tokens; both fit comfortably in 200
    expect(document.querySelectorAll('[data-testid="evicted-messages"] li')).toHaveLength(0);

    select.value = "80";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(text('[data-testid="eviction-announcement"]')).toMatch(/^one message just fell/i);
    expect(document.querySelectorAll('[data-testid="evicted-messages"] li')).toHaveLength(1);
    expect(document.querySelectorAll('[data-testid="visible-messages"] li')).toHaveLength(1);
  });
});
