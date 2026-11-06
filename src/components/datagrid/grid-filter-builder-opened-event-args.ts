import type { FilterBuilder } from '../filterbuilder/FilterBuilder';
import type { MxForm } from '../form/MxForm';

/** Occurs after the filter builder opens, with the builder and its window. */
export interface GridFilterBuilderOpenedEventArgs {
  readonly builder: FilterBuilder;
  readonly window: MxForm;
}
