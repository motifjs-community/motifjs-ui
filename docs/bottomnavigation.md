# BottomNavigation

> Navigation · @motifx-community/ui 0.1.0-beta.11

The destinations of an application at the bottom of the screen, each an icon with a label. The bar is one Tab stop, marks the selected item for screen readers and keeps clear of the home indicator of a phone.

## Import

```tsx
import { BottomNavigation } from '@motifx-community/ui';
```

## Destinations

`items` defines the destinations, and `x-model` binds the selected one. `badge` shows a count on the icon, `dot` shows a dot, and `activeGlyph` changes the glyph while the item is selected.

```tsx
import { reactive } from '@motifx/core';
import { BottomNavigation, Stack } from '@motifx-community/ui';

/** Three destinations bound to a value, with a count on one of them. */
export default function Basic() {
    const s = reactive({ page: 'home', unread: 3 });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <BottomNavigation
                class="bn-basic"
                position="static"
                x-model={() => s.page}
                items={[
                    { value: 'home', text: 'Home', glyph: 'star', activeGlyph: 'star-filled' },
                    { value: 'inbox', text: 'Inbox', glyph: 'file', badge: () => s.unread },
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },
                    { value: 'profile', text: 'Profile', glyph: 'person', dot: true }
                ]}
            />
            <output class="bn-told">{() => `Page: ${s.page}`}</output>
        </Stack>
    );
}
```

## Labels

`labelMode` shows the labels always, only on the selected item, or never. A label out of view stays as the accessible name of the item.

```tsx
import { reactive } from '@motifx/core';
import { BottomNavigation, ButtonGroup, Stack } from '@motifx-community/ui';

const ITEMS = [
    { value: 'home', text: 'Home', glyph: 'star' },
    { value: 'search', text: 'Search', glyph: 'search' },
    { value: 'alarms', text: 'Alarms', glyph: 'clock' },
    { value: 'locked', text: 'Locked', glyph: 'lock', enabled: false }
];

/** `labelMode`: a label out of view stays as the accessible name of the item. */
export default function Labels() {
    const s = reactive({ mode: 'active' as 'always' | 'active' | 'never', page: 'home' });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <ButtonGroup
                label="Label mode"
                x-model={() => s.mode}
                items={[
                    { value: 'always', text: 'Always' },
                    { value: 'active', text: 'Active' },
                    { value: 'never', text: 'Never' }
                ]}
            />
            <BottomNavigation class="bn-labels" label="Sections" position="static" labelMode={() => s.mode} x-model={() => s.page} items={ITEMS} />
        </Stack>
    );
}
```

## Refusing a change

`onSelecting` occurs before the selection changes, and setting `cancel` keeps the current item.

```tsx
import { reactive } from '@motifx/core';
import { BottomNavigation, Stack, Switch } from '@motifx-community/ui';

/** `onSelecting` keeps the page while there are unsaved changes. */
export default function Guarded() {
    const s = reactive({ page: 'edit', dirty: true, told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <Switch label="Unsaved changes" x-model={() => s.dirty} />
            <BottomNavigation
                class="bn-guarded"
                label="Document"
                position="static"
                x-model={() => s.page}
                onSelecting={e => {
                    e.cancel = s.dirty;
                    s.told = s.dirty ? 'Save your changes first.' : '';
                }}
                items={[
                    { value: 'edit', text: 'Edit', glyph: 'pencil' },
                    { value: 'files', text: 'Files', glyph: 'file' },
                    { value: 'share', text: 'Share', glyph: 'upload' }
                ]}
            />
            <output class="bn-guard-told">{() => s.told}</output>
        </Stack>
    );
}
```

## In a screen

By default, the bar is fixed to the bottom of the viewport. In a box that scrolls, use `position='sticky'`. `hideOnScroll` moves it away while scrolling down.

```tsx
import { reactive } from '@motifx/core';
import { AppBar, BottomNavigation } from '@motifx-community/ui';

const ROWS = Array.from({ length: 30 }, (_, i) => `Message ${i + 1}`);

/** A phone screen: the two bars around a box that scrolls. Scrolling down moves the bottom bar away. */
export default function Screen() {
    const s = reactive({ page: 'mail' });
    return (
        <div class="bn-screen" tabindex="0" style="position: relative; inline-size: min(100%, 390px); block-size: 420px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)">
            <AppBar title="Messages" navigation="menu" />
            {ROWS.map(row => (
                <p key={row} style="margin: 0; padding: 12px 16px">
                    {row}
                </p>
            ))}
            <BottomNavigation
                class="bn-scroll"
                label="Screens"
                position="sticky"
                hideOnScroll
                x-model={() => s.page}
                items={[
                    { value: 'mail', text: 'Messages', glyph: 'file' },
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },
                    { value: 'profile', text: 'Profile', glyph: 'person' }
                ]}
            />
        </div>
    );
}
```

