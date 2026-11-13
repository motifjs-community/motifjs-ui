import type { Bind, ComponentBase } from '@motifx/core';
import type { Chord } from './chord';
import type { ShortcutHandler } from './shortcut-handler';

/** A shortcut as `addShortcut` keeps it. */
export interface ShortcutRegistration {
  /** The keys it was given. */
  defaults: readonly string[];
  /** The keys that run it now: the user's for its name, else `defaults`. */
  keys: readonly string[];
  /** Each of `keys` read, in the same order: one chord, or the chords pressed one after the other. */
  sequences: Chord[][];
  handler: ShortcutHandler;
  scope: ComponentBase | null;
  /** The parts of the scope focus must be in (`within`), or `null`. */
  within: Bind<ComponentBase | readonly ComponentBase[]> | null;
  inEditable: boolean;
  name: string | null;
  text: string | (() => string) | null;
  category: string | (() => string) | null;
  customizable: boolean;
}
