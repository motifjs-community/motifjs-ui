import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Buttons from './examples/Buttons';
import Programmatic from './examples/Programmatic';
import Picker from './examples/Picker';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const BOX_PROPS = [
  ['value', '`Bind<string | null>`', '`null`', 'The color, stored as `#rrggbb` (`#rrggbbaa` with `alpha`). Any `#…` or `rgb(…)` form is accepted. `x-model` provides two-way binding.'],
  ['alpha', '`Bind<boolean>`', '`false`', 'Adds an opacity slider and input, and the value keeps its opacity.'],
  ['palette', '`Bind<readonly string[] | null>`', '`null`', 'Preset colors in the popup.'],
  ['apply', '`Bind<ColorBoxApply>`', "`'instantly'`", 'With `instantly`, the value follows every change in the popup. With `useButtons`, it changes on OK, and Cancel discards the change.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'Shows a button that clears the field.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when the field is empty.'],
  ['label, helpText, readOnly, required, rules, size…', 'see Field', '', 'All standard field props. Text that is not a color is reported as invalid.'],
];

const BOX_MEMBERS = [
  ['open(), close()', 'methods', 'Opens or closes the picker (Alt+Down also opens it).'],
  ['opened', 'read-only', 'Indicates whether the picker is open.'],
  ['onOpened, onClosed', 'events', 'Occurs when the picker opens or closes (with the reason).'],
  ['picker', 'read-only', 'The `ColorPicker` in the popup, after it has been opened.'],
  ['clear()', 'method', 'Clears the value.'],
];

const PICKER_PROPS = [
  ['value', '`Bind<string | null>`', '`null`', 'The color, updated with every change. `x-model` provides two-way binding.'],
  ['alpha', '`Bind<boolean>`', '`false`', 'Adds an opacity slider and input.'],
  ['palette', '`Bind<readonly string[] | null>`', '`null`', 'Preset colors that can be selected with one click.'],
  ['showInputs', '`Bind<boolean>`', '`true`', 'Shows the hex and red, green and blue inputs.'],
  ['eyeDropper', '`Bind<boolean>`', '`true`', 'Shows a button that picks a color from the screen, in browsers that support EyeDropper.'],
  ['onValueChanged', '`ColorChangedEventArgs`', '', 'Occurs when the color changes (`value`), either through user input or programmatically (`byUser`).'],
];

const FUNCTIONS = [
  ['parseColor(text)', '`ColorRgba | null`', 'Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(…)` and `rgba(…)`.'],
  ['formatColor(rgba)', '`string`', 'Returns `#rrggbb`, or `#rrggbbaa` when the color is not opaque.'],
];

const KEYS = [
  ['Arrow keys', 'In the area, arrow keys change saturation (Left, Right) and brightness (Up, Down). On a slider, they change hue or opacity. Shift moves in steps of 10.'],
  ['Home, End', 'Moves to either end of a slider.'],
  ['Alt+Down', 'In the color box, opens the picker.'],
  ['Enter', 'In the color box, applies the typed hex value.'],
];

const A11Y = [
  ['Handles', 'Sliders named “Saturation and brightness”, “Hue” and “Opacity”, which announce their position in the kit language.'],
  ['Inputs', 'Kit text and number boxes, each with a label (Hex, Red, Green, Blue, Opacity).'],
  ['Presets', 'Buttons named by their color. The selected one is pressed (`aria-pressed`).'],
  ['Popup', 'A dialog named “Choose color”. Focus moves to the area and returns to the box when it closes.'],
];

const HOOKS = [
  ['.mx-color-picker', 'The picker. `data-alpha`.'],
  ['.mx-color-picker__area, __strip, __hue, __alpha, __thumb', 'The area, the sliders and their handles.'],
  ['.mx-color-picker__preview, __inputs, __hex, __channel, __swatches, __swatch, __pick', 'The rest of the picker.'],
  ['.mx-color-box, .mx-color-box__swatch, .mx-color-box__toggle, .mx-color-box__popup', 'The color box and its parts.'],
];

const TOKENS = [
  ['color-picker.area, .strip, .thumb, .preview, .swatch', 'Units: corners, the handle\'s ring and focus state, and the hover, selected and focus states of a preset.'],
  ['color-picker.width, .gap, .area-height, .strip-height, .thumb-size, .preview-size, .swatch-size, .swatch-gap', 'The sizes and spacing of the picker.'],
  ['color-picker.checker-*, color-box.checker-*', 'The checkerboard behind a transparent color.'],
  ['color-box.swatch, color-box.swatch-size, color-box.popup-gap', 'The swatch in the box and the spacing in the popup.'],
];

export default function ColorBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A color field with a popup picker, or the picker on its own. The picker has a saturation and brightness area, a hue slider, an opacity slider, channel inputs and preset colors." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ColorBox, ColorPicker } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Color field">
        <p>
          <Rich text="Type a hex value or any `rgb(…)` form, or open the picker. The value is stored as hex. Every prop accepts a value or a function." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="picker" title="Standalone picker">
        <Example files={code('Picker.tsx')}>
          <Picker />
        </Example>
      </Section>

      <Section anchor="buttons" title="OK and Cancel buttons">
        <Example files={code('Buttons.tsx')}>
          <Buttons />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="ColorBox props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={BOX_PROPS} />
        <h3>
          <Rich text="ColorBox properties, methods and events" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Description']} rows={BOX_MEMBERS} />
        <h3>
          <Rich text="ColorPicker props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PICKER_PROPS} />
        <h3>
          <Rich text="Functions" />
        </h3>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={FUNCTIONS} />
      </Section>
    </>
  );
}
