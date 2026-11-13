/** Where a part is on the screen: pixels from the top left corner of the viewport of its own window. */
export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}
