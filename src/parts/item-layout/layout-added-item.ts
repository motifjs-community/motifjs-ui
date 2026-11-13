/** An item the user added: a command, a group of the user's own (in a tree) or a separator (in a flat list). */
export interface LayoutAddedItem {
  /** Given by the owner: `user:1`, `user:2`… */
  id: string;
  /** Where it stands: the id of a group, `''` for the top. */
  parent: string;
  /** The key of the command. */
  command?: string;
  /** The name of a group of the user's own. */
  text?: string;
  /** A separator. */
  separator?: boolean;
}
