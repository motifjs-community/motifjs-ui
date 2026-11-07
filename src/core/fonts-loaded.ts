/** Calls `loaded` when fonts of the page of `el` finish loading: text measured before then may have changed size. Returns the function that stops it. */
export function onFontsLoaded(el: Element, loaded: () => void): () => void {
  const fonts = el.ownerDocument.fonts as FontFaceSet | undefined;
  if (!fonts || typeof fonts.addEventListener !== 'function') return () => {};
  fonts.addEventListener('loadingdone', loaded);
  return () => fonts.removeEventListener('loadingdone', loaded);
}
