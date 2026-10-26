import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { FilterBuilder, filterText } from '@motifx-community/ui';
import { saleFields, sales } from './sales';

/** The value is the data layer's filter, bound both ways; here it filters sales in memory. */
export default function Basic() {
  const s = reactive({
    filter: data.and(data.where('city', 'in', ['Ankara', 'İzmir']), data.or(data.where('amount', '>', 500), data.where('paid', '=', false))) as data.FilterExpression | null,
  });
  const matches = () => sales.filter(data.createRowFilter(s.filter, { fields: { date: 'date' } })).length;
  return (
    <>
      <FilterBuilder class="fb-basic" label="Sales filter" fields={saleFields} locale="en" x-model={() => s.filter} />
      <output class="fb-basic-text">{() => filterText(s.filter, { fields: saleFields, locale: 'en' }) || 'No filter'}</output>
      <output class="fb-basic-count">{() => `${matches()} of ${sales.length} sales`}</output>
      <pre class="fb-basic-value">{() => JSON.stringify(s.filter, null, 2)}</pre>
    </>
  );
}
