import { reactive, type Component } from '@motifx/core';
import { Button, enStrings, NumberBox, trStrings, uiLocale, type SpinLayout } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const show = (value: number | null) => (value === null ? 'null' : String(value));

const PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'The number; `null` when empty. `x-model` binds it two-way.'],
  ['min / max', '`Bind<number | null>`', '`null`', 'Bounds: steps stop there, Home / End go there, entered values are kept inside (see `clamp`), the range is checked.'],
  ['step', '`Bind<number>`', '`1`', 'What the arrow keys, the spin buttons and the wheel add.'],
  ['largeStep', '`Bind<number>`', '10 × `step`', 'What PageUp / PageDown add.'],
  ['showSpinButtons', '`Bind<boolean>`', '`true`', 'The up and down buttons in the box.'],
  ['spinLayout', '`Bind<SpinLayout>`', "`'stacked'`", '`stacked`: arrows on top of each other; `inline`: − and + side by side.'],
  ['wheel', '`Bind<boolean>`', '`false`', 'The mouse wheel changes the value while the field has focus.'],
  ['format', '`Bind<Intl.NumberFormatOptions>`', '`{}`', 'How the value shows without focus: `{ style: \'currency\', currency: \'TRY\' }`, `{ style: \'percent\' }`, `{ minimumFractionDigits: 2 }`…'],
  ['locale', '`Bind<string>`', 'the page `lang`', 'The locale of the format and of what is typed.'],
  ['decimals', '`Bind<number | null>`', '`null`', 'Digits kept after the point when a value is entered (rounded half away from zero).'],
  ['clamp', '`Bind<boolean>`', '`true`', 'A value outside `min` / `max` is brought inside when entered; `false` leaves it to the range check.'],
  ['allowEmpty', '`Bind<boolean>`', '`true`', 'An empty field is `null`; `false` puts `min` (or 0) in its place when the field is left.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", '`input`: the value changes as soon as the text is a whole number in range; `change`: when the field is left or Enter is pressed.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while the field is empty.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects the whole text when the field gets focus.'],
  ['align', "`Bind<'start' | 'center' | 'end'>`", "`'start'`", 'Text alignment.'],
  ['label, labelMode, helpText, hint, prefix, suffix, icon, buttons', 'see TextBox', '', 'The parts every field has.'],
  ['readOnly, required, size, variant, stretch', 'see TextBox', '', 'The states and the look every field has.'],
  ['rules, error, validateOn, validationGroup', 'see TextBox', '', 'Validation, as for every field.'],
  ['name, autocomplete', '`Bind<string>`', "—, `'off'`", 'Passed to the `<input>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop. `locale` reads back the locale in use.'],
  ['formattedValue', 'read-only, reactive', 'The value as it shows without focus, `\'\'` when empty.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The outcome of the checks.'],
  ['inputElement', 'read-only', 'The native `<input>`.'],
];

const METHODS = [
  ['stepUp(times = 1)', '`void`', 'Adds `step` × `times`, kept within `min` / `max`.'],
  ['stepDown(times = 1)', '`void`', 'Takes `step` × `times` away.'],
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the input.'],
  ['select()', '`void`', 'Selects the whole text.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; a held spin button reports every step.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Enter was pressed. `e`: `{ value, source, event }`.'],
];

const KEYS = [
  ['Up / Down arrow', 'Adds / takes away `step`.'],
  ['PageUp / PageDown', 'Adds / takes away `largeStep`.'],
  ['Home / End', 'Goes to `min` / `max` when they are set; otherwise moves the caret.'],
  ['Enter', 'Enters the typed text (rounded, kept in range) and fires `onEnter`.'],
  ['Mouse wheel', 'With `wheel`, steps while the field has focus.'],
  ['Alt + key (`&Name`)', 'Focus the field (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Role', '`spinbutton` on a text `<input inputmode="decimal">`, so phones show a number keyboard and any locale can be typed.'],
  ['Value', '`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with the formatted value (`₺1.234,50`).'],
  ['Spin buttons', 'Named “Increase” / “Decrease” from `uiLocale`; not Tab stops (the arrow keys do their job).'],
  ['Errors', '`aria-invalid="true"`; the message line is a polite live region.'],
];

