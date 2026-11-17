import type { ComponentBase } from '@motifx/core';
import type { ChatContextItem } from './chat-context-item';

/** The arguments of a send. Set `cancel` to keep the text and the files in the box (nothing is sent). */
export interface ChatSendEventArgs {
  text: string;
  /** The files attached to it. */
  attachments: File[];
  /** The context items that go with it (those `on`). */
  contextItems: ChatContextItem[];
  cancel: boolean;
  source: ComponentBase;
}
