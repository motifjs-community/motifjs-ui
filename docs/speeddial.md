# SpeedDial

> Buttons · @motifx-community/ui 0.1.0-beta.6

A floating action button that opens a set of related actions. Place it in a corner, on an edge or inline. Actions appear in a line with labels, or on a full, half or quarter circle around the button with tooltips. If there is only one action, the main button performs it directly.

## Import

```tsx
import { SpeedDial } from '@motifx-community/ui';
```

## Linear layout

`actions` defines the buttons, which open in the given `direction`. Each action has a `glyph` from the kit's icon set or a custom `icon`, a `text` shown as its label, and a `click` handler. `open` and `x-model` control whether the actions are visible. This example uses `position='inline'` to keep the button in the page flow.

```tsx
import { reactive } from '@motifx/core';
import { SpeedDial, Stack } from '@motifx-community/ui';

/** Two speed dials in the page flow: one opens upward and one toward the end. Clicking an action reports it. */
export default function Inline() {
    const s = reactive({ told: '', open: false });
    const actions = [
        { key: 'note', text: 'New note', glyph: 'pencil', click: () => (s.told = 'a new note') },
        { key: 'event', text: 'New event', glyph: 'calendar', click: () => (s.told = 'a new event') },
        { key: 'file', text: 'Upload a file', glyph: 'upload', click: () => (s.told = 'a file to upload') },
        { key: 'locked', text: 'Not yet', glyph: 'lock', enabled: false }
    ];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <div class="sd-row" style="display: flex; align-items: flex-end; gap: 48px; min-block-size: 260px; padding-inline-start: 140px">
                <SpeedDial class="sd-up" position="inline" direction="up" text="New" actions={actions} x-model={() => s.open} />
                <SpeedDial class="sd-end" position="inline" direction="end" text="Share" glyph="person" actions={[{ text: 'Mail', glyph: 'file', click: () => (s.told = 'shared by mail') }, { text: 'Link', glyph: 'pin', click: () => (s.told = 'a link to share') }]} />
            </div>
            <output class="sd-told">{() => `${s.told || 'nothing yet'}${s.open ? ' (open)' : ''}`}</output>
        </Stack>
    );
}
```

## Circle layout

`layout='circle'` places the actions evenly around the main button, starting from `direction`. They animate out from under the button and return there when closed. `radius` sets the distance. By default, it is calculated to keep the actions `gap` apart and clear of the button. Labels are off in circular layouts because they would overlap, so the actions show tooltips instead. You can change this with `showLabels` and `tooltip`. In this example, `relativeTo='parent'` centers the button in its box by measuring `position` against the nearest positioned ancestor.

```tsx
import { reactive } from '@motifx/core';
import { Button, SpeedDial, Stack } from '@motifx-community/ui';

/** The actions on a whole circle around the button, in the centre of a box; by default just far enough out to keep them apart. */
export default function Circle() {
    const s = reactive({ radius: null as number | null, told: '' });
    const actions = [
        { text: 'Edit', glyph: 'pencil', click: () => (s.told = 'edit') },
        { text: 'Refresh', glyph: 'repeat', click: () => (s.told = 'refresh') },
        { text: 'Delete', glyph: 'trash', click: () => (s.told = 'delete') },
        { text: 'Upload', glyph: 'upload', click: () => (s.told = 'upload') },
        { text: 'Download', glyph: 'download', click: () => (s.told = 'download') }
    ];
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Radius by itself" variant="outline" onclick={() => (s.radius = null)} />
                <Button text="Radius 120" variant="outline" onclick={() => (s.radius = 120)} />
                <output class="sd-circle-told">{() => s.told}</output>
            </Stack>
            <div style="position: relative; inline-size: 100%; block-size: 22rem">
                <SpeedDial class="sd-circle" layout="circle" position="center" relativeTo="parent" radius={() => s.radius} text="Tools" actions={actions} />
            </div>
        </Stack>
    );
}
```

## Semi-circle layout

`layout='semi-circle'` places the actions on a half circle centered on `direction`, which works well in the middle of an edge. `position` accepts `top`, `bottom`, `start` and `end`, and `direction` defaults to pointing into the page.

