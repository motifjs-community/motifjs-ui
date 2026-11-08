import type { ComponentBase } from '@motifx/core';
import type { Command } from './command';

export interface CommandRunEventArgs {
  command: Command;
  /** The item that named it, `null` when its keys or `commands.run` ran it. */
  item: unknown;
  /** The component of that item, or the command's scope. */
  source: ComponentBase | null;
  /** The click or the key press; `null` when it ran programmatically. */
  event: Event | null;
}
