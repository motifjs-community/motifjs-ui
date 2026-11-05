# Switch

> Choice · @motifx-community/ui 0.1.0-beta.2

An on / off switch with its caption: a track with a thumb that slides, an optional on / off text inside or next to it, read-only and required. A native checkbox with the switch role underneath.

## Import

```tsx
import { Switch } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Switch } from '@motifx-community/ui';

/** A switch bound to state with x-model, and switches created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ wifi: true, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const sw = new Switch({ label: `Feature ${++added}`, onText: 'On', offText: 'Off' });
    sw.onValueChanged((e) => (s.result = `${sw.label}: ${e.value ? 'on' : 'off'}`));
    host?.controls.add(sw);
    sw.focus();
  };

  return (
    <>
      <Switch label="&Wi-Fi" x-model={() => s.wifi} helpText={() => (s.wifi ? 'Connected to Home.' : 'Not connected.')} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a switch from code" variant="outline" onclick={addFromCode} />
        <output class="sw-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## On / off text

`onText` and `offText` show in the track (the track grows to fit them) or next to it. The texts are for the eye; the switch says its state itself.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Switch, type SwitchStateText } from '@motifx-community/ui';

const PLACES: SwitchStateText[] = ['inside', 'beside', 'none'];

/** An on / off text in the track, next to it, or not shown. */
export default function StateText() {
  const s = reactive({ place: 'inside' as SwitchStateText, sync: false, dark: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Text position">
        {PLACES.map((place) => (
          <Button
            key={place}
            text={place}
            size="sm"
            variant={() => (s.place === place ? 'solid' : 'ghost')}
            aria-pressed={() => s.place === place}
            onclick={() => (s.place = place)}
          />
        ))}
      </Stack>
      <Switch label="&Sync" class="sw-sync" onText="On" offText="Off" showStateText={() => s.place} x-model={() => s.sync} />
      <Switch label="Dark mode" onText="Dark" offText="Light" showStateText={() => s.place} x-model={() => s.dark} />
    </>
  );
}
```

## Caption

The caption sits after the track, or before it with `labelPosition="start"`; with `stretch` the field takes the width and the track goes to the far end, as in a settings list.

```tsx
import { reactive } from '@motifx/core';
import { Switch } from '@motifx-community/ui';

/** Captions before the track, stretched so the tracks line up at the far end, as in a settings list. */
export default function Caption() {
  const s = reactive({ updates: true });
  return (
    <div style="inline-size: 22rem">
      <Switch label="Automatic updates" labelPosition="start" stretch x-model={() => s.updates} />
      <Switch label="Send usage data" labelPosition="start" stretch helpText="Anonymous, once a week." />
    </div>
  );
}
```

## Sizes

```tsx
import { Switch, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A switch in each size, with its on / off text. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <Switch key={size} label={size} size={size} value={size === 'md'} onText="On" offText="Off" />
      ))}
    </>
  );
}
```

## Required, read-only, disabled

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Switch, ValidationGroup } from '@motifx-community/ui';

