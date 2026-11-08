# Signature

> Editors · @motifx-community/ui 0.1.0-beta.7

A pad to sign on with a pen, a finger or a mouse. The value is the strokes themselves, so a signature can be stored as data, drawn again at any size and exported as an image.

## Import

```tsx
import { Signature } from '@motifx-community/ui';
```

## Signing

`x-model` binds the strokes. A pen that reports pressure sets the width of the line, and otherwise it follows the speed. The buttons in the corner remove the last stroke and the whole signature.

```tsx
import { reactive } from '@motifx/core';
import { Signature, Stack, type SignatureStroke } from '@motifx-community/ui';

/** A pad bound to a value. The value is the strokes themselves, so it can be stored and drawn again. */
export default function Basic() {
    const s = reactive({ strokes: [] as readonly SignatureStroke[] });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Signature class="sig-basic" label="Your signature" helpText="Sign with a pen, a finger or the mouse." x-model={() => s.strokes} />
            <output class="sig-told">{() => `Strokes: ${s.strokes.length}`}</output>
        </Stack>
    );
}
```

## Creating an image

`toDataURL()`, `toBlob()` and `toSVG()` give an image. It is drawn in black so that it does not depend on the theme, and the background is transparent unless you set one.

```tsx
import { reactive } from '@motifx/core';
import { Button, Signature, Stack } from '@motifx-community/ui';

/** An image of the signature. It is drawn in black on a transparent background unless told otherwise. */
export default function Export() {
    const s = reactive({ image: '' });
    let pad!: Signature;
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Signature ref={(x: Signature) => (pad = x)} class="sig-export" label="Sign to create an image" />
            <Button text="Create the image" variant="outline" onclick={() => (s.image = pad.toDataURL('image/png', { background: '#ffffff', width: 420 }))} />
            {s.image && <img class="sig-image" alt="The signature as an image" src={() => s.image} style="max-inline-size: 100%; border: 1px solid var(--mx-color-stroke-divider)" />}
        </Stack>
    );
}
```

## The pen and the pad

`penColor`, `minWidth` and `maxWidth` set the pen, and `height` the pad. `showGuide`, `showClear`, `showUndo` and `placeholder` turn its parts on and off.

```tsx
import { Signature, Stack } from '@motifx-community/ui';

/** The pen, the size of the pad and which parts it shows. */
export default function Options() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Signature class="sig-pen" label="A thick blue pen" penColor="#1d4ed8" minWidth={2} maxWidth={6} height={120} />
            <Signature class="sig-plain" label="Only the pad" showGuide={false} showClear={false} showUndo={false} placeholder="" height={120} />
        </Stack>
    );
}
```

## Saved signatures and states

Giving the stored strokes as `value` draws the signature again. `required`, `readOnly` and `enabled` work as in every field.

```tsx
import { Button, Signature, Stack, type SignatureStroke } from '@motifx-community/ui';

const SAVED: readonly SignatureStroke[] = [
    {
        points: Array.from({ length: 40 }, (_, i) => ({
            x: 0.12 + (i / 39) * 0.76,
            y: 0.5 + Math.sin(i / 3) * 0.2 * (1 - i / 60),
            pressure: 0.3 + (i % 8) / 12
        }))
    }
];

/** A saved signature drawn again, a required field, and a pad that cannot be changed. */
export default function States() {
    let pad!: Signature;
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Signature class="sig-saved" label="Saved signature" value={SAVED} height={120} readOnly />
            <Signature ref={(x: Signature) => (pad = x)} class="sig-required" label="Required" required height={120} />
            <Button text="Validate" variant="outline" onclick={() => void pad.validate()} />
            <Signature class="sig-disabled" label="Disabled" enabled={false} height={100} />
        </Stack>
    );
}
```

## Programmatic use

`new Signature(props)` creates the pad without JSX. Each prop is also a property.

