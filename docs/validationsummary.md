# ValidationSummary

> Editors · @motifx-community/ui 0.1.0-beta.6

Lists the invalid fields of a `ValidationGroup` under a header, with each field's label and message on its own line. Clicking a line moves focus to the field. The summary updates whenever a field in the group is validated or reset, and it is hidden when there are no errors.

## Import

```tsx
import { ValidationSummary, ValidationGroup } from '@motifx-community/ui';
```

## Using a summary above a form

Set `group` to the group the fields join with `validationGroup`. After `group.validate()`, the invalid fields are listed. A field that becomes valid leaves the list, and `group.reset()` clears it. Clicking a line moves focus to the field (`focusOnClick`).

```tsx
import { Button, NumberBox, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';

/** The invalid fields of a form, listed above it after Save. Clicking a line moves to the field. */
export default function Form() {
    const group = new ValidationGroup();
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <ValidationSummary class="vs-form" group={group} />
            <TextBox label="Name" required validationGroup={group} />
            <TextBox label="E-mail" required rules={[{ type: 'email' }]} validationGroup={group} />
            <NumberBox label="Guests" required rules={[{ type: 'range', min: 1, max: 8 }]} validationGroup={group} />
            <Stack orientation="horizontal" gap="sm">
                <Button class="vs-save" text="Save" tone="accent" onclick={() => void group.validate({ focus: false })} />
                <Button class="vs-reset" text="Start again" variant="outline" onclick={() => group.reset()} />
            </Stack>
        </Stack>
    );
}
```

## Programmatic use

`header` sets the line above the list, and `showHeader` hides it. `onItemClick` reports which line was clicked, and `failed` and `count` report what is listed.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';

/** A custom header or none. The lines report which field was clicked, and `failed` reports how many there are. */
export default function Programmatic() {
    const group = new ValidationGroup();
    const s = reactive({ header: true, told: '', count: 0 });
    const summary = new ValidationSummary({
        group,
        header: 'Before you send it',
        showHeader: () => s.header,
        onItemClick: e => (s.told = `pressed: ${e.text}`)
    });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <span class="vs-coded" onConfig={c => c.controls.add(summary)} />
            <TextBox label="Street" required validationGroup={group} />
            <TextBox label="Town" required validationGroup={group} />
            <Stack orientation="horizontal" wrap align="center">
                <Button class="vs-coded-check" text="Check" tone="accent" onclick={async () => {
                    await group.validate({ focus: false });
                    s.count = summary.count;
                }} />
                <Button text="Header on and off" variant="outline" onclick={() => (s.header = !s.header)} />
                <output class="vs-coded-told">{() => `${s.count} failed${s.told ? `, ${s.told}` : ''}`}</output>
            </Stack>
        </Stack>
    );
}
```

## Accessibility

| Topic | Details |
| --- | --- |
| `The summary` | A live region (`polite`). The lines are announced when they appear, and the summary is hidden when there are no errors. |
| `A line` | A button with the field's label and message (“E-mail: Enter a valid e-mail address”). Clicking it moves focus to the field. |
| `Glyph` | The icon before the header is decorative. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-validation-summary` | The summary. `data-empty` while there are no errors. |
| `.mx-validation-summary__header, .mx-validation-summary__icon, .mx-validation-summary__header-text` | The header, its glyph and its text. |
| `.mx-validation-summary__list, .mx-validation-summary__line, .mx-validation-summary__item` | The list, a line and the button inside it. |

### Component tokens

| Token | Description |
| --- | --- |
| `validation-summary.box, .icon, .header, .item` | Units: the box, the glyph before the header (`icon`), the header text and a line (`hover`, `focus`). |
| `validation-summary.gap, .line-gap` | The space between the header and the list, and between the lines. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `group` | `Bind<ValidationGroup \| null>` | `null` | The group whose invalid fields are listed. |
| `header` | `Bind<string>` | The kit string “Please correct the following” | The text above the list. |
| `showHeader` | `Bind<boolean>` | `true` | Shows the header. |
| `focusOnClick` | `Bind<boolean>` | `true` | Clicking a line moves focus to its field. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onItemClick` | event | Occurs when a line is clicked (`target`, `text`). |
| `failed` | read-only | The invalid targets currently listed, in group order. |
| `count` | read-only | The number of lines. |
| `refresh()` | `void` | Redraws the lines from the current state of the fields. |

## Feedback

Loading issues…