const HOOKS = [
  ['.mx-field.mx-number-box', 'The field. `data-spin` while the spin buttons show, and the field attributes.'],
  ['.mx-number-box__spin', 'The spin buttons; `data-layout="stacked" | "inline"`.'],
  ['.mx-number-box__step', 'One spin button; `data-step="up" | "down"`.'],
];

const TOKENS = [
  ['number-box.spin-width', 'The width of a stacked spin button.'],
  ['number-box.spin-inset', 'The space around the stacked spin buttons.'],
  ['field.*', 'Everything else, as for TextBox.'],
];

export default function NumberBoxPage() {
  const s = reactive({
    quantity: 3 as number | null,
    rate: 0.1 as number | null,
    price: 1234.5 as number | null,
    share: 0.125 as number | null,
    dollars: 99.99 as number | null,
    age: null as number | null,
    score: 50 as number | null,
    weight: 72.456 as number | null,
    seats: 2 as number | null,
    layout: 'stacked' as SpinLayout,
    spin: true,
    lang: 'en',
    log: '',
  });
  let added = 0;
  let host: Component<HTMLDivElement> | null = null;

  const addFromCode = () => {
    const box = new NumberBox({ label: `Count ${++added}`, min: 0, max: 10, value: 5, locale: 'en' });
    box.onValueChanged((e) => (s.log = `${box.label}: ${show(e.value)}`));
    host?.controls.add(box);
    box.focus();
  };

  return (
    <>
      <p class="lead">
        A number field: arrow keys, PageUp / PageDown and spin buttons that repeat while held, bounds, a step without float
        noise, a format for display (currency, percent) and typing in the locale’s own way.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { NumberBox, type NumberBoxProps } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="`x-model` binds a number (`null` when empty). Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<NumberBox label="&Quantity" min={1} max={99} x-model={() => this.order.quantity} />

const count = new NumberBox({ label: 'Count', min: 0, max: 10, value: 5 });
count.onValueChanged((e) => console.log(e.value));
this.panel.controls.add(count);
count.stepUp();
`}
          stack
        >
          <div class="docs-flow">
            <NumberBox label="&Quantity" min={1} max={99} locale="en" x-model={() => s.quantity} />
            <output class="nb-quantity">{() => `value: ${show(s.quantity)}`}</output>
          </div>
          <div class="docs-flow">
            <Button text="Add a field from code" variant="outline" onclick={addFromCode} />
            <output class="nb-log">{() => s.log}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="steps" title="Steps and keys">
        <p>
          <Rich text="Up / Down add `step`, PageUp / PageDown add `largeStep` (10 × `step` by default), Home / End go to `min` / `max`. Steps are added on the decimal digits, so 0.1 + 0.2 is 0.3. With `wheel`, the mouse wheel steps while the field has focus." />
        </p>
        <Example
          code={`
<NumberBox label="Rate" step={0.1} min={0} max={5} wheel x-model={() => this.rate} />
`}
        >
          <NumberBox label="Rate" step={0.1} min={0} max={5} wheel locale="en" x-model={() => s.rate} />
          <output class="nb-rate">{() => `value: ${show(s.rate)}`}</output>
        </Example>
      </Section>

      <Section anchor="spin" title="Spin buttons">
        <p>
          <Rich text="Pressing a spin button steps once; holding it repeats until it is let go or a bound is reached. They sit on top of each other (`stacked`) or side by side (`inline`), or not at all." />
        </p>
        <Example
          code={`
<NumberBox label="Seats" spinLayout="inline" min={1} max={9} />
<NumberBox label="Seats" showSpinButtons={false} />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Spin buttons">
            {(['stacked', 'inline'] as SpinLayout[]).map((layout) => (
              <Button
                key={layout}
                text={layout}
                size="sm"
                variant={() => (s.spin && s.layout === layout ? 'solid' : 'ghost')}
                aria-pressed={() => s.spin && s.layout === layout}
                onclick={() => {
                  s.layout = layout;
                  s.spin = true;
                }}
              />
            ))}
            <Button text="none" size="sm" variant={() => (s.spin ? 'ghost' : 'solid')} aria-pressed={() => !s.spin} onclick={() => (s.spin = false)} />
          </div>
          <NumberBox label="Seats" min={1} max={9} locale="en" spinLayout={() => s.layout} showSpinButtons={() => s.spin} x-model={() => s.seats} />
        </Example>
      </Section>

      <Section anchor="format" title="Format and locale">
        <p>
          <Rich text="Without focus the value shows through `Intl.NumberFormat` with `format` and `locale` (the page `lang` by default); with focus it turns into the plain number to edit. What is typed is read in that locale: `1.234,5` in Turkish, `1,234.5` in English; a `.` also works as the decimal point where it cannot be a group separator. A percent is edited as shown: 12.5 for 0.125." />
        </p>
        <Example
          code={`
<NumberBox label="Price" locale="tr-TR" format={{ style: 'currency', currency: 'TRY' }} x-model={() => this.price} />
<NumberBox label="Share" format={{ style: 'percent', maximumFractionDigits: 1 }} step={0.01} />
<NumberBox label="Amount" locale="en-US" format={{ style: 'currency', currency: 'USD' }} />
`}
          stack
        >
          <div class="docs-flow">
            <NumberBox label="Price" locale="tr-TR" min={0} format={{ style: 'currency', currency: 'TRY' }} x-model={() => s.price} />
            <output class="nb-price">{() => `value: ${show(s.price)}`}</output>
          </div>
          <div class="docs-flow">
            <NumberBox label="Share" locale="en" min={0} max={1} step={0.01} format={{ style: 'percent', maximumFractionDigits: 1 }} x-model={() => s.share} />
            <output class="nb-share">{() => `value: ${show(s.share)}`}</output>
          </div>
          <div class="docs-flow">
            <NumberBox label="Amount" locale="en-US" format={{ style: 'currency', currency: 'USD' }} x-model={() => s.dollars} />
            <output>{() => `value: ${show(s.dollars)}`}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="range" title="Min, max and clamp">
        <p>
          <Rich text="An entered value outside `min` / `max` is brought inside when the field is left. With `clamp={false}` it stays as typed and the range check reports it." />
        </p>
        <Example
          code={`
<NumberBox label="Score" min={0} max={100} />
<NumberBox label="Age" min={18} max={120} clamp={false} />
`}
        >
          <NumberBox label="Score" min={0} max={100} locale="en" x-model={() => s.score} helpText="Try 250." />
          <NumberBox label="Age" min={18} max={120} clamp={false} locale="en" x-model={() => s.age} helpText="Try 12." />
        </Example>
      </Section>

      <Section anchor="decimals" title="Decimals and empty">
        <p>
          <Rich text="`decimals` rounds what is entered and limits the digits shown. An empty field is `null`; with `allowEmpty={false}` it gets `min` (or 0) when the field is left." />
        </p>
        <Example
          code={`
<NumberBox label="Weight" decimals={1} suffix="kg" />
<NumberBox label="Guests" min={1} allowEmpty={false} />
`}
        >
          <div class="docs-flow">
            <NumberBox label="Weight" decimals={1} step={0.1} suffix="kg" locale="en" x-model={() => s.weight} />
            <output class="nb-weight">{() => `value: ${show(s.weight)}`}</output>
          </div>
          <NumberBox label="Guests" min={1} allowEmpty={false} locale="en" value={2} />
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
          <Rich text="The names of the spin buttons and the range messages come from `uiLocale.strings`; numbers follow `locale`." />
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
            The up button reads <output class="nb-increase">{() => uiLocale.strings.increase}</output>
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
      </Section>
    </>
  );
}
