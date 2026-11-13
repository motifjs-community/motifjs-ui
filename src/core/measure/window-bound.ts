/** What the layer holds for a component in the window it is in now: an observation, a listener, a frame loop. */
export interface WindowBound {
  /** Starts in the window the component is in now. */
  attach(): void;
  /** Stops what `attach` started: the component left the page or the window. */
  detach(): void;
  /** The component is in a page: mounted, shown again, or moved (`moved`: into another window). */
  arrived(moved: boolean): void;
  /** Ends it for good. */
  stop(): void;
}