## Programmatic use

`new BottomNavigation(props)` creates the bar without JSX. Each prop is also a property.

```tsx
import { Component } from '@motifx/core';
import { BottomNavigation, Button, Stack } from '@motifx-community/ui';

/** A bar created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const bar = new BottomNavigation({
            label: 'Search pages',
            position: 'static',
            value: 'home',
            items: [
                { value: 'home', text: 'Home', glyph: 'star' },
                { value: 'search', text: 'Search', glyph: 'search' }
            ]
        });
        const go = new Button({ text: 'Go to Search', variant: 'outline', onclick: () => (bar.value = 'search') });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(bar, go);
        this.controls.add(stack);
    }
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly BottomNavigationItem[]>` | `[]` | The destinations. The bar is designed for three to five; use a `Drawer` for more. |
| `value` | `Bind<string \| number \| null>` | `null` | The `value` of the selected item. `x-model` provides two-way binding. |
| `label` | `Bind<string>` | The kit string “Navigation” | The accessible name of the bar. |
| `labelMode` | `Bind<'always' \| 'active' \| 'never'>` | `'always'` | When items show their labels. A label out of view stays as the accessible name of the item. |
| `position` | `Bind<'fixed' \| 'sticky' \| 'static'>` | `'fixed'` | How the bar stays on the page. |
| `hideOnScroll` | `Bind<boolean>` | `false` | Moves the bar away while scrolling down, and brings it back while scrolling up. |
| `scrollTarget` | `Bind<ComponentBase \| null>` | The nearest ancestor that scrolls | What `hideOnScroll` watches. Without a scrolling ancestor, it is the page. |

### Item fields

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number` | Its position | What `value` is when this item is selected. |
| `text` | `Bind<string>` | — | The label, which is also the accessible name. |
| `glyph, activeGlyph` | `Bind<string>` | `''` | The glyph, and the glyph while selected. |
| `icon, activeIcon` | `Bind<IconSource \| null>` | `null` | An image address or a component, used instead of a glyph. |
| `href, rel, target` | `Bind<string>` | `''` | Make the item a link. Use `rel: 'router'` for routed pages. |
| `badge` | `Bind<number \| null>` | `null` | A count in a badge on the icon. |
| `dot` | `Bind<boolean>` | `false` | A dot on the icon instead of a count. |
| `enabled, visible` | `Bind<boolean>` | `true` | A disabled item is dimmed and cannot be selected. A hidden item is removed. |
| `click` | `(e) => void` | — | Occurs when the item is pressed. |
| `data` | `unknown` | — | A custom application value for the item. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `selectedItem` | `BottomNavigationItem \| null` | The selected item. |
| `focus()` | `boolean` | Moves focus to the item Tab reaches. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onSelecting` | `{ value, previous, item, previousItem, originalEvent, source, cancel }` | Occurs before the selection changes. Setting `cancel` keeps the current item, and a link is not followed. |
| `onSelectionChanged` | `{ value, previous, item, previousItem, originalEvent, source }` | Occurs after the selection changes. |
| `onItemClick` | `{ item, value, originalEvent, source }` | Occurs when an item is pressed, after its own `click`. |

### Keyboard

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the bar, to the selected item, and out of it. |
| `Left, Right` | Moves between the items, wrapping around at the ends. The direction follows the page. |
| `Home, End` | Moves to the first or the last item. |
| `Enter, Space` | Selects the focused item. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Landmark` | The bar is a `<nav>` with an accessible name. |
| `Selected item` | `aria-current="page"` marks it for screen readers. |
| `Disabled item` | `aria-disabled="true"`; the arrow keys pass over it. |
| `Focus` | A bar moved away by `hideOnScroll` comes back when focus enters it. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-bottom-navigation` | The bar. `data-label-mode`, `data-position` and `data-hidden` describe its state. |
| `.mx-bottom-navigation__list, .mx-bottom-navigation__item` | The row and an item. `data-selected` and `aria-disabled` describe an item. |
| `.mx-bottom-navigation__indicator, .mx-bottom-navigation__icon-host, .mx-bottom-navigation__glyph, .mx-bottom-navigation__icon, .mx-bottom-navigation__label, .mx-bottom-navigation__badge` | The mark of the selected item, the box of the icon, its glyph or icon, the label and the badge. |

### Design tokens

| Token | Description |
| --- | --- |
| `bottom-navigation.bar, .list, .item, .indicator, .icon-host, .label` | Units: the bar, the row, an item (`hover`, `pressed`, `focus`, `selected`, `disabled`), the mark (`selected`), the box of the icon and the label (`selected`). |

## Feedback

Loading issues…
