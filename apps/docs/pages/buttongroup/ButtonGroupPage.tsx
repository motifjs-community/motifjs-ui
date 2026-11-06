import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Looks from './examples/Looks';
import Selections from './examples/Selections';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly (ButtonGroupItem<T> | T)[]>`', '`[]`', 'The buttons: `ButtonGroupItem` objects (`value`, `text`, `icon`, `hint`, `enabled`, `visible`), plain values that serve as their own text, or objects of any shape.'],
  ['itemText, itemValue', '`ItemField`', "`'text'`, `'value'`", 'The location of the text and value in a custom object: a property name or a function.'],
  ['selection', '`Bind<ButtonGroupSelection>`', "`'single'`", '`single` selects one button, `multiple` toggles each button, and `none` makes them actions only.'],
  ['value', '`Bind<T | readonly T[] | null>`', '`null` / `[]`', 'The selected value, or an array of the values that are on. `x-model` provides two-way binding, and each change produces a new array.'],
  ['allowEmpty', '`Bind<boolean>`', '`false`', 'With `single`, pressing the selected button again clears the selection.'],
  ['attached', '`Bind<boolean>`', 'Set by the design language (`true`)', 'The buttons are attached and share their edges.'],
  ['variant', '`Bind<ButtonVariant>`', 'Set by the design language (`outline`)', 'The appearance of every button.'],
  ['size', '`Bind<ButtonSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Stretches to the full width, with the buttons sharing it evenly.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the group (“Text alignment”).'],
  ['enabled, visible', 'see Control', '', 'Properties shared by all controls.'],
];

const MEMBERS = [
  ['onValueChanged', 'event', 'Occurs when the value changes (`value`), either through user input or programmatically (`byUser`).'],
  ['onItemClick', 'event', 'Occurs when a button is pressed (`item`, `value`), with any selection mode.'],
  ['buttons', 'read-only', 'The kit buttons in the group, in item order.'],
  ['isSelected(value)', '`boolean`', 'Indicates whether the button for `value` is selected or on.'],
  ['refresh()', '`void`', 'Re-reads the items after they have been changed in place.'],
];

const KEYS = [
  ['Tab', 'One Tab stop: the button focused last, otherwise the selected one, otherwise the first.'],
  ['Arrow keys, Home, End', 'Moves between the buttons, skipping disabled ones.'],
  ['Space, Enter', 'Presses the button, which selects it, toggles it or runs its action.'],
];

const A11Y = [
  ['Group', '`role="group"` with its label.'],
  ['Buttons', 'Kit buttons. With a selection, each one reports whether it is on (`aria-pressed`). An icon-only button is named by its `hint`.'],
];

const HOOKS = [
  ['.mx-button-group', 'The group. `data-attached`, `data-stretch`.'],
  ['.mx-button-group__item', 'Each button (a `.mx-button`).'],
];

const TOKENS = [
  ['button-group.item.*', 'Place: the appearance of each button in a group (`variant`) and of the selected one (`face.*-toggled.*`).'],
  ['button-group.inner-start.*, button-group.inner-end.*', 'Places: the corners where two buttons meet.'],
  ['button-group.attached, button-group.gap', 'Whether buttons are attached by default, and the gap between them when they are not.'],
];

export default function ButtonGroupPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A set of related buttons, used as a segmented selection of one or more options or as a row of actions. The buttons are standard kit buttons and are attached by default." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ButtonGroup } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="selections" title="Multiple selection and action groups">
        <Example files={code('Selections.tsx')}>
          <Selections />
        </Example>
      </Section>

      <Section anchor="looks" title="Sizes and layout">
        <Example files={code('Looks.tsx')}>
          <Looks />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
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
          <Rich text="Events, properties and methods" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
