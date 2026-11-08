import type { Bind } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { ShortcutInfo } from "../../core/shortcut-info";
import type { ShortcutEditorKeysChangedEventArgs } from "./shortcut-editor-keys-changed-event-args";

/** Props of `ShortcutEditor`. Each prop is also a settable property, and a function is tracked. */
export interface ShortcutEditorProps extends ControlProps {
    /** Which shortcuts are listed. By default, every one the user can change (`customizable`). */
    filter?: Bind<((shortcut: ShortcutInfo) => boolean) | null>;
    /** Lists the shortcuts under their categories. The default is `true`. */
    grouped?: Bind<boolean>;
    /** A search field above the list. The default is `true`. */
    searchEnabled?: Bind<boolean>;
    /** The button that gives every shortcut its own keys again. The default is `true`. */
    resetAllEnabled?: Bind<boolean>;
    /** The height, as a CSS length. By default, it fills the height of its parent. */
    height?: Bind<string | null>;
    /** The accessible name. The default is a kit string ("Keyboard shortcuts"). */
    label?: Bind<string>;
    /** Occurs after the user gives a shortcut other keys, takes them away or gives it its own again. */
    onKeysChanged?: (e: ShortcutEditorKeysChangedEventArgs) => void;
}
