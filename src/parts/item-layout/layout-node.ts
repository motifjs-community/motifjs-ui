/** An item as the user arranged it. */
export interface LayoutNode<I> {
  /** Its name in the customization: its place in the items given, or the id given to an item the user added. */
  id: string;
  key: string;
  /** Where it stands now: the keys along the way, joined with `/`. */
  path: string;
  /** The id of its group, `''` for the top. */
  parent: string;
  /** As the app gave it: an item, a command, a group of the user's own or a separator the user added. */
  item: I;
  /** As it is drawn: `item`, or a copy with the user's changes. */
  drawn: I;
  hidden: boolean;
  /** `customizable: false`: it stays shown and in its place. */
  fixed: boolean;
  /** Added by the user. */
  added: boolean;
  /** A separator the user added. */
  separator: boolean;
  /** Has items of its own that others can be put in. */
  holds: boolean;
  children(): LayoutNode<I>[];
}
