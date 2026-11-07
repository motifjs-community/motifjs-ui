# OtpInput

> Editors · @motifx-community/ui 0.1.0-beta.6

A one-time code in a row of boxes. Typing, pasting a whole code, the code a phone offers from a message and screen readers work as in any text box, because the boxes are drawn over one real input.

## Import

```tsx
import { OtpInput } from '@motifx-community/ui';
```

## Entering a code

`x-model` binds the code, and `onCompleted` occurs when the last box is filled. Paste a code into the field, or type part of it and use the arrow keys.

```tsx
import { reactive } from '@motifx/core';
import { Button, OtpInput, Stack } from '@motifx-community/ui';

/** A six-digit code bound to a value. `onCompleted` occurs once, when the last box is filled. */
export default function Basic() {
    const s = reactive({ code: '', told: 'nothing yet' });
    return (
        <Stack gap="md">
            <OtpInput class="otp-basic" label="Verification code" helpText="We sent it to your phone." x-model={() => s.code} onCompleted={e => (s.told = e.value)} />
            <output class="otp-value">{() => `Value: ${s.code || 'empty'}`}</output>
            <output class="otp-told">{() => `Completed: ${s.told}`}</output>
            <Button text="Clear" variant="outline" onclick={() => (s.code = '')} />
        </Stack>
    );
}
```

## Formats

`length` sets the number of boxes, and `charset` or `pattern` the characters. `groupSize` separates the boxes, `masked` hides the characters, and `placeholder` marks empty boxes.

```tsx
import { OtpInput, Stack } from '@motifx-community/ui';

/** Other lengths and characters, groups of boxes, and a masked PIN. */
export default function Formats() {
    return (
        <Stack gap="lg">
            <OtpInput class="otp-key" label="Access key" length={8} charset="alphanumeric" uppercase groupSize={4} />
            <OtpInput class="otp-pin" label="PIN" length={4} masked />
            <OtpInput class="otp-hint" label="Code" length={4} placeholder="0" />
            <OtpInput class="otp-hex" label="Color code" length={6} pattern={/[0-9a-f]/i} uppercase size="sm" />
        </Stack>
    );
}
```

## Validation

A code that is not complete fails on its own. `rules` adds your own checks, as in every field.

```tsx
import { reactive } from '@motifx/core';
import { Button, OtpInput, Stack } from '@motifx-community/ui';

/** An incomplete code fails on its own, and a rule of the application can refuse a complete one. */
export default function Validation() {
    const s = reactive({ code: '' });
    let field!: OtpInput;
    return (
        <Stack gap="md">
            <OtpInput
                ref={(x: OtpInput) => (field = x)}
                class="otp-valid"
                label="Code"
                length={4}
                required
                x-model={() => s.code}
                rules={[{ type: 'custom', check: value => value === '1234', message: 'This code is not correct.' }]}
            />
            <Button text="Verify" variant="outline" onclick={() => void field.validate()} />
        </Stack>
    );
}
```

## Sizes and states

`size` sets the size of the boxes. `readOnly` and `enabled` work as in every field.

```tsx
import { OtpInput, Stack } from '@motifx-community/ui';

/** The sizes, and a field that cannot be changed. */
export default function States() {
    return (
        <Stack gap="lg">
            <OtpInput class="otp-small" label="Small" size="sm" length={4} value="12" />
            <OtpInput class="otp-large" label="Large" size="lg" length={4} value="12" />
            <OtpInput class="otp-readonly" label="Read-only" length={4} value="1234" readOnly />
            <OtpInput class="otp-disabled" label="Disabled" length={4} value="12" enabled={false} />
        </Stack>
    );
}
```

## Programmatic use

`new OtpInput(props)` creates the field without JSX. Each prop is also a property.

