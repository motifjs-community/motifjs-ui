import { reactive, type Component } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, ListBox, Switch, ValidationGroup, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  member?: boolean;
}

const COUNTRIES: Country[] = [
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪' },
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷' },
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦' },
];

const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

interface Order {
  id: number;
  name: string;
}

const ORDERS: Order[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Order #${String(i + 1).padStart(5, '0')}` }));

/** 5,000 orders behind the adapter of the data layer, loaded in blocks while the list scrolls. */
function orderSource() {
  return new data.DataSource<Order, number>({ adapter: new data.ArrayAdapter({ data: ORDERS, key: 'id' }), loadMode: 'blocks', pageSize: 50, searchFields: ['name'] });
}

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
  ['searchDelay', '`Bind<number>`', '`0` / `250`', 'Milliseconds after the last key before searching (in memory / a data source).'],
  ['height', '`Bind<number | string | null>`', '—', 'Rows (`8`) or a CSS length (`"12rem"`). Without it the list is as high as its items, up to `list.max-height`.'],
  ['itemTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Draws an item your way.'],
  ['noItemsText', '`Bind<string>`', '—', 'What an empty list says instead of `uiLocale`’s “No items”.'],
  ['label, labelMode, helpText, hint, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup', 'see TextBox', '', 'The field props every editor has.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['selectedItems, selectedItem', 'read-only, reactive', 'The items of the chosen values that are known; with a data source the others are asked by key and follow.'],
  ['listItems', 'read-only', 'The `DataItems` the list shows (what the last search matched).'],
  ['searchBox', 'read-only', 'The search `TextBox` while `searchEnabled` is on.'],
  ['isValid, validationMessage', 'read-only, reactive', 'See TextBox.'],
];

const METHODS = [
  ['selectAllItems()', '`Promise<void>`', 'Multiple: chooses every item the list shows (a data source: after their values load).'],
  ['clear()', '`void`', 'Chooses nothing.'],
  ['scrollToItem(item)', '`void`', 'Brings an item into view and highlights it.'],
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
  ['Groups', 'Each group is `role="group"` named by its header.'],
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
  ['listbox.padding, listbox.gap', 'The space around the list and between it and the search box.'],
  ['listbox.check-size, listbox.check-radius, listbox.check-border-width', 'The check boxes.'],
  ['listbox.divider-width', 'The line under "Select all".'],
  ['list.*', 'The rows, as for DropDown: height, padding, highlight, chosen item, headers, the most height.'],
  ['field.*', 'The label, the box, the line under it.'],
];

export default function ListBoxPage() {
  const s = reactive({
    city: 'İzmir' as string | null,
    picked: ['Bursa', 'Konya'] as string[],
    multiple: true,
    checkBoxes: true,
    selectAll: true,
    follows: true,
    search: false,
    country: 'JP' as string | null,
    orders: [42, 4321] as number[],
    required: [] as string[],
    result: '',
    lang: 'en',
    made: 0,
  });
  const orders = orderSource();
  const group = new ValidationGroup();
  let host: Component<HTMLDivElement> | undefined;
  const flag = (c: Country, el: HTMLElement) => {
    el.textContent = `${c.flag}  ${c.name}`;
  };
  const addFromCode = () => {
    const list = new ListBox<string, string>({ label: `Size ${++s.made}`, items: ['S', 'M', 'L', 'XL'], height: 4 });
    list.onValueChanged((e) => (s.result = `${list.label}: ${e.value}`));
    host?.controls.add(list);
    list.focus();
  };

  return (
    <>
      <p class="lead">
        A list that stays on the page. One item or several are chosen with the keys or the pointer; items come from
        memory or from a data source, can be searched and grouped, and long lists draw only the rows in view.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ListBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="`items` can be plain values; `x-model` binds the value. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<ListBox label="&City" items={['Ankara', 'Bursa', 'İzmir']} x-model={() => this.form.city} />

const size = new ListBox({ label: 'Size', items: ['S', 'M', 'L', 'XL'], height: 4 });
size.onValueChanged((e) => console.log(e.value));
this.panel.controls.add(size);
`}
        >
          <ListBox label="&City" items={CITIES} x-model={() => s.city} />
          <div class="docs-flow">
            <output class="lb-city">{() => `city: ${s.city ?? '—'}`}</output>
            <Button text="Add a list from code" variant="outline" onclick={addFromCode} />
            <output class="lb-made">{() => s.result}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="multiple" title="Several items">
        <p>
          <Rich text="With `selectionMode` set to `'multiple'` the value is an array, and every change writes a new one. Each switch below is a prop you can bind." />
        </p>
        <Example
          code={`
<ListBox
  label="Cities"
  items={cities}
  selectionMode={() => (this.ui.multiple ? 'multiple' : 'single')}
  showCheckBoxes={() => this.ui.checkBoxes}
  selectAll={() => this.ui.selectAll}
  selectionFollowsFocus={() => this.ui.follows}
  searchEnabled={() => this.ui.search}
  x-model={() => this.form.cities}
/>
`}
          stack
        >
          <div class="docs-flow">
            <Switch label="Multiple" x-model={() => s.multiple} />
            <Switch label="Check boxes" x-model={() => s.checkBoxes} />
            <Switch label="Select all" x-model={() => s.selectAll} />
            <Switch label="Selection follows focus" x-model={() => s.follows} />
            <Switch label="Search" x-model={() => s.search} />
          </div>
          <div class="docs-flow">
            <ListBox
              label="Cities"
              items={CITIES}
              selectionMode={() => (s.multiple ? 'multiple' : 'single')}
              showCheckBoxes={() => s.checkBoxes}
              selectAll={() => s.selectAll}
              selectionFollowsFocus={() => s.follows}
              searchEnabled={() => s.search}
              value={() => (s.multiple ? s.picked : (s.picked[0] ?? null))}
              onValueChanged={(e) => (s.picked = Array.isArray(e.value) ? (e.value as string[]) : e.value === null ? [] : [e.value as string])}
            />
            <output class="lb-picked">{() => `value: ${JSON.stringify(s.multiple ? s.picked : (s.picked[0] ?? null))}`}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="objects" title="Objects, groups, templates">
        <p>
          <Rich text="Objects of your own are read through `textField` and `valueField`; `groupField` puts items under headers, `enabledField` keeps some from being chosen, and `itemTemplate` draws an item your way." />
        </p>
        <Example
          code={`
<ListBox
  label="Country"
  items={this.countries}
  textField="name"
  valueField="code"
  groupField="region"
  enabledField={(c) => c.member !== false}
  itemTemplate={(c, host) => (host.textContent = \`\${c.flag}  \${c.name}\`)}
  height={8}
  x-model={() => this.form.country}
/>
`}
        >
          <ListBox
            label="Country"
            items={COUNTRIES}
            textField="name"
            valueField="code"
            groupField="region"
            enabledField={(c: Country) => c.member !== false}
            itemTemplate={flag}
            height={8}
            x-model={() => s.country}
          />
          <output class="lb-country">{() => `code: ${s.country ?? '—'}`}</output>
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With `dataSource` the list reads a `DataSource` of the data layer, and the search goes to it (its `searchFields`). In `'blocks'` mode only the rows in view load while the list scrolls; chosen values on rows not loaded yet stay chosen, and “Select all” loads the values of every matching row. This one holds 5,000 orders." />
        </p>
        <Example
          code={`
const orders = new data.DataSource({
  adapter: new data.ArrayAdapter({ data: rows, key: 'id' }),
  loadMode: 'blocks',
  searchFields: ['name'],
});

<ListBox label="Orders" dataSource={orders} textField="name" valueField="id"
  selectionMode="multiple" selectAll searchEnabled height={10} x-model={() => this.form.orders} />
`}
        >
          <ListBox
            label="Orders"
            dataSource={orders}
            textField="name"
            valueField="id"
            selectionMode="multiple"
            selectAll
            searchEnabled
            height={10}
            x-model={() => s.orders}
          />
          <output class="lb-orders">{() => `${s.orders.length} chosen${s.orders.length && s.orders.length < 6 ? `: ${s.orders.join(', ')}` : ''}`}</output>
        </Example>
      </Section>

      <Section anchor="validation" title="Validation and states">
        <Example
          code={`
<ListBox label="Sizes" items={sizes} selectionMode="multiple" required validationGroup={group} />
<ListBox label="Read-only" items={cities} value="Bursa" readOnly />
`}
        >
          <ListBox
            label="Sizes"
            items={['S', 'M', 'L', 'XL']}
            selectionMode="multiple"
            required
            helpText="Pick one or more."
            validationGroup={group}
            x-model={() => s.required}
          />
          <ListBox label="Read-only" items={CITIES} value="Bursa" readOnly height={4} />
          <ListBox label="Disabled" items={CITIES} value="Bursa" enabled={false} height={4} />
          <div class="docs-flow">
            <Button
              text="Check"
              variant="outline"
              onclick={async () => {
                const result = await group.validate();
                s.result = result.valid ? 'Fine.' : 'Pick a size.';
              }}
            />
            <output class="lb-check">{() => s.result}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="“Select all”, the search box, “No items” and “Loading…” come from `uiLocale.strings` (`selectAll`, `search`, `noItems`, `loading`)." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
          <ListBox label="Fruit" items={['Apple', 'Cherry', 'Pear']} selectionMode="multiple" selectAll searchEnabled />
          <ListBox label="Empty" items={[]} height={3} />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <p>
          <Rich text="A prop whose value is a function of its own (`textField`, a template) takes the function itself when it has parameters; a function without parameters is a getter, as for every other prop." />
        </p>
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
