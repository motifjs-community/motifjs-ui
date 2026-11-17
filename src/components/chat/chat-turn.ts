import type { ChatMessage } from './chat-message';

/**
 * A turn of the conversation: a message of the user and what came after it, up to the next one. The chat keeps only
 * turns near the view on the page; a turn far from it is these messages alone, and is drawn again from them.
 */
export interface ChatTurn {
  messages: ChatMessage[];
}
