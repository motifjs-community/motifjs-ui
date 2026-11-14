# Tabs

> Navigation · @motifx-community/ui 0.1.0-beta.11

Tabs display one panel at a time below a tab strip. You can define them in JSX or programmatically, and they support closable tabs, icons and badges, scroll buttons when tabs overflow, four placements, and panels that are created on first display.

## Import

```tsx
import { Tabs, Tab } from '@motifx-community/ui';
```

## Declarative and programmatic

The children of a `<Tab>` are its panel. `value` is the `key` of the selected tab, or its index, and `x-model` provides two-way binding. When you create the component with `new`, add, insert and remove tabs programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs, TextBox } from '@motifx-community/ui';

/** Tabs from JSX bound with x-model, and tabs created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ page: 'general' as string | number, name: '', log: '' });
  let added = 0;

  const reports = new Tabs({ label: 'Reports', closable: true });
  reports.add(new Tab({ title: 'Summary', content: () => <p>The summary, built when it was first shown.</p> }));
  reports.onSelectionChanged((e) => (s.log = e.tab ? `Selected “${e.tab.title}”${e.byUser ? ' by the user' : ' programmatically'}.` : 'No tab left.'));

  const addReport = () => {
    const n = ++added;
    const tab = reports.add(new Tab({ title: `Report ${n}`, content: () => <p>Report {n}.</p> }));
    reports.select(tab);
  };

  return (
    <>
      <Tabs label="Settings" x-model={() => s.page}>
        <Tab key="general" title="&General">
          <TextBox label="Name" x-model={() => s.name} helpText="Its text stays while you switch tabs." />
        </Tab>
        <Tab key="advanced" title="&Advanced">
          <p>Advanced settings.</p>
        </Tab>
        <Tab key="about" title="A&bout">
          <p>Version 1.0.</p>
        </Tab>
      </Tabs>
      <output class="tabs-page">{() => `value: "${s.page}"`}</output>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a report programmatically" variant="outline" onclick={addReport} />
        <output class="tabs-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" class="tabs-coded" style="inline-size: 100%" onBuilt={(c) => c.controls.add(reports)} />
    </>
  );
}
```

## Closable tabs

`closable` adds a close button to every tab, and a tab's own `closable` takes precedence. Delete or a middle-click closes the focused or hovered tab. `onClose` can cancel the action, for example to confirm unsaved changes.

```tsx
import { reactive } from '@motifx/core';
import { Button, Tab, Tabs } from '@motifx-community/ui';

const HomeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 7.5L8 3l5.5 4.5M4 6.5v6.5h8V6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A close button on every tab but Home; onClose keeps the draft open while it is protected. */
export default function Closable() {
  const s = reactive({ keepDraft: true });
  return (
    <>
      <Button
        text={() => (s.keepDraft ? 'Draft is protected' : 'Draft can close')}
        variant="outline"
        size="sm"
        toggle
        x-model={() => s.keepDraft}
      />
      <Tabs
        label="Documents"
        closable
        onClose={(e) => {
          if (e.tab.key === 'draft' && s.keepDraft) e.cancel = true;
        }}
      >
        <Tab title="Home" icon={() => <HomeIcon />} closable={false}>
          <p>Home cannot be closed.</p>
        </Tab>
        <Tab key="draft" title="Draft">
          <p>Closing is cancelled while the draft is protected.</p>
        </Tab>
        <Tab title="Notes">
          <p>Notes.</p>
        </Tab>
        <Tab title="Ideas">
          <p>Ideas.</p>
        </Tab>
      </Tabs>
    </>
  );
}
```

## Overflow

When tabs do not fit, arrow buttons scroll the strip (`scrollButtons`, on by default). The selected tab and the focused tab scroll into view.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs } from '@motifx-community/ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Twelve tabs in a narrow strip, with scroll buttons that can be turned off. */
export default function ManyTabs() {
  const s = reactive({ scrollButtons: true });

  const months = new Tabs({ label: 'Months', scrollButtons: () => s.scrollButtons });
  for (const month of MONTHS) months.add(new Tab({ title: month, content: () => <p>{month}: nothing planned yet.</p> }));

  return (
    <>
      <Button text="Scroll buttons" variant="outline" size="sm" toggle x-model={() => s.scrollButtons} />
      <Stack class="tabs-months" style="inline-size: 100%; max-inline-size: 28rem" onBuilt={(c) => c.controls.add(months)} />
    </>
  );
}
```

