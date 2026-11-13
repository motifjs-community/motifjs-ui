import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Countries from './examples/Countries';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import Orders from './examples/Orders';
import SeveralItems from './examples/SeveralItems';
import Validation from './examples/Validation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<V | V[] | null>`', '`null` / `[]`', 'The selected value (single) or values (multiple). `x-model` binds it, and a change writes a new array.'],
  ['items / dataSource', '`Bind<readonly T[]>` / `Bind<DataSource | null>`', '—', 'An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server. A data source takes precedence.'],
  ['textField, valueField', '`Bind<ItemField<T>>`', "`'text'`, `'value'`", 'A property name or a function `(item) => …`. Plain values serve as their own text and value.'],
  ['iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'An icon for each item, headers between groups (in-memory items), and items that cannot be selected.'],
  ['selectionMode', "`Bind<'single' | 'multiple'>`", "`'single'`", 'A single value, or an array of values.'],
  ['showCheckBoxes', '`Bind<boolean>`', '`true`', 'In multiple selection, shows check boxes in front of the items. `false` draws a check mark instead, and a plain click selects only that item.'],
  ['selectAll', '`Bind<boolean>`', '`false`', 'In multiple selection, adds a "Select all" row that can be checked, empty or indeterminate.'],
  ['selectionFollowsFocus', '`Bind<boolean>`', '`true`', 'In single selection, the arrow keys select as they move. When off, they only move, and Space or Enter selects.'],
  ['searchEnabled', '`Bind<boolean>`', '`false`', 'Adds a search box above the list.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How the search matches in-memory items.'],
  ['searchDelay', '`Bind<number>`', '`0` / `250`', 'The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source).'],
  ['height', '`Bind<number | string | null>`', '—', 'The height, in rows (`8`) or a CSS length (`"12rem"`). Without it, the list is as tall as its items, up to the `max-height` of the list (`list.container`).'],
  ['itemTemplate', '`Bind<(item, host: ComponentBase) => cleanup | void>`', '—', 'Customizes how an item is drawn.'],
  ['noItemsText', '`Bind<string>`', '—', 'The text for an empty list, which replaces the `uiLocale` “No items” string.'],
  ['label, labelMode, helpText, hint, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup', 'see TextBox', '', 'Field props shared by all editors.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['selectedItems, selectedItem', 'read-only, reactive', 'The known items for the selected values. With a data source, the others are requested by key and added.'],
  ['listItems', 'read-only', 'The `DataItems` shown in the list, which are the results of the last search.'],
  ['searchBox', 'read-only', 'The search `TextBox` while `searchEnabled` is on.'],
  ['isValid, validationMessage', 'read-only, reactive', 'See TextBox.'],
];

const METHODS = [
  ['selectAllItems()', '`Promise<void>`', 'In multiple selection, selects every item the list shows (with a data source, after their values load).'],
  ['clear()', '`void`', 'Clears the selection.'],
  ['scrollToItem(item)', '`void`', 'Scrolls an item into view and highlights it.'],
  ['refresh()', '`void`', 'Your items can be plain or reactive, and the list reads them as they are. After changing them in place, call `refresh()`. It re-reads the items, their text and values, and the selection.'],
  ['validate(), resetValidation(), focus()', '', 'See TextBox.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`'],
  ['onValidated(e)', 'See TextBox.'],
];

const KEYS = [
  ['Tab', 'The list is one Tab stop. The search box, when enabled, is another.'],
  ['Down, Up, Home, End, Page Down, Page Up', 'Moves the highlight and skips items that cannot be selected. In single selection, the item is also selected.'],
  ['A letter', 'Moves to the next item that starts with that letter. Letters typed quickly are combined into one search.'],
  ['Space, Enter', 'In single selection, selects the highlighted item. In multiple selection, selects or deselects it.'],
  ['Shift + Down / Up', 'In multiple selection, moves and selects or deselects the next item.'],
  ['Shift + Space', 'In multiple selection, selects every item from the last selected item to the highlighted one.'],
  ['Control + Shift + Home / End', 'In multiple selection, selects every item from the highlighted one to the first or last item.'],
  ['Control + A', 'In multiple selection, selects every item, or clears the selection if all are selected.'],
  ['Down in the search box', 'Moves focus to the list.'],
  ['Control + click, Shift + click', 'In multiple selection, adds or removes one item, or selects the items in between.'],
];

const A11Y = [
  ['Pattern', 'The APG listbox. The list has `role="listbox"` and holds focus itself, and `aria-activedescendant` identifies the highlighted option.'],
  ['Options', '`role="option"` with `aria-selected`, and `aria-disabled` on disabled items. Multi-select lists have `aria-multiselectable`.'],
  ['Name', 'The label names the list (`aria-labelledby`), help and error text describe it, and `aria-invalid` and `aria-required` report its state.'],
  ['Groups', 'Each group has `role="group"` and is labeled by its header.'],
  ['Long lists', 'Only visible rows are rendered. Each option reports its position with `aria-posinset` and `aria-setsize`, and loading rows have `aria-busy`.'],
  ['Focus', 'The highlight appears while the list is in use, and it also gets the focus ring during keyboard use.'],
];

const HOOKS = [
  ['.mx-list-box', 'Added to the field. `data-selection-mode` and `data-check-boxes`, plus the TextBox field attributes.'],
  ['.mx-list-box__search', 'The search box.'],
  ['.mx-list, .mx-list__item, .mx-list__header, .mx-list__check', 'The shared list, its options (`data-active`, `data-selected`), group headers and check boxes.'],
  ['.mx-list__item[data-select-all]', 'The "Select all" row, with `data-mixed` when only some items are selected.'],
];

const TOKENS = [
  ['listbox.container, listbox.box', 'Units: the spacing around the list box, and around and between its search box and list.'],
  ['listbox.check', 'Unit: the check box of a row in a multi-select list (`checked`, `disabled`, `checked-disabled`).'],
  ['listbox.keys, listbox.idle', 'Units: the ring around the row with keyboard focus (`selected`), and that row while the list is not in use.'],
  ['listbox.field, listbox.search, listbox.list', 'Places: the field, search box and list inside a list box, which are the list and field units as they appear here.'],
  ['list.*', 'The rows, as in DropDown: height, padding, highlight, selected item, headers and "Select all".'],
];

export default function ListBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A list displayed directly on the page. Users select one or more items with the keyboard or pointer. Items can come from memory or a data source, can be searched and grouped, and long lists render only the visible rows." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ListBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="`items` can be plain values, and `x-model` binds the selected value. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx', 'cities.ts')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="multiple" title="Multiple selection">
        <p>
          <Rich text="When `selectionMode` is `'multiple'`, the value is an array and every change writes a new one. Each option below is a prop you can bind." />
        </p>
        <Example files={code('SeveralItems.tsx', 'cities.ts')} stack>
          <SeveralItems />
        </Example>
      </Section>

      <Section anchor="objects" title="Objects, groups, templates">
        <p>
          <Rich text="Custom objects are read through `textField` and `valueField`. `groupField` places items under headers, `enabledField` disables specific items, and `itemTemplate` customizes how an item is drawn." />
        </p>
        <Example files={code('Countries.tsx')}>
          <Countries />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With `dataSource`, the list reads a `DataSource` from the data layer, and the search runs there (using its `searchFields`). In `'blocks'` mode, only the visible rows load as the list scrolls. Selected values on unloaded rows stay selected, and “Select all” loads the values of every matching row. This example has 5,000 orders." />
        </p>
        <Example files={code('Orders.tsx')}>
          <Orders />
        </Example>
      </Section>

      <Section anchor="validation" title="Validation and states">
        <Example files={code('Validation.tsx', 'cities.ts')}>
          <Validation />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="“Select all”, the search box, “No items” and “Loading…” come from `uiLocale.strings` (`selectAll`, `search`, `noItems`, `loading`)." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <p>
          <Rich text="A prop that accepts a function as its value (`textField`, a template) uses the function as is when it has parameters. A function without parameters is treated as a getter, as with every other prop." />
        </p>
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
