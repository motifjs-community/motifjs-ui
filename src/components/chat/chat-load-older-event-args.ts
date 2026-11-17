import type { Chat } from './Chat';
import type { ChatMessage } from './chat-message';

/**
 * The arguments of `onLoadOlder`. Add the older messages with `chat.prepend()`, then call `release()` or set `promise`.
 * A promise that rejects, or `fail()`, shows the button to try again.
 */
export interface ChatLoadOlderEventArgs {
  /** The oldest message shown: load what came before it. `null` when there is none. */
  before: ChatMessage | null;
  /** Ends the loading. `done = true` says there is nothing older, and the chat stops asking. */
  release: (done?: boolean) => void;
  /** The loading failed: the chat offers to try again. */
  fail: () => void;
  /** A promise to wait for: the loading ends when it settles. */
  promise?: Promise<unknown>;
  source: Chat;
}
