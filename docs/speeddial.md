# SpeedDial

> Buttons · @motifx-community/ui 0.1.0-beta.3

A round button in a corner of the page, on an edge or in the flow, that opens its actions when pressed: round buttons in a line with a label beside each, or on a circle, a half or a quarter of one around it with a tooltip each. With one action, the main button does it itself.

## Import

```tsx
import { SpeedDial } from '@motifx-community/ui';
```

## In a line

`actions` are the buttons that go out in `direction`; each has a `glyph` of the kit’s set or an `icon` of your own, a `text` shown as its label, and a `click`. `open` and `x-model` say whether the fan is out. Here in the flow of the page (`position='inline'`).

```tsx
import { reactive } from '@motifx/core';
import { SpeedDial, Stack } from '@motifx-community/ui';

/** Two speed dials in the flow of the page: one fans up, one fans to the end; a press on an action tells. */
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

## On a circle

`layout='circle'` lays the actions evenly around the main button, the first in `direction`. They come out from under the button and go back there. `radius` sets how far out; by itself it is just enough to keep the actions `gap` apart and clear of the button. Around the button the labels are off and the actions have tooltips, because labels would run into each other; `showLabels` and `tooltip` say otherwise. Here it is in the centre of its box: `relativeTo='parent'` measures `position` in the nearest positioned parent.

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

## On a half circle

`layout='semi-circle'` lays them on half a circle with `direction` in its middle, which suits the middle of an edge: `position` takes `top`, `bottom`, `start` and `end`, and `direction` follows from it, into the page.

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

## On a quarter circle

`layout='quarter-circle'` lays them on a quarter of a circle, which suits a corner: `direction` follows from `position` again, and is a diagonal such as `up-start` when you set it.

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

`tooltip` on the speed dial turns tooltips on or off for all its actions and passes options to each; `tooltip` on an action wins, with a text of its own, options, or `false`. Each is the kit’s `Tooltip`, on the outer side of the action unless `placement` says another. With one action, the main button carries its tooltip.

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

## In a corner of the viewport

By default it is fixed to the bottom end corner of the viewport, `inset` away from the edges; `position` names another place. Switch it on here to see it over the page.

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

## One action

With exactly one action shown, there is nothing to fan out: the main button takes the action’s glyph and name and does it itself. `extended` shows the name beside the glyph.

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

| Key | What it does |
| --- | --- |
| `Tab` | The main button is the one stop; the actions are reached with the arrow keys. |
| `Arrow keys` | On the main button, the key along the actions opens them on the first (the other way, on the last); on the actions they move, around the ends. Up and Down for a line that stands, Left and Right for one that lies; around the button either pair, Down and Right forward along the circle. |
| `Home, End` | The first and the last action. |
| `Enter, Space` | Press the main button or the focused action. |
| `Escape` | Closes the actions and puts the focus back on the main button; so does a press outside, and Tab. While a tooltip is shown, the first Escape hides the tooltip. |

## Accessibility

| Topic | How |
| --- | --- |
| `The main button` | A button named by `text` (“Actions” in the kit language) with `aria-haspopup="menu"` and `aria-expanded`; with one action shown it is that action, named by it. |
| `The actions` | A `menu` of `menuitem`s named by their labels; out of sight they are hidden from readers and keys (`inert`). |
| `Labels and glyphs` | The labels are shown beside the actions while open; the name is on the action either way. The glyphs are decorative. |
| `Tooltips` | The kit’s `Tooltip`: on keyboard focus too, dismissed with Escape, described with `aria-describedby`. A touch does not show one, so where the glyph alone does not say it on a touch screen, keep the labels on. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-speed-dial` | The speed dial. `data-layout`, `data-position`, `data-relative`, `data-direction`, `data-open`, `data-labels`, `data-extended`, `data-single`. |
| `.mx-speed-dial__main, .mx-speed-dial__main-glyph, .mx-speed-dial__main-text` | The main button, its glyph and its text. |
| `.mx-speed-dial__fan, .mx-speed-dial__action, .mx-speed-dial__action-icon, .mx-speed-dial__label` | The fan, an action (`aria-disabled`, `data-side`: where its label and tooltip go), its glyph or icon, its label. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `speed-dial.main, .main-glyph, .main-text, .action, .action-icon, .label, .fan` | Units: the main button (`hover`, `pressed`, `focus`, `open`, `extended`, `disabled`), its glyph (`open`) and text, an action (`hover`, `pressed`, `focus`, `disabled`), its glyph, the label, the fan. |
| `speed-dial.inset, .gap, .label-gap` | From the edges, between the buttons (around the button too: the radius keeps this gap), between an action and its label. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `actions` | `Bind<readonly SpeedDialAction[]>` | `[]` | The actions in order: `text`, `glyph` (of the kit’s set) or `icon` (yours), `tooltip`, `enabled`, `visible`, `click`, `key`, `data`. With one shown, the main button does it itself. |
| `glyph, openGlyph` | `Bind<string>` | `'plus'`, `'dismiss'` | The main button’s glyph, and its glyph while the actions are open. |
| `text` | `Bind<string>` | the kit’s “Actions” | What screen readers call the main button, and its text when `extended`. |
| `extended` | `Bind<boolean>` | `false` | The main button shows its `text` beside the glyph. |
| `layout` | `Bind<SpeedDialLayout>` | `'linear'` | `linear`, `circle`, `semi-circle` or `quarter-circle`: in a line from the main button, or around it. |
| `radius` | `Bind<number \| null>` | by itself | Around the button: pixels from its centre to the actions’ centres. By itself it is just enough to keep them apart. An `extended` main button is wider than this reckons with, so give it one. |
| `direction` | `Bind<SpeedDialDirection>` | into the page | `up`, `down`, `start`, `end` or a diagonal such as `up-start`: where the actions go, the middle of the arc around the button. A line takes the first word of a diagonal. By itself it is away from the edges `position` names, and `up` in the centre and inline. |
| `position` | `Bind<SpeedDialPosition>` | `'bottom-end'` | A corner (`bottom-end`, `bottom-start`, `top-end`, `top-start`), the middle of an edge (`top`, `bottom`, `start`, `end`), `center`, or `inline` in the flow. |
| `relativeTo` | `Bind<SpeedDialRelativeTo>` | `'viewport'` | What `position` is measured in: `viewport`, or `parent`, the nearest positioned parent. |
| `open` | `Bind<boolean>` | `false` | The actions are open. `x-model` binds it two-way. |
| `closeOnAction` | `Bind<boolean>` | `true` | A press on an action closes the fan. |
| `showLabels` | `Bind<boolean>` | in a line yes, around no | The actions’ labels are shown beside them while open. |
| `tooltip` | `Bind<boolean \| SpeedDialTooltip>` | while the labels are off | Tooltips on the actions, with their `text`. Options go to each `Tooltip` (`placement`, `delay`, `hideDelay`, `showOn`, `content`…). By default they open on the outer side after 200 ms. An action’s own `tooltip` wins: a text, options, or `false` for none. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onOpened, onClosed` | event | The actions opened or closed (`byUser`). |
| `onActionClick` | event | An action was pressed (`index`, `action`); its own `click` runs first. |
| `isOpen` | read-only | The actions are open. |
| `single` | read-only | The one action shown, when there is exactly one; `null` otherwise. |
| `mainElement` | read-only | The main button. |
| `show(), close(), toggle()` | `void` | Opens or closes the actions. |
| `refresh()` | `void` | Reads the actions again after they were changed in place. |
