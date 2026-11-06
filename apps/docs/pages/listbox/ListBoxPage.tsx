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
  ['value', '`Bind<V | V[] | null>`', '`null` / `[]`', 'The chosen value (single) or values (multiple). `x-model` binds it; a change writes a new array.'],
  ['items / dataSource', '`Bind<readonly T[]>` / `Bind<DataSource | null>`', '—', 'Items in memory, searched here, or a data source of `@motifx-community/data`, searched where it lives. A data source wins.'],
  ['textField, valueField', '`Bind<ItemField<T>>`', "`'text'`, `'value'`", 'A property name or a function `(item) => …`. Plain values are their own text and value.'],
  ['iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'An icon per item; headers between groups (items in memory); items that cannot be chosen.'],
  ['selectionMode', "`Bind<'single' | 'multiple'>`", "`'single'`", 'One value, or an array of them.'],
  ['showCheckBoxes', '`Bind<boolean>`', '`true`', 'Multiple: check boxes in front of the items; `false` draws a check mark, and a plain click chooses only that item.'],
  ['selectAll', '`Bind<boolean>`', '`false`', 'Multiple: a "Select all" row that is checked, empty or shows a dash.'],
  ['selectionFollowsFocus', '`Bind<boolean>`', '`true`', 'Single: the arrow keys choose as they move. Off: they only move, Space or Enter chooses.'],
  ['searchEnabled', '`Bind<boolean>`', '`false`', 'A search box above the list.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How items in memory match the search.'],
  ['searchDelay', '`Bind<number>`', '`0` / `250`', 'The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source).'],
  ['height', '`Bind<number | string | null>`', '—', 'Rows (`8`) or a CSS length (`"12rem"`). Without it the list is as high as its items, up to the list’s `max-height` (`list.container`).'],
  ['itemTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Draws an item your way.'],
  ['noItemsText', '`Bind<string>`', '—', 'What an empty list says instead of `uiLocale`’s “No items”.'],
  ['label, labelMode, helpText, hint, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup', 'see TextBox', '', 'Field props shared by all editors.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['selectedItems, selectedItem', 'read-only, reactive', 'The items of the chosen values that are known; with a data source the others are asked by key and follow.'],
  ['listItems', 'read-only', 'The `DataItems` shown in the list, which are the results of the last search.'],
  ['searchBox', 'read-only', 'The search `TextBox` while `searchEnabled` is on.'],
  ['isValid, validationMessage', 'read-only, reactive', 'See TextBox.'],
];

const METHODS = [
  ['selectAllItems()', '`Promise<void>`', 'Multiple: chooses every item the list shows (a data source: after their values load).'],
  ['clear()', '`void`', 'Chooses nothing.'],
  ['scrollToItem(item)', '`void`', 'Brings an item into view and highlights it.'],
  ['refresh()', '`void`', 'Your items may be plain or reactive; the list reads them as they are. After changing them in place, call `refresh()`. It reads which items there are, their texts and values, and the chosen ones again.'],
  ['validate(), resetValidation(), focus()', '', 'See TextBox.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`'],
  ['onValidated(e)', 'See TextBox.'],
];

const KEYS = [
  ['Tab', 'The list is one Tab stop; the search box, when on, is another.'],
  ['Down, Up, Home, End, Page Down, Page Up', 'Move the highlight; items that cannot be chosen are skipped. Single: the item is chosen too.'],
  ['A letter', 'The next item starting with it; letters typed quickly search together.'],
  ['Space, Enter', 'Single: choose the highlighted item. Multiple: choose it or let it go.'],
  ['Shift + Down / Up', 'Multiple: move and choose or let go of the next item.'],
  ['Shift + Space', 'Multiple: choose every item from the last one chosen to the highlighted one.'],
  ['Control + Shift + Home / End', 'Multiple: choose every item from the highlighted one to the first / last.'],
  ['Control + A', 'Multiple: choose every item, or none when all are chosen.'],
  ['Down in the search box', 'Go to the list.'],
  ['Control + click, Shift + click', 'Multiple: add or take away one item; choose the items between.'],
];

const A11Y = [
  ['Pattern', 'The APG listbox: the list is `role="listbox"`, focused itself; `aria-activedescendant` names the highlighted option.'],
  ['Options', '`role="option"` with `aria-selected`; disabled ones `aria-disabled`. Multiple lists are `aria-multiselectable`.'],
  ['Name', 'The label names the list (`aria-labelledby`); help and errors describe it, `aria-invalid` and `aria-required` tell its state.'],
  ['Groups', 'Each group has `role="group"` and is labeled by its header.'],
  ['Long lists', 'Only the rows in view are drawn; each option says where it is with `aria-posinset` and `aria-setsize`; rows still loading are `aria-busy`.'],
  ['Focus', 'The highlight shows while the list is in use; with the keys it also gets the focus ring.'],
];

const HOOKS = [
  ['.mx-list-box', 'Added to the field. `data-selection-mode`, `data-check-boxes`; the field attributes of TextBox.'],
  ['.mx-list-box__search', 'The search box.'],
  ['.mx-list, .mx-list__item, .mx-list__header, .mx-list__check', 'The list (shared), its options (`data-active`, `data-selected`), group headers and check boxes.'],
  ['.mx-list__item[data-select-all]', 'The "Select all" row; `data-mixed` when some items are chosen.'],
];

const TOKENS = [
  ['listbox.container, listbox.box', 'Units: the space around the list box, and around and between its search box and list.'],
  ['listbox.check', 'Unit: the check box of a row in a list of several choices (`checked`, `disabled`, `checked-disabled`).'],
  ['listbox.keys, listbox.idle', 'Units: the ring round the row the keys are on (`selected`), and that row while the list is not in use.'],
  ['listbox.field, listbox.search, listbox.list', 'Places: the field, the search box and the list inside a list box (the list\'s and the field\'s own units, as they look here).'],
  ['list.*', 'The rows, as for DropDown: height, padding, highlight, chosen item, headers, "Select all".'],
];

export default function ListBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A list that stays on the page. One item or several are chosen with the keys or the pointer; items come from memory or from a data source, can be searched and grouped, and long lists draw only the rows in view." />
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

      <Section anchor="multiple" title="Several items">
        <p>
          <Rich text="With `selectionMode` set to `'multiple'` the value is an array, and every change writes a new one. Each switch below is a prop you can bind." />
        </p>
        <Example files={code('SeveralItems.tsx', 'cities.ts')} stack>
          <SeveralItems />
        </Example>
      </Section>

      <Section anchor="objects" title="Objects, groups, templates">
        <p>
          <Rich text="Objects of your own are read through `textField` and `valueField`; `groupField` puts items under headers, `enabledField` keeps some from being chosen, and `itemTemplate` draws an item your way." />
        </p>
        <Example files={code('Countries.tsx')}>
          <Countries />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With `dataSource` the list reads a `DataSource` of the data layer, and the search goes to it (its `searchFields`). In `'blocks'` mode only the rows in view load while the list scrolls; chosen values on rows not loaded yet stay chosen, and “Select all” loads the values of every matching row. This one holds 5,000 orders." />
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
