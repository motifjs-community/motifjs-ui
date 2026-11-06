# Tabs

> Navigation · @motifx-community/ui 0.1.0-beta.3

Tabs show one panel at a time under a strip of tabs: from JSX or programmatically, closable, with icons and badges, scroll buttons when the tabs do not fit, four placements and panels built when they are first shown.

## Import

```tsx
import { Tabs, Tab } from '@motifx-community/ui';
```

## Declarative and programmatic

A `<Tab>`'s children are its panel. `value` is the selected tab's `key` (else its index) and `x-model` binds it two-way. Created with `new`, tabs are added, inserted and removed programmatically.

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

A close button on every tab (`closable`), or on some (a tab's own `closable` wins). Delete or a middle click closes the focused or pointed tab. `onClose` can cancel: ask about unsaved work first.

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

## Many tabs

When the tabs do not fit, arrow buttons scroll the strip (`scrollButtons`, on by default); the selected tab and the one with focus scroll into view.

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

By default an arrow key selects the tab it moves to. With `activation="manual"` it only moves focus and Enter or Space selects: better when a panel is slow to show.

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

## Icons, badges, disabled tabs

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

A panel is built the first time it is shown and kept afterwards, so what was typed in it stays (`lazy`, on by default; `lazy={false}` builds every panel at once). A tab with a `content` factory and `keepAlive={false}` has its content disposed while hidden and made again when it shows. JSX children are made once by the page, so they are always kept.

```tsx
import { reactive } from '@motifx/core';
import { Stack, Tab, Tabs, TextBox } from '@motifx-community/ui';

/** Panels built when first shown: one kept, one made again each time it shows. */
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

| Key | What it does |
| --- | --- |
| `Tab` | Into the strip, onto the selected tab; again, into its panel. |
| `Left / Right` | The previous / next tab, wrapping around (reversed in right-to-left text). With `start` and `end` placement: Up / Down. |
| `Home / End` | The first / last tab. |
| `Enter / Space` | Select the focused tab (with `activation="manual"`). |
| `Delete` | Closes the focused tab when it is closable. |
| `Alt + key (`&General`)` | Selects that tab and focuses it (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | How |
| --- | --- |
| `Roles` | `tablist`, `tab` (a `<button>`) and `tabpanel`; `aria-orientation="vertical"` with `start` and `end` placement. |
| `State` | `aria-selected` on the tabs; `aria-controls` ties a tab to its panel and `aria-labelledby` names the panel by its tab. |
| `Focus` | One Tab stop in the strip (the selected tab). A panel with nothing focusable in it takes focus itself (`tabindex="0"`), so its text can be reached. |
| `Disabled tabs` | `aria-disabled="true"`; the arrow keys skip them. |
| `Close button` | Not a Tab stop and hidden from screen readers (a button inside a tab would be a control inside a control); Delete closes the tab and `aria-keyshortcuts="Delete"` announces it. Its tooltip comes from `uiLocale`. |
| `Scroll buttons` | For the pointer only, hidden from screen readers: the arrow keys reach every tab and scroll it into view. |

## Localization

Tabs write one text: the close button's tooltip, `uiLocale.strings.close`. Every tab follows a change at once.

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

| Hook | What it is |
| --- | --- |
| `.mx-tabs` | The root. `data-placement`, `data-variant`, `data-size`, `data-stretch`, `data-overflow`, `data-scroll-buttons`, `data-disabled`. |
| `.mx-tabs__strip, .mx-tabs__list` | The strip and the tab list in it (the scroll box). |
| `.mx-tabs__tab` | A tab: `aria-selected`, `aria-disabled`, `data-closable`. |
| `.mx-tabs__icon, .mx-tabs__label, .mx-tabs__badge, .mx-tabs__close` | The parts of a tab. |
| `.mx-tabs__scroll` | A scroll button: `data-direction` (`back`, `forward`), `data-end` when it has nowhere to go. |
| `.mx-tabs__panels, .mx-tabs__panel` | The panels and a panel (the tab's own element). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `tabs.container, tabs.strip, tabs.list, tabs.scroll, tabs.scroll-icon` | Units: the whole, the strip with its line along the panel (`bottom`, `start`, `end`; the pill tray: `pill`, `pill-bottom` …), the row of tabs, the scroll buttons and their glyph. |
| `tabs.tab, tabs.label, tabs.icon, tabs.badge, tabs.close, tabs.close-icon` | Units: a tab in each state (`hover`, `pressed`, `selected`, `disabled`, `focus`; in the pill variant `pill`, `pill-hover` …) and its parts. |
| `tabs.indicator, tabs.separator, tabs.panel` | Units: the line variant's mark (`vertical`, `hover`, `selected`, `selected-disabled`), a line between two tabs, the panel (`pill`, `pill-across`, `focus`). |
| `tabs.height.*, tabs.pill-height.*, tabs.padding.*, tabs.font-size.*, tabs.line-height.*, tabs.indicator-inset.*` | Sizes per size class. |
| `tabs.pill-gap, tabs.tab-overlap, tabs.indicator-offset, tabs.indicator-inset-vertical, tabs.close-pull, tabs.vertical-width` | Where the layout puts the pieces: between pills, over the strip's line, the mark, the close button, a vertical strip's width. |
| `tabs.curve-display, tabs.curve-size, tabs.curve-frame-width, tabs.curve-frame-color` | Outward curves at the selected tab's corners on the panel's side, in its fill. |

## API reference

### Tabs props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| number \| null>` | the first tab | The selected tab's `key`, else its index. `x-model` binds it two-way. |
| `selectedIndex` | `Bind<number>` | `0` | The selected tab's index in `tabs`. |
| `label` | `Bind<string>` | `''` | Names the tab list for screen readers (`aria-label`). The same property as `text`. |
| `activation` | `Bind<'auto' \| 'manual'>` | `'auto'` | `auto`: an arrow key selects the tab it moves to. `manual`: arrows move focus only; Enter or Space selects. |
| `placement` | `Bind<TabsPlacement>` | `'top'` | `top`, `bottom`, `start`, `end`. `start` and `end` stack the tabs vertically. |
| `variant` | `Bind<TabsVariant>` | `'line'` | `line`: a bar on the selected tab. `pill`: the tabs sit on a tray and the selected one is raised. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `stretch` | `Bind<boolean>` | `false` | The tabs share the whole width. |
| `scrollButtons` | `Bind<boolean>` | `true` | Arrow buttons at the ends of the strip when the tabs do not fit. Off: a thin scroll bar. |
| `closable` | `Bind<boolean>` | `false` | Every tab gets a close button. A tab's own `closable` wins. |
| `lazy` | `Bind<boolean>` | `true` | A panel is built when it is first shown, then kept. A tab's own `lazy` wins. |
| `keepAlive` | `Bind<boolean>` | `true` | `false`: what a tab's `content` made is disposed while the tab is hidden and made again when it shows. A tab's own `keepAlive` wins. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. `tabStop={false}` takes the tab strip out of the Tab order. |

### Tab props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The caption; `&General` makes Alt+G select the tab. The same property as `text`. |
| `key` | `Bind<string>` | `''` | Names the tab in `value`. The JSX `key` works too. |
| `icon` | `Bind<IconSource \| null>` | — | An icon before the title. |
| `badge` | `Bind<string \| number \| null>` | — | A short text after the title (a count); empty or `null` shows none. |
| `hint` | `Bind<string>` | `''` | A tooltip. |
| `closable` | `Bind<boolean \| undefined>` | the Tabs | A close button on this tab. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | the Tabs | This tab's own setting. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Makes the panel content when the panel is built: instead of, or after, the JSX children. |
| `enabled` | `Bind<boolean>` | `true` | `false`: the tab cannot be selected and the arrow keys skip it. |
| `visible` | `Bind<boolean>` | `true` | `false`: the tab is left out; a selected one hands the selection to a neighbour. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `tabs` | read-only, reactive | The tabs, in strip order. |
| `selectedTab` | read-only, reactive | The selected `Tab`, `null` when there is none. |
| `Tab.isSelected, Tab.isClosable` | read-only, reactive | Whether the tab is selected; whether it shows a close button. |
| `Tab.contentBuilt` | read-only | Whether its panel has been built. |
| `Tab.owner, Tab.headerElement` | read-only | Its `Tabs`; its button in the strip. A tab's own element is its panel. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `add(tab)` | `Tab` | Adds a tab at the end. A tab of another `Tabs` moves here. |
| `insert(index, tab)` | `Tab` | Adds a tab at an index. |
| `remove(tab)` | `boolean` | Removes the tab and disposes it; no `onClose`. The selection and focus move to a neighbour. |
| `select(tab \| index)` | `boolean` | Selects a tab programmatically; `false` when it is hidden or not there. |
| `close(tab)` | `boolean` | Closes a tab as its close button does: `onClose` can cancel it. |
| `focus()` | `boolean` | Focuses the selected tab. |
| `Tab.select(), Tab.close(), Tab.focus()` | `boolean` | The same, from the tab. |

### Events

| Event | When |
| --- | --- |
| `onSelecting(e)` | The user is about to select a tab. `e`: `{ tab, index, previousTab, previousIndex, cancel, source, event }`; `e.cancel = true` keeps the current one. |
| `onSelectionChanged(e)` | The selected tab changed. `e`: `{ tab, index, previousTab, previousIndex, byUser, source, event? }`. |
| `onClose(e)` | A tab is about to close, by its button, Delete, a middle click or `close()`. `e`: `{ tab, index, byUser, cancel, source, event? }`. |
