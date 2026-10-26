import type { data } from '@motifx-community/data';
import type { FilterBuilderModelOptions } from './filter-builder-model-options';
import { FilterBuilderModel } from './FilterBuilderModel';

/**
 * A filter of the data layer as one line of text, as the filter builder reads it:
 * `[City] Equals 'Ankara' And [Amount] Is greater than '100'`. The fields give captions, formats and
 * lookup texts; a field it does not know reads as its name in words.
 */
export function filterText(value: data.FilterExpression | null | undefined, options: FilterBuilderModelOptions = {}): string {
  return new FilterBuilderModel(() => options).filterText(value);
}
