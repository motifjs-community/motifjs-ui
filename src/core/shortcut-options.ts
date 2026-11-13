import type { Bind, ComponentBase } from '@motifx/core';

/** The options of `addShortcut`, besides the keys and the handler. */
export interface ShortcutOptions {
  /**
   * Limits the shortcut to times when focus is inside this component and it is
   * enabled. Without it, the shortcut is application-wide.
   */
  scope?: ComponentBase;
  /**
   * Limits the shortcut further to times when focus is inside one of these parts of the scope, such as the tabs of a
   * strip or a splitter: one component, a list of them, or a function that gives them as they are now. Shortcuts of
   * different parts of the same scope may share keys.
   */
  within?: Bind<ComponentBase | readonly ComponentBase[]>;
  /**
   * Also enables the shortcut in text fields. By default, a chord without Ctrl, Alt
   * or Meta (Delete, a letter, Escape…) does not fire in text fields. Function keys
   * and chords with those modifiers always work.
   */
  inEditable?: boolean;
  /**
   * What it does: the key of a command, or a component's own name for it (`tabDocuments.closeTab`). A shortcut with a
   * name takes the keys the user gave to that name (`shortcuts.keymap`) in place of its own, and shortcuts with the same
   * name share them.
   */
  name?: string;
  /** How it reads in a list of shortcuts. The default is `name`. */
  text?: string | (() => string);
  /** The heading a list of shortcuts groups it under, such as `File`. */
  category?: string | (() => string);
  /** Whether the user's keys take the place of its own. The default is `true`; without a name it never is. */
  customizable?: boolean;
}
