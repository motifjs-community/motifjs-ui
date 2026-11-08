/** An item the user added in the customizer: a command of the bar's `commands`, or a menu of the user's own. */
export interface MenuBarAddedItem {
  /** Given by the bar: `user:1`, `user:2`… */
  id: string;
  /** Where it stands: the id of a menu, `''` for the bar. */
  parent: string;
  /** The key of the command in `commands`. */
  command?: string;
  /** The name of a menu of the user's own. */
  text?: string;
}
