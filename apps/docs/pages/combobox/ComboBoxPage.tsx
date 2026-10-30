import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import CustomValues from './examples/CustomValues';
import FromCode from './examples/FromCode';
import Products from './examples/Products';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<V | null>`', '`null`', 'The value of the chosen item; `x-model` binds it.'],
  ['items / dataSource', '`Bind<readonly T[]>` / `Bind<DataSource | null>`', '—', 'Items in memory, searched here, or a data source of `@motifx-community/data`, searched where it lives.'],
  ['textField, valueField, iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'As for DropDown; groups for items in memory.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How items in memory match.'],
  ['minSearchLength', '`Bind<number>`', '`0`', 'Characters to type before the list opens.'],
  ['searchDelay', '`Bind<number>`', '`0` / `250`', 'Milliseconds after the last key before searching (in memory / a data source).'],
  ['acceptCustomValue', '`Bind<boolean>`', '`false`', 'Text that matches no item becomes the value; otherwise the field goes back to the chosen item.'],
  ['autoHighlight', '`Bind<boolean>`', '`true`', 'The first match is highlighted, so Enter takes it.'],
  ['showDropDownButton, clearButton', '`Bind<boolean>`', '`true`, `false`', 'The arrow that opens every item; the button that empties it.'],
  ['itemTemplate, matchWidth, placeholder', '', '', 'As for DropDown.'],
];

const KEYS = [
  ['Typing', 'Searches and opens the list; the first match is highlighted.'],
  ['Down / Up, Alt + Down', 'Open the list with every item; move in it.'],
  ['Enter', 'Take the highlighted item (or the text, see `acceptCustomValue`) and close.'],
  ['Tab, leaving', 'An item whose text is the text is taken; otherwise the custom value or the chosen item again.'],
  ['Escape', 'Close the list; closed, undo the typing; then, with `clearButton`, empty it.'],
];

export default function ComboBoxPage() {
  return (
    <>
      <p class="lead">
        A text field with a list that follows what is typed. The items come from memory or from a data source of the
        data layer, searched on the server. <code>Autocomplete</code> is the free-text kind: the value is the text.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ComboBox, Autocomplete } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <Example files={code('FromCode.tsx', 'cities.ts')}>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With `dataSource` the search goes to the data source (its `searchFields`), after `searchDelay`. In `'blocks'` mode only the rows in view load; a value on no loaded page is found by key, so the field shows its text at once. This one holds 10,000 products and answers after 300 ms." />
        </p>
        <Example files={[...code('Products.tsx'), slowAdapterFile]}>
          <Products />
        </Example>
      </Section>

      <Section anchor="custom" title="Custom values and Autocomplete">
        <Example files={code('CustomValues.tsx', 'cities.ts')}>
          <CustomValues />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'How']}
          rows={[
            ['Pattern', 'The APG combobox with list autocomplete: the input is `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`.'],
            ['Highlight', '`aria-activedescendant` names the highlighted option; focus stays in the input.'],
            ['Loading', 'Rows not loaded yet are options with `aria-busy`, reading "Loading…" from `uiLocale`.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties, methods, events</h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['selectedItem', 'The item of the value, when known.'],
            ['listItems', 'The `DataItems` the list shows (what the last search matched).'],
            ['opened, open(), close(), clear()', 'The list and the value.'],
            ['refresh()', 'Your items may be plain or reactive; the box reads them as they are. After changing them in place, call `refresh()`. The open list and the text of the value follow. Autocomplete has it too.'],
            ['onValueChanged, onOpened, onClosed, onValidated', 'As for DropDown.'],
          ]}
        />
        <p>
          <Rich text="The items part is shared: `DataItems` feeds any list control from an array or a data source." />
        </p>
      </Section>
    </>
  );
}
