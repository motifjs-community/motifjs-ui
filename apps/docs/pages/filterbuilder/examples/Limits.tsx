import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { FilterBuilder, RadioGroup, Stack, Switch, type FilterBuilderField } from '@motifx-community/ui';

const fields: FilterBuilderField[] = [
  { dataField: 'customer.name', caption: 'Customer.Name' },
  { dataField: 'customer.address.city' },
  { dataField: 'customer.address.country' },
  { dataField: 'total', dataType: 'number' },
];

/** How deep groups go, which group operations there are, and dotted fields as submenus. */
export default function Limits() {
  const s = reactive({ max: '1', notOps: true, nested: true });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup
          label="maxGroupLevel"
          orientation="horizontal"
          items={[
            { value: '0', text: '0' },
            { value: '1', text: '1' },
            { value: '2', text: '2' },
            { value: 'none', text: 'No limit' },
          ]}
          x-model={() => s.max}
        />
        <Switch label="Not And, Not Or" x-model={() => s.notOps} />
        <Switch label="allowHierarchicalFields" x-model={() => s.nested} />
      </Stack>
      <FilterBuilder
        class="fb-limits"
        label="Customers filter"
        fields={fields}
        value={data.and(data.where('customer.address.city', '=', 'Ankara'), data.where('total', '>=', 1000))}
        maxGroupLevel={() => (s.max === 'none' ? null : Number(s.max))}
        groupOperations={() => (s.notOps ? ['and', 'or', 'notAnd', 'notOr'] : ['and', 'or'])}
        allowHierarchicalFields={() => s.nested}
      />
    </>
  );
}