```tsx
import { SpeedDial } from '@motifx-community/ui';

const ACTIONS = [
    { text: 'Edit', glyph: 'pencil' },
    { text: 'Refresh', glyph: 'repeat' },
    { text: 'Delete', glyph: 'trash' },
    { text: 'Upload', glyph: 'upload' },
    { text: 'Download', glyph: 'download' }
];

/** A half circle on the middle of each edge of a box: `direction` follows from `position`, into the box. */
export default function SemiCircle() {
    return (
        <div class="sd-semi" style="position: relative; inline-size: 100%; block-size: 26rem">
            <SpeedDial class="sd-semi-top" layout="semi-circle" position="top" relativeTo="parent" text="Tools at the top" actions={ACTIONS} />
            <SpeedDial class="sd-semi-start" layout="semi-circle" position="start" relativeTo="parent" text="Tools at the start" actions={ACTIONS} />
            <SpeedDial class="sd-semi-end" layout="semi-circle" position="end" relativeTo="parent" text="Tools at the end" actions={ACTIONS} />
            <SpeedDial class="sd-semi-bottom" layout="semi-circle" position="bottom" relativeTo="parent" text="Tools at the bottom" actions={ACTIONS} />
        </div>
    );
}
```

## Quarter-circle layout

`layout='quarter-circle'` places the actions on a quarter circle, which works well in a corner. `direction` is again derived from `position`. If you set it yourself, use a diagonal value such as `up-start`.

```tsx
import { SpeedDial } from '@motifx-community/ui';

const ACTIONS = [
    { text: 'Edit', glyph: 'pencil' },
    { text: 'Refresh', glyph: 'repeat' },
    { text: 'Delete', glyph: 'trash' },
    { text: 'Upload', glyph: 'upload' },
    { text: 'Download', glyph: 'download' }
];

/** A quarter circle in each corner of a box: `direction` follows from `position`, into the box. */
export default function QuarterCircle() {
    return (
        <div class="sd-quarter" style="position: relative; inline-size: 100%; block-size: 26rem">
            <SpeedDial class="sd-quarter-top-start" layout="quarter-circle" position="top-start" relativeTo="parent" text="Tools, top start" actions={ACTIONS} />
            <SpeedDial class="sd-quarter-top-end" layout="quarter-circle" position="top-end" relativeTo="parent" text="Tools, top end" actions={ACTIONS} />
            <SpeedDial class="sd-quarter-bottom-start" layout="quarter-circle" position="bottom-start" relativeTo="parent" text="Tools, bottom start" actions={ACTIONS} />
            <SpeedDial class="sd-quarter-bottom-end" layout="quarter-circle" position="bottom-end" relativeTo="parent" text="Tools, bottom end" actions={ACTIONS} />
        </div>
    );
}
```

## Tooltips

Use `tooltip` on the speed dial to turn tooltips on or off for all actions and to pass options to each one. `tooltip` on an action takes precedence and accepts text, options or `false`. Each tooltip is a kit `Tooltip` that opens on the outer side of the action unless `placement` specifies otherwise. With one action, the main button shows its tooltip.

```tsx
import { reactive } from '@motifx/core';
import { Button, SpeedDial, Stack } from '@motifx-community/ui';

/** Tooltips on the actions: the speed dial's options for all, a text or options of an action's own, none on one. */
export default function Tooltips() {
    const s = reactive({ on: true });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Button class="sd-tips-toggle" text="Tooltips" variant="outline" toggle x-model={() => s.on} />
            <div style="min-block-size: 5rem; padding-block-start: 2rem">
                <SpeedDial
                    class="sd-tips"
                    position="inline"
                    direction="end"
                    text="Edit"
                    closeOnAction={false}
                    showLabels={false}
                    tooltip={() => (s.on ? { placement: 'top', delay: 100 } : false)}
                    actions={[
                        { text: 'Edit', glyph: 'pencil' },
                        { text: 'Upload', glyph: 'upload', tooltip: 'Upload a new version, up to 20 MB' },
                        { text: 'Delete', glyph: 'trash', tooltip: { text: 'Kept in the bin for 30 days', placement: 'bottom' } },
                        { text: 'Save', glyph: 'save', tooltip: false }
                    ]}
                />
            </div>
        </Stack>
    );
}
```

