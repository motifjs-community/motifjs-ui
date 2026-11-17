/**
 * What a model's stream gives, once read. Most providers send these five things, each in its own words: your server,
 * or the provider's SDK, turns its events into them, and the chat never sees the provider.
 */
export type ModelEvent =
  | { type: 'thinking'; delta: string }
  | { type: 'text'; delta: string }
  | { type: 'tool-start'; id: string; name: string }
  | { type: 'tool-args'; id: string; delta: string }
  | { type: 'tool-end'; id: string };

/** A call the model made: its arguments as JSON text. */
export interface ModelCall {
  id: string;
  name: string;
  args: string;
}

/** The conversation as the model reads it: what the user said, what the model said and called, what each call returned. */
export type ModelMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; calls: ModelCall[] }
  | { role: 'tool'; id: string; result: string };

/** A request that failed; `retryable`: it may work if sent again (the provider was busy, the network dropped). */
export class ModelError extends Error {
  constructor(message: string, readonly retryable = false) {
    super(message);
  }
}

/** A model: one request, and its events as they arrive. `signal` cancels it; a failure throws a `ModelError`. */
export interface Model {
  stream(history: readonly ModelMessage[], signal: AbortSignal): AsyncIterable<ModelEvent>;
}
