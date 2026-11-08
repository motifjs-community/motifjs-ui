import type { ComponentBase } from '@motifx/core';

/** A keyboard shortcut of the app as `shortcuts.list()` reports it. */
export interface ShortcutInfo {
  /** The keys that run it now, as written: `'Mod+S'`, `'Ctrl+K W'`. The user's for its name, else `defaults`. */
  keys: readonly string[];
  /** The keys it was given. */
  defaults: readonly string[];
  /** What it does: the key of a command (`'save'`), or a component's own name for it (`'tabDocuments.closeTab'`). */
  name: string | null;
  /** How it reads in a list: the text of its command, or its name. */
  text: string;
  /** The heading a list groups it under; empty when it has none. */
  category: string;
  /** Where it works: while focus is inside this component, or app-wide (`null`). */
  scope: ComponentBase | null;
  inEditable: boolean;
  /** Whether the user can give it other keys: it has a name and was not added with `customizable: false`. */
  customizable: boolean;
}
