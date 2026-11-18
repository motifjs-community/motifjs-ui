import type { CustomizerDisplay } from './customizer-display';

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
  /** A separator: it has no name to change. */
  separator?: boolean;
  /** What it shows, when the user can choose (`CustomizerSource.display`); left out otherwise. */
  display?: CustomizerDisplay;
  children: CustomizerNode[];
}
