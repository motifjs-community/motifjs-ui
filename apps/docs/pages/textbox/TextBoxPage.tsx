import { reactive, type Component } from '@motifx/core';
import { Button, enStrings, TextBox, trStrings, uiLocale, ValidationGroup, validateFields, type FieldLabelMode, type FieldVariant } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
    <path d="M10.5 10.5l3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M5.5 5.5h8v8h-8zM3 10.5h-.5v-8h8v.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

const VARIANTS: FieldVariant[] = ['outline', 'filled', 'underline'];
const MODES: FieldLabelMode[] = ['top', 'side', 'floating', 'hidden'];

const PROPS = [
  ['value', '`Bind<string>`', "`''`", 'The text. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The caption; `&Name` makes Alt+N focus the field. The same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side` (next to the box), `floating` (inside the box until there is a value), `hidden` (only for screen readers).'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while the field is empty.'],
  ['helpText', '`Bind<string>`', "`''`", 'A line under the box. An error message takes its place.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip.'],
  ['type', '`Bind<TextBoxType>`', "`'text'`", '`text`, `password`, `email`, `search`, `tel`, `url`. `email` and `url` also check the format.'],
  ['prefix / suffix', '`Bind<string>`', "`''`", 'Fixed text before / after the value inside the box (`https://`, `kg`).'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon at the start of the box.'],
  ['buttons', '`Bind<readonly FieldButton[]>`', '`[]`', 'Buttons of your own inside the box, at the start or the end.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'A button that empties the field; Escape does the same.'],
  ['passwordReveal', '`Bind<boolean>`', '`true`', 'With `type="password"`: a button that shows the password.'],
  ['maxLength / minLength', '`Bind<number>`', '—', 'Limits; `minLength` is checked by validation.'],
  ['showCounter', '`Bind<boolean>`', '`false`', '`12/50` under the box (`12` without `maxLength`).'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", '`change`: the value changes when the field is left or Enter is pressed.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects the whole text when the field gets focus.'],
  ['align', "`Bind<'start' | 'center' | 'end'>`", "`'start'`", 'Text alignment.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'Can be read, selected and copied, not changed.'],
  ['required', '`Bind<boolean>`', '`false`', 'A mark after the label, `aria-required`, and a `required` rule.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['variant', '`Bind<FieldVariant>`', "`'outline'`", '`outline`, `filled`, `underline`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in.'],
  ['mask', '`Bind<string>`', "`''`", 'See Mask.'],
  ['maskChars', '`Bind<Record<string, MaskChar>>`', '`{}`', 'Mask characters of your own.'],
  ['maskPlaceholder', '`Bind<string>`', "`'_'`", 'Shown in the places not filled yet.'],
  ['maskValue', "`Bind<'raw' | 'formatted'>`", "`'raw'`", '`raw`: only the typed characters; `formatted`: with the fixed ones.'],
  ['showMask', "`Bind<'always' | 'focus'>`", "`'focus'`", '`focus`: an empty mask shows only while the field has focus.'],
  ['rules', '`Bind<readonly ValidationRule[]>`', '`[]`', 'See Validation.'],
  ['error', '`Bind<string | null>`', '—', 'An error from outside (the server); shown until cleared.'],
  ['validateOn', '`Bind<ValidateOn>`', "`'blur'`", '`blur`, `input`, `manual`.'],
  ['validationGroup', '`Bind<ValidationGroup | null>`', '—', 'The group it is checked with.'],
  ['inputMode, autocomplete, spellcheck, name', '`Bind<…>`', '—', 'Passed to the `<input>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop: `box.error = () => this.model.nameError` is followed.'],
  ['isValid', 'read-only, reactive', '`false` while an error shows.'],
  ['validationMessage', 'read-only, reactive', 'The error shown, `\'\'` without one.'],
  ['validating', 'read-only, reactive', 'An asynchronous rule is running.'],
  ['maskComplete', 'read-only', 'Every place of the mask is filled.'],
  ['inputElement', 'read-only', 'The native `<input>`.'],
];

const METHODS = [
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the input.'],
  ['select()', '`void`', 'Selects the whole text.'],
  ['clear()', '`void`', 'Empties the field as its clear button does.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; `byUser` tells the user from code.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Enter was pressed. `e`: `{ value, source, event }`.'],
  ['oninput, onchange, onkeydown, onfocusin, onfocusout', 'The DOM events of the input reach the field.'],
];

const RULES = [
  ["{ type: 'required' }", 'Something must be entered.'],
  ["{ type: 'email' } / { type: 'url' }", 'An email address / a web address.'],
  ["{ type: 'pattern', pattern }", 'A `RegExp`, or a string that must match the whole value (like the HTML `pattern`).'],
  ["{ type: 'length', min?, max? }", 'The number of characters.'],
  ["{ type: 'range', min?, max? }", 'A number or a date between bounds.'],
  ["{ type: 'compare', with, not? }", 'Equal to another value (a repeated password), or different with `not`.'],
  ["{ type: 'custom', check, ignoreEmpty? }", '`check(value)` returns `true`, `false` or a message, or a promise of one (a server call).'],
  ['every rule', '`message` (a value or a function) and `enabled`. Empty values pass every rule but `required` and `compare`.'],
];

const MASK = [
  ['0', 'A digit.'],
  ['9', 'A digit that may stay empty.'],
  ['a', 'A letter.'],
  ['*', 'A letter or a digit.'],
  ['\\\\', 'The next character is fixed: `\\\\0` is a fixed zero.'],
  ['anything else', 'A fixed character, skipped while typing.'],
];

const KEYS = [
  ['Alt + key (`&Name`)', 'Focus the field (Control + Option + key on Apple platforms).'],
  ['Enter', 'Commits the value (with `updateOn="change"`) and fires `onEnter`.'],
  ['Escape', 'With `clearButton`, empties a field that has a value; otherwise it goes on to the window around it.'],
  ['Tab', 'The buttons you add and the password button are Tab stops; the clear button is not (Escape does its job).'],
];

const A11Y = [
  ['Element', 'A native `<input>`; its `<label>` is tied to it with `for`.'],
  ['Description', '`aria-describedby` names the prefix, the suffix and the line under the box.'],
  ['Errors', '`aria-invalid="true"`; the message line is a polite live region, so a new error is read out.'],
  ['Required', '`aria-required="true"`; the mark after the label is hidden from screen readers.'],
  ['Buttons', 'The clear and password buttons are named from `uiLocale`; the password button has `aria-pressed`.'],
];

const HOOKS = [
  ['.mx-field', 'The field. `data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`, `data-required`, `data-stretch`.'],
  ['.mx-text-box', 'Added by TextBox.'],
  ['.mx-field__label, .mx-field__box, .mx-field__input', 'The label, the box, the input.'],
  ['.mx-field__icon, .mx-field__prefix, .mx-field__suffix', 'The parts at the sides of the input.'],
  ['.mx-field__button, .mx-text-box__clear, .mx-text-box__reveal', 'The buttons in the box.'],
  ['.mx-field__message, .mx-field__counter', 'The line under the box.'],
];

const TOKENS = [
  ['field.width', 'The width when not stretched.'],
  ['field.height.*, field.padding.*, field.font-size.*', 'Sizes, from the density tokens.'],
  ['field.radius, field.border-width, field.focus-width', 'Corners, border, and the bottom line while focused.'],
  ['field.gap, field.label-gap, field.label-width, field.label-font-weight', 'Spacing and the label.'],
  ['field.message-gap, field.message-font-size, field.message-line', 'The line under the box.'],
  ['field.icon-size, field.button-inset, field.button-radius', 'Icons and buttons in the box.'],
  ['field.floating-height, field.floating-font-size', 'The floating label.'],
];

export default function TextBoxPage() {
  const s = reactive({
    name: 'Ada',
    email: '',
    password: '',
    phone: '',
    iban: '',
    plate: '',
    site: '',
    query: '',
    note: '',
    variant: 'outline' as FieldVariant,
    labelMode: 'top' as FieldLabelMode,
    editable: true,
    user: '',
    serverError: '' as string | null,
    log: [] as string[],
    lang: 'en',
    result: '',
  });
  const group = new ValidationGroup();
  let added = 0;
  let host: Component<HTMLDivElement> | null = null;
  let form: Component<HTMLDivElement> | null = null;

  const addFromCode = () => {
    const box = new TextBox({ label: `Field ${++added}`, clearButton: true, placeholder: 'Created with new' });
    box.onValueChanged((e) => (s.result = `${box.label}: ${e.value}`));
    host?.controls.add(box);
    box.focus();
  };

  const save = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Saved.' : `${result.invalid.length} field(s) to fix.`;
  };

  const checkPanel = async () => {
    const result = await validateFields(form!);
    s.result = result.valid ? 'All fields are fine.' : `${result.invalid.length} field(s) to fix.`;
  };

  const userTaken = (value: string) => new Promise<boolean | string>((done) => setTimeout(() => done(value.toLowerCase() === 'ada' ? `“${value}” is taken.` : true), 600));

  return (
    <>
      <p class="lead">
        A one-line text field with its label, help text and error: placeholder, prefix and suffix, buttons in the box,
        a clear button, a password that can be shown, a character counter, an input mask and validation — alone, in a
        group, or every field in a panel.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TextBox, ValidationGroup, validateFields, type ValidationRule } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; a function of a reactive object keeps the field in step with it. `x-model` binds the value two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<TextBox label="&Name" x-model={() => this.form.name} clearButton />

const city = new TextBox({ label: 'City', clearButton: true });
city.onValueChanged((e) => console.log(e.value, e.byUser));
this.panel.controls.add(city);
city.value = 'Ankara';
`}
          stack
        >
          <TextBox label="&Name" x-model={() => s.name} clearButton helpText={() => `Hello, ${s.name || 'stranger'}.`} />
          <div class="docs-flow">
            <Button text="Add a field from code" variant="outline" onclick={addFromCode} />
            <output class="tb-result">{() => s.result}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="label" title="Label">
        <p>
          <Rich text="The label goes above the box, next to it (`side`), inside it until there is a value (`floating`), or only to screen readers (`hidden`). `&` marks its access key." />
        </p>
        <Example
          code={`
<TextBox label="&Email" labelMode="floating" type="email" />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Label mode">
            {MODES.map((mode) => (
              <Button
                key={mode}
                text={mode}
                size="sm"
                variant={() => (s.labelMode === mode ? 'solid' : 'ghost')}
                aria-pressed={() => s.labelMode === mode}
                onclick={() => (s.labelMode = mode)}
              />
            ))}
          </div>
          <TextBox label="&Email" labelMode={() => s.labelMode} type="email" x-model={() => s.email} helpText="We never share it." />
        </Example>
      </Section>

      <Section anchor="look" title="Variants and sizes">
        <Example
          code={`
<TextBox label="Outline" />
<TextBox label="Filled" variant="filled" />
<TextBox label="Underline" variant="underline" size="lg" />
`}
          stack
        >
          {VARIANTS.map((variant) => (
            <div key={variant} class="docs-flow">
              <TextBox label={`${variant} sm`} variant={variant} size="sm" placeholder="Small" />
              <TextBox label={`${variant} md`} variant={variant} placeholder="Medium" />
              <TextBox label={`${variant} lg`} variant={variant} size="lg" placeholder="Large" />
            </div>
          ))}
        </Example>
      </Section>

      <Section anchor="content" title="Prefix, suffix, icon, buttons">
        <p>
          <Rich text="`prefix` and `suffix` are fixed text around the value; `icon` sits at the start; `buttons` adds your own, each with its own `enabled`, `visible` and `position`." />
        </p>
        <Example
          code={`
<TextBox label="Site" prefix="https://" suffix=".com" x-model={() => this.form.site} />
<TextBox label="Search" type="search" icon={() => <SearchIcon />} clearButton />
<TextBox
  label="Invite link"
  readOnly
  value={() => this.link}
  buttons={[{ icon: () => <CopyIcon />, hint: 'Copy', click: () => navigator.clipboard.writeText(this.link) }]}
/>
`}
          stack
        >
          <TextBox label="Site" prefix="https://" suffix=".com" x-model={() => s.site} />
          <TextBox label="Search" type="search" icon={() => <SearchIcon />} clearButton x-model={() => s.query} />
          <TextBox
            label="Invite link"
            readOnly
            value="https://motifjs.com/invite/42"
            buttons={[{ icon: () => <CopyIcon />, hint: 'Copy', click: () => (s.result = 'Copied.') }]}
          />
        </Example>
      </Section>

      <Section anchor="password" title="Password, counter">
        <Example
          code={`
<TextBox label="Password" type="password" x-model={() => this.form.password} />
<TextBox label="Note" maxLength={40} showCounter />
`}
          stack
        >
          <TextBox label="Password" type="password" x-model={() => s.password} autocomplete="new-password" />
          <TextBox label="Note" maxLength={40} showCounter x-model={() => s.note} />
        </Example>
      </Section>

      <Section anchor="mask" title="Mask">
        <p>
          <Rich text={'A mask keeps the text in shape while it is typed, deleted or pasted; the caret skips the fixed characters. The value is the typed characters only, or with `maskValue="formatted"` the text as shown. A mask that is not filled in fails validation.'} />
        </p>
        <ApiTable head={['Character', 'Means']} rows={MASK} />
        <Example
          code={`
<TextBox label="Phone" mask="(000) 000 00 00" x-model={() => this.form.phone} />
<TextBox label="IBAN" mask="TR00 0000 0000 0000 0000 0000 00" maskValue="formatted" />
<TextBox
  label="Plate"
  mask="00 LLL 099"
  maskChars={{ L: { test: /\\p{L}/u, transform: 'upper' } }}
/>
`}
          stack
        >
          <div class="docs-flow">
            <TextBox label="Phone" type="tel" mask="(000) 000 00 00" x-model={() => s.phone} />
            <output class="tb-phone">{() => `value: "${s.phone}"`}</output>
          </div>
          <div class="docs-flow">
            <TextBox label="IBAN" mask="TR00 0000 0000 0000 0000 0000 00" maskValue="formatted" stretch x-model={() => s.iban} />
          </div>
          <div class="docs-flow">
            <TextBox label="Plate" mask="00 LLL 099" maskChars={{ L: { test: /\p{L}/u, transform: 'upper' } }} x-model={() => s.plate} />
            <output>{() => `value: "${s.plate}"`}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="validation" title="Validation">
        <p>
          <Rich text={'A field checks itself when it is left after a change, then on every change until the value passes. `required`, `minLength`, `type="email"` and a mask bring their own rules; `rules` adds yours, async ones too. `error` shows a message from outside, e.g. from the server.'} />
        </p>
        <Example
          code={`
const group = new ValidationGroup();

<TextBox label="Email" type="email" required validationGroup={group} />
<TextBox
  label="User name"
  required
  rules={[
    { type: 'length', min: 3 },
    { type: 'pattern', pattern: '[a-z0-9_]+', message: 'Lower case letters, digits and _ only.' },
    { type: 'custom', check: (v) => api.isFree(v) },   // true, false or a message
  ]}
  validationGroup={group}
/>
<TextBox label="Code" error={() => this.model.codeError} validationGroup={group} />

<Button text="Save" onclick={async () => (await group.validate()).valid && this.save()} />
`}
          stack
        >
          <TextBox label="Email" type="email" required validationGroup={group} />
          <TextBox
            label="User name"
            required
            helpText="Try “ada”: the server says it is taken."
            x-model={() => s.user}
            rules={[
              { type: 'length', min: 3 },
              { type: 'pattern', pattern: '[a-z0-9_]+', message: 'Lower case letters, digits and _ only.' },
              { type: 'custom', check: userTaken },
            ]}
            validationGroup={group}
          />
          <TextBox label="Code" error={() => s.serverError} validationGroup={group} helpText="An error from outside shows until cleared." />
          <div class="docs-flow">
            <Button text="Save" tone="accent" onclick={save} />
            <Button text="Server error" variant="outline" onclick={() => (s.serverError = s.serverError ? null : 'This code expired.')} />
            <Button text="Reset" variant="ghost" onclick={() => group.reset()} />
            <output class="tb-save">{() => s.result}</output>
          </div>
        </Example>
        <p>
          <Rich text="Without a group, `validateFields(panel)` checks every field inside a component or an element: a panel, a dialog, a page." />
        </p>
        <Example
          code={`
const result = await validateFields(this.panel);   // { valid, invalid }
`}
        >
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (form = c)}>
            <TextBox label="First name" required />
            <TextBox label="Last name" required />
            <Button text="Check the panel" variant="outline" onclick={checkPanel} />
          </div>
        </Example>
      </Section>

      <Section anchor="states" title="Read-only and disabled">
        <Example
          code={`
<TextBox label="Order" value="#1042" readOnly={() => !this.editing} />
<TextBox label="Order" value="#1042" enabled={() => this.editing} />
`}
        >
          <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
          <TextBox label="Read-only" value="#1042" readOnly={() => !s.editable} clearButton />
          <TextBox label="Disabled" value="#1042" enabled={() => s.editable} />
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
          <Rich text="The names of the clear and password buttons and every validation message come from `uiLocale.strings`; every field follows a change at once, errors already shown included." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
uiLocale.strings = { ...uiLocale.strings, required: 'Please fill this in.' };
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
            Required reads <output class="tb-required">{() => uiLocale.strings.required}</output>
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
        <h3>Validation rules</h3>
        <ApiTable head={['Rule', 'Checks']} rows={RULES} />
        <p>
          <Rich text="The frame (`Field`), the mask (`InputMask`, which works on any `<input>`) and validation (`ValidationGroup`, `validateFields`, `checkRules`) are shared parts, exported for other components and your own." />
        </p>
      </Section>
    </>
  );
}
