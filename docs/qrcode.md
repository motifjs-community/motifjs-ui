# QRCode

> Display · @motifx-community/ui 0.1.0-beta.5

A QR code, drawn as vectors so that it stays sharp at any size. It has no dependencies, chooses the smallest version that holds the text, and can carry a logo.

## Import

```tsx
import { QRCode } from '@motifx-community/ui';
```

## A code from a text

`value` is the text of the code, and the code follows it. Change the text to see the code grow.

```tsx
import { reactive } from '@motifx/core';
import { QRCode, Stack, TextBox } from '@motifx-community/ui';

/** A code that follows a text. The smallest version that holds the text is chosen. */
export default function Basic() {
    const s = reactive({ text: 'https://ui.motifjs.com' });
    return (
        <Stack gap="md">
            <TextBox label="Text" x-model={() => s.text} />
            <QRCode class="qr-basic" value={() => s.text} />
        </Stack>
    );
}
```

## Error correction

`level` sets how much of the code can be damaged. A higher level holds less text, so the code grows.

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, QRCode, Stack, type QrLevel } from '@motifx-community/ui';

/** A higher level survives more damage, and needs a larger code. */
export default function Levels() {
    const s = reactive({ level: 'M' as QrLevel });
    return (
        <Stack gap="md">
            <ButtonGroup
                label="Error correction"
                x-model={() => s.level}
                items={[
                    { value: 'L', text: 'L' },
                    { value: 'M', text: 'M' },
                    { value: 'Q', text: 'Q' },
                    { value: 'H', text: 'H' }
                ]}
            />
            <QRCode class="qr-level" value="https://ui.motifjs.com/qrcode" level={() => s.level} size={200} />
        </Stack>
    );
}
```

## A logo

`logo` puts an image in the middle, which takes the place of some modules. Level `H` restores what it covers. `logoSize` sets its share, at most `0.3`.

```tsx
import { QRCode } from '@motifx-community/ui';

/** A logo in the middle, which takes the place of some modules. Level H restores what it covers. */
export default function Logo() {
    return <QRCode class="qr-logo" value="https://ui.motifjs.com/qrcode" level="H" logo="/favicon.svg" size={220} />;
}
```

## Creating an image

`toDataURL()` and `toSVG()` give an image, in black on white unless you set other colors. `onEncodeFailed` occurs when a text does not fit in a code.

```tsx
import { reactive } from '@motifx/core';
import { Button, QRCode, Stack } from '@motifx-community/ui';

/** An image of the code, to download or print. */
export default function Export() {
    const s = reactive({ image: '' });
    let code!: QRCode;
    return (
        <Stack gap="md">
            <QRCode ref={(x: QRCode) => (code = x)} class="qr-export" value="Printed with the order" />
            <Button text="Create the image" variant="outline" onclick={() => (s.image = code.toDataURL('image/png', { size: 256 }))} />
            {s.image && <img class="qr-image" alt="The code as an image" src={() => s.image} />}
        </Stack>
    );
}
```

## Programmatic use

`new QRCode(props)` creates the code without JSX. Each prop is also a property.

```tsx
import { Component } from '@motifx/core';
import { Button, QRCode, Stack } from '@motifx-community/ui';

/** A code created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const code = new QRCode({ value: 'First', size: 140 });
        const next = new Button({ text: 'Change the text', variant: 'outline', onclick: () => (code.value = 'Second') });
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
| `value` | `Bind<string>` | `''` | The text of the code. It may hold any characters. |
| `level` | `Bind<'L' \| 'M' \| 'Q' \| 'H'>` | `'M'` | How much of the code can be damaged: about 7, 15, 25 or 30 percent. |
| `size` | `Bind<number \| null>` | From the design language | The width and height in pixels. |
| `margin` | `Bind<number>` | `4` | The quiet zone around the code, in modules. Readers need at least `4`. |
| `logo` | `Bind<string \| null>` | `null` | The address of an image in the middle of the code. Use level `H` with it. |
| `logoSize` | `Bind<number>` | `0.2` | The share of the code the logo covers, at most `0.3`. |
| `label` | `Bind<string>` | The kit string “QR code: …” | The accessible name. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `isInvalid` | `boolean` | Indicates that the value could not be drawn. |
| `modules` | `number` | The number of modules along a side of the code, without its margin. |
| `toSVG(options?)` | `string` | The code as an SVG document. The logo is not part of it. |
| `toDataURL(type?, options?)` | `string` | The code as a data URL, a PNG by default. The logo is not part of it. |

### Image options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number` | `512` | The width and height in pixels, rounded to whole modules. |
| `color` | `string` | `'#000000'` | The color of the modules. |
| `background` | `string` | `'#ffffff'` | The background. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onEncodeFailed` | `{ value, source }` | Occurs when the text does not fit in a code, which then draws nothing. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Name` | The code has the role `img`, and its name holds the text, so a screen reader can read it. |
| `Colors` | A code stays dark on a light sheet in every theme, as readers expect. |
| `Size` | For printing, keep a module at least 0.4 mm wide, and leave the quiet zone in place. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-qr-code` | The sheet. `data-invalid` says the value could not be drawn. |
| `.mx-qr-code__svg, .mx-qr-code__logo` | The code and the logo. |

### Design tokens

| Token | Description |
| --- | --- |
| `qr-code.size` | The width and height. |
| `qr-code.sheet, .logo` | Units: the sheet, whose `color` is the color of the modules, and the logo. |

## Feedback

Loading issues…
