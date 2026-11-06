/** How often constructed sheets are compared: the page gives no word when it changes them. */
const SHEET_CHECK = 1000;

/**
 * Gives `target` (the document of a window the app opened) the appearance of `source`, the page: its
 * style sheets (`<link rel="stylesheet">`, `<style>` and constructed sheets) and the attributes
 * of `<html>` and `<body>` the design system reads (`data-theme`, `data-identity`, density, `dir`,
 * `lang`, classes, inline style). It keeps watching: a sheet added, changed or removed later (a
 * dev server does that), or a theme changed, shows in `target` too. Returns the function that
 * stops watching.
 */
export function mirrorPage(source: Document, target: Document): () => void {
  const copies = new Map<Element, Element>();
  const view = target.defaultView;
  const marker = target.createComment('mx-page-styles');
  target.head.append(marker);

  const isSheet = (el: Element) => el.localName === 'style' || (el.localName === 'link' && /(^|\s)stylesheet(\s|$)/i.test(el.getAttribute('rel') ?? ''));

  const syncSheets = () => {
    const wanted = [...source.querySelectorAll('link, style')].filter(isSheet);
    for (const [from, copy] of copies) {
      if (!wanted.includes(from)) {
        copy.remove();
        copies.delete(from);
      }
    }
    let after: Node = marker;
    for (const from of wanted) {
      let copy = copies.get(from);
      if (!copy) {
        copy = target.importNode(from, true) as Element;
        copies.set(from, copy);
      } else if (from.localName === 'style' && copy.textContent !== from.textContent) {
        copy.textContent = from.textContent;
      }
      if (from.localName === 'link') syncAttributes(from, copy);
      if (after.nextSibling !== copy) target.head.insertBefore(copy, after.nextSibling);
      after = copy;
    }
  };

  let adopted: CSSStyleSheet[] = [];
  let adoptedRules: number[] = [];
  const syncAdopted = () => {
    const sheets = [...(source.adoptedStyleSheets ?? [])];
    const rules = sheets.map((s) => s.cssRules.length);
    if (sheets.length === adopted.length && sheets.every((s, i) => s === adopted[i] && rules[i] === adoptedRules[i])) return;
    adopted = sheets;
    adoptedRules = rules;
    const Sheet = view?.CSSStyleSheet;
    if (typeof Sheet !== 'function' || !('adoptedStyleSheets' in target)) return;
    // A constructed sheet belongs to one document: each one is copied as text.
    target.adoptedStyleSheets = sheets.map((s) => {
      const copy = new Sheet();
      copy.replaceSync([...s.cssRules].map((r) => r.cssText).join('\n'));
      return copy;
    });
  };

  const syncRoots = () => {
    syncAttributes(source.documentElement, target.documentElement);
    if (source.body && target.body) syncAttributes(source.body, target.body);
  };

  syncSheets();
  syncAdopted();
  syncRoots();
  const Observer = source.defaultView?.MutationObserver;
  const observers: MutationObserver[] = [];
  if (typeof Observer === 'function') {
    const sheets = new Observer(syncSheets);
    sheets.observe(source.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href', 'rel', 'media', 'disabled'] });
    const roots = new Observer(syncRoots);
    roots.observe(source.documentElement, { attributes: true });
    if (source.body) roots.observe(source.body, { attributes: true });
    observers.push(sheets, roots);
  }
  const timer = setInterval(syncAdopted, SHEET_CHECK);
  return () => {
    for (const observer of observers) observer.disconnect();
    clearInterval(timer);
  };
}

/** Makes `to`'s attributes those of `from`. */
function syncAttributes(from: Element, to: Element): void {
  for (const name of to.getAttributeNames()) if (!from.hasAttribute(name)) to.removeAttribute(name);
  for (const name of from.getAttributeNames()) {
    const value = from.getAttribute(name)!;
    if (to.getAttribute(name) !== value) to.setAttribute(name, value);
  }
}
