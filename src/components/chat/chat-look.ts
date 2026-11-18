import type { CodeHighlighter } from '../markdown/code-highlighter';
import type { DiagramRenderer } from '../markdown/diagram-renderer';
import type { MathRenderer } from '../markdown/math-renderer';
import type { ChatFeedback, ChatMessage } from './chat-message';
import type { ChatRequestPart } from './chat-request';
import type { ChatTurn } from './chat-turn';

/** What the parts of a turn take from the chat when they are made, and what they ask of it. */
export interface ChatLook {
  highlighter: CodeHighlighter | null;
  mathRenderer: MathRenderer | null;
  diagramRenderer: DiagramRenderer | null;
  linkTarget: string;
  /** A code block longer than this many lines is folded to them; `0` folds none. */
  codeLines: number;
  /** A time of day, as the chat writes it in the kit language. */
  time(date: Date): string;
  /** The user wants to answer a request waiting in the flow: what is in the composer's place takes the focus. */
  ask(part: ChatRequestPart): void;
  /** The user goes back to before `message`, its text back in the box. */
  rewind(message: ChatMessage): void;
  /** The user sends `text` in place of `message`. */
  resend(message: ChatMessage, text: string): void;
  /** Set when the app takes forks: the user starts another conversation from `message`. */
  fork: ((message: ChatMessage) => void) | null;
  /** Set when the app takes retries: the user asks again for the reply `message`, which failed or stopped. */
  retry: ((message: ChatMessage) => void) | null;
  /** Set when the app takes regenerations: the user asks for another reply in the place of `message`. */
  regenerate: ((message: ChatMessage) => void) | null;
  /** Set when the app takes feedback: the user says the reply `message` was good or bad, or takes it back. */
  feedback: ((message: ChatMessage, feedback: ChatFeedback | null) => void) | null;
  /** `turn` is the conversation's last: its reply can be tried again. */
  isLatest(turn: ChatTurn): boolean;
}
