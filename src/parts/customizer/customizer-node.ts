/** An item in the customizer's tree. */
export interface CustomizerNode {
  id: string;
  /** The id of the item it stands in, `''` at the top. */
  parent: string;
  text: string;
  shown: boolean;
  /** Stays shown and in its place: it cannot be hidden, moved or renamed. */
  fixed: boolean;
  /** Items can be put in it. */
  holds: boolean;
  /** Added by the user, so it can be deleted. */
  added: boolean;
  children: CustomizerNode[];
}
