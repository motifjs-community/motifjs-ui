import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { CodeHighlighter } from '../markdown/code-highlighter';
import type { DiagramRenderer } from '../markdown/diagram-renderer';
import type { MathRenderer } from '../markdown/math-renderer';
import type { ChatComposerProps } from './chat-composer-props';
import type { ChatForkEventArgs, ChatRetryEventArgs, ChatRewindEventArgs } from './chat-history-event-args';
import type { ChatLoadOlderEventArgs } from './chat-load-older-event-args';
import type { ChatMessage } from './chat-message';
import type { ChatSendEventArgs } from './chat-send-event-args';
import type { Chat } from './Chat';

/** Props of `Chat`. Each prop is also a settable property, and a function is tracked. */
export interface ChatProps extends ControlProps {
  /**
   * The messages, oldest first. The chat keeps the array and the objects it is given: `add`, `prepend` and `remove`
   * change this array, and a reply is written into its message. Another array is another conversation; rows of messages
   * that are in both are kept.
   */
  messages?: Bind<ChatMessage[]>;
  /** There are older messages to load: near the top, and with the button above the first message. */
  hasOlder?: Bind<boolean>;
  /** The hint in the empty message box. The default is the kit's "Message". */
  placeholder?: Bind<string>;
  /** Colours the code blocks of messages drawn after it is set. */
  highlighter?: Bind<CodeHighlighter | null>;
  /** Draws the math of messages drawn after it is set (`$…$`, `$$…$$`). The default is none: `$` is text. */
  mathRenderer?: Bind<MathRenderer | null>;
  /** Draws the diagrams of messages drawn after it is set (a fenced `mermaid` block). The default is none. */
  diagramRenderer?: Bind<DiagramRenderer | null>;
  /** Where links in messages open. The default is `'_blank'`. */
  linkTarget?: Bind<string>;
  /** The accessible name of the conversation. The default is the kit's "Conversation". */
  label?: Bind<string>;
  /**
   * Props of the composer, given to it as they are: its modes, models, thinking, context meter, history and their
   * events. Its `onSend` and `onStop` are the chat's own; use the chat's.
   */
  composer?: Omit<ChatComposerProps, 'onSend' | 'onStop'>;
  /**
   * A message of the user is sent; it is added unless `e.cancel` is set. Start the reply here with `chat.reply()`. One
   * sent while a reply is written waits above the box and is sent when the replies end.
   */
  onSend?: (e: ChatSendEventArgs & { message: ChatMessage }) => void;
  /** The user stopped the reply; its `signal` is aborted already. */
  onStop?: (e: { source: Chat }) => void;
  /** Older messages are wanted: near the top, or from the button. */
  onLoadOlder?: (e: ChatLoadOlderEventArgs) => void;
  /** Occurs before the conversation goes back to before a message of the user (its rewind or edit button). Set `e.cancel` to keep it. */
  onRewind?: (e: ChatRewindEventArgs) => void;
  /** Given, a message of the user has a fork button: open another conversation with `e.messages`. */
  onFork?: (e: ChatForkEventArgs) => void;
  /** Given, a failed or stopped last reply has a button to try again: it is gone, write the new one with `chat.reply()`. */
  onRetry?: (e: ChatRetryEventArgs) => void;
}
