import type { Keymap } from './keymap';

export interface KeymapChangedEventArgs {
  /** The keys the user gave so far, to save. */
  keymap: Keymap;
  /** The name of the shortcut whose keys changed, or `null` when the whole keymap was given. */
  name: string | null;
}
