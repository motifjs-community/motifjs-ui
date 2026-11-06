# SpeedDial

> Buttons · @motifx-community/ui 0.1.0-beta.3

A round button in a corner of the page, or in the flow, that fans out its actions when pressed: each a round button with a glyph and a label beside it. With one action, the main button does it itself.

## Import

```tsx
import { SpeedDial } from '@motifx-community/ui';
```

## A fan of actions

`actions` are the buttons that fan out in `direction`; each has a `glyph` of the kit’s set or an `icon` of your own, a `text` shown as its label, and a `click`. `open` and `x-model` say whether the fan is out. Here in the flow of the page (`position='inline'`).

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

## In a corner of the viewport

By default it is fixed to the bottom end corner of the viewport, `inset` away from the edges; `position` names another corner. Switch it on here to see it over the page.

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
                direction={() => (s.position.startsWith('top') ? 'down' : 'up')}
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
| `Arrow keys` | On the main button, the key along the fan opens it on the first action (the other way, on the last); on the actions they move, around the ends. Up and Down for a fan that stands, Left and Right for one that lies. |
| `Home, End` | The first and the last action. |
| `Enter, Space` | Press the main button or the focused action. |
| `Escape` | Closes the actions and puts the focus back on the main button; so does a press outside, and Tab. |

## Accessibility

| Topic | How |
| --- | --- |
| `The main button` | A button named by `text` (“Actions” in the kit language) with `aria-haspopup="menu"` and `aria-expanded`; with one action shown it is that action, named by it. |
| `The actions` | A `menu` of `menuitem`s named by their labels; out of sight they are hidden from readers and keys (`inert`). |
| `Labels and glyphs` | The labels are shown beside the actions while open and carry the names; the glyphs are decorative. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-speed-dial` | The speed dial. `data-position`, `data-direction`, `data-open`, `data-labels`, `data-extended`, `data-single`. |
| `.mx-speed-dial__main, .mx-speed-dial__main-glyph, .mx-speed-dial__main-text` | The main button, its glyph and its text. |
| `.mx-speed-dial__fan, .mx-speed-dial__action, .mx-speed-dial__action-icon, .mx-speed-dial__label` | The fan, an action (`aria-disabled`), its glyph or icon, its label. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `speed-dial.main, .main-glyph, .main-text, .action, .action-icon, .label, .fan` | Units: the main button (`hover`, `pressed`, `focus`, `open`, `extended`, `disabled`), its glyph (`open`) and text, an action (`hover`, `pressed`, `focus`, `disabled`), its glyph, the label, the fan. |
| `speed-dial.inset, .gap, .label-gap` | From the viewport’s edges, between the buttons, between an action and its label. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `actions` | `Bind<readonly SpeedDialAction[]>` | `[]` | The actions in the order they fan out: `text`, `glyph` (of the kit’s set) or `icon` (yours), `enabled`, `visible`, `click`, `key`, `data`. With one shown, the main button does it itself. |
| `glyph, openGlyph` | `Bind<string>` | `'plus'`, `'dismiss'` | The main button’s glyph, and its glyph while the actions are open. |
| `text` | `Bind<string>` | the kit’s “Actions” | What screen readers call the main button, and its text when `extended`. |
| `extended` | `Bind<boolean>` | `false` | The main button shows its `text` beside the glyph. |
| `direction` | `Bind<SpeedDialDirection>` | `'up'` | `up`, `down`, `start` or `end`: where the actions fan out. |
| `position` | `Bind<SpeedDialPosition>` | `'bottom-end'` | A corner of the viewport it is fixed to (`bottom-end`, `bottom-start`, `top-end`, `top-start`), or `inline` in the flow. |
| `open` | `Bind<boolean>` | `false` | The actions are open. `x-model` binds it two-way. |
| `closeOnAction` | `Bind<boolean>` | `true` | A press on an action closes the fan. |
| `showLabels` | `Bind<boolean>` | `true` | The actions’ labels are shown beside them while open. |

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
