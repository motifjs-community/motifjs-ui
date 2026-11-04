# TextBox

> Editors · @motifx-community/ui 0.1.0-beta.0

A one-line text field with its label, help text and error: placeholder, prefix and suffix, buttons in the box, a clear button, a password that can be shown, a character counter, an input mask and validation — alone, in a group, or every field in a panel.

## Import

```tsx
import { TextBox, ValidationGroup, validateFields, type ValidationRule } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; a function of a reactive object keeps the field in step with it. `x-model` binds the value two-way. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox } from '@motifx-community/ui';

/** A field bound to state with x-model, and fields created with `new` and added from code. */
export default function FromCode() {
  const form = reactive({ name: 'Ada', result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const box = new TextBox({ label: `Field ${++added}`, clearButton: true, placeholder: 'Created with new' });
    box.onValueChanged((e) => (form.result = `${box.label}: ${e.value}`));
    host?.controls.add(box);
    box.focus();
  };

  return (
    <>
      <TextBox label="&Name" x-model={() => form.name} clearButton helpText={() => `Hello, ${form.name || 'stranger'}.`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a field from code" variant="outline" onclick={addFromCode} />
        <output class="tb-result">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Label

The label goes above the box, next to it (`side`), inside it until there is a value (`floating`), or only to screen readers (`hidden`). `&` marks its access key.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, type FieldLabelMode } from '@motifx-community/ui';

const MODES: FieldLabelMode[] = ['top', 'side', 'floating', 'hidden'];

/** The label above the box, next to it, floating inside it, or only for screen readers. */
export default function LabelModes() {
  const s = reactive({ email: '', labelMode: 'top' as FieldLabelMode });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Label mode">
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
      </Stack>
      <TextBox label="&Email" labelMode={() => s.labelMode} type="email" x-model={() => s.email} helpText="We never share it." />
    </>
  );
}
```

## Variants and sizes

```tsx
import { Stack, TextBox, type FieldVariant } from '@motifx-community/ui';

const VARIANTS: FieldVariant[] = ['outline', 'filled', 'underline'];

/** Every variant in the three sizes. */
export default function VariantsAndSizes() {
  return (
    <>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          <TextBox label={`${variant} sm`} variant={variant} size="sm" placeholder="Small" />
          <TextBox label={`${variant} md`} variant={variant} placeholder="Medium" />
          <TextBox label={`${variant} lg`} variant={variant} size="lg" placeholder="Large" />
        </Stack>
      ))}
    </>
  );
}
```

## Prefix, suffix, icon, buttons

`prefix` and `suffix` are fixed text around the value; `icon` sits at the start; `buttons` adds your own, each with its own `enabled`, `visible` and `position`.

```tsx
import { reactive } from '@motifx/core';
import { TextBox } from '@motifx-community/ui';

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

/** Fixed text around the value, an icon at the start, and a button of your own in the box. */
export default function PrefixSuffix() {
  const s = reactive({ site: '', query: '' });
  const link = 'https://motifjs.com/invite/42';
  return (
    <>
      <TextBox label="Site" prefix="https://" suffix=".com" x-model={() => s.site} />
      <TextBox label="Search" type="search" icon={() => <SearchIcon />} clearButton x-model={() => s.query} />
      <TextBox
        label="Invite link"
        readOnly
        value={link}
        buttons={[{ icon: () => <CopyIcon />, hint: 'Copy', click: () => navigator.clipboard.writeText(link) }]}
      />
    </>
  );
}
```

## Password, counter

```tsx
import { reactive } from '@motifx/core';
import { Stack, TextBox } from '@motifx-community/ui';

/** A password that can be shown, and a field that counts its characters; a password sits in a form. */
export default function PasswordCounter() {
  const s = reactive({ password: '', note: '' });
  return (
    <form onsubmit={(e: SubmitEvent) => e.preventDefault()}>
      <Stack>
        <TextBox label="Password" type="password" x-model={() => s.password} autocomplete="new-password" />
        <TextBox label="Note" maxLength={40} showCounter x-model={() => s.note} />
      </Stack>
    </form>
  );
}
```

## Mask

A mask keeps the text in shape while it is typed, deleted or pasted; the caret skips the fixed characters. The value is the typed characters only, or with `maskValue="formatted"` the text as shown. A mask that is not filled in fails validation.

