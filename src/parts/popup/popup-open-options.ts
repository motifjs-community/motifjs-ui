/** The options of `Popup.open`, besides the anchor. */
export interface PopupOpenOptions {
  /** The element that opens and closes the popup (a click on it is not "outside"). The default is the anchor. */
  toggle?: Element;
  /** The element that receives focus when the popup closes with focus inside. The default is the toggle. */
  returnFocus?: HTMLElement;
}
