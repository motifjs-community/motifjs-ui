# Barcode

> Display · @motifx-community/ui 0.1.0-beta.10

A linear barcode, drawn as vectors: Code 128, Code 39, EAN-13, EAN-8, UPC-A or Interleaved 2 of 5. It has no dependencies, works out check digits and refuses a value the format cannot hold.

## Import

```tsx
import { Barcode } from '@motifx-community/ui';
```

## Formats

`format` sets the kind of barcode, and `value` what it holds.

| Format | Value | Description |
| --- | --- | --- |
| `code128` | Any ASCII text | The default, for labels, shipping and stock. Digits are packed in pairs, so it stays short. |
| `code39` | Capitals, digits and `- . $ / + %` and space | Older industrial labels. Lower-case letters become capitals. |
| `ean13` | 12 or 13 digits | Retail products. The check digit is worked out, and a wrong one is refused. |
| `ean8` | 7 or 8 digits | Small retail products. |
| `upca` | 11 or 12 digits | Retail products in North America. |
| `itf` | Digits | Interleaved 2 of 5, for cartons. An odd number of digits gets a leading zero. |

```tsx
import { Barcode, Stack } from '@motifx-community/ui';

/** Each format, with a value it can hold. */
export default function Formats() {
    return (
        <Stack gap="md">
            <Barcode class="bc-128" format="code128" value="ORDER-2026-118" />
            <Barcode class="bc-39" format="code39" value="PART-77" />
            <Barcode class="bc-13" format="ean13" value="400638133393" />
            <Barcode class="bc-8" format="ean8" value="9638507" />
            <Barcode class="bc-upc" format="upca" value="03600029145" />
            <Barcode class="bc-itf" format="itf" value="1234567890" />
        </Stack>
    );
}
```

## Size and text

`moduleWidth` and `height` set the size of the bars, and `showText` the text under them. Keep the bars wide enough for the distance it is read from.

```tsx
import { Barcode, Stack } from '@motifx-community/ui';

/** The size of the bars, and a code without its text. */
export default function Options() {
    return (
        <Stack gap="md">
            <Barcode class="bc-large" value="LARGE-1" moduleWidth={3} height={96} />
            <Barcode class="bc-plain" value="NO-TEXT" showText={false} />
        </Stack>
    );
}
```

## Values that do not fit

A value the format cannot hold draws nothing and raises `onEncodeFailed`. Change the last digit of this EAN-13 to see it refused.

```tsx
import { reactive } from '@motifx/core';
import { Barcode, Stack, TextBox } from '@motifx-community/ui';

/** A value the format cannot hold draws nothing and raises `onEncodeFailed`. An EAN refuses a wrong check digit. */
export default function Validation() {
    const s = reactive({ value: '4006381333931', told: '' });
    return (
        <Stack gap="md">
            <TextBox label="EAN-13" x-model={() => s.value} />
            <Barcode
                class="bc-valid"
                format="ean13"
                value={() => s.value}
                onEncodeFailed={e => (s.told = `“${e.value}” is not a valid EAN-13.`)}
            />
            <output class="bc-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Creating an image

`toDataURL()` and `toSVG()` give an image with the text under the bars, in black on white unless you set other colors.

```tsx
import { reactive } from '@motifx/core';
import { Barcode, Button, Stack } from '@motifx-community/ui';

/** An image of the code, with its text, to download or print. */
export default function Export() {
    const s = reactive({ image: '' });
    let code!: Barcode;
    return (
        <Stack gap="md">
            <Barcode ref={(x: Barcode) => (code = x)} class="bc-export" value="LABEL-42" />
            <Button text="Create the image" variant="outline" onclick={() => (s.image = code.toDataURL('image/png', { scale: 2 }))} />
            {s.image && <img class="bc-image" alt="The code as an image" src={() => s.image} />}
        </Stack>
    );
}
```

## Programmatic use

`new Barcode(props)` creates the code without JSX. Each prop is also a property.

```tsx
import { Component } from '@motifx/core';
import { Barcode, Button, Stack } from '@motifx-community/ui';

/** A code created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const code = new Barcode({ value: 'FIRST' });
        const next = new Button({ text: 'Change the value', variant: 'outline', onclick: () => (code.value = 'SECOND') });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(code, next);
        this.controls.add(stack);
    }
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string>` | `''` | The value of the code. |
| `format` | `Bind<BarcodeFormat>` | `'code128'` | The kind of barcode. |
| `checkDigit` | `Bind<boolean>` | `false` | Adds the optional check character of Code 39. |
| `moduleWidth` | `Bind<number>` | `2` | The width of the thinnest bar in pixels. |
| `height` | `Bind<number \| null>` | From the design language | The height of the bars in pixels. |
| `margin` | `Bind<number>` | `10` | The quiet zone at each side, in modules. Readers need it. |
| `showText` | `Bind<boolean>` | `true` | Shows the text under the bars. |
| `label` | `Bind<string>` | The kit string “Barcode: …” | The accessible name. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `isInvalid` | `boolean` | Indicates that the value could not be drawn. |
| `codeText` | `string` | The text under the bars, with the check digit where the format has one. |
| `toSVG(options?)` | `string` | The code as an SVG document, with its text. |
| `toDataURL(type?, options?)` | `string` | The code as a data URL, a PNG by default. |

### Image options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scale` | `number` | `2` | The width of a module in pixels. |
| `color` | `string` | `'#000000'` | The color of the bars and the text. |
| `background` | `string` | `'#ffffff'` | The background. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onEncodeFailed` | `{ value, format, source }` | Occurs when the format cannot hold the value, which then draws nothing. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Name` | The code has the role `img`, and its name holds the value, so a screen reader can read it. |
| `Colors` | A code stays dark on a light sheet in every theme, as readers expect. |
| `Width` | A narrow parent scrolls the code rather than squeezing its bars, which would stop it reading. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-barcode` | The sheet. `data-invalid` says the value could not be drawn. |
| `.mx-barcode__svg, .mx-barcode__text` | The bars and the text. |

### Design tokens

| Token | Description |
| --- | --- |
| `barcode.height` | The height of the bars. |
| `barcode.sheet, .text` | Units: the sheet, whose `color` is the color of the bars, and the text. |

## Feedback

Loading issues…
