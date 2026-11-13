import type { Bind, ComponentBase } from '@motifx/core';
import type { CommandRunEventArgs } from './command-run-event-args';
import type { IconSource } from './icon-source';

/**
 * A command of the app, defined once: menus, toolbars and ribbons name it by `key` (`command: 'save'`) and take from it
 * what they are not given, and its `shortcut` runs it. Every field except `key`, `shortcut`, `run`, `scope` and `data`
 * accepts a value or a function.
 */
export interface Command {
  /** Names the command. Several commands may share a key in different scopes, such as `'save'` in each document. */
  key: string;
  /** The text. `&` marks the access key. */
  text?: Bind<string>;
  /** A longer description, shown as a tooltip. */
  hint?: Bind<string>;
  /** An image address or a component; a component as a function, so a menu copy gets its own (see `IconSource`). */
  icon?: Bind<IconSource | null | undefined>;
  /** The name of a glyph, for the items that take one. */
  glyph?: Bind<string>;
  /** The keys that run it: `'Mod+S'`, or several. See `addShortcut` for the syntax. */
  shortcut?: string | readonly string[];
  /** `false` dims the items that name it, and its keys do nothing. The default is `true`. */
  enabled?: Bind<boolean>;
  /** Shows the items that name it checked or not; `undefined` makes them plain items. */
  checked?: Bind<boolean | undefined>;
  /** `false` hides the items that name it. The default is `true`. */
  visible?: Bind<boolean>;
  /** A heading that lists group commands under, such as `'File'`. */
  category?: Bind<string>;
  /**
   * Limits the command and its keys to times when focus is inside this component, and takes the command away when the
   * component is disposed. Without it, it is app-wide.
   */
  scope?: ComponentBase | null;
  /** Its keys work in text fields too (see `addShortcut`). */
  inEditable?: boolean;
  /** Runs the command: from an item that names it, or from its keys. */
  run?: (e: CommandRunEventArgs) => void;
  /** Custom data for the command. */
  data?: unknown;
}
