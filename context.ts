// Pure simulation logic for the context-window mechanic, kept free of the
// DOM so it can be unit tested directly and reused by main.ts.

export interface Message {
  id: number;
  text: string;
  tokens: number;
}

// A token is commonly approximated as ~4 characters of English text (the
// same rule of thumb model vendors publish); this keeps the demo honest
// about being an approximation rather than a real BPE vocabulary.
export function approxTokens(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export interface ContextState {
  visible: Message[];
  evicted: Message[];
  usedTokens: number;
}

// Given the full message history in arrival order and a fixed window size
// (in tokens), evict the oldest messages until the remainder fits — the
// same first-in-first-out truncation a fixed context window forces.
export function buildContext(history: Message[], windowSize: number): ContextState {
  const visible: Message[] = [];
  const evicted: Message[] = [];
  let used = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    if (used + message.tokens <= windowSize) {
      visible.unshift(message);
      used += message.tokens;
    } else {
      evicted.unshift(message);
    }
  }

  return { visible, evicted, usedTokens: used };
}

// A tiny recall test: can a fact stated once still be found in what's
// visible? Used to make eviction's consequence concrete rather than
// abstract — "5 evicted messages" doesn't land the way "it forgot your
// name" does.
export function canRecall(visible: Message[], needle: string): boolean {
  const lower = needle.toLowerCase();
  return visible.some((m) => m.text.toLowerCase().includes(lower));
}
