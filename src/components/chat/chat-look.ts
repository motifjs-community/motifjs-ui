import type { CodeHighlighter } from '../markdown/code-highlighter';
import type { ChatMessage } from './chat-message';
import type { ChatAnswer, ChatQuestionsPart, ChatRequestPart } from './chat-request';
import type { ChatTurn } from './chat-turn';

/** What the parts of a turn take from the chat when they are made, and where the user's answers go. */
export interface ChatLook {
  highlighter: CodeHighlighter | null;
  linkTarget: string;
  /** A time of day, as the chat writes it in the kit language. */
  time(date: Date): string;
  /** The user answered a request drawn in the flow. */
  answer(part: ChatRequestPart, answer: ChatAnswer): void;
  /** The user wants to answer questions: the form under the conversation takes the focus. */
  ask(part: ChatQuestionsPart): void;
  /** The user goes back to before `message`, its text back in the box. */
  rewind(message: ChatMessage): void;
  /** The user sends `text` in place of `message`. */
  resend(message: ChatMessage, text: string): void;
  /** Set when the app takes forks: the user starts another conversation from `message`. */
  fork: ((message: ChatMessage) => void) | null;
  /** Set when the app takes retries: the user asks again for the reply `message`, which failed or stopped. */
  retry: ((message: ChatMessage) => void) | null;
  /** `turn` is the conversation's last: its reply can be tried again. */
  isLatest(turn: ChatTurn): boolean;
}
