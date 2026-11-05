import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Looks from './examples/Looks';
import Selections from './examples/Selections';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly (ButtonGroupItem<T> | T)[]>`', '`[]`', 'The buttons: `ButtonGroupItem`s (`value`, `text`, `icon`, `hint`, `enabled`, `visible`), plain values (each its own text), or objects of your own shape.'],
  ['itemText, itemValue', '`ItemField`', "`'text'`, `'value'`", 'Where an item of your own shape keeps its text and its value: a property name or a function.'],
  ['selection', '`Bind<ButtonGroupSelection>`', "`'single'`", '`single`: one of them; `multiple`: each on and off; `none`: only actions.'],
  ['value', '`Bind<T | readonly T[] | null>`', '`null` / `[]`', 'The chosen value, or an array of the values turned on. Two-way with `x-model`; a change gives a new array.'],
  ['allowEmpty', '`Bind<boolean>`', '`false`', '`single`: pressing the chosen button again leaves none chosen.'],
  ['attached', '`Bind<boolean>`', 'the language’s (`true`)', 'The buttons touch, sharing their edges.'],
  ['variant', '`Bind<ButtonVariant>`', 'the language’s (`outline`)', 'The look of every button.'],
  ['size', '`Bind<ButtonSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width, the buttons sharing it.'],
  ['label', '`Bind<string>`', "`''`", 'What screen readers call the group (“Text alignment”).'],
  ['enabled, visible', 'see Control', '', 'The shared properties of every control.'],
];

const MEMBERS = [
  ['onValueChanged', 'event', 'The value changed (`value`), by the user or by code (`byUser`).'],
  ['onItemClick', 'event', 'A button was pressed (`item`, `value`), with any selection.'],
  ['buttons', 'read-only', 'The kit buttons of the group, in the order of the items.'],
  ['isSelected(value)', '`boolean`', 'Whether the button of `value` is chosen or on.'],
  ['refresh()', '`void`', 'Reads the items again after they were changed in place.'],
];

const KEYS = [
  ['Tab', 'One stop: the button focused last, else the chosen one, else the first.'],
  ['Arrow keys, Home, End', 'Move between the buttons (disabled ones are skipped).'],
  ['Space, Enter', 'Press the button: choose it, turn it on or off, or do its action.'],
];

const A11Y = [
  ['Group', '`role="group"` with its label.'],
  ['Buttons', 'Kit buttons; with a selection each says whether it is on (`aria-pressed`). A button with only an icon is named by its `hint`.'],
];

const HOOKS = [
  ['.mx-button-group', 'The group. `data-attached`, `data-stretch`.'],
  ['.mx-button-group__item', 'Each button (a `.mx-button`).'],
];

const TOKENS = [
  ['button-group.item.*', 'Place: each button’s look in a group (`variant`) and the look of the chosen one (`face.*-toggled.*`).'],
  ['button-group.inner-start.*, button-group.inner-end.*', 'Places: the corners where two buttons touch.'],
  ['button-group.attached, button-group.gap', 'Whether buttons touch when not told, and the space between them when they do not.'],
];

export default function ButtonGroupPage() {
  return (
    <>
      <p class="lead">
        Buttons that belong together: a segmented choice of one or several, or a row of actions. The buttons are the
        kit’s own, touching by default.
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
          <Rich text="Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="selections" title="Several, or only actions">
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
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Events, properties and methods</h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
