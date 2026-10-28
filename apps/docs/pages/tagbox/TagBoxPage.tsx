import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Customers from './examples/Customers';
import CustomTags from './examples/CustomTags';
import FromCode from './examples/FromCode';
import Localization from './examples/Localization';
import TeamList from './examples/TeamList';
import Validation from './examples/Validation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<V[]>`', '`[]`', 'The values of the chosen items. `x-model` binds it; every change writes a new array.'],
  ['items / dataSource', '`Bind<readonly T[]>` / `Bind<DataSource | null>`', '—', 'Items in memory, searched here, or a data source of `@motifx-community/data`, searched where it lives.'],
  ['textField, valueField, iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'As for ListBox; groups for items in memory.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while nothing is chosen.'],
  ['searchMode, minSearchLength, searchDelay', '', "`'contains'`, `0`, `0` / `250`", 'How and when the typed text searches, as for ComboBox.'],
  ['acceptCustomValue', '`Bind<boolean>`', '`false`', 'Enter adds text that matches no item as a tag of its own.'],
  ['customValue', '`Bind<(text) => V | null>`', 'the text', 'Makes the value of a typed text; `null` turns it down.'],
  ['autoHighlight', '`Bind<boolean>`', '`true` (`false` with `acceptCustomValue`)', 'The first match is highlighted while typing, so Enter takes it.'],
  ['closeOnSelect', '`Bind<boolean>`', '`false`', 'Choosing an item closes the list.'],
  ['maxTags', '`Bind<number>`', '`0`', 'Tags shown; the rest are counted in one more tag, “+3”. `0` shows all.'],
  ['maxSelected', '`Bind<number>`', '`0`', 'Items that can be chosen at most; at the limit the others cannot be chosen. `0`: no limit.'],
  ['selectAll', '`Bind<boolean>`', '`false`', 'A "Select all" row before the items.'],
  ['hideSelected', '`Bind<boolean>`', '`false`', 'Chosen items leave the list (items in memory).'],
  ['openOnFieldClick', '`Bind<boolean>`', '`true`', 'A press on the field opens the list.'],
  ['showDropDownButton, clearButton', '`Bind<boolean>`', '`true`, `false`', 'The arrow that opens every item; the button that removes every tag.'],
  ['itemTemplate, tagTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Draws an item of the list / a tag your way.'],
  ['matchWidth', '`Bind<boolean>`', '`true`', 'The list is at least as wide as the field.'],
  ['label, labelMode, helpText, hint, prefix, icon, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup', 'see TextBox', '', 'The field props every editor has.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['selectedItems', 'read-only, reactive', 'The items of the chosen values that are known; with a data source the others are found by key.'],
  ['listItems', 'read-only', 'The `DataItems` the list shows (what the last search matched).'],
  ['opened', 'read/write, reactive', 'Whether the list is open; setting it opens or closes it.'],
  ['inputElement', 'read-only', 'The text input.'],
];

const METHODS = [
  ['open(), close()', '`boolean`, `void`', 'Opens the list (`false` when disabled or read-only); closes it.'],
  ['clear()', '`void`', 'Removes every tag.'],
  ['selectAllItems()', '`Promise<void>`', 'Chooses every item the list shows, up to `maxSelected` (a data source: after their values load).'],
  ['validate(), resetValidation(), focus()', '', 'See TextBox.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`'],
  ['onOpened()', 'The list opened.'],
  ['onClosed(reason)', "The list closed: `'escape'`, `'outside'`, `'focus'` or `'code'`."],
  ['onValidated(e)', 'See TextBox.'],
];

const KEYS = [
  ['Typing', 'Searches and opens the list; the first match is highlighted.'],
  ['Down / Up, Alt + Down', 'Open the list with every item; move in it.'],
  ['Enter', 'Choose the highlighted item or let it go; the list stays open. With `acceptCustomValue`, text that matches no item becomes a tag.'],
  ['Backspace in an empty input', 'Remove the last tag.'],
  ['Left at the start of the input', 'Go to the last tag.'],
  ['On a tag: Left, Right, Home, End', 'Move between the tags; Right on the last one and End go back to the input.'],
  ['On a tag: Delete, Backspace', 'Remove it.'],
  ['Escape', 'Close the list; closed, empty the text; then, with `clearButton`, remove every tag.'],
  ['Alt + Up, Tab', 'Close the list.'],
];

const A11Y = [
  ['Pattern', 'The APG combobox with a multi-select listbox: the input is `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`; the list is `aria-multiselectable`.'],
  ['Highlight', '`aria-activedescendant` names the highlighted option; focus stays in the input.'],
  ['Tags', 'A `role="list"` of `role="listitem"`s; each has a remove button named “Remove …” from `uiLocale`, and the “+3” tag lists the rest in its title.'],
  ['Name', 'The label names the input; help and errors describe it.'],
];

const HOOKS = [
  ['.mx-tag-box', 'Added to the field. `data-open`, `data-text` while text is typed; the field attributes of TextBox.'],
  ['.mx-tag-box__tags, .mx-tag-box__tag, .mx-tag-box__tag-text, .mx-tag-box__remove', 'The tags, one tag (`data-loading` while its item is asked for), its text, its remove button.'],
  ['.mx-tag-box__more', 'The “+3” tag.'],
  ['.mx-tag-box__input, .mx-tag-box__arrow, .mx-tag-box__clear', 'The text input and the buttons.'],
  ['.mx-tag-box__popup, .mx-list…', 'The popup and the shared list.'],
];

const TOKENS = [
  ['tagbox.tag, tagbox.tag-text', 'Units: a tag (`more`: the "+N" tag, `loading`, `focus`, `hover`, `fixed`, `disabled`) and its text.'],
  ['tagbox.remove, tagbox.remove-glyph', 'Units: a tag\'s remove button (`hover`, `pressed`) and its glyph.'],
  ['tagbox.box, tagbox.tags, tagbox.arrow, tagbox.arrow-glyph', 'Units: the box\'s space round the tags, the tags together, and the arrow that opens the list (`open`).'],
  ['tagbox.inset, tagbox.input-min-width', 'The space between the tags and the field\'s edge; the narrowest the input gets before it goes to the next line.'],
  ['list.*, listbox.*, field.*', 'The list, the list box and the field.'],
];

export default function TagBoxPage() {
  return (
    <>
      <p class="lead">
        Picks several items. The chosen ones are tags in the field, followed by a text input that searches the list;
        items come from memory or from a data source, and typed text can become a tag of its own.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TagBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="`x-model` binds an array; every change writes a new one. Created with `new`, the same properties are set from code." />
        </p>
        <Example files={code('FromCode.tsx', 'skills.ts')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="options" title="The list">
        <p>
          <Rich text="The list keeps open while you choose, shows the chosen items checked and can have a “Select all” row. Each switch is a prop you can bind." />
        </p>
        <Example files={code('TeamList.tsx')} stack>
          <TeamList />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With `dataSource` the typed text searches the data source (its `searchFields`). In `'blocks'` mode only the rows in view load; the tags of values on no loaded page are found by key. `maxTags` keeps the field short. This one holds 5,000 customers." />
        </p>
        <Example files={code('Customers.tsx')} stack>
          <Customers />
        </Example>
      </Section>

      <Section anchor="custom" title="Tags of your own">
        <p>
          <Rich text="With `acceptCustomValue`, Enter adds text that matches no item as a tag; `customValue` shapes it or turns it down. `tagTemplate` draws a tag your way." />
        </p>
        <Example files={code('CustomTags.tsx')}>
          <CustomTags />
        </Example>
      </Section>

      <Section anchor="validation" title="Validation and states">
        <Example files={code('Validation.tsx', 'skills.ts')}>
          <Validation />
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
          <Rich text="The remove buttons (`removeItem`, “Remove {text}”), the “+3” tag (`moreItems`), “Select all”, the buttons and the list texts come from `uiLocale.strings`." />
        </p>
        <Example files={code('Localization.tsx', 'skills.ts')}>
          <Localization />
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
