import type { Keymap } from "../../core/keymap";

export interface ShortcutEditorKeysChangedEventArgs {
    /** The name of the shortcut, or `null` when every shortcut was given its own keys again. */
    name: string | null;
    /** The keys of the shortcut now. Empty when `name` is `null`. */
    keys: readonly string[];
    /** The keys the user gave so far (`shortcuts.keymap`), to save. */
    keymap: Keymap;
}
