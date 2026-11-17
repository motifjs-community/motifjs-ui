import type { IconSource } from '../../core/icon-source';

/**
 * Something the app adds to the next message by itself, shown as a chip among the composer's tools: the open file, a
 * selection. The user can leave it out (the chip toggles `on`) or take it off.
 */
export interface ChatContextItem {
  label: string;
  /** By default a file glyph. */
  icon?: IconSource;
  /** It goes with the message. The default is `true`. */
  on?: boolean;
  /** The app's own data for it: a path, a range. */
  data?: unknown;
}
