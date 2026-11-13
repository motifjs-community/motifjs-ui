/** A group's tab row as read for its scroll buttons, its thin scrollbar and the count of tabs out of sight. */
export interface StripRoom {
  /** The width of all the tabs that scroll, and the room they have. */
  needed: number;
  room: number;
  /** How far the row is scrolled from its start. */
  position: number;
  /** The tabs not fully in sight. */
  hidden: number;
  /** Where the row starts in the strip, from its inline start, and how wide it is. */
  trackStart: number;
  trackSize: number;
}
