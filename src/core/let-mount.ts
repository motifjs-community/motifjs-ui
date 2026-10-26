/**
 * Lets the components under `element` run `onMounted` when `element` sits in another window's
 * document. Core waits for an element to reach the page's own `document` before it calls
 * `onMounted` (CORE-REPORTS R30), so for a moment the element stands in a hidden holder of the
 * page's document: core sees it arrive there, and the element is back in place before anything
 * is painted. Content made right into a window the app opened needs it.
 */
export function letMount(element: Element): void {
  const page = typeof document === 'undefined' ? null : document;
  const parent = element.parentNode;
  if (!page?.body || !parent || element.ownerDocument === page) return;
  const next = element.nextSibling;
  const holder = page.createElement('div');
  holder.hidden = true;
  page.body.append(holder);
  holder.append(element);
  // Core's observer was told first: its record was queued before this.
  queueMicrotask(() => {
    if (element.parentNode === holder && parent.isConnected) parent.insertBefore(element, next?.parentNode === parent ? next : null);
    holder.remove();
  });
}
