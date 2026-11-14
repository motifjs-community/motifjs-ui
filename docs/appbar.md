# AppBar

> Navigation · @motifx-community/ui 0.1.0-beta.11

The top bar of an application, with a navigation button, a logo, a title, a control and commands. The commands are a `Toolbar`, so those that do not fit move into a menu.

## Import

```tsx
import { AppBar } from '@motifx-community/ui';
```

## Title and commands

`navigation` adds a button at the start of the bar, and `onNavigationClick` reports it. `actions` takes the same items as `Toolbar.items`. Make the window narrower to see commands move into the menu.

```tsx
import { reactive } from '@motifx/core';
import { AppBar, Stack } from '@motifx-community/ui';

const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;

/** A title, a menu button and commands. Commands that do not fit move into the "more" menu. */
export default function Basic() {
    const s = reactive({ told: 'nothing yet' });
    const actions = [
        { icon: icon('search'), hint: 'Search', click: () => (s.told = 'search') },
        { icon: icon('download'), hint: 'Download', click: () => (s.told = 'download') },
        { icon: icon('trash'), hint: 'Delete', click: () => (s.told = 'delete') }
    ];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <AppBar class="ab-basic" position="static" title="Orders" subtitle="This week" navigation="menu" actions={actions} onNavigationClick={() => (s.told = 'the menu')} />
            <output class="ab-told">{() => `Pressed: ${s.told}`}</output>
        </Stack>
    );
}
```

## Title and tone

`titleAlign` centers the title, `tone` gives the bar the accent color, and `prominent` puts a larger title on a row of its own.

```tsx
import { AppBar, Stack } from '@motifx-community/ui';

const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;

/** A centered title, the accent tone, and a prominent title on a row of its own. */
export default function Looks() {
    const actions = [{ icon: icon('search'), hint: 'Search' }];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <AppBar class="ab-center" position="static" title="Invoice" navigation="back" titleAlign="center" actions={actions} />
            <AppBar class="ab-accent" position="static" title="Inbox" tone="accent" navigation="menu" actions={actions} />
            <AppBar class="ab-prominent" position="static" title="Reports" prominent navigation="back" actions={actions} />
        </Stack>
    );
}
```

## A control in the bar

JSX children lie between the title and the commands. This is the place for a search box.

```tsx
import { AppBar, TextBox } from '@motifx-community/ui';

/** A control between the title and the commands, written as a JSX child. */
export default function WithContent() {
    return (
        <AppBar class="ab-content" position="static" title="Customers" style="inline-size: 100%">
            <TextBox label="Search" labelMode="hidden" placeholder="Search customers" />
        </AppBar>
    );
}
```

## Scrolling

By default, the bar sticks to the top of what scrolls. `scrollBehavior` raises it over the content or moves it away while scrolling down. Scroll the box to compare them.

```tsx
import { reactive } from '@motifx/core';
import { AppBar, ButtonGroup, Stack } from '@motifx-community/ui';

const ROWS = Array.from({ length: 30 }, (_, i) => `Order ${i + 1}`);

/** The bar sticks to the top of the box that scrolls. `lift` raises it over the content, `hide` moves it away. */
export default function Scrolling() {
    const s = reactive({ behavior: 'lift' as 'none' | 'lift' | 'hide' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <ButtonGroup
                label="Scroll behavior"
                x-model={() => s.behavior}
                items={[
                    { value: 'none', text: 'None' },
                    { value: 'lift', text: 'Lift' },
                    { value: 'hide', text: 'Hide' }
                ]}
            />
            <div class="ab-scroll" tabindex="0" style="block-size: 260px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)">
                <AppBar class="ab-scrolling" title="Orders" navigation="menu" scrollBehavior={() => s.behavior} />
                {ROWS.map(row => (
                    <p key={row} style="margin: 0; padding: 12px 16px">
                        {row}
                    </p>
                ))}
            </div>
        </Stack>
    );
}
```

## Programmatic use

`new AppBar(props)` creates the bar without JSX. Each prop is also a property.

