import type { ComponentBase } from '@motifx/core';
import type { ChatContextItem } from './chat-context-item';

/** The user turned a context item on or off (`item.on`), or took it off (`removed`: it left the array). */
export interface ChatContextChangedEventArgs {
  item: ChatContextItem;
  removed: boolean;
  source: ComponentBase;
}
