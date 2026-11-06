import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Countries from './examples/Countries';
import Programmatic from './examples/Programmatic';
import LiveItems from './examples/LiveItems';
import Localization from './examples/Localization';
import LongList from './examples/LongList';
import Validation from './examples/Validation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<V | null>`', '`null`', 'The value of the chosen item. `x-model` binds it two-way.'],
  ['items', '`Bind<readonly T[]>`', '`[]`', 'Plain values, `DropDownItem`s (`{ value, text, icon?, group?, enabled? }`) or objects of your own. A function is followed; items changed in place show after `refresh()`.'],
  ['dataSource', '`Bind<DataSource<T> | null>`', '`null`', 'Items from the data layer, loaded where the list is scrolled to and searched on its `searchFields`. Wins over `items`. A value on no loaded page is asked for by key; meanwhile the field waits (see Lookup).'],
  ['valueText', '`Bind<string>`', "`''`", 'The value\'s text while its item is asked for from `dataSource`, shown at once instead of waiting (a record that carries the name: `valueText={() => order.customerName}`).'],
  ['searchDelay', '`Bind<number>`', '`250` with a data source, else `0`', 'Milliseconds between the last key in the search box and the search.'],
  ['textField / valueField', '`Bind<ItemField<T>>`', "`'text'` / `'value'`", 'A property name or a function `(item) => …`. Without `valueField` an object with a `value` gives that, anything else is its own value.'],
  ['iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'An icon per option; options with the same group follow each other under its name; options that cannot be chosen.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when no item is selected.'],
  ['searchEnabled', '`Bind<boolean>`', '`false`', 'A search box at the top of the list.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How the search matches the option text.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'A button that empties the value; Escape does the same while the list is closed.'],
  ['itemTemplate / fieldTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Draws an option / the chosen item yourself.'],
  ['matchWidth', '`Bind<boolean>`', '`true`', 'The list is at least as wide as the field.'],
  ['label, labelMode, helpText, hint, prefix, icon, buttons, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup', 'see TextBox', '', 'Field props shared by all editors.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['selectedItem', 'read-only, reactive', 'The item whose value is the value.'],
  ['opened', 'read/write, reactive', 'Indicates whether the list is open. Set it to open or close the list.'],
  ['isValid, validationMessage', 'read-only, reactive', 'See TextBox.'],
];

const METHODS = [
  ['open(search?)', '`boolean`', 'Opens the list; `search` starts the search box with that text. `false` when disabled, read-only, or while the value\'s item is asked for.'],
  ['close()', '`void`', 'Closes it; focus goes back to the field.'],
  ['clear()', '`void`', 'Clears the value.'],
  ['refresh()', '`void`', 'Your items may be plain or reactive; the drop-down reads them as they are. After changing them in place, call `refresh()`. The field\'s text and the open list follow.'],
  ['validate(), resetValidation(), focus()', '', 'See TextBox.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`'],
  ['onOpened()', 'Occurs when the list opens.'],
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
  ['Groups', 'Each group has `role="group"` and is labeled by its header.'],
  ['Long lists', 'Only the rows in view are drawn; each option says where it is with `aria-posinset` and `aria-setsize`.'],
  ['Search', 'The search box controls the list and names the highlighted option the same way.'],
  ['Waiting', 'While the value\'s item is asked for, the combobox is `aria-busy` and its text says "Loading…" to screen readers; a key the source does not have carries the reason as its title.'],
];

const HOOKS = [
  ['.mx-drop-down', 'Added to the field. `data-open` while the list is open, `data-loading` while the value\'s item is asked for; the field attributes of TextBox.'],
  ['.mx-drop-down__display, .mx-drop-down__text, .mx-drop-down__chevron', 'The combobox, the chosen text (`data-placeholder` when empty, `data-missing` for a key the source does not have), the arrow.'],
  ['.mx-drop-down__spinner', 'The spinner in the arrow\'s place while the value\'s item is asked for.'],
  ['.mx-drop-down__popup, .mx-drop-down__search', 'The popup and its search box.'],
  ['.mx-list, .mx-list__item, .mx-list__header', 'The list (shared), its options (`data-active`, `data-selected`) and group headers.'],
];

const TOKENS = [
  ['field.*', 'The field, as for TextBox.'],
  ['drop-down.value, drop-down.chevron, drop-down.spinner, drop-down.spinner-shape', 'Units: the chosen text (`placeholder`, `missing`, `disabled`), the arrow (`open`, `disabled`), the ring that turns while the value\'s item is asked for and the shape a language may draw instead (with the spinner\'s shapes and timing).'],
  ['list.item-height, list.item', 'The options: their row height, and the item unit in each state (`hover`, `pressed`, `active`, `selected`, `selected-hover`, `selected-pressed`, `disabled`, `next`, `select-all`).'],
  ['list.indicator, list.check, list.mark, list.icon, list.text', 'Units: the bar on the chosen option (`multiple`), the check of a list of several choices and its mark, an icon, the text.'],
  ['list.container, list.group, list.header, list.select-all-divider, list.empty', 'Units: the list (its space and most height), a group, group headers, the line under "Select all", the empty text.'],
];

export default function DropDownPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Picks one item from a list. The field shows the chosen item; the list opens below it with the keyboard or a press, can be searched, grouped and drawn your way, and stays fast with thousands of items." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { DropDown, type DropDownItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="`items` can be plain values, and `x-model` binds the selected value. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx', 'cities.ts')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="objects" title="Objects, groups, templates">
        <p>
          <Rich text="Objects of your own are read through `textField` and `valueField` (a name or a function); `groupField` puts options under headers, `enabledField` keeps some from being chosen, and a template draws an option your way." />
        </p>
        <Example files={code('Countries.tsx')}>
          <Countries />
        </Example>
      </Section>

      <Section anchor="search" title="Search and long lists">
        <p>
          <Rich text="`searchEnabled` puts a search box at the top of the list. A long list draws only the rows in view: this one has 5,000 orders." />
        </p>
        <Example files={code('LongList.tsx')}>
          <LongList />
        </Example>
      </Section>

      <Section anchor="live" title="Items that change">
        <p>
          <Rich text="`items` given as a function is followed: a new list shows at once. Your items may be plain or reactive; the drop-down reads them as they are, so after changing them in place, call `refresh()`: the open list and the field show the change." />
        </p>
        <Example files={code('LiveItems.tsx')}>
          <LiveItems />
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
          <Rich text="The search box, the clear button, the empty list text, the wait (`loading`) and the reason a key is marked (`notInList`, `loadFailed`) come from `uiLocale.strings`." />
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
        <p>
          <Rich text="The list is a shared part, `OptionList`, exported for combo boxes, list boxes and your own controls." />
        </p>
      </Section>
    </>
  );
}
