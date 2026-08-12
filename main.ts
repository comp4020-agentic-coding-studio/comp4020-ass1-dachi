import { approxTokens, buildContext, canRecall, type Message } from "./context";

const FACT_TEXT = "My name is Iris and I live by the harbour.";
const FACT_NEEDLE = "Iris";

const FILLER_LINES = [
  "What's the weather usually like there?",
  "Any good coffee nearby?",
  "Do you have plans this weekend?",
  "What's your favourite season, and why?",
  "Tell me something you're proud of lately.",
  "Read any good books recently?",
];

const windowSelect = document.querySelector<HTMLSelectElement>('[data-testid="window-size-select"]');
const meterFill = document.querySelector<HTMLElement>('[data-testid="token-meter-fill"]');
const meterLabel = document.querySelector<HTMLElement>('[data-testid="token-meter-label"]');
const visibleList = document.querySelector<HTMLElement>('[data-testid="visible-messages"]');
const evictedList = document.querySelector<HTMLElement>('[data-testid="evicted-messages"]');
const recallAnswer = document.querySelector<HTMLElement>('[data-testid="recall-answer"]');
const announcement = document.querySelector<HTMLElement>('[data-testid="eviction-announcement"]');
const factButton = document.querySelector<HTMLButtonElement>('[data-testid="quick-add-fact"]');
const fillerButton = document.querySelector<HTMLButtonElement>('[data-testid="quick-add-filler"]');
const resetButton = document.querySelector<HTMLButtonElement>('[data-testid="reset-demo"]');
const composerForm = document.querySelector<HTMLFormElement>('[data-testid="composer-form"]');
const composerInput = document.querySelector<HTMLTextAreaElement>('[data-testid="composer-input"]');
const composerPreview = document.querySelector<HTMLElement>('[data-testid="composer-preview"]');

let history: Message[] = [];
let nextId = 1;
let fillerIndex = 0;
let previousEvictedIds = new Set<number>();

// One <li> per message, reused across renders and moved between the two
// columns rather than torn down and recreated — that's what lets a message
// crossing the boundary actually transition (CSS below) instead of
// teleporting, which is the whole point of a demo about *watching* eviction
// happen.
const visibleEls = new Map<number, HTMLLIElement>();
const evictedEls = new Map<number, HTMLLIElement>();

function currentWindowSize(): number {
  return windowSelect ? Number(windowSelect.value) : 80;
}

function addMessage(text: string): void {
  const trimmed = text.trim();
  if (trimmed === "") return;
  history = [...history, { id: nextId++, text: trimmed, tokens: approxTokens(trimmed) }];
  render();
}

function makeMessageEl(message: Message): HTMLLIElement {
  const li = document.createElement("li");
  li.textContent = message.text;
  li.classList.add("msg-enter");
  return li;
}

// Places every message in `messages` into `target`, in order. A message
// already in `own` is left alone (no re-render, no restarted animation); one
// found in `other` has just crossed the visible/forgotten boundary and is
// moved rather than recreated, so its CSS transition actually has something
// to animate from; anything new is created fresh.
function reconcileList(
  target: HTMLElement | null,
  messages: Message[],
  own: Map<number, HTMLLIElement>,
  other: Map<number, HTMLLIElement>,
): void {
  if (!target) return;
  for (const message of messages) {
    let li = own.get(message.id);
    if (!li) {
      const moved = other.get(message.id);
      if (moved) {
        other.delete(message.id);
        li = moved;
      } else {
        li = makeMessageEl(message);
      }
      own.set(message.id, li);
    }
    target.append(li);
  }
}

function dropStale(own: Map<number, HTMLLIElement>, keepIds: Set<number>): void {
  for (const [id, li] of own) {
    if (!keepIds.has(id)) {
      li.remove();
      own.delete(id);
    }
  }
}

function render(): void {
  const windowSize = currentWindowSize();
  const { visible, evicted, usedTokens } = buildContext(history, windowSize);

  reconcileList(visibleList, visible, visibleEls, evictedEls);
  reconcileList(evictedList, evicted, evictedEls, visibleEls);
  dropStale(visibleEls, new Set(visible.map((m) => m.id)));
  dropStale(evictedEls, new Set(evicted.map((m) => m.id)));

  if (meterFill) {
    const percent = Math.min(100, (usedTokens / windowSize) * 100);
    meterFill.style.width = `${percent}%`;
    meterFill.classList.toggle("is-warn", percent >= 70 && percent < 95);
    meterFill.classList.toggle("is-full", percent >= 95);
  }
  if (meterLabel) {
    meterLabel.textContent = `${usedTokens} / ${windowSize} tokens used`;
  }

  const needle = FACT_NEEDLE.toLowerCase();
  const factEverStated = history.some((m) => m.text.toLowerCase().includes(needle));
  if (recallAnswer) {
    if (!factEverStated) {
      recallAnswer.textContent = "Nothing yet — try “Tell it your name” below.";
      recallAnswer.classList.remove("is-known", "is-forgotten");
    } else if (canRecall(visible, FACT_NEEDLE)) {
      recallAnswer.textContent = "Iris. (Still inside the context window.)";
      recallAnswer.classList.add("is-known");
      recallAnswer.classList.remove("is-forgotten");
    } else {
      recallAnswer.textContent =
        "I don't know — that fact is outside the current context window, so it's been forgotten.";
      recallAnswer.classList.add("is-forgotten");
      recallAnswer.classList.remove("is-known");
    }
  }

  const evictedIds = new Set(evicted.map((m) => m.id));
  const newlyEvicted = evicted.filter((m) => !previousEvictedIds.has(m.id));
  if (announcement && newlyEvicted.length > 0) {
    announcement.textContent =
      newlyEvicted.length === 1
        ? "One message just fell out of the context window."
        : `${newlyEvicted.length} messages just fell out of the context window.`;
  }
  previousEvictedIds = evictedIds;
}

factButton?.addEventListener("click", () => {
  addMessage(FACT_TEXT);
});

fillerButton?.addEventListener("click", () => {
  const line = FILLER_LINES[fillerIndex % FILLER_LINES.length];
  fillerIndex++;
  addMessage(line);
});

resetButton?.addEventListener("click", () => {
  history = [];
  nextId = 1;
  fillerIndex = 0;
  previousEvictedIds = new Set();
  if (announcement) announcement.textContent = "";
  render();
});

composerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!composerInput) return;
  addMessage(composerInput.value);
  composerInput.value = "";
  if (composerPreview) composerPreview.textContent = "≈ 0 tokens";
});

composerInput?.addEventListener("input", () => {
  if (composerPreview) {
    composerPreview.textContent = `≈ ${approxTokens(composerInput.value)} tokens`;
  }
});

windowSelect?.addEventListener("change", render);

render();
