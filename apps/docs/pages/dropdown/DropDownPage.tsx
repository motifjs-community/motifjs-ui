import { reactive } from '@motifx/core';
import { Button, DropDown, ValidationGroup, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  member?: boolean;
}

const COUNTRIES: Country[] = [
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷', member: true },
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪', member: true },
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷', member: true },
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵', member: true },
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷', member: true },
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷', member: true },
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦', member: true },
];

const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

const MANY = Array.from({ length: 5000 }, (_, i) => ({ value: i + 1, text: `Order #${String(i + 1).padStart(5, '0')}` }));

const PROPS = [
  ['value', '`Bind<V | null>`', '`null`', 'The value of the chosen item. `x-model` binds it two-way.'],
  ['items', '`Bind<readonly T[]>`', '`[]`', 'Plain values, `DropDownItem`s (`{ value, text, icon?, group?, enabled? }`) or objects of your own. A function is followed, and so are changes inside a reactive array.'],
  ['textField / valueField', '`Bind<ItemField<T>>`', "`'text'` / `'value'`", 'A property name or a function `(item) => …`. Without `valueField` an object with a `value` gives that, anything else is its own value.'],
  ['iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'An icon per option; options with the same group follow each other under its name; options that cannot be chosen.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while nothing is chosen.'],
  ['searchEnabled', '`Bind<boolean>`', '`false`', 'A search box at the top of the list.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How the search matches the option text.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'A button that empties the value; Escape does the same while the list is closed.'],
  ['itemTemplate / fieldTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Draws an option / the chosen item yourself.'],
  ['matchWidth', '`Bind<boolean>`', '`true`', 'The list is at least as wide as the field.'],
  ['label, labelMode, helpText, hint, prefix, icon, buttons, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup', 'see TextBox', '', 'The field props every editor has.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['selectedItem', 'read-only, reactive', 'The item whose value is the value.'],
  ['opened', 'read/write, reactive', 'Whether the list is open; setting it opens or closes it.'],
  ['isValid, validationMessage', 'read-only, reactive', 'See TextBox.'],
];

const METHODS = [
  ['open()', '`boolean`', 'Opens the list; `false` when disabled or read-only.'],
  ['close()', '`void`', 'Closes it; focus goes back to the field.'],
  ['clear()', '`void`', 'Empties the value.'],
  ['validate(), resetValidation(), focus()', '', 'See TextBox.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`'],
  ['onOpened()', 'The list opened.'],
  ['onClosed(reason)', "The list closed: `'escape'`, `'outside'`, `'focus'` or `'code'` (also after a choice)."],
  ['onValidated(e)', 'See TextBox.'],
];

const KEYS = [
  ['Down, Up, Enter, Space, Alt + Down', 'Open the list on the chosen option (Home / End: on the first / last).'],
  ['A letter', 'Open the list on the next option starting with it; letters typed quickly search together.'],
  ['In the list: Up, Down, Home, End, Page Up, Page Down', 'Move the highlight; options that cannot be chosen are skipped.'],
  ['In the list: Enter, Space, Alt + Up', 'Choose the highlighted option and close.'],
  ['In the list: Tab', 'Choose the highlighted option and go on to the next field.'],
  ['Escape', 'Close without choosing; with `clearButton` and the list closed, empty the value.'],
  ['Alt + key (`&City`)', 'Focus the field.'],
];

const A11Y = [
  ['Pattern', 'The APG select-only combobox: the field is `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`; focus stays on it.'],
  ['Highlight', '`aria-activedescendant` names the highlighted option; options are `role="option"` with `aria-selected`, disabled ones `aria-disabled`.'],
  ['Groups', 'Each group is `role="group"` named by its header.'],
  ['Long lists', 'Only the rows in view are drawn; each option says where it is with `aria-posinset` and `aria-setsize`.'],
  ['Search', 'The search box controls the list and names the highlighted option the same way.'],
];

const HOOKS = [
  ['.mx-drop-down', 'Added to the field. `data-open` while the list is open; the field attributes of TextBox.'],
  ['.mx-drop-down__display, .mx-drop-down__text, .mx-drop-down__chevron', 'The combobox, the chosen text (`data-placeholder` when empty), the arrow.'],
  ['.mx-drop-down__popup, .mx-drop-down__search', 'The popup and its search box.'],
  ['.mx-list, .mx-list__item, .mx-list__header', 'The list (shared), its options (`data-active`, `data-selected`) and group headers.'],
];

const TOKENS = [
  ['field.*', 'The field, as for TextBox.'],
  ['list.item-height, list.item-padding, list.item-gap, list.item-radius', 'The options.'],
  ['list.item-highlight, list.item-selected, list.indicator-width, list.indicator-color', 'The highlight and the chosen option.'],
  ['list.header-font-size, list.header-font-weight, list.max-height, list.icon-size', 'Group headers, the list height, icons.'],
];

export default function DropDownPage() {
  const s = reactive({
    city: 'İzmir' as string | null,
    country: 'TR' as string | null,
    order: 1200 as number | null,
    size: null as string | null,
    priority: 'normal' as string | null,
    lang: 'en',
    result: '',
    items: ['Draft', 'Review'] as string[],
    status: 'Draft' as string | null,
  });
  const group = new ValidationGroup();
  const flag = (c: Country, host: HTMLElement) => {
    host.textContent = `${c.flag}  ${c.name}`;
  };

  return (
    <>
      <p class="lead">
        Picks one item from a list. The field shows the chosen item; the list opens below it with the keyboard or a
        press, can be searched, grouped and drawn your way, and stays fast with thousands of items.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { DropDown, type DropDownItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="`items` can be plain values; `x-model` binds the value. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<DropDown label="&City" items={['Ankara', 'Bursa', 'İzmir']} x-model={() => this.form.city} />

const size = new DropDown({ label: 'Size', items: ['S', 'M', 'L'], placeholder: 'Pick one' });
size.onValueChanged((e) => console.log(e.value));
this.panel.controls.add(size);
`}
          stack
        >
          <div class="docs-flow">
            <DropDown label="&City" items={CITIES} x-model={() => s.city} />
            <output class="dd-city">{() => `city: ${s.city ?? '—'}`}</output>
          </div>
          <DropDown label="Size" items={['S', 'M', 'L', 'XL']} placeholder="Pick one" x-model={() => s.size} clearButton />
        </Example>
      </Section>

      <Section anchor="objects" title="Objects, groups, templates">
        <p>
          <Rich text="Objects of your own are read through `textField` and `valueField` (a name or a function); `groupField` puts options under headers, `enabledField` keeps some from being chosen, and a template draws an option your way." />
        </p>
        <Example
          code={`
<DropDown
  label="Country"
  items={this.countries}
  textField="name"
  valueField="code"
  groupField="region"
  enabledField={(c) => c.member}
  itemTemplate={(c, host) => (host.textContent = \`\${c.flag}  \${c.name}\`)}
  fieldTemplate={(c, host) => (host.textContent = \`\${c.flag}  \${c.name}\`)}
  x-model={() => this.form.country}
/>
`}
        >
          <DropDown
            label="Country"
            items={COUNTRIES}
            textField="name"
            valueField="code"
            groupField="region"
            enabledField={(c: Country) => c.member !== false}
            itemTemplate={flag}
            fieldTemplate={flag}
            x-model={() => s.country}
          />
          <output class="dd-country">{() => `code: ${s.country ?? '—'}`}</output>
        </Example>
      </Section>

      <Section anchor="search" title="Search and long lists">
        <p>
          <Rich text="`searchEnabled` puts a search box at the top of the list. A long list draws only the rows in view: this one has 5,000 orders." />
        </p>
        <Example
          code={`
<DropDown label="Order" items={orders} searchEnabled x-model={() => this.form.order} />
`}
        >
          <DropDown label="Order" items={MANY} searchEnabled x-model={() => s.order} />
          <output class="dd-order">{() => `order: ${s.order ?? '—'}`}</output>
        </Example>
      </Section>

      <Section anchor="live" title="Items that change">
        <p>
          <Rich text="`items` given as a function is followed, and so are changes inside a reactive array: the open list and the field show them at once." />
        </p>
        <Example
          code={`
<DropDown label="Status" items={() => this.model.statuses} x-model={() => this.form.status} />
this.model.statuses.push('Published');
`}
        >
          <DropDown label="Status" items={() => s.items} x-model={() => s.status} />
          <Button text="Add “Published”" variant="outline" enabled={() => !s.items.includes('Published')} onclick={() => s.items.push('Published')} />
        </Example>
      </Section>

      <Section anchor="validation" title="Validation and states">
        <Example
          code={`
<DropDown label="Priority" items={['low', 'normal', 'high']} required validationGroup={group} />
<DropDown label="Assignee" items={people} readOnly />
`}
        >
          <DropDown label="Priority" items={['low', 'normal', 'high']} required clearButton validationGroup={group} x-model={() => s.priority} />
          <DropDown label="Read-only" items={CITIES} value="Bursa" readOnly />
          <DropDown label="Disabled" items={CITIES} value="Bursa" enabled={false} />
          <Button
            text="Check"
            variant="outline"
            onclick={async () => {
              const result = await group.validate();
              s.result = result.valid ? 'Fine.' : 'Pick a priority.';
            }}
          />
          <output class="dd-check">{() => s.result}</output>
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
          <Rich text="The search box, the clear button and the empty list text come from `uiLocale.strings`." />
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
          <DropDown label="Empty" items={[]} placeholder="Open me" />
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
        <p>
          <Rich text="The list is a shared part, `OptionList`, exported for combo boxes, list boxes and your own controls." />
        </p>
      </Section>
    </>
  );
}