/** A switch that must be on, checked with its group, and read-only and disabled ones following state. */
export default function States() {
  const s = reactive({ terms: false, editable: true, result: '' });
  const group = new ValidationGroup();

  const next = async () => {
    s.result = (await group.validate()).valid ? 'Thanks.' : 'Please agree first.';
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="I &agree to the terms" required validationGroup={group} x-model={() => s.terms} />
        <Button text="Continue" tone="accent" onclick={next} />
        <output>{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
        <Switch label="Read-only" readOnly={() => !s.editable} value={true} />
        <Switch label="Disabled on" enabled={() => s.editable} value={true} />
        <Switch label="Disabled off" enabled={() => s.editable} />
      </Stack>
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Space` | Flips it (the native key). |
| `Enter` | Flips it too, as on a button. |
| `Alt + key (`&Name`)` | Focuses and flips it (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | How |
| --- | --- |
| `Element` | A native `<input type="checkbox" role="switch">`: screen readers say "switch, on / off"; the browser gives it Space, the form value, `:checked` and `:disabled`, and its caption is a `<label for>`, so a click on the caption flips it. |
| `On / off text` | Drawn for the eye only (`aria-hidden`): the state is read out from the switch itself. |
| `Read-only` | `aria-readonly="true"`; it keeps its place in the Tab order. |
| `Motion` | The thumb slides with the motion tokens; it stops sliding when the user asks for reduced motion. |
| `Focus` | The design system focus ring around the track, for the keyboard only. |

## Localization

The switch writes no text of its own: `onText` and `offText` are yours, and can be functions of your own language state. The `required` message comes from `uiLocale.strings`.

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-switch` | The field. `data-state` (`checked`, `unchecked`), `data-state-text`, `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`. |
| `.mx-toggle-field` | The layout CheckBox and Switch share. |
| `.mx-switch__input` | The native checkbox: the track itself. |
| `.mx-switch__thumb` | The thumb drawn over the track. |
| `.mx-switch__text, .mx-switch__on, .mx-switch__off` | The on / off texts. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `switch.track, switch.thumb` | Units: the track and the thumb, each with every state (`checked`, `invalid`, `hover`, `pressed`, `focus`, `disabled` and their pairs). |
| `switch.thumb-icon, switch.halo` | Units: an icon in the thumb and a halo around it, where the language has them. |
| `switch.text, switch.side-text` | Units: the on / off text in the track and beside it. |
| `switch.track-width.*, switch.track-height.*` | The track, per size. |
| `switch.thumb-size.*, switch.thumb-size-checked.*, switch.thumb-size-hover.*, switch.thumb-size-pressed.*, switch.thumb-inset, switch.thumb-stretch` | The thumb per size and state, the space around it, and how far it stretches while pressed. |
| `switch.height.*, switch.font-size.*` | The row height (density tokens) and the caption size. |
| `switch.text-padding, switch.gap` | The space of the on / off text, and before the caption. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean>` | `false` | On or off. `x-model` binds it two-way. |
| `label` | `Bind<string>` | `''` | The caption next to the track; `&Name` makes Alt+N flip it. The same property as `text`. |
| `labelPosition` | `Bind<'start' \| 'end'>` | `'end'` | The caption after the track (`end`) or before it (`start`), in the reading direction. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `hidden` keeps the caption for screen readers only; every other mode shows it next to the track. |
| `onText / offText` | `Bind<string>` | `''` | A short text for each state, e.g. `On` / `Off`. |
| `showStateText` | `Bind<SwitchStateText>` | `'inside'` | Where that text shows: `inside` the track, `beside` it, or `none`. |
| `helpText` | `Bind<string>` | `''` | A line under the caption. An error message takes its place. |
| `hint` | `Bind<string>` | `''` | A tooltip. |
| `readOnly` | `Bind<boolean>` | `false` | Focusable and read out, but it does not flip. |
| `required` | `Bind<boolean>` | `false` | It must be on. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`; the row height follows the density tokens. |
| `stretch` | `Bind<boolean>` | `false` | Fills the width; with `labelPosition="start"` the track goes to the far end. |
| `name` | `Bind<string>` | `''` | The name it is sent with in a form. |
| `rules, error, validateOn, validationGroup` | see Field |  | Validation, as in every field. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The outcome of the last check. |
| `inputElement` | read-only | The native `<input type="checkbox" role="switch">`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `toggle()` | `void` | Flips it as a click does. |
| `validate()` | `Promise<boolean>` | Checks the value and shows the outcome. |
| `resetValidation()` | `void` | Hides the outcome of earlier checks. |
| `focus()` | `boolean` | Focuses the switch. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | The value changed. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | A check ended. `e`: `{ valid, message, source }`. |
| `onclick, onchange, onfocusin, onfocusout` | The DOM events of the input reach the field. |
