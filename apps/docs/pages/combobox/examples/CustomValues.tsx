import { reactive } from '@motifx/core';
import { Autocomplete, ComboBox } from '@motifx-community/ui';
import { cities } from './cities';

/** A combo box that takes text matching no item, and an Autocomplete whose value is the text itself. */
export default function CustomValues() {
  const form = reactive({ tag: '', query: '' });
  return (
    <>
      <ComboBox label="Tag" items={['bug', 'feature', 'docs']} acceptCustomValue x-model={() => form.tag} />
      <Autocomplete label="Search" items={cities} x-model={() => form.query} />
      <output class="cb-query">{() => `query: "${form.query}"`}</output>
    </>
  );
}