## Placement

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs, type TabsPlacement } from '@motifx-community/ui';

const PLACEMENTS: TabsPlacement[] = ['top', 'bottom', 'start', 'end'];

/** The strip above, below, or beside the panel. */
export default function Placement() {
  const s = reactive({ placement: 'top' as TabsPlacement });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Placement">
        {PLACEMENTS.map((placement) => (
          <Button
            key={placement}
            text={placement}
            size="sm"
            variant={() => (s.placement === placement ? 'solid' : 'ghost')}
            aria-pressed={() => s.placement === placement}
            onclick={() => (s.placement = placement)}
          />
        ))}
      </Stack>
      <Tabs label="Placement" class="tabs-placement" placement={() => s.placement}>
        <Tab title="Profile">
          <p>Profile.</p>
        </Tab>
        <Tab title="Security">
          <p>Security.</p>
        </Tab>
        <Tab title="Billing">
          <p>Billing.</p>
        </Tab>
      </Tabs>
    </>
  );
}
```

## Manual activation

By default, an arrow key selects the tab it moves to. With `activation="manual"`, it only moves focus, and Enter or Space selects the tab. This works better when a panel is slow to display.

```tsx
import { Tab, Tabs } from '@motifx-community/ui';

/** Arrow keys move focus only; Enter or Space selects. */
export default function ManualActivation() {
  return (
    <Tabs label="Manual" class="tabs-manual" activation="manual">
      <Tab title="One">
        <p>One.</p>
      </Tab>
      <Tab title="Two">
        <p>Two.</p>
      </Tab>
      <Tab title="Three">
        <p>Three.</p>
      </Tab>
    </Tabs>
  );
}
```

## Icons, badges and disabled tabs

```tsx
import { reactive } from '@motifx/core';
import { Button, Tab, Tabs } from '@motifx-community/ui';

const MailIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 4h11v8h-11zM2.5 4.5L8 8.5l5.5-4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A tab with an icon, a count that follows state and a tooltip, and a disabled tab. */
export default function IconsAndBadges() {
  const s = reactive({ unread: 3 });
  return (
    <Tabs label="Mail">
      <Tab title="Inbox" icon={() => <MailIcon />} badge={() => (s.unread ? s.unread : null)} hint="Mail you have not read">
        <Button text="Read one" variant="outline" onclick={() => (s.unread = Math.max(0, s.unread - 1))} />
      </Tab>
      <Tab title="Sent">
        <p>Sent mail.</p>
      </Tab>
      <Tab title="Archive" enabled={false}>
        <p>Archive.</p>
      </Tab>
    </Tabs>
  );
}
```

## Variants and sizes

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs, type TabsVariant } from '@motifx-community/ui';

const VARIANTS: TabsVariant[] = ['line', 'pill'];

/** Both variants in the three sizes, stretched or not. */
export default function VariantsAndSizes() {
  const s = reactive({ variant: 'line' as TabsVariant, stretch: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            text={variant}
            size="sm"
            variant={() => (s.variant === variant ? 'solid' : 'ghost')}
            aria-pressed={() => s.variant === variant}
            onclick={() => (s.variant = variant)}
          />
        ))}
        <Button text="Stretch" size="sm" variant="outline" toggle x-model={() => s.stretch} />
      </Stack>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Tabs key={size} label={`Size ${size}`} size={size} variant={() => s.variant} stretch={() => s.stretch}>
          <Tab title="Day">
            <p>{`Size ${size}.`}</p>
          </Tab>
          <Tab title="Week">
            <p>Week.</p>
          </Tab>
          <Tab title="Month">
            <p>Month.</p>
          </Tab>
        </Tabs>
      ))}
    </>
  );
}
```

## Lazy panels

A panel is created the first time it is shown and then kept, so user input is preserved (`lazy`, on by default). `lazy={false}` creates every panel immediately. A tab with a `content` factory and `keepAlive={false}` has its content disposed while hidden and recreated when shown. JSX children are created once by the page, so they are always kept.

