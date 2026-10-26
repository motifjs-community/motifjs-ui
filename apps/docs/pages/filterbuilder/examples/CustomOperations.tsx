import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { FilterBuilder, NumberBox, filterText, type FilterBuilderCustomOperation } from '@motifx-community/ui';
import { saleFields } from './sales';

const DAY = 24 * 60 * 60 * 1000;
/** The demo's "today", so the example reads the same every day. */
const today = new Date(2026, 5, 30);

/** "Is in the last … days" on dates, with a NumberBox of its own; "Is a round amount" without a value. */
const lastDays: FilterBuilderCustomOperation = {
  name: 'lastDays',
  caption: 'Is in the last days',
  dataTypes: ['date'],
  customizeText: (info) => `${info.value} days`,
  editor: (ctx) => {
    const box = new NumberBox({ label: 'Days', labelMode: 'hidden', size: 'sm', min: 1, value: typeof ctx.value === 'number' ? ctx.value : null });
    box.onValueChanged((e) => ctx.setValue(e.value));
    return box;
  },
  calculateFilterExpression: (days, field) => data.where(field.dataField, 'between', [new Date(today.getTime() - (days as number) * DAY), today]),
};

const round: FilterBuilderCustomOperation = {
  name: 'round',
  caption: 'Is a round amount',
  dataTypes: ['number'],
  hasValue: false,
  calculateFilterExpression: (_value, field) => data.where(field.dataField, 'in', [100, 200, 300, 400, 500, 600, 700, 800, 900]),
  // Known again from any expression of that shape, also one read back from storage.
  readFilterExpression: (e) => (data.isCondition(e) && e.op === 'in' && Array.isArray(e.value) && e.value.length === 9 && e.value[0] === 100 ? { field: e.field, value: undefined } : null),
};

export default function CustomOperations() {
  const s = reactive({ filter: null as data.FilterExpression | null });
  return (
    <>
      <FilterBuilder class="fb-custom" label="Filter with custom operations" fields={saleFields} customOperations={[lastDays, round]} locale="en" x-model={() => s.filter} />
      <output class="fb-custom-text">{() => filterText(s.filter, { fields: saleFields, customOperations: [lastDays, round], locale: 'en' }) || 'No filter'}</output>
      <pre class="fb-custom-value">{() => JSON.stringify(s.filter)}</pre>
    </>
  );
}
