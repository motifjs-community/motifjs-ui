/** An item the user added to a toolbar: a command, or a separator. */
export interface ToolbarAddedItem {
  /** Given by the toolbar: `user:1`, `user:2`… */
  id: string;
  /** The key of the command. */
  command?: string;
  /** A separator. */
  separator?: boolean;
}
