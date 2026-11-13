import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Groups from './examples/Groups';
import Looks from './examples/Looks';
import Removing from './examples/Removing';
import Sizes from './examples/Sizes';
import Tones from './examples/Tones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The text.'],
  ['value', '`Bind<unknown>`', 'Its text', 'The value it represents in a group.'],
  ['icon', '`Bind<IconSource | null>`', '`null`', 'An icon before the text: an image address or a component.'],
  ['avatar', '`Bind<AvatarProps | null>`', '`null`', 'An avatar before the text (its props; the chip sets the size).'],
  ['selectable', '`Bind<boolean>`', '`false`', 'Pressing the chip toggles it, as a filter. In a group with selection, the group controls it.'],
  ['selected', '`Bind<boolean>`', '`false`', 'Indicates whether the chip is on.'],
  ['clickable', '`Bind<boolean>`', '`false`', 'Lets the chip be pressed like a button (`onclick`).'],
  ['removable', '`Bind<boolean>`', '`false`', 'Adds a remove button after the text. The button, Delete and Backspace raise `onRemove`.'],
  ['variant', '`Bind<ChipVariant>`', 'Set by the design language', '`filled` or `outline`. Material draws chips outlined, and the other design languages draw them filled.'],
  ['tone', '`Bind<ChipTone>`', "`'standard'`", '`standard`, `accent`, `info`, `success`, `caution` or `danger`. A selected chip shows the selection color instead.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['enabled, visible, tabStop', 'see Control', '', 'Properties shared by all controls.'],
];

const EVENTS = [
  ['onRemove', '`ChipRemoveEventArgs`', 'Occurs when the user requests removal (`byKeyboard`). Your code performs the removal.'],
  ['onSelectedChanged', '`ChipSelectedChangedEventArgs`', 'Occurs when the chip is turned on or off (`selected`), either by the user or programmatically (`byUser`).'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['avatarControl', 'read-only', 'The avatar before the text, if there is one.'],
];

const METHODS = [['remove()', '`void`', 'Requests removal, as the remove button does (raises `onRemove`).']];

const GROUP_PROPS = [
  ['selection', '`Bind<ChipGroupSelection>`', "`'none'`", '`none`, `single`, `multiple`.'],
  ['value', '`Bind<unknown>`', '`null` / `[]`', 'The value of the selected chip (`single`), or an array of selected values (`multiple`). A change produces a new array. `x-model` provides two-way binding.'],
  ['wrap', '`Bind<boolean>`', '`true`', '`false` keeps the chips on one line that scrolls.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the group (“Diet”).'],
];

const GROUP_MEMBERS = [
  ['onValueChanged', 'event', 'Occurs when the value changes (`value`), either through user input or programmatically (`byUser`).'],
  ['chips', 'read-only', 'The chips in order, including those from JSX lists.'],
  ['isSelected(value)', '`boolean`', 'Indicates whether the chip for `value` is selected.'],
];

const KEYS = [
  ['Enter, Space', 'Presses the chip, which toggles a selectable chip or selects one in a group.'],
  ['Delete, Backspace', 'Requests removal of a removable chip.'],
  ['Arrow keys, Home, End', 'In a group, moves between the chips. The group has one Tab stop, on the chip focused last.'],
];

const A11Y = [
  ['Selectable', 'A button with `aria-pressed`.'],
  ['In a group that selects', 'The group is a `listbox` (`aria-multiselectable` for multiple selection), and each chip is an `option` with `aria-selected`.'],
  ['Remove', 'The remove button is named “Remove Ada” in the kit language. Keyboard users reach it with Delete on the chip.'],
  ['Disabled state', 'Removed from the Tab order and marked with `aria-disabled`.'],
];

const HOOKS = [
  ['.mx-chip', 'The chip. `data-size`, `data-variant`, `data-selected`, `data-pressable`, `data-removable`, `data-lead`, `data-check`, `data-disabled`.'],
  ['.mx-chip__check, .mx-chip__icon, .mx-chip__avatar', 'The content before the text.'],
  ['.mx-chip__text, .mx-chip__remove', 'The text and the remove button.'],
  ['.mx-chip-group', 'The group. `data-wrap`.'],
];

const TOKENS = [
  ['chip.chip', 'Unit: the chip, filled at rest, then `outline`, each tone filled and outlined (`accent` … `danger`, `outline-*`), and `selected`, `hover`, `pressed`, `focus` and `disabled`.'],
  ['chip.icon, chip.remove', 'Units: the icon or check mark, and the remove button (`hover`, `pressed`).'],
  ['chip.height.*, chip.font-size.*, chip.padding.*, chip.icon-inset.*, chip.gap.*', 'The chip, its text and its spacing, per size.'],
  ['chip.icon-size.*, chip.avatar-size.*, chip.remove-size.*', 'The content before and after the text, per size. An avatar and the remove button have the same inset from the edge as from the top and bottom.'],
  ['chip.variant, chip.check', 'The default appearance, and whether a selected chip shows a check mark (Material).'],
  ['chip-group.gap', 'The space between chips.'],
];

export default function ChipPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A compact element with short text and an optional leading icon or avatar. Use it as a filter, as a choice among a few options, or to represent a selected item that can be removed. A group handles single or multiple selection and arrow key navigation." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Chip, ChipGroup } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="looks" title="Appearance and states">
        <Example files={code('Looks.tsx')}>
          <Looks />
        </Example>
      </Section>

      <Section anchor="tones" title="Tones">
        <Example files={code('Tones.tsx')}>
          <Tones />
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes">
        <Example files={code('Sizes.tsx')}>
          <Sizes />
        </Example>
      </Section>

      <Section anchor="groups" title="Selection in a group">
        <p>
          <Rich text="`selection` turns chips into selectable options. `value` holds their values, and `onValueChanged` reports changes." />
        </p>
        <Example files={code('Groups.tsx')}>
          <Groups />
        </Example>
      </Section>

      <Section anchor="removing" title="Removing chips">
        <p>
          <Rich text="A removable chip only sends a request. Remove the item from your list in `onRemove`, and the group updates to match." />
        </p>
        <Example files={code('Removing.tsx')}>
          <Removing />
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
          <Rich text="The remove button's name is the `removeItem` kit string (“Remove {text}”) and changes with the kit language (`uiLocale`)." />
        </p>
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
          <Rich text="Chip props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Chip events" />
        </h3>
        <ApiTable head={['Event', 'Arguments', 'Description']} rows={EVENTS} />
        <h3>
          <Rich text="Chip properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Chip methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="ChipGroup props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={GROUP_PROPS} />
        <h3>
          <Rich text="ChipGroup events, properties and methods" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Description']} rows={GROUP_MEMBERS} />
      </Section>
    </>
  );
}
