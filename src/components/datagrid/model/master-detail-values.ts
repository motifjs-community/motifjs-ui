import type { DetailContext } from '../detail-context';

/** The `masterDetail` options as the grid reads them: values, not getters. */
export interface MasterDetailValues<T> {
  enabled: boolean;
  autoExpandAll: boolean;
  template: ((ctx: DetailContext<T>) => unknown) | undefined;
  canExpand: boolean | ((row: T) => boolean);
  keepDetails: boolean;
  height: number | ((row: T) => number) | undefined;
  estimatedHeight: number;
  keepLimit: number;
  columnWidth: number;
  toggleKeys: readonly string[];
  arrowKeys: boolean;
}
