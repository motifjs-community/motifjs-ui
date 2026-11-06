# ValidationSummary

> Editors · @motifx-community/ui 0.1.0-beta.3

The failed fields of a `ValidationGroup`, one line each with the field’s label and its message, under a header; a press on a line goes to the field. It draws itself again whenever a field of the group is checked or reset, and stays out of sight while nothing has failed.

## Import

```tsx
import { ValidationSummary, ValidationGroup } from '@motifx-community/ui';
```

## Above a form

Give it the `group` the fields join with `validationGroup`. After `group.validate()` the failed fields are listed; a field that passes again leaves the list, and `group.reset()` empties it. A press on a line focuses the field (`focusOnClick`).

```tsx
import { Button, NumberBox, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';

/** The failed fields of a form listed above it after Save; a press on a line goes to the field. */
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

`header` gives the line above the list, `showHeader` hides it; `onItemClick` tells which line was pressed, `failed` and `count` say what is listed.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';

/** A header of its own, or none; the lines tell which field was pressed, and `failed` says how many there are. */
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

| Topic | How |
| --- | --- |
| `The summary` | A live region (`polite`): the lines are read out when they appear; out of sight while nothing has failed. |
| `A line` | A button with the field’s label and its message (“E-mail: Enter a valid e-mail address”); a press focuses the field. |
| `Glyph` | The mark before the header is decorative. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-validation-summary` | The summary. `data-empty` while nothing has failed. |
| `.mx-validation-summary__header, .mx-validation-summary__icon, .mx-validation-summary__header-text` | The header, its glyph, its text. |
| `.mx-validation-summary__list, .mx-validation-summary__line, .mx-validation-summary__item` | The list, a line, the button in it. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `validation-summary.box, .icon, .header, .item` | Units: the box, the glyph before the header (`icon`), the header’s text, a line (`hover`, `focus`). |
| `validation-summary.gap, .line-gap` | Between the header and the list; between the lines. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `group` | `Bind<ValidationGroup \| null>` | `null` | The group whose failed fields are listed. |
| `header` | `Bind<string>` | the kit’s “Please correct the following” | The line above the list. |
| `showHeader` | `Bind<boolean>` | `true` | The header is shown. |
| `focusOnClick` | `Bind<boolean>` | `true` | A press on a line focuses its field. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onItemClick` | event | A line was pressed (`target`, `text`). |
| `failed` | read-only | The failed targets listed now, in the group’s order. |
| `count` | read-only | How many lines there are. |
| `refresh()` | `void` | Draws the lines again from the fields as they are now. |
