/** Named steps of the design system's spacing scale (a 4px grid), each a `--mx-space-*` token. */
export type SpaceStep = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * A spacing value: a named token step (`'md'`), a number of pixels (`12`), or
 * any CSS length (`'1.5rem'`, `'calc(…)'`, `'var(--my-gap)'`). A string may
 * hold up to four parts like CSS shorthand: `'md lg'`, `'0 xs'`.
 */
export type Space = SpaceStep | number | (string & {});

/** A size: a number of pixels or any CSS length. */
export type Length = number | (string & {});

const STEPS: Record<SpaceStep, string> = {
  none: '0',
  xxs: 'var(--mx-space-1)',
  xs: 'var(--mx-space-2)',
  sm: 'var(--mx-space-3)',
  md: 'var(--mx-space-4)',
  lg: 'var(--mx-space-6)',
  xl: 'var(--mx-space-8)',
  xxl: 'var(--mx-space-12)',
};

/** CSS for a {@link Length}: numbers become pixels, strings pass through. */
export function toLength(value: Length | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return typeof value === 'number' ? `${value}px` : value;
}

/** CSS for a {@link Space}: steps become tokens, numbers pixels, each part of a shorthand on its own. */
export function toSpace(value: Space | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') return `${value}px`;
  // Split only on top-level spaces so `calc(1rem + 2px)` stays one part.
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value.trim()) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ' ' && depth === 0) {
      if (current) parts.push(current);
      current = '';
    } else current += ch;
  }
  if (current) parts.push(current);
  return parts.map((p) => STEPS[p as SpaceStep] ?? (/^-?\d*\.?\d+$/.test(p) ? `${p}px` : p)).join(' ');
}
