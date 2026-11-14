# TextBox

> Editors · @motifx-community/ui 0.1.0-beta.10

A single-line text input with a label, help text and error display. It supports a placeholder, a prefix and suffix, buttons inside the box, a clear button, a password reveal button, a character counter, an input mask and validation, either on its own, in a group, or across all fields in a panel.

## Import

```tsx
import { TextBox, ValidationGroup, validateFields, type ValidationRule } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and a function that reads a reactive object keeps the field in sync with it. `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox } from '@motifx-community/ui';

/** A field bound to state with x-model, and fields created with `new` and added programmatically. */
export default function Programmatic() {
  const form = reactive({ name: 'Ada', result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const box = new TextBox({ label: `Field ${++added}`, clearButton: true, placeholder: 'Created with new' });
    box.onValueChanged((e) => (form.result = `${box.label}: ${e.value}`));
    host?.controls.add(box);
    box.focus();
  };

  return (
    <>
      <TextBox label="&Name" x-model={() => form.name} clearButton helpText={() => `Hello, ${form.name || 'stranger'}.`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a field programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="tb-result">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Label

The label can appear above the box, next to it (`side`), inside it until there is a value (`floating`), or only for screen readers (`hidden`). `&` marks its access key.

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

## Prefix, suffix, icon and buttons

`prefix` and `suffix` add fixed text around the value, and `icon` appears at the start. `buttons` adds custom buttons, each with its own `enabled`, `visible` and `position`.

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

/** Fixed text around the value, an icon at the start, and a custom button in the box. */
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

## Password and character counter

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

## Input mask

A mask keeps the text in the required format as the user types, deletes or pastes, and the caret skips fixed characters. The value contains only the typed characters, or the displayed text with `maskValue="formatted"`. An incomplete mask fails validation.

| Character | Meaning |
| --- | --- |
| `0` | A digit. |
| `9` | An optional digit. |
| `a` | A letter. |
| `*` | A letter or a digit. |
| `\\` | Treats the next character as fixed: `\\0` is a fixed zero. |
| `anything else` | A fixed character, skipped during typing. |

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

A field validates itself when it loses focus after a change, and then on every change until the value is valid. `required`, `minLength`, `type="email"` and a mask bring their own rules, and `rules` adds your own, including asynchronous ones. `error` displays a message from an external source, such as the server.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, ValidationGroup } from '@motifx-community/ui';

/** Simulates a server call: "ada" is taken. */
const isFree = (value: string) =>
  new Promise<boolean | string>((done) => setTimeout(() => done(value.toLowerCase() === 'ada' ? `“${value}” is taken.` : true), 600));

/** Built-in rules, custom rules including an async one, an external error, and a group validated on Save. */
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

Without a group, `validateFields(panel)` validates every field inside a component, such as a panel, a dialog or a page.

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

| Key | Description |
| --- | --- |
| `Alt + key (`&Name`)` | Moves focus to the field (Control + Option + key on Apple platforms). |
| `Enter` | Commits the value (with `updateOn="change"`) and raises `onEnter`. |
| `Escape` | With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window. |
| `Tab` | Custom buttons and the password button are Tab stops. The clear button is not, because Escape does the same thing. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Element` | A native `<input>` associated with its `<label>` through `for`. |
| `Description` | `aria-describedby` references the prefix, the suffix and the help text. |
| `Errors` | `aria-invalid="true"`. The message is a polite live region, so new errors are announced. |
| `Required check boxes` | `aria-required="true"`. The indicator after the label is hidden from screen readers. |
| `Buttons` | The clear and password buttons get their names from `uiLocale`, and the password button has `aria-pressed`. |

## Localization

The names of the clear and password buttons and all validation messages come from `uiLocale.strings`. Every field updates immediately when they change, including errors already on screen.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of every field on the page; errors already shown follow too. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
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

| Hook | Description |
| --- | --- |
| `.mx-field` | The field. `data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`, `data-required`, `data-stretch`. |
| `.mx-text-box` | Added by TextBox. |
| `.mx-field__label, .mx-field__box, .mx-field__input` | The label, the box and the input. |
| `.mx-field__icon, .mx-field__prefix, .mx-field__suffix` | The parts on either side of the input. |
| `.mx-field__button, .mx-text-box__clear, .mx-text-box__reveal` | Buttons inside the box. |
| `.mx-field__message, .mx-field__counter` | Help text below the box. |

### Component tokens

| Token | Description |
| --- | --- |
| `field.width` | The width when the field is not stretched. |
| `field.height.*, field.padding.*, field.font-size.*` | Sizes are defined by the density tokens. |
| `field.box, field.layer, field.frame, field.indicator, field.ring` | Units: the box, a state layer over its fill, the frame (with `frame-start`, `frame-notch` and `frame-end` around a notch), the line along the bottom, and a ring for keyboard focus. Each has a box per state: by variant (`filled-…`, `underline-…`), by status (`invalid`, `readonly`, `disabled`), and for `hover`, `focus` and `pressed`. |
| `field.label, field.required, field.icon, field.prefix, field.suffix, field.placeholder` | Units: the label (`focus`, `invalid`, `disabled`, `floating-…`), the required indicator and the parts next to the text. |
| `field.slot, field.button, field.glyph, field.button-icon` | Units: button groups in the box, the buttons (`hover`, `pressed`, `focus`, `disabled`) and their contents. |
| `field.foot, field.message, field.counter` | Units: the line below the box (`shown`, `invalid`, `disabled`), the help or error text, and the counter. |
| `field.border-width, field.gap, field.label-gap, field.label-width, field.label-font-weight, field.label-font-size` | Frame width, spacing and the label. |
| `field.icon-size, field.button-inset` | Icons, and the distance between the buttons and the edges of the box. |
| `field.floating-height, field.floating-font-size, field.floating-padding, field.notch-gap` | The floating label and the notch cut for it. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string>` | `''` | The text. `x-model` provides two-way binding. |
| `label` | `Bind<string>` | `''` | The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `top`, `side` (next to the box), `floating` (inside the box until there is a value) or `hidden` (for screen readers only). |
| `placeholder` | `Bind<string>` | `''` | Displayed when the field is empty. |
| `helpText` | `Bind<string>` | `''` | Help text shown below the box. An error message replaces it. |
| `hint` | `Bind<string>` | `''` | The tooltip text. |
| `type` | `Bind<TextBoxType>` | `'text'` | `text`, `password`, `email`, `search`, `tel` or `url`. `email` and `url` also validate the format. |
| `prefix / suffix` | `Bind<string>` | `''` | Fixed text before or after the value inside the box (`https://`, `kg`). |
| `icon` | `Bind<IconSource \| null>` | — | An icon at the start of the box. |
| `buttons` | `Bind<readonly FieldButton[]>` | `[]` | Custom buttons inside the box, at the start or end. |
| `clearButton` | `Bind<boolean>` | `false` | Shows a button that clears the field. Pressing Escape also clears it. |
| `passwordReveal` | `Bind<boolean>` | `true` | With `type="password"`, shows a button that reveals the password. |
| `maxLength / minLength` | `Bind<number>` | — | Length limits. `minLength` is enforced by validation. |
| `showCounter` | `Bind<boolean>` | `false` | Shows `12/50` below the box (`12` without `maxLength`). |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | With `change`, the value updates when the field loses focus or the user presses Enter. |
| `selectOnFocus` | `Bind<boolean>` | `false` | Selects all text when the field receives focus. |
| `align` | `Bind<'start' \| 'center' \| 'end'>` | `'start'` | Text alignment. |
| `readOnly` | `Bind<boolean>` | `false` | The value can be read, selected and copied, but not changed. |
| `required` | `Bind<boolean>` | `false` | Adds an indicator after the label, `aria-required` and a `required` rule. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `variant` | `Bind<FieldVariant>` | `'outline'` | `outline`, `filled`, `underline`. |
| `stretch` | `Bind<boolean>` | `false` | Stretches to the full width of its container. |
| `mask` | `Bind<string>` | `''` | See Input mask. |
| `maskChars` | `Bind<Record<string, MaskChar>>` | `{}` | Custom mask characters. |
| `maskPlaceholder` | `Bind<string>` | `'_'` | Shown in positions that are not filled yet. |
| `maskValue` | `Bind<'raw' \| 'formatted'>` | `'raw'` | `raw` returns only the typed characters, and `formatted` includes the fixed ones. |
| `showMask` | `Bind<'always' \| 'focus'>` | `'focus'` | With `focus`, an empty mask appears only while the field has focus. |
| `rules` | `Bind<readonly ValidationRule[]>` | `[]` | See Validation. |
| `error` | `Bind<string \| null>` | — | An error from an external source, such as the server. It stays until cleared. |
| `validateOn` | `Bind<ValidateOn>` | `'blur'` | `blur`, `input`, `manual`. |
| `validationGroup` | `Bind<ValidationGroup \| null>` | — | The group the field is validated with. |
| `inputMode, autocomplete, spellcheck, name` | `Bind<…>` | — | Passed to the `<input>`. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop: `box.error = () => this.model.nameError` is tracked. |
| `isValid` | read-only, reactive | `false` while an error is displayed. |
| `validationMessage` | read-only, reactive | The error being displayed, or `''` if there is none. |
| `validating` | read-only, reactive | Indicates that an asynchronous rule is running. |
| `maskComplete` | read-only | Indicates that every position of the mask is filled. |
| `inputPart` | read-only | The native `<input>`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `validate()` | `Promise<boolean>` | Validates the value and displays the result. |
| `resetValidation()` | `void` | Clears the results of previous validation. |
| `focus()` | `boolean` | Sets focus on the input. |
| `select()` | `void` | Selects all text. |
| `clear()` | `void` | Clears the field, as the clear button does. |
| `typeText(text)` | `void` | Puts `text` in the field as if the user typed it; the value follows as typing commits it. |
| `refresh()` | `void` | Your `buttons` can be plain or reactive, and the field reads them as they are. After changing them in place, call `refresh()`. Every editor has this method, and list editors also re-read their items. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. `byUser` distinguishes user input from programmatic changes. |
| `onValidated(e)` | Occurs when validation finishes. `e`: `{ valid, message, source }`. |
| `onEnter(e)` | Occurs when the user presses Enter. `e`: `{ value, source, event }`. |
| `oninput, onchange, onkeydown, onfocusin, onfocusout` | DOM events from the input bubble up to the field. |

### Validation rules

| Rule | Validators |
| --- | --- |
| `{ type: 'required' }` | A value is required. |
| `{ type: 'email' } / { type: 'url' }` | An email address or a web address. |
| `{ type: 'pattern', pattern }` | A `RegExp`, or a string that must match the whole value, like the HTML `pattern` attribute. |
| `{ type: 'length', min?, max? }` | The number of characters. |
| `{ type: 'range', min?, max? }` | A number or date within a range. |
| `{ type: 'compare', with, not? }` | Equal to another value, such as a repeated password, or different from it with `not`. |
| `{ type: 'custom', check, ignoreEmpty? }` | `check(value)` returns `true`, `false`, a message, or a promise of one of these, such as a server call. |
| `every rule` | `message` (a value or a function) and `enabled`. Empty values pass every rule except `required` and `compare`. |

The frame (`Field`), the mask (`InputMask`, which works on any `<input>`) and validation (`ValidationGroup`, `validateFields`, `checkRules`) are shared parts, exported for use in other components and your own code.

A `Field` subclass that renders a native control (`<input>`, `<select>`, `<textarea>`) declares it with `controlTag` (`protected get controlTag() { return 'input'; }`). Without it the label gets no `for` and the control gets no `readonly`.

## Feedback

Loading issues…
