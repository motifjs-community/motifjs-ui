import type { CustomizerCommand } from './customizer-command';
import type { CustomizerDisplay } from './customizer-display';
import type { CustomizerNode } from './customizer-node';

/**
 * What the customizer changes: the owner (a menu bar, a toolbar) reads its items as a tree and applies each change. A
 * change returns `false`, or `null` for an addition, when it cannot be made. The owner also says what it offers beyond
 * that (groups of the user's own, separators, what an item shows); the window shows the buttons for those only.
 */
export interface CustomizerSource {
  /** The user can add groups of their own and move items into them. The default is `true`; `false` for a flat list. */
  groups?: boolean;
  /** The user can add separators. The default is `false`. */
  separators?: boolean;
  /** Sets what an item shows; without it, the window does not offer the choice. */
  display?(id: string, display: CustomizerDisplay): boolean;
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
  /**
   * Adds a command (`command`), a group of the user's own (`text`) or a separator (`separator`) to `parent`, after
   * `after`; returns its id.
   */
  add(parent: string, after: string | null, what: { command?: string; text?: string; separator?: boolean }): string | null;
  /** Undoes the user's changes on `id` and inside it, or all of them with `null`. */
  reset(id: string | null): boolean;
}
