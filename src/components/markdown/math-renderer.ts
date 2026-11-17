/**
 * The door for math: `$…$` in a line, and `$$…$$` and ```` ```math ```` blocks. The TeX shows as it arrives; once it
 * is complete the door draws it, and the element it gives (KaTeX's, MathJax's) takes its place as it is. `null` keeps
 * the TeX as written. Without a door, `$` is text.
 *
 * @example
 * const math: MathRenderer = {
 *   render(tex, display) {
 *     const host = document.createElement('span');
 *     katex.render(tex, host, { displayMode: display, throwOnError: false });
 *     return host;
 *   }
 * };
 */
export interface MathRenderer {
  /** Draws `tex`: a block of its own when `display`, in the line otherwise. */
  render(tex: string, display: boolean): Element | null;
}