```tsx
import { Component } from '@motifx/core';
import { AppBar, Button, Stack } from '@motifx-community/ui';

/** A bar created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const bar = new AppBar({ title: 'Draft', position: 'static', navigation: 'back' });
        const rename = new Button({ text: 'Rename', variant: 'outline', onclick: () => (bar.title = 'Final') });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(bar, rename);
        this.controls.add(stack);
    }
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title, subtitle` | `Bind<string>` | `''` | The title, and a smaller line under it. |
| `titleAlign` | `Bind<'start' \| 'center'>` | `'start'` | A centered title stays in the middle of the bar whatever lies beside it. |
| `headingLevel` | `Bind<number \| null>` | `null` | Makes the title a heading of this level. |
| `logo` | `Bind<IconSource \| null>` | `null` | An image address or a component before the title. |
| `navigation` | `Bind<'none' \| 'menu' \| 'back'>` | `'none'` | The button at the start of the bar. |
| `navigationGlyph` | `Bind<string>` | `'menu'`, `'arrow-start'` | The glyph of that button. The back arrow is mirrored in a right-to-left page. |
| `navigationLabel` | `Bind<string>` | A kit string | The accessible name of that button. |
| `actions` | `Bind<readonly ToolbarItem[]>` | `[]` | The commands at the end of the bar, the same items as `Toolbar.items`. |
| `actionsLabel` | `Bind<string>` | The kit string “Actions” | The accessible name of the commands. |
| `overflow` | `Bind<ToolbarOverflow>` | `'menu'` | How commands that do not fit are handled. |
| `content` | `Bind<ComponentBase \| null>` | `null` | A control between the title and the commands, the same as JSX children. |
| `tone` | `Bind<'surface' \| 'accent'>` | `'surface'` | The color of the bar. |
| `prominent` | `Bind<boolean>` | `false` | Puts a larger title on a row of its own under the buttons. |
| `position` | `Bind<'static' \| 'sticky' \| 'fixed'>` | `'sticky'` | How the bar stays on the page. |
| `scrollBehavior` | `Bind<'none' \| 'lift' \| 'hide'>` | `'none'` | `lift` raises the bar over the content that scrolls under it. `hide` also moves it away while scrolling down, and brings it back while scrolling up. |
| `scrollTarget` | `Bind<ComponentBase \| null>` | The nearest ancestor that scrolls | What `scrollBehavior` watches. Without a scrolling ancestor, it is the page. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onNavigationClick` | `{ navigation, originalEvent, source }` | Occurs when the button at the start of the bar is pressed. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Landmark` | The bar is a `<header>`, which is a banner landmark when it is not inside a sectioning element. |
| `Heading` | Use `headingLevel` when the title is the heading of the page. |
| `Commands` | The commands are a `Toolbar` with an accessible name: one Tab stop, with the arrow keys, Home and End inside it. |
| `Focus` | A bar moved away by `hide` comes back when focus enters it. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-app-bar` | The bar. `data-tone`, `data-position`, `data-title-align`, `data-prominent`, `data-lifted` and `data-hidden` describe its state. |
| `.mx-app-bar__row, .mx-app-bar__start, .mx-app-bar__navigation, .mx-app-bar__logo` | The row, the start of the bar, the navigation button and the logo. |
| `.mx-app-bar__titles, .mx-app-bar__title, .mx-app-bar__subtitle` | The titles. |
| `.mx-app-bar__content, .mx-app-bar__actions` | The control and the commands. |

### Design tokens

| Token | Description |
| --- | --- |
| `app-bar.bar, .row, .start, .logo, .titles, .title, .subtitle, .content` | Units: the bar (`lifted`, `accent`), the row (`prominent`), the title (`prominent`, `accent`) and the subtitle (`accent`). |
| `app-bar.title-least` | The room the titles keep before commands move into the menu. |
| `app-bar.toolbar, .button` | Places: the commands, and a button of an accent bar. |

## Feedback

Loading issues…
