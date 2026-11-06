# ColorBox and ColorPicker

> Editors · @motifx-community/ui 0.1.0-beta.3

A color field with a popup picker, or the picker on its own. The picker has a saturation and brightness area, a hue slider, an opacity slider, channel inputs and preset colors.

## Import

```tsx
import { ColorBox, ColorPicker } from '@motifx-community/ui';
```

## Color field

Type a hex value or any `rgb(…)` form, or open the picker. The value is stored as hex. Every prop accepts a value or a function.

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

## Standalone picker

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

## OK and Cancel buttons

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

| Key | Description |
| --- | --- |
| `Arrow keys` | In the area, arrow keys change saturation (Left, Right) and brightness (Up, Down). On a slider, they change hue or opacity. Shift moves in steps of 10. |
| `Home, End` | Moves to either end of a slider. |
| `Alt+Down` | In the color box, opens the picker. |
| `Enter` | In the color box, applies the typed hex value. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Handles` | Sliders named “Saturation and brightness”, “Hue” and “Opacity”, which announce their position in the kit language. |
| `Inputs` | Kit text and number boxes, each with a label (Hex, Red, Green, Blue, Opacity). |
| `Presets` | Buttons named by their color. The selected one is pressed (`aria-pressed`). |
| `Popup` | A dialog named “Choose color”. Focus moves to the area and returns to the box when it closes. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-color-picker` | The picker. `data-alpha`. |
| `.mx-color-picker__area, __strip, __hue, __alpha, __thumb` | The area, the sliders and their handles. |
| `.mx-color-picker__preview, __inputs, __hex, __channel, __swatches, __swatch, __pick` | The rest of the picker. |
| `.mx-color-box, .mx-color-box__swatch, .mx-color-box__toggle, .mx-color-box__popup` | The color box and its parts. |

### Component tokens

| Token | Description |
| --- | --- |
| `color-picker.area, .strip, .thumb, .preview, .swatch` | Units: corners, the handle's ring and focus state, and the hover, selected and focus states of a preset. |
| `color-picker.width, .gap, .area-height, .strip-height, .thumb-size, .preview-size, .swatch-size, .swatch-gap` | The sizes and spacing of the picker. |
| `color-picker.checker-*, color-box.checker-*` | The checkerboard behind a transparent color. |
| `color-box.swatch, color-box.swatch-size, color-box.popup-gap` | The swatch in the box and the spacing in the popup. |

## API reference

### ColorBox props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| null>` | `null` | The color, stored as `#rrggbb` (`#rrggbbaa` with `alpha`). Any `#…` or `rgb(…)` form is accepted. `x-model` provides two-way binding. |
| `alpha` | `Bind<boolean>` | `false` | Adds an opacity slider and input, and the value keeps its opacity. |
| `palette` | `Bind<readonly string[] \| null>` | `null` | Preset colors in the popup. |
| `apply` | `Bind<ColorBoxApply>` | `'instantly'` | With `instantly`, the value follows every change in the popup. With `useButtons`, it changes on OK, and Cancel discards the change. |
| `clearButton` | `Bind<boolean>` | `false` | Shows a button that clears the field. |
| `placeholder` | `Bind<string>` | `''` | Displayed when the field is empty. |
| `label, helpText, readOnly, required, rules, size…` | see Field |  | All standard field props. Text that is not a color is reported as invalid. |

### ColorBox properties, methods and events

| Member | Type | Description |
| --- | --- | --- |
| `open(), close()` | methods | Opens or closes the picker (Alt+Down also opens it). |
| `opened` | read-only | Indicates whether the picker is open. |
| `onOpened, onClosed` | events | Occurs when the picker opens or closes (with the reason). |
| `picker` | read-only | The `ColorPicker` in the popup, after it has been opened. |
| `clear()` | method | Clears the value. |

### ColorPicker props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| null>` | `null` | The color, updated with every change. `x-model` provides two-way binding. |
| `alpha` | `Bind<boolean>` | `false` | Adds an opacity slider and input. |
| `palette` | `Bind<readonly string[] \| null>` | `null` | Preset colors that can be selected with one click. |
| `showInputs` | `Bind<boolean>` | `true` | Shows the hex and red, green and blue inputs. |
| `eyeDropper` | `Bind<boolean>` | `true` | Shows a button that picks a color from the screen, in browsers that support EyeDropper. |
| `onValueChanged` | `ColorChangedEventArgs` |  | Occurs when the color changes (`value`), either through user input or programmatically (`byUser`). |

### Functions

| Function | Returns | Description |
| --- | --- | --- |
| `parseColor(text)` | `ColorRgba \| null` | Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(…)` and `rgba(…)`. |
| `formatColor(rgba)` | `string` | Returns `#rrggbb`, or `#rrggbbaa` when the color is not opaque. |
