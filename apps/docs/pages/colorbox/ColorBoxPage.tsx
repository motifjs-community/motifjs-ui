import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Buttons from './examples/Buttons';
import Programmatic from './examples/Programmatic';
import Picker from './examples/Picker';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const BOX_PROPS = [
  ['value', '`Bind<string | null>`', '`null`', 'The colour, kept as `#rrggbb` (`#rrggbbaa` with `alpha`); any `#…` or `rgb(…)` form is read. Two-way with `x-model`.'],
  ['alpha', '`Bind<boolean>`', '`false`', 'An opacity strip and input; the value keeps its opacity.'],
  ['palette', '`Bind<readonly string[] | null>`', '`null`', 'Preset colours in the popup.'],
  ['apply', '`Bind<ColorBoxApply>`', "`'instantly'`", '`instantly`: the value follows every move in the popup; `useButtons`: it changes on OK, Cancel leaves it.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'A button that empties it.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while it is empty.'],
  ['label, helpText, readOnly, required, rules, size…', 'see Field', '', 'Everything a field has. Text that is not a colour is reported as not valid.'],
];

const BOX_MEMBERS = [
  ['open(), close()', 'methods', 'Opens or closes the picker (Alt+Down opens it too).'],
  ['opened', 'read-only', 'Whether the picker is open.'],
  ['onOpened, onClosed', 'events', 'The picker opened, or closed (with the reason).'],
  ['picker', 'read-only', 'The `ColorPicker` in the popup, once it was opened.'],
  ['clear()', 'method', 'Empties it.'],
];

const PICKER_PROPS = [
  ['value', '`Bind<string | null>`', '`null`', 'The colour; it follows every move. Two-way with `x-model`.'],
  ['alpha', '`Bind<boolean>`', '`false`', 'An opacity strip and input.'],
  ['palette', '`Bind<readonly string[] | null>`', '`null`', 'Preset colours to choose with one press.'],
  ['showInputs', '`Bind<boolean>`', '`true`', 'The hex and red, green, blue inputs.'],
  ['eyeDropper', '`Bind<boolean>`', '`true`', 'A button that picks a colour from the screen, where the browser can (EyeDropper).'],
  ['onValueChanged', '`ColorChangedEventArgs`', '', 'The colour changed (`value`), by the user or by code (`byUser`).'],
];

const FUNCTIONS = [
  ['parseColor(text)', '`ColorRgba | null`', 'Reads `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(…)`, `rgba(…)`.'],
  ['formatColor(rgba)', '`string`', '`#rrggbb`, or `#rrggbbaa` when it is not opaque.'],
];

const KEYS = [
  ['Arrow keys', 'On the area: saturation (left, right) and brightness (up, down); on a strip: hue or opacity. Shift moves by 10.'],
  ['Home, End', 'A strip’s ends.'],
  ['Alt+Down', 'In the colour box: opens the picker.'],
  ['Enter', 'In the colour box: takes the hex typed.'],
];

const A11Y = [
  ['Handles', 'Sliders named “Saturation and brightness”, “Hue”, “Opacity”, saying where they stand, in the kit language.'],
  ['Inputs', 'Kit text and number boxes, each with its label (Hex, Red, Green, Blue, Opacity).'],
  ['Presets', 'Buttons named by their colour; the chosen one is pressed (`aria-pressed`).'],
  ['Popup', 'A dialog named “Choose color”; focus goes to the area and comes back to the box.'],
];

const HOOKS = [
  ['.mx-color-picker', 'The picker. `data-alpha`.'],
  ['.mx-color-picker__area, __strip, __hue, __alpha, __thumb', 'The area, the strips and their handles.'],
  ['.mx-color-picker__preview, __inputs, __hex, __channel, __swatches, __swatch, __pick', 'The rest of the picker.'],
  ['.mx-color-box, .mx-color-box__swatch, .mx-color-box__toggle, .mx-color-box__popup', 'The colour box and its parts.'],
];

const TOKENS = [
  ['color-picker.area, .strip, .thumb, .preview, .swatch', 'Units: their corners, the handle’s ring and focus, a preset’s hover, chosen and focus looks.'],
  ['color-picker.width, .gap, .area-height, .strip-height, .thumb-size, .preview-size, .swatch-size, .swatch-gap', 'The picker’s sizes and spaces.'],
  ['color-picker.checker-*, color-box.checker-*', 'The checker under a see-through colour.'],
  ['color-box.swatch, color-box.swatch-size, color-box.popup-gap', 'The swatch in the box, and the space in the popup.'],
];

export default function ColorBoxPage() {
  return (
    <>
      <p class="lead">
        A colour as a field, with a picker in a popup; or the picker on its own. The picker has an area of saturation and
        brightness, a hue strip, an opacity strip, inputs for the channels and preset colours.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ColorBox, ColorPicker } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="A colour field">
        <p>
          <Rich text="Type a hex or any `rgb(…)` form, or open the picker; the value is kept as hex. Every prop takes a value or a function." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="picker" title="The picker on its own">
        <Example files={code('Picker.tsx')}>
          <Picker />
        </Example>
      </Section>

      <Section anchor="buttons" title="OK and Cancel">
        <Example files={code('Buttons.tsx')}>
          <Buttons />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>ColorBox props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={BOX_PROPS} />
        <h3>ColorBox properties, methods and events</h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={BOX_MEMBERS} />
        <h3>ColorPicker props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PICKER_PROPS} />
        <h3>Functions</h3>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={FUNCTIONS} />
      </Section>
    </>
  );
}
