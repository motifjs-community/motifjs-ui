# Switch

> Choice · @motifx-community/ui 0.1.0-beta.10

An on/off switch with a label. It has a track with a sliding thumb, optional on/off text inside or next to the track, and read-only and required states. It is a native check box with the switch role.

## Import

```tsx
import { Switch } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Switch } from '@motifx-community/ui';

/** A switch bound to state with x-model, and switches created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ wifi: true, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const sw = new Switch({ label: `Feature ${++added}`, onText: 'On', offText: 'Off' });
    sw.onValueChanged((e) => (s.result = `${sw.label}: ${e.value ? 'on' : 'off'}`));
    host?.controls.add(sw);
    sw.focus();
  };

  return (
    <>
      <Switch label="&Wi-Fi" x-model={() => s.wifi} helpText={() => (s.wifi ? 'Connected to Home.' : 'Not connected.')} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a switch programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="sw-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## On/off text

`onText` and `offText` appear inside the track, which grows to fit them, or next to it. The text is visual only, and the switch announces its own state.

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

The label appears after the track, or before it with `labelPosition="start"`. With `stretch`, the field takes the full width and the track moves to the far end, as in a settings list.

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

| Key | Description |
| --- | --- |
| `Space` | Toggles the switch, using the native key. |
| `Enter` | Also toggles the switch, as on a button. |
| `Alt + key (`&Name`)` | Moves focus to the switch and toggles it (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Element` | A native `<input type="checkbox" role="switch">`. Screen readers announce "switch, on" or "switch, off", and the browser provides Space, the form value, `:checked` and `:disabled`. Its label is a `<label for>`, so clicking the label toggles the switch. |
| `On/off text` | Decorative only (`aria-hidden`), because the switch announces its own state. |
| `Read-only` | `aria-readonly="true"`. The field stays in the Tab order. |
| `Motion` | The thumb animates with the motion tokens, and the animation is removed when the user prefers reduced motion. |
| `Focus` | The design system focus ring around the track, shown only during keyboard use. |

## Localization

A switch has no strings of its own. `onText` and `offText` are yours and can be functions of your language state. The `required` message comes from `uiLocale.strings`.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-switch` | The field. `data-state` (`checked`, `unchecked`), `data-state-text`, `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`. |
| `.mx-toggle-field` | The layout shared by CheckBox and Switch. |
| `.mx-switch__input` | The native check box, which is the track itself. |
| `.mx-switch__thumb` | The thumb drawn over the track. |
| `.mx-switch__text, .mx-switch__on, .mx-switch__off` | The on/off text. |

### Component tokens

| Token | Description |
| --- | --- |
| `switch.track, switch.thumb` | Units: the track and the thumb, each with every state (`checked`, `invalid`, `hover`, `pressed`, `focus`, `disabled` and their combinations). |
| `switch.thumb-icon, switch.halo` | Units: an icon in the thumb and a halo around it, where the design language includes them. |
| `switch.text, switch.side-text` | Units: the on/off text in the track and next to it. |
| `switch.track-width.*, switch.track-height.*` | The track, per size. |
| `switch.thumb-size.*, switch.thumb-size-checked.*, switch.thumb-size-hover.*, switch.thumb-size-pressed.*, switch.thumb-inset, switch.thumb-stretch` | The thumb per size and state, the space around it, and how far it stretches when pressed. |
| `switch.height.*, switch.font-size.*` | Row height (density tokens) and label size. |
| `switch.text-padding, switch.gap` | The spacing of the on/off text and the space before the label. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean>` | `false` | Indicates whether the switch is on. `x-model` provides two-way binding. |
| `label` | `Bind<string>` | `''` | The label next to the track. Writing `&Name` makes Alt+N toggle the switch. This is the same property as `text`. |
| `labelPosition` | `Bind<'start' \| 'end'>` | `'end'` | Places the label after the track (`end`) or before it (`start`), following the reading direction. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `hidden` keeps the label for screen readers only. Every other mode shows it next to the track. |
| `onText / offText` | `Bind<string>` | `''` | Short text for each state, such as `On` and `Off`. |
| `showStateText` | `Bind<SwitchStateText>` | `'inside'` | Where the text appears: `inside` the track, `beside` it, or `none`. |
| `helpText` | `Bind<string>` | `''` | Help text shown below the label. An error message replaces it. |
| `hint` | `Bind<string>` | `''` | The tooltip text. |
| `readOnly` | `Bind<boolean>` | `false` | The switch can receive focus and is announced, but it cannot be toggled. |
| `required` | `Bind<boolean>` | `false` | The switch must be on. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`; the row height follows the density tokens. |
| `stretch` | `Bind<boolean>` | `false` | Stretches to the full width. With `labelPosition="start"`, the track moves to the far end. |
| `name` | `Bind<string>` | `''` | The name submitted with the form. |
| `rules, error, validateOn, validationGroup` | see Field |  | Validation works the same way as for all fields. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The result of the last validation. |
| `inputPart` | read-only | The native `<input type="checkbox" role="switch">`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `toggle()` | `void` | Toggles the switch as a click does. |
| `validate()` | `Promise<boolean>` | Validates the value and displays the result. |
| `resetValidation()` | `void` | Clears the results of previous validation. |
| `focus()` | `boolean` | Sets focus on the switch. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | Occurs when validation finishes. `e`: `{ valid, message, source }`. |
| `onclick, onchange, onfocusin, onfocusout` | DOM events from the input bubble up to the field. |

## Feedback

Loading issues…