## Fixed to the viewport

By default, the button is fixed to the bottom end corner of the viewport, `inset` from the edges. Use `position` to choose another location. Turn it on here to see it over the page.

```tsx
import { reactive } from '@motifx/core';
import { Button, SpeedDial, Stack } from '@motifx-community/ui';

/** A speed dial fixed to a corner of the viewport, shown while the switch is on; the corner and the fan's way can change. */
export default function Corner() {
    const s = reactive({ on: false, position: 'bottom-end' as 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start', told: '' });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button class="sd-corner-toggle" text="In the corner" variant="outline" toggle x-model={() => s.on} />
                <Button text="Bottom end" variant="outline" onclick={() => (s.position = 'bottom-end')} />
                <Button text="Bottom start" variant="outline" onclick={() => (s.position = 'bottom-start')} />
                <Button text="Top end" variant="outline" onclick={() => (s.position = 'top-end')} />
                <output class="sd-corner-told">{() => s.told}</output>
            </Stack>
            <SpeedDial
                class="sd-corner"
                visible={() => s.on}
                position={() => s.position}
                text="Create"
                actions={[
                    { text: 'Document', glyph: 'file', click: () => (s.told = 'a document') },
                    { text: 'Folder', glyph: 'columns', click: () => (s.told = 'a folder') },
                    { text: 'Upload', glyph: 'upload', click: () => (s.told = 'an upload') }
                ]}
            />
        </Stack>
    );
}
```

## Single action

When exactly one action is visible, there is nothing to expand. The main button takes the action's glyph and name, and runs the action directly. `extended` shows the name next to the glyph.

```tsx
import { reactive } from '@motifx/core';
import { SpeedDial, Stack } from '@motifx-community/ui';

/** With one action shown, the main button does it itself and takes its glyph and name; `extended` shows the name beside the glyph. */
export default function Single() {
    const s = reactive({ saved: 0 });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="lg" align="center">
                <SpeedDial class="sd-single" position="inline" actions={[{ text: 'Save', glyph: 'save', click: () => s.saved++ }]} />
                <SpeedDial class="sd-extended" position="inline" extended actions={[{ text: 'Save a copy', glyph: 'save', click: () => s.saved++ }]} />
            </Stack>
            <output class="sd-single-told">{() => `saved ${s.saved} times`}</output>
        </Stack>
    );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | The main button is the only Tab stop. Use the arrow keys to reach the actions. |
| `Arrow keys` | On the main button, the arrow key that points along the actions opens them on the first action, and the opposite key opens them on the last. On the actions, the arrow keys move between them and wrap at the ends. A vertical line uses Up and Down, and a horizontal line uses Left and Right. In circular layouts both pairs work, with Down and Right moving forward around the circle. |
| `Home, End` | Moves to the first or last action. |
| `Enter, Space` | Presses the main button or the focused action. |
| `Escape` | Closes the actions and returns focus to the main button. Clicking outside and pressing Tab also close them. If a tooltip is visible, the first Escape dismisses the tooltip. |

## Accessibility

| Topic | Details |
| --- | --- |
| `The main button` | A button named by `text` (“Actions” in the kit language), with `aria-haspopup="menu"` and `aria-expanded`. With one action, it represents that action and takes its name. |
| `The actions` | A `menu` of `menuitem` elements named by their labels. When closed, they are hidden from assistive technology and from the keyboard (`inert`). |
| `Labels and glyphs` | Labels appear next to the actions while they are open, and each action carries its accessible name in either case. Glyphs are decorative. |
| `Tooltips` | The kit's `Tooltip`. It also appears on keyboard focus, closes with Escape and is exposed through `aria-describedby`. Tooltips do not appear on touch, so keep the labels on if a glyph alone is not clear on a touch screen. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-speed-dial` | The speed dial. `data-layout`, `data-position`, `data-relative`, `data-direction`, `data-open`, `data-labels`, `data-extended`, `data-single`. |
| `.mx-speed-dial__main, .mx-speed-dial__main-glyph, .mx-speed-dial__main-text` | The main button, its glyph and its text. |
| `.mx-speed-dial__fan, .mx-speed-dial__action, .mx-speed-dial__action-icon, .mx-speed-dial__label` | The action container, an action (`aria-disabled`, `data-side`: where its label and tooltip appear), its glyph or icon, and its label. |

