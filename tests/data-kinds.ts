import { reactive } from '@motifx/core';

/**
 * The two kinds of data an app may hand a component: as it is, or made reactive. Every component reads both the
 * same way, so its tests run once with each: `describe.each(dataKinds)('%s data', (_, make) => …)`.
 */
export const dataKinds: [string, <T extends object>(data: T) => T][] = [
  ['plain', (data) => data],
  ['reactive', (data) => reactive(data) as typeof data],
];
