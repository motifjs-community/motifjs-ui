import type { CustomizerCommand } from './customizer-command';
import type { CustomizerNode } from './customizer-node';

/**
 * What the customizer changes: the owner (a menu bar, later a ribbon or a toolbar) reads its items as a tree and applies
 * each change. A change returns `false`, or `null` for an addition, when it cannot be made.
 */
export interface CustomizerSource {
  /** The items as they are now, hidden ones included. */
  nodes(): CustomizerNode[];
  /** The commands the user can add; none hides the button. */
  commands(): CustomizerCommand[];
  /** The places `id` can be moved into: the top (`''`) and the items that hold others. */
  targets(id: string): CustomizerNode[];
  canMove(id: string, step: 1 | -1): boolean;
  show(id: string, on: boolean): boolean;
  move(id: string, step: 1 | -1): boolean;
  moveInto(id: string, target: string): boolean;
  rename(id: string, text: string): boolean;
  remove(id: string): boolean;
  /** Adds a command (`command`) or a group of the user's own (`text`) to `parent`, after `after`; returns its id. */
  add(parent: string, after: string | null, what: { command?: string; text?: string }): string | null;
  /** Undoes the user's changes on `id` and inside it, or all of them with `null`. */
  reset(id: string | null): boolean;
}
