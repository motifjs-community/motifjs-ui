# ColorBox and ColorPicker

> Editors · @motifx-community/ui 0.1.0-beta.3

A colour as a field, with a picker in a popup; or the picker on its own. The picker has an area of saturation and brightness, a hue strip, an opacity strip, inputs for the channels and preset colours.

## Import

```tsx
import { ColorBox, ColorPicker } from '@motifx-community/ui';
```

## A colour field

Type a hex or any `rgb(…)` form, or open the picker; the value is kept as hex. Every prop takes a value or a function.

```tsx
import { reactive } from '@motifx/core';
import { ColorBox, Stack } from '@motifx-community/ui';

const PALETTE = ['#3b5bdb', '#1971c2', '#0c8599', '#2b8a3e', '#f08c00', '#e8590c', '#e03131', '#c2255c', '#862e9c', '#495057'];

/** A colour field bound with `x-model`: type a hex, or open the picker (Alt+Down); one made with `new` programmatically. */
export default function Programmatic() {
  const s = reactive({ accent: '#3b5bdb' as string | null });
  const coded = new ColorBox({ label: 'Made in code', value: '#2b8a3e', clearButton: true });

  return (
    <Stack gap="lg" style="inline-size: 18rem; max-inline-size: 100%">
      <ColorBox label="&Accent" palette={PALETTE} x-model={() => s.accent} helpText={() => `Value: ${s.accent ?? 'none'}`} />
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## The picker on its own

```tsx
import { reactive } from '@motifx/core';
import { ColorPicker, Stack } from '@motifx-community/ui';

const PALETTE = ['#ffffff', '#ced4da', '#495057', '#000000', '#e03131', '#f08c00', '#2b8a3e', '#1971c2', '#862e9c', '#3b5bdb80'];

/** The picker on its own, in the page: with opacity (`alpha`) and preset colours. */
export default function Picker() {
  const s = reactive({ color: '#1971c2cc' as string | null });

  return (
    <Stack gap="lg">
      <ColorPicker alpha palette={PALETTE} x-model={() => s.color} />
      <span>{() => `Value: ${s.color}`}</span>
    </Stack>
  );
}
```

## OK and Cancel

```tsx
import { reactive } from '@motifx/core';
import { ColorBox, Stack } from '@motifx-community/ui';

/** Applied with buttons: the value changes on OK, Cancel leaves it; with opacity it keeps `#rrggbbaa`. */
export default function Buttons() {
  const s = reactive({ overlay: '#00000080' as string | null });

  return (
    <Stack gap="lg" style="inline-size: 18rem; max-inline-size: 100%">
      <ColorBox label="Overlay" alpha apply="useButtons" x-model={() => s.overlay} />
      <span>{() => `Value: ${s.overlay ?? 'none'}`}</span>
    </Stack>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Arrow keys` | On the area: saturation (left, right) and brightness (up, down); on a strip: hue or opacity. Shift moves by 10. |
| `Home, End` | A strip’s ends. |
| `Alt+Down` | In the colour box: opens the picker. |
| `Enter` | In the colour box: takes the hex typed. |

## Accessibility

| Topic | How |
| --- | --- |
| `Handles` | Sliders named “Saturation and brightness”, “Hue”, “Opacity”, saying where they stand, in the kit language. |
| `Inputs` | Kit text and number boxes, each with its label (Hex, Red, Green, Blue, Opacity). |
| `Presets` | Buttons named by their colour; the chosen one is pressed (`aria-pressed`). |
| `Popup` | A dialog named “Choose color”; focus goes to the area and comes back to the box. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-color-picker` | The picker. `data-alpha`. |
| `.mx-color-picker__area, __strip, __hue, __alpha, __thumb` | The area, the strips and their handles. |
| `.mx-color-picker__preview, __inputs, __hex, __channel, __swatches, __swatch, __pick` | The rest of the picker. |
| `.mx-color-box, .mx-color-box__swatch, .mx-color-box__toggle, .mx-color-box__popup` | The colour box and its parts. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `color-picker.area, .strip, .thumb, .preview, .swatch` | Units: their corners, the handle’s ring and focus, a preset’s hover, chosen and focus looks. |
| `color-picker.width, .gap, .area-height, .strip-height, .thumb-size, .preview-size, .swatch-size, .swatch-gap` | The picker’s sizes and spaces. |
| `color-picker.checker-*, color-box.checker-*` | The checker under a see-through colour. |
| `color-box.swatch, color-box.swatch-size, color-box.popup-gap` | The swatch in the box, and the space in the popup. |

## API reference

### ColorBox props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| null>` | `null` | The colour, kept as `#rrggbb` (`#rrggbbaa` with `alpha`); any `#…` or `rgb(…)` form is read. Two-way with `x-model`. |
| `alpha` | `Bind<boolean>` | `false` | An opacity strip and input; the value keeps its opacity. |
| `palette` | `Bind<readonly string[] \| null>` | `null` | Preset colours in the popup. |
| `apply` | `Bind<ColorBoxApply>` | `'instantly'` | `instantly`: the value follows every move in the popup; `useButtons`: it changes on OK, Cancel leaves it. |
| `clearButton` | `Bind<boolean>` | `false` | A button that empties it. |
| `placeholder` | `Bind<string>` | `''` | Shown while it is empty. |
| `label, helpText, readOnly, required, rules, size…` | see Field |  | Everything a field has. Text that is not a colour is reported as not valid. |

### ColorBox properties, methods and events

| Member | Kind | Description |
| --- | --- | --- |
| `open(), close()` | methods | Opens or closes the picker (Alt+Down opens it too). |
| `opened` | read-only | Whether the picker is open. |
| `onOpened, onClosed` | events | The picker opened, or closed (with the reason). |
| `picker` | read-only | The `ColorPicker` in the popup, once it was opened. |
| `clear()` | method | Empties it. |

### ColorPicker props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| null>` | `null` | The colour; it follows every move. Two-way with `x-model`. |
| `alpha` | `Bind<boolean>` | `false` | An opacity strip and input. |
| `palette` | `Bind<readonly string[] \| null>` | `null` | Preset colours to choose with one press. |
| `showInputs` | `Bind<boolean>` | `true` | The hex and red, green, blue inputs. |
| `eyeDropper` | `Bind<boolean>` | `true` | A button that picks a colour from the screen, where the browser can (EyeDropper). |
| `onValueChanged` | `ColorChangedEventArgs` |  | The colour changed (`value`), by the user or by code (`byUser`). |

### Functions

| Function | Returns | Description |
| --- | --- | --- |
| `parseColor(text)` | `ColorRgba \| null` | Reads `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(…)`, `rgba(…)`. |
| `formatColor(rgba)` | `string` | `#rrggbb`, or `#rrggbbaa` when it is not opaque. |