```tsx
import { Component } from '@motifx/core';
import { Button, OtpInput, Stack } from '@motifx-community/ui';

/** A field created programmatically. `clear()` empties it and puts the caret in the first box. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const code = new OtpInput({ label: 'Programmatic code', length: 4, value: '12' });
        const clear = new Button({ text: 'Clear', variant: 'outline', onclick: () => code.clear() });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(code, clear);
        this.controls.add(stack);
    }
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `length` | `Bind<number>` | `6` | The number of characters. |
| `charset` | `Bind<'digits' \| 'letters' \| 'alphanumeric'>` | `'digits'` | Which characters are accepted. Anything else is left out, also in a pasted code. |
| `pattern` | `Bind<RegExp \| null>` | `null` | Accepts the characters this matches instead of `charset`. It is tested on one character at a time. |
| `uppercase` | `Bind<boolean>` | `false` | Turns letters into capitals as they are typed. |
| `masked` | `Bind<boolean>` | `false` | Draws a mark in place of each character. |
| `maskCharacter` | `Bind<string>` | `'•'` | The mark of `masked`. |
| `placeholder` | `Bind<string>` | `''` | Shown in a box that is still empty. |
| `groupSize` | `Bind<number \| null>` | `null` | Puts a separator after every so many boxes, such as `3` for `123-456`. |
| `separator` | `Bind<string>` | `'–'` | The text of that separator. |
| `autoComplete` | `Bind<string>` | `'one-time-code'` | The `autocomplete` of the input, which lets a phone offer the code from a message. |
| `label, helpText, size, readOnly, required, rules, error, validateOn` |  |  | Same as `TextBox`. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `value` | `string` | The characters entered so far. `x-model` provides two-way binding. |
| `isComplete` | `boolean` | Indicates that every box is filled. |
| `clear()` | `void` | Empties the boxes and puts the caret in the first one. |
| `validate()` | `Promise<boolean>` | Same as `TextBox`. |
| `focus()` | `boolean` | Moves focus to the first empty box. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onCompleted` | `{ value, source, originalEvent }` | Occurs when the user has entered every character, by typing, pasting or from the phone. It occurs once for a code. |
| `onValueChanged` | `{ value, previousValue, byUser, source, event }` | Same as `TextBox`. |

### Keyboard

| Key | Description |
| --- | --- |
| `Characters` | Fill the box with the caret, and the caret moves on. In a filled box, the character takes its place. |
| `Backspace, Delete` | Remove a character, and those after it move back. |
| `Left, Right, Home, End` | Move the caret between the boxes. |
| `Ctrl+V` | Pastes a whole code. Characters that are not accepted, such as spaces and dashes, are left out. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Input` | One real `<input>` with its label, one Tab stop. Screen readers treat it as a text box, and the boxes are hidden from them. |
| `Direction` | The boxes run left to right in every page, as a code is read. |
| `Phones` | `autocomplete="one-time-code"` offers the code from a message, and `inputmode="numeric"` opens the number keypad for digits. |
| `Masked codes` | `masked` only changes what the boxes draw. Use it where the code should not be read over a shoulder. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-otp-input` | The field. `data-size`, `data-invalid`, `data-readonly` and `data-disabled` describe its state. |
| `.mx-otp-input__input` | The real input, unseen over the boxes. |
| `.mx-otp-input__cells, .mx-otp-input__cell, .mx-otp-input__char, .mx-otp-input__caret, .mx-otp-input__separator` | The row, a box, a character, the caret and the separator. `data-active` and `data-filled` describe a box. |

### Design tokens

| Token | Description |
| --- | --- |
| `otp-input.cell-width, .cell-height, .font-size` | The size of a box and of a character, for `sm`, `md` and `lg`. |
| `otp-input.input-font-size` | The text of the input under the boxes. Below 16 px a phone zooms in on focus. |
| `otp-input.cells, .cell, .char, .caret, .separator` | Units: the row, a box (`hover`, `filled`, `active`, `invalid`, `invalid-active`, `readonly`, `disabled`), a character, the caret and the separator. |
| `otp-input.field` | Place: the field under the boxes, without a box of its own. |

## Feedback

Loading issues…
