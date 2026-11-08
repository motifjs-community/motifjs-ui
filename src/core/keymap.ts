/**
 * The keys the user gave to keyboard shortcuts, by the shortcut's name (the key of a command, or a component's own name
 * such as `tabDocuments.closeTab`): they take the place of the shortcut's own keys, and an empty list leaves it without
 * keys. A plain object, to save and give back.
 */
export type Keymap = Readonly<Record<string, readonly string[]>>;
