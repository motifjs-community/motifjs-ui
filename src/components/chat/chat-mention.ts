import type { ComponentBase } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** What the app suggests after `@`: a file, a symbol, a person. */
export interface ChatMention {
  label: string;
  /** What goes in the text after `@`; by default `label`. */
  value?: string;
  /** A dimmer line beside the label: a folder. */
  description?: string;
  icon?: IconSource;
}

/**
 * The user writes after `@`: give what fits `query` in `items`, or a promise of them in `promise`. The menu shows the
 * answer to the latest query only; with neither, it closes.
 */
export interface ChatMentionEventArgs {
  query: string;
  items?: readonly ChatMention[];
  promise?: Promise<readonly ChatMention[]>;
  source: ComponentBase;
}
