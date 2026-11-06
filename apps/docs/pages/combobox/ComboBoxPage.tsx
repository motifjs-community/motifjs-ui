import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import CustomValues from './examples/CustomValues';
import Programmatic from './examples/Programmatic';
import Products from './examples/Products';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<V | null>`', '`null`', 'The value of the selected item. `x-model` binds it.'],
  ['items / dataSource', '`Bind<readonly T[]>` / `Bind<DataSource | null>`', '—', 'An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server.'],
  ['textField, valueField, iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'Same as DropDown. Groups apply to in-memory items.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How in-memory items are matched.'],
  ['minSearchLength', '`Bind<number>`', '`0`', 'The number of characters to type before the list opens.'],
  ['searchDelay', '`Bind<number>`', '`0` / `250`', 'The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source).'],
  ['acceptCustomValue', '`Bind<boolean>`', '`false`', 'Text that matches no item becomes the value. Otherwise, the field reverts to the selected item.'],
  ['autoHighlight', '`Bind<boolean>`', '`true`', 'Highlights the first match, so Enter accepts it.'],
  ['showDropDownButton, clearButton', '`Bind<boolean>`', '`true`, `false`', 'The arrow that opens all items, and the button that clears the value.'],
  ['itemTemplate, matchWidth, placeholder', '', '', 'Same as DropDown.'],
];

const KEYS = [
  ['Typing', 'Searches and opens the list, highlighting the first match.'],
  ['Down / Up, Alt + Down', 'Opens the list with all items, or moves the highlight within it.'],
  ['Enter', 'Accepts the highlighted item, or the text (see `acceptCustomValue`), and closes the list.'],
  ['Tab, leaving', 'If an item\'s text matches the input, it is selected. Otherwise, the custom value is used or the selected item is restored.'],
  ['Escape', 'Closes the list. When closed, it reverts the typing, and then clears the value with `clearButton`.'],
];

export default function ComboBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A text input with a list that filters as the user types. Items can come from memory or from a data layer source that is searched on the server. `Autocomplete` is the free-text variant, where the value is the text itself." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ComboBox, Autocomplete } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <Example files={code('Programmatic.tsx', 'cities.ts')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With `dataSource`, the search goes to the data source (using its `searchFields`) after `searchDelay`. In `'blocks'` mode, only the visible rows load, and a value that is not on a loaded page is looked up by key so the field can show its text immediately. This example has 10,000 products and responds after 300 ms." />
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
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            ['Pattern', 'The APG combobox with list autocomplete. The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`.'],
            ['Highlight', '`aria-activedescendant` identifies the highlighted option while focus stays in the input.'],
            ['Loading', 'Rows not loaded yet are options with `aria-busy`, which announce "Loading…" from `uiLocale`.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties, methods, events" />
        </h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['selectedItem', 'The item for the current value, when known.'],
            ['listItems', 'The `DataItems` shown in the list, which are the results of the last search.'],
            ['opened, open(), close(), clear()', 'The list and the value.'],
            ['refresh()', 'Your items can be plain or reactive, and the box reads them as they are. After changing them in place, call `refresh()`. The open list and the value text update. Autocomplete has the same method.'],
            ['onValueChanged, onOpened, onClosed, onValidated', 'Same as DropDown.'],
          ]}
        />
        <p>
          <Rich text="The items logic is a shared part: `DataItems` supplies any list control from an array or a data source." />
        </p>
      </Section>
    </>
  );
}