| Character | Means |
| --- | --- |
| `0` | A digit. |
| `9` | A digit that may stay empty. |
| `a` | A letter. |
| `*` | A letter or a digit. |
| `\\` | The next character is fixed: `\\0` is a fixed zero. |
| `anything else` | A fixed character, skipped while typing. |

```tsx
import { reactive } from '@motifx/core';
import { Stack, TextBox } from '@motifx-community/ui';

/** A phone number, an IBAN kept with its spaces, and a plate with a mask character of its own. */
export default function Masks() {
  const s = reactive({ phone: '', iban: '', plate: '' });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <TextBox label="Phone" type="tel" mask="(000) 000 00 00" x-model={() => s.phone} />
        <output class="tb-phone">{() => `value: "${s.phone}"`}</output>
      </Stack>
      <TextBox label="IBAN" mask="TR00 0000 0000 0000 0000 0000 00" maskValue="formatted" stretch x-model={() => s.iban} />
      <Stack orientation="horizontal" wrap align="center">
        <TextBox label="Plate" mask="00 LLL 099" maskChars={{ L: { test: /\p{L}/u, transform: 'upper' } }} x-model={() => s.plate} />
        <output>{() => `value: "${s.plate}"`}</output>
      </Stack>
    </>
  );
}
```

## Validation

A field checks itself when it is left after a change, then on every change until the value passes. `required`, `minLength`, `type="email"` and a mask bring their own rules; `rules` adds yours, async ones too. `error` shows a message from outside, e.g. from the server.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, ValidationGroup } from '@motifx-community/ui';

/** Stands in for a server call: "ada" is taken. */
const isFree = (value: string) =>
  new Promise<boolean | string>((done) => setTimeout(() => done(value.toLowerCase() === 'ada' ? `“${value}” is taken.` : true), 600));

/** Built-in rules, rules of your own (an async one too), an error from outside, and a group checked on Save. */
export default function Validation() {
  const s = reactive({ user: '', serverError: '' as string | null, result: '' });
  const group = new ValidationGroup();

  const save = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Saved.' : `${result.invalid.length} field(s) to fix.`;
  };

  return (
    <>
      <TextBox label="Email" type="email" required validationGroup={group} />
      <TextBox
        label="User name"
        required
        helpText="Try “ada”: the server says it is taken."
        x-model={() => s.user}
        rules={[
          { type: 'length', min: 3 },
          { type: 'pattern', pattern: '[a-z0-9_]+', message: 'Lower case letters, digits and _ only.' },
          { type: 'custom', check: isFree },
        ]}
        validationGroup={group}
      />
      <TextBox label="Code" error={() => s.serverError} validationGroup={group} helpText="An error from outside shows until cleared." />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save" tone="accent" onclick={save} />
        <Button text="Server error" variant="outline" onclick={() => (s.serverError = s.serverError ? null : 'This code expired.')} />
        <Button text="Reset" variant="ghost" onclick={() => group.reset()} />
        <output class="tb-save">{() => s.result}</output>
      </Stack>
    </>
  );
}
```

Without a group, `validateFields(panel)` checks every field inside a component or an element: a panel, a dialog, a page.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, validateFields } from '@motifx-community/ui';

/** Every field inside a panel checked at once, without a group. */
export default function CheckPanel() {
  const s = reactive({ result: '' });
  let panel: Stack | null = null;

  const check = async () => {
    const result = await validateFields(panel!);
    s.result = result.valid ? 'All fields are fine.' : `${result.invalid.length} field(s) to fix.`;
  };

  return (
    <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (panel = c)}>
      <TextBox label="First name" required />
      <TextBox label="Last name" required />
      <Button text="Check the panel" variant="outline" onclick={check} />
      <output>{() => s.result}</output>
    </Stack>
  );
}
```

## Read-only and disabled

```tsx
import { reactive } from '@motifx/core';
import { Button, TextBox } from '@motifx-community/ui';

/** Read-only and disabled, both following state. */
export default function ReadOnly() {
  const s = reactive({ editing: true });
  return (
    <>
      <Button text="Toggle" variant="outline" onclick={() => (s.editing = !s.editing)} />
      <TextBox label="Read-only" value="#1042" readOnly={() => !s.editing} clearButton />
      <TextBox label="Disabled" value="#1042" enabled={() => s.editing} />
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Alt + key (`&Name`)` | Focus the field (Control + Option + key on Apple platforms). |
| `Enter` | Commits the value (with `updateOn="change"`) and fires `onEnter`. |
| `Escape` | With `clearButton`, empties a field that has a value; otherwise it goes on to the window around it. |
| `Tab` | The buttons you add and the password button are Tab stops; the clear button is not (Escape does its job). |

