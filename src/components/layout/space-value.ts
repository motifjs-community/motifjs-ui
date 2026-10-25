import type { LayoutSpace } from './layout-space';

const STEPS = new Set(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']);

/** One CSS value per word: a step becomes its token, a bare number pixels; `''` for nothing. */
export function spaceValue(value: LayoutSpace | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') return `${value}px`;
  return value
    .trim()
    .split(/\s+/)
    .map((word) => (STEPS.has(word) ? `var(--mx-layout-space-${word})` : /^-?\d*\.?\d+$/.test(word) ? `${word}px` : word))
    .join(' ');
}
