import type { FilterBuilder } from '../filterbuilder/FilterBuilder';
import type { MxForm } from '../form/MxForm';

/** The filter builder opened: the builder and its window. */
export interface GridFilterBuilderOpenedEventArgs {
  readonly builder: FilterBuilder;
  readonly window: MxForm;
}
