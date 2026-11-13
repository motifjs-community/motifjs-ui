/** Return `false` from a handler to pass the key on, to a less specific shortcut and then the page. */
export type ShortcutHandler = (e: KeyboardEvent) => void | boolean;
