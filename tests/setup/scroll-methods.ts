// The test document keeps scrollTop and scrollLeft but has no scroll methods: these write them as an instant scroll
// would, so a scroll the kit writes through core (the attr keys scrollTo, scrollBy, scrollIntoView) lands in a test as
// in a browser, and an element that has its own methods keeps them. Test files that run without a document skip it.

function scrollWith(el: Element, args: unknown[], by: boolean): void {
  const [first, second] = args;
  const to: ScrollToOptions = typeof first === 'number' ? { left: first, top: typeof second === 'number' ? second : undefined } : ((first as ScrollToOptions | undefined) ?? {});
  if (typeof to.left === 'number') el.scrollLeft = (by ? el.scrollLeft : 0) + to.left;
  if (typeof to.top === 'number') el.scrollTop = (by ? el.scrollTop : 0) + to.top;
}

function addMissing(name: 'scrollTo' | 'scrollBy' | 'scrollIntoView', value: (this: Element, ...args: unknown[]) => void): void {
  if (typeof (Element.prototype as unknown as Record<string, unknown>)[name] === 'function') return;
  Object.defineProperty(Element.prototype, name, { configurable: true, writable: true, value });
}

if (typeof Element !== 'undefined') {
  addMissing('scrollTo', function (...args) {
    scrollWith(this, args, false);
  });
  addMissing('scrollBy', function (...args) {
    scrollWith(this, args, true);
  });
  addMissing('scrollIntoView', () => {});
}
