import type { Bind } from '@motifx/core';

/**
 * For props whose value is itself a function (a field reader, a template): a function that takes
 * arguments is the value; one without arguments is a getter, followed like any other.
 */
export function functionValue<F>(value: Bind<F>): Bind<F> {
  return typeof value === 'function' && value.length > 0 ? () => value as F : value;
}
