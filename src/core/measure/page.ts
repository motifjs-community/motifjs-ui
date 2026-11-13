/** The page of a window: its viewport without the scroll bars, how far it is scrolled and its direction. */
export interface Page {
  readonly width: number;
  readonly height: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;
  /** From the inline start (never negative, right to left too) and from the top. */
  readonly scrollStart: number;
  readonly scrollTop: number;
  readonly rtl: boolean;
}
