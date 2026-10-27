/** A CSS length (`'20rem'`, `'50%'`, `'var(--x)'`) in pixels, as a block size inside `within`; a number is pixels already. */
export function cssLength(within: HTMLElement, value: number | string, axis: 'block' | 'inline' = 'block'): number {
  if (typeof value === 'number') return value;
  const probe = within.ownerDocument.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.setProperty(axis === 'block' ? 'block-size' : 'inline-size', value);
  within.append(probe);
  const box = probe.getBoundingClientRect();
  probe.remove();
  return axis === 'block' ? box.height : box.width;
}