```tsx
import { reactive } from '@motifx/core';
import { Stack, Tab, Tabs, TextBox } from '@motifx-community/ui';

/** Panels created when first shown: one is kept, and one is recreated each time it is shown. */
export default function LazyPanels() {
  const s = reactive({ builds: 0 });

  const tabs = new Tabs({ label: 'Lazy panels' });
  tabs.add(new Tab({ title: 'First', content: () => <p>Always here.</p> }));
  tabs.add(
    new Tab({
      title: 'Kept',
      content: () => {
        s.builds++;
        return <TextBox label="Type, switch tabs, come back" />;
      },
    }),
  );
  tabs.add(
    new Tab({
      title: 'Made each time',
      keepAlive: false,
      content: () => {
        s.builds++;
        return <TextBox label="This one starts empty each time" />;
      },
    }),
  );

  return (
    <>
      <Stack style="inline-size: 100%" onBuilt={(c) => c.controls.add(tabs)} />
      <output class="tabs-builds">{() => `Panels built: ${s.builds}`}</output>
    </>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | Moves focus to the selected tab, then into its panel. |
| `Left / Right` | Moves to the previous or next tab, wrapping at the ends (reversed for right-to-left text). With `start` and `end` placement, use Up and Down. |
| `Home / End` | Moves to the first or last tab. |
| `Enter / Space` | Selects the focused tab (with `activation="manual"`). |
| `Delete` | Closes the focused tab if it is closable. |
| `Alt + key (`&General`)` | Selects that tab and moves focus to it (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Roles` | `tablist`, `tab` (a `<button>`) and `tabpanel`, with `aria-orientation="vertical"` for `start` and `end` placement. |
| `State` | `aria-selected` on the tabs. `aria-controls` links a tab to its panel, and `aria-labelledby` names the panel after its tab. |
| `Focus` | The strip has one Tab stop, on the selected tab. A panel with no focusable content receives focus itself (`tabindex="0"`), so its text can be reached. |
| `Disabled tabs` | `aria-disabled="true"`. The arrow keys skip these tabs. |
| `Close button` | Not a Tab stop and hidden from screen readers, because a button inside a tab would be a control within a control. Delete closes the tab, and `aria-keyshortcuts="Delete"` announces it. Its tooltip comes from `uiLocale`. |
| `Scroll buttons` | These are for pointer use only and are hidden from screen readers. The arrow keys reach every tab and scroll it into view. |

## Localization

