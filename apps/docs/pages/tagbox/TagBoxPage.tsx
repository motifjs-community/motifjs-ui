import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Customers from './examples/Customers';
import CustomTags from './examples/CustomTags';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import TeamList from './examples/TeamList';
import Validation from './examples/Validation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<V[]>`', '`[]`', 'The values of the selected items. `x-model` binds them, and every change writes a new array.'],
  ['items / dataSource', '`Bind<readonly T[]>` / `Bind<DataSource | null>`', '—', 'An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server.'],
  ['textField, valueField, iconField, groupField, enabledField', '`Bind<ItemField<T>>`', '—', 'Same as ListBox. Groups apply to in-memory items.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when no item is selected.'],
  ['searchMode, minSearchLength, searchDelay', '', "`'contains'`, `0`, `0` / `250`", 'How and when typed text searches, as in ComboBox.'],
  ['acceptCustomValue', '`Bind<boolean>`', '`false`', 'Pressing Enter adds text that matches no item as a custom tag.'],
  ['customValue', '`Bind<(text) => V | null>`', 'The text', 'Creates the value for typed text. Returning `null` rejects it.'],
  ['autoHighlight', '`Bind<boolean>`', '`true` (`false` with `acceptCustomValue`)', 'Highlights the first match while typing, so Enter accepts it.'],
  ['closeOnSelect', '`Bind<boolean>`', '`false`', 'Closes the list when an item is selected.'],
  ['maxTags', '`Bind<number>`', '`0`', 'The number of tags shown. The rest are counted in a “+3” tag. `0` shows all.'],
  ['maxSelected', '`Bind<number>`', '`0`', 'The maximum number of selectable items. At the limit, the others cannot be selected. `0` means no limit.'],
  ['selectAll', '`Bind<boolean>`', '`false`', 'Adds a "Select all" row before the items.'],
  ['hideSelected', '`Bind<boolean>`', '`false`', 'Removes selected items from the list (in-memory items only).'],
  ['openOnFieldClick', '`Bind<boolean>`', '`true`', 'Clicking the field opens the list.'],
  ['showDropDownButton, clearButton', '`Bind<boolean>`', '`true`, `false`', 'The arrow that opens all items, and the button that removes all tags.'],
  ['itemTemplate, tagTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Customizes how a list item or a tag is drawn.'],
  ['matchWidth', '`Bind<boolean>`', '`true`', 'The list is at least as wide as the field.'],
  ['label, labelMode, helpText, hint, prefix, icon, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup', 'see TextBox', '', 'Field props shared by all editors.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['selectedItems', 'read-only, reactive', 'The known items for the selected values. With a data source, the others are looked up by key.'],
  ['listItems', 'read-only', 'The `DataItems` shown in the list, which are the results of the last search.'],
  ['opened', 'read/write, reactive', 'Indicates whether the list is open. Set it to open or close the list.'],
  ['inputElement', 'read-only', 'The text input.'],
];

const METHODS = [
  ['open(), close()', '`boolean`, `void`', 'Opens the list (returns `false` when disabled or read-only), or closes it.'],
  ['clear()', '`void`', 'Removes all tags.'],
  ['selectAllItems()', '`Promise<void>`', 'Selects every item the list shows, up to `maxSelected` (with a data source, after their values load).'],
  ['refresh()', '`void`', 'Your items can be plain or reactive, and the box reads them as they are. After changing them in place, call `refresh()`. The tags, the open list and `selectedItems` update.'],
  ['validate(), resetValidation(), focus()', '', 'See TextBox.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source, event? }`'],
  ['onOpened()', 'Occurs when the list opens.'],
  ['onClosed(reason)', "Occurs when the list closes. The reason is `'escape'`, `'outside'`, `'focus'` or `'code'`."],
  ['onValidated(e)', 'See TextBox.'],
];

