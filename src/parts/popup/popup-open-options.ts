/** What `Popup.open` takes besides the anchor. */
export interface PopupOpenOptions {
  /** The element that opens and closes the popup (a press on it is not "outside"); the anchor by default. */
  toggle?: Element;
  /** Gets focus back when the popup closes with focus inside; the toggle by default. */
  returnFocus?: HTMLElement;
}
