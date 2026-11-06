import type { Bind } from '@motifx/core';

/**
 * For props whose value is itself a function, such as a field reader or a template. A function that
 * takes arguments is the value, and one without arguments is a getter, tracked like any other.
 */
export function functionValue<F>(value: Bind<F>): Bind<F> {
  return typeof value === 'function' && value.length > 0 ? () => value as F : value;
}