Tabs have one string of their own, the close button tooltip `uiLocale.strings.close`. Every tab updates immediately when it changes.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of every component on the page, the tabs' close button included. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        The close button reads <output class="tabs-close-name">{() => kitTexts.strings.close}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-tabs` | The root. `data-placement`, `data-variant`, `data-size`, `data-stretch`, `data-overflow`, `data-scroll-buttons`, `data-disabled`. |
| `.mx-tabs__strip, .mx-tabs__list` | The strip and its tab list, which is the scrolling box. |
| `.mx-tabs__tab` | A tab: `aria-selected`, `aria-disabled`, `data-closable`. |
| `.mx-tabs__icon, .mx-tabs__label, .mx-tabs__badge, .mx-tabs__close` | The parts of a tab. |
| `.mx-tabs__scroll` | A scroll button: `data-direction` (`back`, `forward`), and `data-end` when it cannot scroll further. |
| `.mx-tabs__panels, .mx-tabs__panel` | The panels and a panel (the tab's own element). |

### Component tokens

| Token | Description |
| --- | --- |
| `tabs.container, tabs.strip, tabs.list, tabs.scroll, tabs.scroll-icon` | Units: the root, the strip with its line along the panel (`bottom`, `start`, `end`; the pill tray: `pill`, `pill-bottom` …), the tab row, the scroll buttons and their glyph. |
| `tabs.tab, tabs.label, tabs.icon, tabs.badge, tabs.close, tabs.close-icon` | Units: a tab in each state (`hover`, `pressed`, `selected`, `disabled`, `focus`; in the pill variant `pill`, `pill-hover` …) and its parts. |
| `tabs.indicator, tabs.separator, tabs.panel` | Units: the line variant indicator (`vertical`, `hover`, `selected`, `selected-disabled`), a divider between tabs, and the panel (`pill`, `pill-across`, `focus`). |
| `tabs.height.*, tabs.pill-height.*, tabs.padding.*, tabs.font-size.*, tabs.line-height.*, tabs.indicator-inset.*` | Sizes per size class. |
| `tabs.pill-gap, tabs.tab-overlap, tabs.indicator-offset, tabs.indicator-inset-vertical, tabs.close-pull, tabs.vertical-width` | Layout measurements: the gap between pills, the offset over the strip line, the indicator, the close button, and the width of a vertical strip. |
| `tabs.curve-display, tabs.curve-size, tabs.curve-frame-width, tabs.curve-frame-color` | Outward curves at the corners of the selected tab on the panel side, in its fill color. |

## API reference

### Tabs props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| number \| null>` | The first tab | The `key` of the selected tab, or its index. `x-model` provides two-way binding. |
| `selectedIndex` | `Bind<number>` | `0` | The index of the selected tab in `tabs`. |
| `label` | `Bind<string>` | `''` | The accessible name of the tab list (`aria-label`). This is the same property as `text`. |
| `activation` | `Bind<'auto' \| 'manual'>` | `'auto'` | With `auto`, an arrow key selects the tab it moves to. With `manual`, arrow keys only move focus, and Enter or Space selects. |
| `placement` | `Bind<TabsPlacement>` | `'top'` | `top`, `bottom`, `start` or `end`. `start` and `end` stack the tabs vertically. |
| `variant` | `Bind<TabsVariant>` | `'line'` | `line` shows a bar on the selected tab. `pill` places the tabs on a tray and raises the selected one. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `stretch` | `Bind<boolean>` | `false` | Makes the tabs share the full width. |
| `scrollButtons` | `Bind<boolean>` | `true` | Shows arrow buttons at the ends of the strip when tabs do not fit. When off, a thin scrollbar appears. |
| `closable` | `Bind<boolean>` | `false` | Adds a close button to every tab. A tab's own `closable` takes precedence. |
| `lazy` | `Bind<boolean>` | `true` | Creates a panel the first time it is shown and then keeps it. A tab's own `lazy` takes precedence. |
| `keepAlive` | `Bind<boolean>` | `true` | With `false`, content created by a tab's `content` is disposed while hidden and recreated when shown. A tab's own `keepAlive` takes precedence. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. `tabStop={false}` removes the tab strip from the Tab order. |

### Tab props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The caption. `&General` makes Alt+G select the tab. This is the same property as `text`. |
| `key` | `Bind<string>` | `''` | Identifies the tab in `value`. The JSX `key` also works. |
| `icon` | `Bind<IconSource \| null>` | — | An icon before the title. |
| `badge` | `Bind<string \| number \| null>` | — | Short text after the title, such as a count. An empty value or `null` hides it. |
| `hint` | `Bind<string>` | `''` | The tooltip text. |
| `closable` | `Bind<boolean \| undefined>` | From Tabs | Shows a close button on this tab. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | From Tabs | This tab's own setting. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Creates the panel content when the panel is created, either instead of or after the JSX children. |
| `enabled` | `Bind<boolean>` | `true` | `false` means the tab cannot be selected and the arrow keys skip it. |
| `visible` | `Bind<boolean>` | `true` | `false` removes the tab. If it is selected, the selection moves to an adjacent tab. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `tabs` | read-only, reactive | The tabs in strip order. |
| `selectedTab` | read-only, reactive | The selected `Tab`, or `null` if there is none. |
| `Tab.isSelected, Tab.isClosable` | read-only, reactive | Indicate whether the tab is selected and whether it shows a close button. |
| `Tab.contentBuilt` | read-only | Indicates whether its panel has been created. |
| `Tab.owner, Tab.headerPart` | read-only | Its `Tabs` and its button in the strip. A tab's own element is its panel. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `add(tab)` | `Tab` | Adds a tab at the end. A tab from another `Tabs` moves here. |
| `insert(index, tab)` | `Tab` | Adds a tab at an index. |
| `remove(tab)` | `boolean` | Removes the tab and disposes it, without raising `onClose`. Selection and focus move to an adjacent tab. |
| `select(tab \| index)` | `boolean` | Selects a tab programmatically. Returns `false` if it is hidden or missing. |
| `close(tab)` | `boolean` | Closes a tab as its close button does, so `onClose` can cancel it. |
| `focus()` | `boolean` | Sets focus on the selected tab. |
| `Tab.select(), Tab.close(), Tab.focus()` | `boolean` | Same as the methods above, called on the tab. |

### Events

| Event | When |
| --- | --- |
| `onSelecting(e)` | Occurs before the user selects a tab. `e`: `{ tab, index, previousTab, previousIndex, cancel, source, event }`. Set `e.cancel = true` to keep the current tab. |
| `onSelectionChanged(e)` | Occurs after the selected tab changes. `e`: `{ tab, index, previousTab, previousIndex, byUser, source, event? }`. |
| `onClose(e)` | Occurs before a tab closes, from its button, Delete, a middle-click or `close()`. `e`: `{ tab, index, byUser, cancel, source, event? }`. |

## Feedback

Loading issues…