```tsx
import { Component } from '@motifx/core';
import { Button, Signature, Stack } from '@motifx-community/ui';

/** A pad created programmatically. `undo()` and `clear()` do what its buttons do. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const pad = new Signature({ label: 'Programmatic signature', height: 120, showUndo: false, showClear: false });
        const clear = new Button({ text: 'Clear', variant: 'outline', onclick: () => pad.clear() });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(pad, clear);
        this.controls.add(stack);
    }
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `height` | `Bind<number \| null>` | From the design language | The height of the pad in pixels. |
| `penColor` | `Bind<string \| null>` | From the design language | The color of the lines. |
| `minWidth, maxWidth` | `Bind<number>` | `1`, `3` | The width of a line at its thinnest and thickest, in pixels. |
| `placeholder` | `Bind<string>` | The kit string “Sign here” | The text of the empty pad. `''` removes it. |
| `showGuide` | `Bind<boolean>` | `true` | Draws the line to sign on. |
| `showClear, showUndo` | `Bind<boolean>` | `true` | Show the buttons that remove the signature and the last stroke. |
| `label, helpText, readOnly, required, rules, error, validateOn` |  |  | Same as `TextBox`. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `value` | `readonly SignatureStroke[]` | The strokes. `x-model` provides two-way binding. |
| `isEmpty` | `boolean` | Indicates that nothing has been signed. |
| `clear()` | `void` | Removes the signature. |
| `undo()` | `void` | Removes the last stroke. |
| `toDataURL(type?, options?)` | `string` | The signature as a data URL, a PNG by default. |
| `toBlob(type?, options?)` | `Promise<Blob \| null>` | The signature as an image file, a PNG by default. |
| `toSVG(options?)` | `string` | The signature as an SVG document. |

### Image options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width, height` | `number` | Twice the pad | The size of the image in pixels. The height keeps the shape of the pad. |
| `color` | `string` | `'#000000'` | The color of the lines, which does not depend on the theme. |
| `background` | `string` | Transparent | The background. |

### Types

| Member | Type | Description |
| --- | --- | --- |
| `SignatureStroke` | `{ points: readonly SignaturePoint[] }` | One line drawn without lifting the pen. |
| `SignaturePoint` | `{ x, y, pressure }` | `x` and `y` run from `0` to `1` across the pad, so a signature fits a pad of any size. `pressure` runs from `0` to `1`. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onStrokeBegan` | `{ stroke, originalEvent, source }` | Occurs when the pen touches the pad. |
| `onStrokeEnded` | `{ stroke, originalEvent, source }` | Occurs when the pen leaves the pad, after the value has changed. |
| `onValueChanged` | `{ value, previousValue, byUser, source, event }` | Same as `TextBox`. |

### Keyboard

| Key | Description |
| --- | --- |
| `Delete` | Removes the signature. |
| `Ctrl+Z` | Removes the last stroke. |
| `Tab` | Moves focus to the pad, and then to its buttons. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Pad` | The pad has the role `img`, the name of its label, and says whether it is signed. |
| `Signing` | A signature is drawn with a pointer. Where a person may not be able to draw, offer another way, such as typing the name in a `TextBox`. |
| `Touch` | The pad takes every touch, so signing does not scroll the page. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-signature` | The field. `data-invalid`, `data-readonly` and `data-disabled` describe its state. |
| `.mx-signature__pad, .mx-signature__canvas, .mx-signature__guide, .mx-signature__placeholder` | The pad, the canvas, the line to sign on and the text. |
| `.mx-signature__actions` | The buttons in the corner of the pad. |

### Design tokens

| Token | Description |
| --- | --- |
| `signature.width, .height, .guide-inset, .actions-inset` | The size of the field and of the pad, and the distances of the line and the buttons. |
| `signature.pad, .guide, .placeholder` | Units: the pad, whose `color` is the color of the ink (`focus`, `invalid`, `readonly`, `disabled`), the line and the text. |
| `signature.field` | Place: the field under the pad, without a box of its own. |

## Feedback

Loading issues…
