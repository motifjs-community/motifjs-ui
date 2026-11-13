/** A browser window as the layer uses it: its own constructors (a size observer, a frame) and its own page. */
export type View = Window & typeof globalThis;
