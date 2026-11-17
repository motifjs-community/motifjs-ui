import type { ComponentBase } from '@motifx/core';
import type { ChatMessage } from './chat-message';

/** The conversation goes back to before `message` (a message of the user): `removed` are it and what came after it. Set `cancel` to keep them. */
export interface ChatRewindEventArgs {
  message: ChatMessage;
  removed: ChatMessage[];
  cancel: boolean;
  source: ComponentBase;
}

/** The user starts another conversation from `message`: `messages` are those before it, for the new conversation to open with. */
export interface ChatForkEventArgs {
  message: ChatMessage;
  messages: ChatMessage[];
  source: ComponentBase;
}

/** The user tries the reply `message` again, which failed or stopped: it is gone; write the new one with `reply()`. */
export interface ChatRetryEventArgs {
  message: ChatMessage;
  /** The user's message it answered, when the turn has one. */
  question: ChatMessage | null;
  source: ComponentBase;
}
