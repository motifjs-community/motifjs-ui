import { reactive, type Component } from '@motifx/core';
import { Button, CheckBox, enStrings, trStrings, uiLocale, ValidationGroup, type ControlSize, type LabelPosition } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

const PROPS = [
  ['value', '`Bind<boolean | null>`', '`false`', '`true` checked, `false` unchecked, `null` indeterminate. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The caption next to the box; `&Name` makes Alt+N toggle it. The same property as `text`.'],
  ['labelPosition', "`Bind<'start' | 'end'>`", "`'end'`", 'The caption after the box (`end`) or before it (`start`), in the reading direction.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`hidden` keeps the caption for screen readers only; every other mode shows it next to the box.'],
  ['threeState', '`Bind<boolean>`', '`false`', 'A click goes unchecked → checked → indeterminate. Without it a click only checks and unchecks; code can still set `null`.'],
  ['helpText', '`Bind<string>`', "`''`", 'A line under the caption. An error message takes its place.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'Focusable and read out, but a click or Space changes nothing.'],
  ['required', '`Bind<boolean>`', '`false`', 'It must be checked: a mark after the caption, `aria-required` and a `required` rule.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`; the row height follows the density tokens.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in; with `labelPosition="start"` the box goes to the far end.'],
  ['name', '`Bind<string>`', "`''`", 'The name it is sent with in a form.'],
  ['rules, error, validateOn, validationGroup', 'see Field', '', 'Validation, as in every field.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The outcome of the last check.'],
  ['inputElement', 'read-only', 'The native `<input type="checkbox">`.'],
];

const METHODS = [
  ['toggle()', '`void`', 'Changes the value as a click does (with `threeState`, to the next of the three).'],
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the box.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; `null` stays `null`.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onclick, onchange, onfocusin, onfocusout', 'The DOM events of the input reach the field.'],
];

const KEYS = [
  ['Space', 'Toggles it (the native checkbox key).'],
  ['Alt + key (`&Name`)', 'Focuses and toggles it (Control + Option + key on Apple platforms).'],
  ['Tab', 'One stop per checkbox.'],
];

const A11Y = [
  ['Element', 'A native `<input type="checkbox">` drawn with `appearance: none`; its caption is a `<label for>`, so a click on the caption toggles it.'],
  ['Indeterminate', 'The native `indeterminate` state: read out as "mixed".'],
  ['Read-only', '`aria-readonly="true"`; it keeps its place in the Tab order.'],
  ['Errors', '`aria-invalid="true"`; the line under the caption is a polite live region and describes the box.'],
  ['Focus', 'The design system focus ring, for the keyboard only.'],
];

const HOOKS = [
  ['.mx-check-box', 'The field. `data-state` (`checked`, `unchecked`, `mixed`), `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`.'],
  ['.mx-toggle-field', 'The layout CheckBox and Switch share: the box and its caption side by side.'],
  ['.mx-check-box__input', 'The native checkbox: the box itself.'],
  ['.mx-check-box__mark, .mx-check-box__check, .mx-check-box__dash', 'The mark drawn over the box.'],
  ['.mx-field__label, .mx-field__message', 'The caption and the line under it.'],
];

const TOKENS = [
  ['checkbox.size.*, checkbox.mark-size.*', 'The box and its mark, per size.'],
  ['checkbox.height.*, checkbox.font-size.*', 'The row height (density tokens) and the caption size.'],
  ['checkbox.radius, checkbox.border-width, checkbox.gap', 'Corners, border, and the space before the caption.'],
];

interface Topping {
  id: number;
  name: string;
  on: boolean;
}

export default function CheckBoxPage() {
  const s = reactive({
    remember: true,
    mixed: null as boolean | null,
    three: false as boolean | null,
    position: 'end' as LabelPosition,
    terms: false,
    privacy: false,
    locked: true,
    editable: true,
    lang: 'en',
    result: '',
    toppings: [
      { id: 1, name: 'Cheese', on: true },
      { id: 2, name: 'Olives', on: false },
      { id: 3, name: 'Peppers', on: true },
    ] as Topping[],
  });
  const group = new ValidationGroup();
  let added = 0;
  let host: Component<HTMLDivElement> | null = null;

  const allToppings = (): boolean | null => {
    const on = s.toppings.filter((t) => t.on).length;
    return on === 0 ? false : on === s.toppings.length ? true : null;
  };

  const addFromCode = () => {
    const box = new CheckBox({ label: `Option ${++added}`, threeState: true });
    box.onValueChanged((e) => (s.result = `${box.label}: ${String(e.value)}`));
    host?.controls.add(box);
    box.focus();
  };

  const save = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Signed up.' : `${result.invalid.length} box(es) to check.`;
  };

  return (
    <>
      <p class="lead">
        A checkbox with its caption: checked, unchecked or indeterminate, three states on request, read-only, required
        and checked with its group. A native checkbox underneath, drawn from the design tokens.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { CheckBox } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<CheckBox label="&Remember me" x-model={() => this.form.remember} />

const box = new CheckBox({ label: 'Option 1', threeState: true });
box.onValueChanged((e) => console.log(e.value, e.byUser));
this.panel.controls.add(box);
`}
          stack
        >
          <CheckBox label="&Remember me" x-model={() => s.remember} helpText={() => (s.remember ? 'You stay signed in.' : 'You sign in every time.')} />
          <div class="docs-flow">
            <Button text="Add a checkbox from code" variant="outline" onclick={addFromCode} />
            <output class="cb-result">{() => s.result}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="states" title="Checked, unchecked, indeterminate">
        <p>
          <Rich text="`null` shows the indeterminate dash. A click on it checks the box; with `threeState` the user goes through all three: unchecked → checked → indeterminate." />
        </p>
        <Example
          code={`
<CheckBox label="Checked" value={true} />
<CheckBox label="Indeterminate" value={null} />
<CheckBox label="Three states" threeState x-model={() => this.state} />
`}
        >
          <CheckBox label="Unchecked" value={false} />
          <CheckBox label="Checked" value={true} />
          <CheckBox label="Indeterminate" x-model={() => s.mixed} />
          <CheckBox label="Three st&ates" threeState x-model={() => s.three} />
          <output class="cb-three">{() => `value: ${String(s.three)}`}</output>
        </Example>
        <p>
          <Rich text="A box over a list is indeterminate while only some items are checked. Its value is a function of the list; a click on it checks or unchecks them all." />
        </p>
        <Example
          code={`
<CheckBox
  label="All toppings"
  value={() => this.allToppings()}   // true, false or null
  onValueChanged={(e) => e.byUser && this.toppings.forEach((t) => (t.on = e.value === true))}
/>
{this.toppings.map((t) => <CheckBox key={t.id} label={t.name} x-model={() => t.on} />)}
`}
          stack
        >
          <CheckBox
            label="All toppings"
            class="cb-all"
            value={allToppings}
            onValueChanged={(e) => {
              if (e.byUser) for (const t of s.toppings) t.on = e.value === true;
            }}
          />
          <div class="docs-flow" style="padding-inline-start: var(--mx-space-6)">
            {s.toppings.map((t) => (
              <CheckBox key={t.id} label={t.name} x-model={() => t.on} />
            ))}
          </div>
        </Example>
      </Section>

      <Section anchor="caption" title="Caption">
        <p>
          <Rich text={'The caption sits after the box, or before it with `labelPosition="start"`. With `stretch` the field takes the width, so a box after its caption goes to the far end, as in a settings list. `labelMode="hidden"` keeps the caption for screen readers only.'} />
        </p>
        <Example
          code={`
<CheckBox label="Show hidden files" labelPosition="start" stretch />
<CheckBox label="Select row 3" labelMode="hidden" />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Caption position">
            {(['end', 'start'] as LabelPosition[]).map((position) => (
              <Button
                key={position}
                text={position}
                size="sm"
                variant={() => (s.position === position ? 'solid' : 'ghost')}
                aria-pressed={() => s.position === position}
                onclick={() => (s.position = position)}
              />
            ))}
          </div>
          <CheckBox label="Show hidden files" labelPosition={() => s.position} />
          <div style="inline-size: 20rem">
            <CheckBox label="Wrap long lines" labelPosition={() => s.position} stretch value={true} />
          </div>
          <CheckBox label="Select row 3" labelMode="hidden" />
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes">
        <Example
          code={`
<CheckBox label="Small" size="sm" />
<CheckBox label="Large" size="lg" />
`}
        >
          {SIZES.map((size) => (
            <CheckBox key={size} label={size} size={size} value={size !== 'sm'} />
          ))}
        </Example>
      </Section>

      <Section anchor="validation" title="Required">
        <p>
          <Rich text="`required` means the box must be checked. It is checked with its group, like any field: the first box left unchecked gets focus." />
        </p>
        <Example
          code={`
const group = new ValidationGroup();

<CheckBox label="I accept the terms" required validationGroup={group} x-model={() => this.form.terms} />
<CheckBox label="I read the privacy notice" required validationGroup={group} />
<Button text="Sign up" onclick={async () => (await group.validate()).valid && this.signUp()} />
`}
          stack
        >
          <CheckBox label="I accept the &terms" required validationGroup={group} x-model={() => s.terms} />
          <CheckBox label="I read the privacy notice" required validationGroup={group} x-model={() => s.privacy} />
          <div class="docs-flow">
            <Button text="Sign up" tone="accent" onclick={save} />
            <Button text="Reset" variant="ghost" onclick={() => group.reset()} />
            <output class="cb-save">{() => s.result}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="states-ro" title="Read-only and disabled">
        <Example
          code={`
<CheckBox label="Paid" readOnly={() => !this.editing} x-model={() => this.order.paid} />
<CheckBox label="Paid" enabled={() => this.editing} x-model={() => this.order.paid} />
`}
        >
          <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
          <CheckBox label="Read-only" readOnly={() => !s.editable} x-model={() => s.locked} />
          <CheckBox label="Disabled" enabled={() => s.editable} x-model={() => s.locked} />
          <CheckBox label="Disabled, unchecked" enabled={() => s.editable} value={false} />
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
          <Rich text="The checkbox writes no text of its own; the `required` message comes from `uiLocale.strings`, and a message already shown follows a change at once." />
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
          <span>
            Required reads <output>{() => uiLocale.strings.required}</output>
          </span>
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
        <p>
          <Rich text="`ToggleField`, the base CheckBox and Switch share (the caption next to a native checkbox, read-only, the access key), is exported for controls of your own." />
        </p>
      </Section>
    </>
  );
}
