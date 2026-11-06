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
  ['value', '`Bind<unknown>`', 'its text', 'What it stands for in a group’s value.'],
  ['icon', '`Bind<IconSource | null>`', '`null`', 'An icon before the text: an image address, an element or a component.'],
  ['avatar', '`Bind<AvatarProps | null>`', '`null`', 'An avatar before the text (its props; the chip sets its size).'],
  ['selectable', '`Bind<boolean>`', '`false`', 'Pressed, it turns on and off (a filter). In a group that selects, the group decides.'],
  ['selected', '`Bind<boolean>`', '`false`', 'Whether it is on.'],
  ['clickable', '`Bind<boolean>`', '`false`', 'It can be pressed like a button (`onclick`).'],
  ['removable', '`Bind<boolean>`', '`false`', 'A remove button after the text; it and Delete / Backspace raise `onRemove`.'],
  ['variant', '`Bind<ChipVariant>`', 'the language’s', '`filled`, `outline`. Material draws chips outlined, the other languages filled.'],
  ['tone', '`Bind<ChipTone>`', "`'standard'`", '`standard`, `accent`, `info`, `success`, `caution`, `danger`; a selected chip shows the selection instead.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['enabled, visible, tabStop', 'see Control', '', 'The shared properties of every control.'],
];

const EVENTS = [
  ['onRemove', '`ChipRemoveEventArgs`', 'The user asked to remove it (`byKeyboard`); removing it is yours to do.'],
  ['onSelectedChanged', '`ChipSelectedChangedEventArgs`', 'It was turned on or off (`selected`), by the user or by code (`byUser`).'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'A value or a function, like the prop.'],
  ['avatarControl', 'read-only', 'The avatar before the text, when it has one.'],
];

const METHODS = [['remove()', '`void`', 'Asks for it to be removed, as its remove button does (raises `onRemove`).']];

const GROUP_PROPS = [
  ['selection', '`Bind<ChipGroupSelection>`', "`'none'`", '`none`, `single`, `multiple`.'],
  ['value', '`Bind<unknown>`', '`null` / `[]`', 'The selected chip’s value (`single`), or an array of the selected ones’ values (`multiple`). A change gives a new array. Two-way with `x-model`.'],
  ['wrap', '`Bind<boolean>`', '`true`', '`false` keeps the chips on one line that scrolls.'],
  ['label', '`Bind<string>`', "`''`", 'What screen readers call the group (“Diet”).'],
];

const GROUP_MEMBERS = [
  ['onValueChanged', 'event', 'The value changed (`value`), by the user or by code (`byUser`).'],
  ['chips', 'read-only', 'The chips in it, in order, from JSX lists too.'],
  ['isSelected(value)', '`boolean`', 'Whether the chip of `value` is selected.'],
];

const KEYS = [
  ['Enter, Space', 'Presses the chip: turns a selectable one on or off, selects one in a group.'],
  ['Delete, Backspace', 'Asks to remove a removable chip.'],
  ['Arrow keys, Home, End', 'In a group: move between the chips. Tab stops once on the group, at the chip focused last.'],
];

const A11Y = [
  ['Selectable', 'A button with `aria-pressed`.'],
  ['In a group that selects', 'The group is a `listbox` (`aria-multiselectable` for several), each chip an `option` with `aria-selected`.'],
  ['Remove', 'The remove button is named “Remove Ada” in the kit language; the keyboard reaches it through Delete on the chip.'],
  ['Disabled', 'Out of the Tab order and marked `aria-disabled`.'],
];

const HOOKS = [
  ['.mx-chip', 'The chip. `data-size`, `data-variant`, `data-selected`, `data-pressable`, `data-removable`, `data-lead`, `data-check`, `data-disabled`.'],
  ['.mx-chip__check, .mx-chip__icon, .mx-chip__avatar', 'What stands before the text.'],
  ['.mx-chip__text, .mx-chip__remove', 'The text, and the remove button.'],
  ['.mx-chip-group', 'The group. `data-wrap`.'],
];

const TOKENS = [
  ['chip.chip', 'Unit: the chip, filled at rest, then `outline`, each tone filled and outlined (`accent` … `danger`, `outline-*`), `selected`, `hover`, `pressed`, `focus`, `disabled`.'],
  ['chip.icon, chip.remove', 'Units: the icon or check mark; the remove button (`hover`, `pressed`).'],
  ['chip.height.*, chip.font-size.*, chip.padding.*, chip.icon-inset.*, chip.gap.*', 'The chip, its text and its spaces, per size.'],
  ['chip.icon-size.*, chip.avatar-size.*, chip.remove-size.*', 'What stands before and after the text, per size. An avatar and the remove button sit as far in from the edge as from the top and bottom.'],
  ['chip.variant, chip.check', 'The look a chip takes when none is given; whether a selected chip shows a check mark (Material).'],
  ['chip-group.gap', 'The space between chips.'],
];

export default function ChipPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A short text with an icon or an avatar before it: a filter to turn on, a choice among a few, or something picked that can be removed. A group selects one or several and moves between them with the arrow keys." />
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
          <Rich text="Every prop takes a value or a function. Created with `new`, the same properties are set programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="looks" title="Looks and states">
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

      <Section anchor="groups" title="Choosing in a group">
        <p>
          <Rich text="`selection` makes the chips choices; `value` holds their values and `onValueChanged` tells a change." />
        </p>
        <Example files={code('Groups.tsx')}>
          <Groups />
        </Example>
      </Section>

      <Section anchor="removing" title="Removing">
        <p>
          <Rich text="A removable chip only asks: `onRemove` is where your list loses the item, and the group follows the list." />
        </p>
        <Example files={code('Removing.tsx')}>
          <Removing />
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
          <Rich text="The remove button’s name is the kit text `removeItem` (“Remove {text}”) and changes with the kit language (`uiLocale`)." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
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
        <ApiTable head={['Member', 'Kind', 'Description']} rows={GROUP_MEMBERS} />
      </Section>
    </>
  );
}