## Accessibility

| Topic | How |
| --- | --- |
| `Element` | A native `<input>`; its `<label>` is tied to it with `for`. |
| `Description` | `aria-describedby` names the prefix, the suffix and the line under the box. |
| `Errors` | `aria-invalid="true"`; the message line is a polite live region, so a new error is read out. |
| `Required` | `aria-required="true"`; the mark after the label is hidden from screen readers. |
| `Buttons` | The clear and password buttons are named from `uiLocale`; the password button has `aria-pressed`. |

## Localization

The names of the clear and password buttons and every validation message come from `uiLocale.strings`; every field follows a change at once, errors already shown included.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of every field on the page; errors already shown follow too. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        Required reads <output class="tb-required">{() => kitTexts.strings.required}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-field` | The field. `data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`, `data-required`, `data-stretch`. |
| `.mx-text-box` | Added by TextBox. |
| `.mx-field__label, .mx-field__box, .mx-field__input` | The label, the box, the input. |
| `.mx-field__icon, .mx-field__prefix, .mx-field__suffix` | The parts at the sides of the input. |
| `.mx-field__button, .mx-text-box__clear, .mx-text-box__reveal` | The buttons in the box. |
| `.mx-field__message, .mx-field__counter` | The line under the box. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `field.width` | The width when not stretched. |
| `field.height.*, field.padding.*, field.font-size.*` | Sizes, from the density tokens. |
| `field.box, field.layer, field.frame, field.indicator, field.ring` | Units: the box, a state layer over its fill, the frame (with `frame-start`, `frame-notch`, `frame-end` around a notch), the line along its bottom and a ring under the keys, each with its box per state: per variant (`filled-…`, `underline-…`), status (`invalid`, `readonly`, `disabled`) and `hover`, `focus`, `pressed`. |
| `field.label, field.required, field.icon, field.prefix, field.suffix, field.placeholder` | Units: the label (`focus`, `invalid`, `disabled`, `floating-…`), the required mark and the parts beside the text. |
| `field.slot, field.button, field.glyph, field.button-icon` | Units: the groups of buttons in the box, the buttons (`hover`, `pressed`, `focus`, `disabled`) and what they show. |
| `field.foot, field.message, field.counter` | Units: the line under the box (`shown`, `invalid`, `disabled`), the help or error text and the counter. |
| `field.border-width, field.gap, field.label-gap, field.label-width, field.label-font-weight, field.label-font-size` | The frame’s width, spacing and the label. |
| `field.icon-size, field.button-inset` | Icons, and how far the buttons sit from the box’s edges. |
| `field.floating-height, field.floating-font-size, field.floating-padding, field.notch-gap` | The floating label and the notch cut for it. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string>` | `''` | The text. `x-model` binds it two-way. |
| `label` | `Bind<string>` | `''` | The caption; `&Name` makes Alt+N focus the field. The same property as `text`. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `top`, `side` (next to the box), `floating` (inside the box until there is a value), `hidden` (only for screen readers). |
| `placeholder` | `Bind<string>` | `''` | Shown while the field is empty. |
| `helpText` | `Bind<string>` | `''` | A line under the box. An error message takes its place. |
| `hint` | `Bind<string>` | `''` | A tooltip. |
| `type` | `Bind<TextBoxType>` | `'text'` | `text`, `password`, `email`, `search`, `tel`, `url`. `email` and `url` also check the format. |
| `prefix / suffix` | `Bind<string>` | `''` | Fixed text before / after the value inside the box (`https://`, `kg`). |
| `icon` | `Bind<IconSource \| null>` | — | An icon at the start of the box. |
| `buttons` | `Bind<readonly FieldButton[]>` | `[]` | Buttons of your own inside the box, at the start or the end. |
| `clearButton` | `Bind<boolean>` | `false` | A button that empties the field; Escape does the same. |
| `passwordReveal` | `Bind<boolean>` | `true` | With `type="password"`: a button that shows the password. |
| `maxLength / minLength` | `Bind<number>` | — | Limits; `minLength` is checked by validation. |
| `showCounter` | `Bind<boolean>` | `false` | `12/50` under the box (`12` without `maxLength`). |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | `change`: the value changes when the field is left or Enter is pressed. |
| `selectOnFocus` | `Bind<boolean>` | `false` | Selects the whole text when the field gets focus. |
| `align` | `Bind<'start' \| 'center' \| 'end'>` | `'start'` | Text alignment. |
| `readOnly` | `Bind<boolean>` | `false` | Can be read, selected and copied, not changed. |
| `required` | `Bind<boolean>` | `false` | A mark after the label, `aria-required`, and a `required` rule. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `variant` | `Bind<FieldVariant>` | `'outline'` | `outline`, `filled`, `underline`. |
| `stretch` | `Bind<boolean>` | `false` | Fills the width of what it sits in. |
| `mask` | `Bind<string>` | `''` | See Mask. |
| `maskChars` | `Bind<Record<string, MaskChar>>` | `{}` | Mask characters of your own. |
| `maskPlaceholder` | `Bind<string>` | `'_'` | Shown in the places not filled yet. |
| `maskValue` | `Bind<'raw' \| 'formatted'>` | `'raw'` | `raw`: only the typed characters; `formatted`: with the fixed ones. |
| `showMask` | `Bind<'always' \| 'focus'>` | `'focus'` | `focus`: an empty mask shows only while the field has focus. |
| `rules` | `Bind<readonly ValidationRule[]>` | `[]` | See Validation. |
| `error` | `Bind<string \| null>` | — | An error from outside (the server); shown until cleared. |
| `validateOn` | `Bind<ValidateOn>` | `'blur'` | `blur`, `input`, `manual`. |
| `validationGroup` | `Bind<ValidationGroup \| null>` | — | The group it is checked with. |
| `inputMode, autocomplete, spellcheck, name` | `Bind<…>` | — | Passed to the `<input>`. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop: `box.error = () => this.model.nameError` is followed. |
| `isValid` | read-only, reactive | `false` while an error shows. |
| `validationMessage` | read-only, reactive | The error shown, `''` without one. |
| `validating` | read-only, reactive | An asynchronous rule is running. |
| `maskComplete` | read-only | Every place of the mask is filled. |
| `inputElement` | read-only | The native `<input>`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `validate()` | `Promise<boolean>` | Checks the value and shows the outcome. |
| `resetValidation()` | `void` | Hides the outcome of earlier checks. |
| `focus()` | `boolean` | Focuses the input. |
| `select()` | `void` | Selects the whole text. |
| `clear()` | `void` | Empties the field as its clear button does. |
| `refresh()` | `void` | Your `buttons` may be plain or reactive; the field reads them as they are. After changing them in place, call `refresh()`. Every editor has it; a list editor reads its items again too. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; `byUser` tells the user from code. |
| `onValidated(e)` | A check ended. `e`: `{ valid, message, source }`. |
| `onEnter(e)` | Enter was pressed. `e`: `{ value, source, event }`. |
| `oninput, onchange, onkeydown, onfocusin, onfocusout` | The DOM events of the input reach the field. |

### Validation rules

| Rule | Checks |
| --- | --- |
| `{ type: 'required' }` | Something must be entered. |
| `{ type: 'email' } / { type: 'url' }` | An email address / a web address. |
| `{ type: 'pattern', pattern }` | A `RegExp`, or a string that must match the whole value (like the HTML `pattern`). |
| `{ type: 'length', min?, max? }` | The number of characters. |
| `{ type: 'range', min?, max? }` | A number or a date between bounds. |
| `{ type: 'compare', with, not? }` | Equal to another value (a repeated password), or different with `not`. |
| `{ type: 'custom', check, ignoreEmpty? }` | `check(value)` returns `true`, `false` or a message, or a promise of one (a server call). |
| `every rule` | `message` (a value or a function) and `enabled`. Empty values pass every rule but `required` and `compare`. |

The frame (`Field`), the mask (`InputMask`, which works on any `<input>`) and validation (`ValidationGroup`, `validateFields`, `checkRules`) are shared parts, exported for other components and your own.
