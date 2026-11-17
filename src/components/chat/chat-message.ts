import type { ChatMessageStatus } from './chat-message-status';
import type { ChatPart } from './chat-part';
import type { ChatRole } from './chat-role';

/**
 * A message of the conversation. The chat keeps the object it is given and writes a streaming reply into it (`parts`,
 * `status`, `error`), so the app holds the same message as the screen.
 */
export interface ChatMessage {
  id: string | number;
  role: ChatRole;
  parts: ChatPart[];
  /** The name shown above the message. By default, the kit's name for its role. */
  author?: string;
  time?: Date;
  /** The default is `'done'`. */
  status?: ChatMessageStatus;
  /** What went wrong, shown under a message whose status is `error`. */
  error?: string;
  /** What the user said of a reply with its buttons (`onFeedback`). */
  feedback?: ChatFeedback;
}

/** Whether a reply was good or bad, as the user said. */
export type ChatFeedback = 'good' | 'bad';
