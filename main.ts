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

function currentWindowSize(): number {
  return windowSelect ? Number(windowSelect.value) : 80;
}

function addMessage(text: string): void {
  const trimmed = text.trim();
  if (trimmed === "") return;
  history = [...history, { id: nextId++, role: "user", text: trimmed, tokens: approxTokens(trimmed) }];
  render();
}

function renderMessageList(target: HTMLElement | null, messages: Message[]): void {
  if (!target) return;
  target.replaceChildren(
    ...messages.map((message) => {
      const li = document.createElement("li");
      li.textContent = message.text;
      return li;
    }),
  );
}

function render(): void {
  const windowSize = currentWindowSize();
  const { visible, evicted, usedTokens } = buildContext(history, windowSize);

  renderMessageList(visibleList, visible);
  renderMessageList(evictedList, evicted);

  if (meterFill) {
    const percent = Math.min(100, (usedTokens / windowSize) * 100);
    meterFill.style.width = `${percent}%`;
    meterFill.classList.toggle("is-warn", percent >= 70 && percent < 95);
    meterFill.classList.toggle("is-full", percent >= 95);
  }
  if (meterLabel) {
    meterLabel.textContent = `${usedTokens} / ${windowSize} tokens used`;
  }

  const factEverStated = history.some((m) => m.text.includes(FACT_NEEDLE));
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
