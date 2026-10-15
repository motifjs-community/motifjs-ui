let locks = 0;
let savedOverflow = '';
let savedPaddingRight = '';

/**
 * Locks page scrolling (reference counted: two open modal forms keep one lock)
 * and compensates the scrollbar width so the page does not shift. Returns a
 * release function that is safe to call more than once.
 */
export function lockScroll(): () => void {
  if (++locks === 1) {
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    savedOverflow = root.style.overflow;
    savedPaddingRight = root.style.paddingRight;
    root.style.overflow = 'hidden';
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) {
      const root = document.documentElement;
      root.style.overflow = savedOverflow;
      root.style.paddingRight = savedPaddingRight;
    }
  };
}
