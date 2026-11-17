/** A command the user runs from the box: `/name` at its start, picked from the menu that `/` opens. */
export interface ChatCommand {
  /** Without the `/`. */
  name: string;
  /** What it does, in a line. */
  description?: string;
}