### Component tokens

| Token | Description |
| --- | --- |
| `speed-dial.main, .main-glyph, .main-text, .action, .action-icon, .label, .fan` | Units: the main button (`hover`, `pressed`, `focus`, `open`, `extended`, `disabled`), its glyph (`open`) and text, an action (`hover`, `pressed`, `focus`, `disabled`), its glyph, the label and the action container. |
| `speed-dial.inset, .gap, .label-gap` | Distance from the edges, gap between buttons (the radius preserves this gap in circular layouts), and gap between an action and its label. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `actions` | `Bind<readonly SpeedDialAction[]>` | `[]` | The actions, in order: `text`, `glyph` (from the kit's set) or `icon` (custom), `tooltip`, `enabled`, `visible`, `click`, `key` and `data`. If one action is visible, the main button performs it directly. |
| `glyph, openGlyph` | `Bind<string>` | `'plus'`, `'dismiss'` | The glyph of the main button, and its glyph while the actions are open. |
| `text` | `Bind<string>` | The kit string “Actions” | The accessible name of the main button, and its text when `extended` is set. |
| `extended` | `Bind<boolean>` | `false` | Shows `text` next to the glyph on the main button. |
| `layout` | `Bind<SpeedDialLayout>` | `'linear'` | `linear`, `circle`, `semi-circle` or `quarter-circle`: a line from the main button, or a circular layout around it. |
| `radius` | `Bind<number \| null>` | Calculated | In circular layouts, the distance in pixels from the center of the main button to the center of each action. By default, it is just large enough to keep the actions apart. An `extended` button is wider than this calculation assumes, so set a value in that case. |
| `direction` | `Bind<SpeedDialDirection>` | Into the page | `up`, `down`, `start`, `end` or a diagonal such as `up-start`. This is the direction the actions open in, and the middle of the arc in circular layouts. A linear layout uses the first part of a diagonal. By default, the actions open away from the edges named by `position`, or `up` when centered or inline. |
| `position` | `Bind<SpeedDialPosition>` | `'bottom-end'` | A corner (`bottom-end`, `bottom-start`, `top-end`, `top-start`), the middle of an edge (`top`, `bottom`, `start`, `end`), `center`, or `inline` to stay in the page flow. |
| `relativeTo` | `Bind<SpeedDialRelativeTo>` | `'viewport'` | The reference for `position`: `viewport`, or `parent` for the nearest positioned ancestor. |
| `open` | `Bind<boolean>` | `false` | Indicates whether the actions are open. `x-model` provides two-way binding. |
| `closeOnAction` | `Bind<boolean>` | `true` | Closes the actions when one is selected. |
| `showLabels` | `Bind<boolean>` | On for linear, off for circular | Shows labels next to the actions while they are open. |
| `tooltip` | `Bind<boolean \| SpeedDialTooltip>` | On when labels are off | Shows tooltips on the actions, using their `text`. Options are passed to each `Tooltip` (`placement`, `delay`, `hideDelay`, `showOn`, `content`…). By default, they open on the outer side after 200 ms. An action's own `tooltip` takes precedence and can be text, options, or `false` to disable it. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onOpened, onClosed` | event | Occurs when the actions open or close (`byUser`). |
| `onActionClick` | event | Occurs when an action is selected (`index`, `action`). The action's own `click` runs first. |
| `isOpen` | read-only | Indicates whether the actions are open. |
| `single` | read-only | The single visible action, or `null` if there is more than one. |
| `mainElement` | read-only | The main button. |
| `show(), close(), toggle()` | `void` | Opens or closes the actions. |
| `refresh()` | `void` | Re-reads the actions after they have been changed in place. |

## Feedback

Loading issues…
