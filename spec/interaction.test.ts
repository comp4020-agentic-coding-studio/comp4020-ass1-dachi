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
});