const KEYS = [
  ['Typing', 'Searches and opens the list, highlighting the first match.'],
  ['Down / Up, Alt + Down', 'Opens the list with all items, or moves the highlight within it.'],
  ['Enter', 'Selects or deselects the highlighted item and keeps the list open. With `acceptCustomValue`, text that matches no item becomes a tag.'],
  ['Backspace in an empty input', 'Removes the last tag.'],
  ['Left at the start of the input', 'Moves to the last tag.'],
  ['On a tag: Left, Right, Home, End', 'Moves between the tags. Right on the last tag, or End, returns to the input.'],
  ['On a tag: Delete, Backspace', 'Removes the tag.'],
  ['Escape', 'Closes the list. When closed, it clears the text, and then removes all tags with `clearButton`.'],
  ['Alt + Up, Tab', 'Closes the list.'],
];

const A11Y = [
  ['Pattern', 'The APG combobox with a multi-select listbox. The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`, and the list has `aria-multiselectable`.'],
  ['Highlight', '`aria-activedescendant` identifies the highlighted option while focus stays in the input.'],
  ['Tags', 'A `role="list"` of `role="listitem"` elements. Each has a remove button named “Remove …” from `uiLocale`, and the “+3” tag lists the rest in its title.'],
  ['Name', 'The label names the input, and help and error text describe it.'],
];

const HOOKS = [
  ['.mx-tag-box', 'Added to the field. `data-open`, and `data-text` while text is typed, plus the TextBox field attributes.'],
  ['.mx-tag-box__tags, .mx-tag-box__tag, .mx-tag-box__tag-text, .mx-tag-box__remove', 'The tags, a tag (`data-loading` while its item is requested), its text and its remove button.'],
  ['.mx-tag-box__more', 'The “+3” tag.'],
  ['.mx-tag-box__input, .mx-tag-box__arrow, .mx-tag-box__clear', 'The text input and the buttons.'],
  ['.mx-tag-box__popup, .mx-list…', 'The popup and the shared list.'],
];

const TOKENS = [
  ['tagbox.tag, tagbox.tag-text', 'Units: a tag (`more`: the "+N" tag, `loading`, `focus`, `hover`, `fixed`, `disabled`) and its text.'],
  ['tagbox.remove, tagbox.remove-glyph', 'Units: a tag\'s remove button (`hover`, `pressed`) and its glyph.'],
  ['tagbox.box, tagbox.tags, tagbox.arrow, tagbox.arrow-glyph', 'Units: the spacing around the tags in the box, the tag group, and the arrow that opens the list (`open`).'],
  ['tagbox.inset, tagbox.input-min-width', 'The space between the tags and the field edge, and the minimum width of the input before it wraps to the next line.'],
  ['list.*, listbox.*, field.*', 'The list, the list box and the field.'],
];

export default function TagBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Selects multiple items. Selected items appear as tags in the field, followed by a text input that searches the list. Items can come from memory or from a data source, and typed text can become a custom tag." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TagBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="`x-model` binds an array, and every change writes a new one. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx', 'skills.ts')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="options" title="List options">
        <p>
          <Rich text="The list stays open during selection, shows selected items as checked, and can include a “Select all” row. Each option is a prop you can bind." />
        </p>
        <Example files={code('TeamList.tsx')} stack>
          <TeamList />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="With `dataSource`, typed text searches the data source (using its `searchFields`). In `'blocks'` mode, only the visible rows load, and tags for values on unloaded pages are looked up by key. `maxTags` keeps the field compact. This example has 5,000 customers." />
        </p>
        <Example files={code('Customers.tsx')} stack>
          <Customers />
        </Example>
      </Section>

      <Section anchor="custom" title="Custom tags">
        <p>
          <Rich text="With `acceptCustomValue`, pressing Enter adds text that matches no item as a tag. `customValue` transforms or rejects it, and `tagTemplate` customizes how a tag is drawn." />
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
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The remove buttons (`removeItem`, “Remove {text}”), the “+3” tag (`moreItems`), “Select all”, the buttons and the list text come from `uiLocale.strings`." />
        </p>
        <Example files={code('Localization.tsx', 'skills.ts')}>
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
