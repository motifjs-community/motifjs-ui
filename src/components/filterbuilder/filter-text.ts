import type { data } from '@motifx-community/data';
import type { FilterBuilderModelOptions } from './filter-builder-model-options';
import { FilterBuilderModel } from './FilterBuilderModel';

/**
 * Formats a data layer filter as a single line of text, as the filter builder displays it:
 * `[City] Equals 'Ankara' And [Amount] Is greater than '100'`. The fields provide captions, formats and
 * lookup text, and an unknown field is displayed as its name in words.
 */
export function filterText(value: data.FilterExpression | null | undefined, options: FilterBuilderModelOptions = {}): string {
  return new FilterBuilderModel(() => options).filterText(value);
}
