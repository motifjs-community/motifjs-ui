import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ChatComposer } from './ChatComposer';
import type { ChatCommand } from './chat-command';
import type { ChatContextChangedEventArgs } from './chat-context-changed-event-args';
import type { ChatContextItem } from './chat-context-item';
import type { ChatMentionEventArgs } from './chat-mention';
import type { ChatOption } from './chat-option';
import type { ChatSendEventArgs } from './chat-send-event-args';
import type { ChatValueChangedEventArgs } from './chat-value-changed-event-args';

/** Props of `ChatComposer`. Each prop is also a settable property, and a function is tracked. */
export interface ChatComposerProps extends ControlProps {
  /** The hint in the empty box. The default is the kit's "Message". */
  placeholder?: Bind<string>;
  /** A reply is being written: the send button becomes a stop button, and what Enter sends is queued by the chat. */
  busy?: Bind<boolean>;
  /** The most lines the box grows to before it scrolls. The default is `8`. */
  maxRows?: Bind<number>;
  /**
   * Files can be attached: picked with the attach button, pasted or dropped. Each shows as a chip above the box, and
   * they go with the message (`e.attachments`). The default is `false`.
   */
  attachments?: Bind<boolean>;
  /** The files taken, as the browser's file input reads it: `.pdf`, `image/png`, `image/*`, comma-separated. The default is any. */
  accept?: Bind<string>;
  /**
   * What the app adds to the next message by itself (the open file, a selection), as chips among the tools. The
   * composer keeps the array and its objects: a chip's toggle writes `on`, its remove button takes the item out.
   */
  contextItems?: Bind<ChatContextItem[]>;
  /** The commands `/` lists: typed at the start of the box, or from the commands button. */
  commands?: Bind<readonly ChatCommand[]>;
  /** The ways the model can work, as the app names them ("Ask before edits", "Plan"). With them a button shows the one in use, and Shift+Tab in the box goes to the next. */
  modes?: Bind<readonly ChatOption[]>;
  /** The `value` of the mode in use; by default the first. The user changes it (`onModeChanged`). */
  mode?: Bind<string>;
  /** The models the user can pick; with them a button shows the one in use. */
  models?: Bind<readonly ChatOption[]>;
  /** The `value` of the model in use; by default the first. The user changes it (`onModelChanged`). */
  model?: Bind<string>;
  /** Whether the model thinks first. Set, the model's menu has a check box for it (`onThinkingChanged`). */
  thinking?: Bind<boolean>;
  /** How full the model's context is, from `0` to `1`. Set, a ring shows it with its percent; `null` hides it. */
  usage?: Bind<number | null>;
  /** What was sent before, oldest first: Arrow Up at the start of the box brings it back. What is sent is added. */
  history?: Bind<readonly string[]>;
  /** Occurs when the user sends the text (Enter, or the send button). */
  onSend?: (e: ChatSendEventArgs) => void;
  /** Occurs when the user stops the reply (the stop button, or Escape while busy). */
  onStop?: (e: { source: ChatComposer }) => void;
  /** Occurs when the user turns a context item on or off, or takes it off. */
  onContextChanged?: (e: ChatContextChangedEventArgs) => void;
  /** Occurs when the user writes after `@`: give what fits `e.query` in `e.items`, or a promise of them in `e.promise`. */
  onMention?: (e: ChatMentionEventArgs) => void;
  /** Occurs when the user picks another mode (the menu, or Shift+Tab). */
  onModeChanged?: (e: ChatValueChangedEventArgs<string>) => void;
  /** Occurs when the user picks another model. */
  onModelChanged?: (e: ChatValueChangedEventArgs<string>) => void;
  /** Occurs when the user turns thinking on or off. */
  onThinkingChanged?: (e: ChatValueChangedEventArgs<boolean>) => void;
}
