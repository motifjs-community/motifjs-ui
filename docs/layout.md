# Layout

> Navigation · @motifx-community/ui 0.1.0-beta.2

Containers that place controls: `Stack` (a row or a column), `Grid` (rows and columns), `Panel` (a plain box that can scroll), `GroupBox` (a titled frame), `DockPanel` (children stuck to its edges) and `SplitContainer` (two panes and a splitter). All of them are controls: they disable and hide what is inside, and lay out children added at any time.

## Import

```tsx
import { Stack, Grid, Panel, GroupBox, DockPanel, SplitContainer, type LayoutSpace } from '@motifx-community/ui';
```

## From JSX and from code

Children come as JSX or are added later with `controls.add`; either way the container picks them up. A child says where it goes in its own props (`grow`, `row`, `dock`…), whatever kind of component it is.

```tsx
import type { Component } from '@motifx/core';
import { Button, Grid, Stack, TextBox } from '@motifx-community/ui';

/** Buttons added to a Stack with `controls.add`, and a Grid built with `new`. */
export default function FromCode() {
  let added = 0;
  let bar: Stack | null = null;

  const addButton = () => bar?.controls.add(new Button({ text: `Button ${++added}`, variant: 'outline', grow: added % 3 === 0 }));

  const buildFromCode = (host: Component<HTMLDivElement>) => {
    const grid = new Grid({ columns: '* *', gap: 'xs' });
    grid.element.classList.add('layout-coded');
    grid.controls.add(
      new TextBox({ label: 'From', stretch: true }),
      new TextBox({ label: 'To', stretch: true }),
      new TextBox({ label: 'Subject', stretch: true, columnSpan: 2 }),
    );
    host.controls.add(grid);
  };

  return (
    <>
      <Stack ref={(c: Stack) => (bar = c)} orientation="horizontal" gap="sm" wrap align="center" style="inline-size: 100%">
        <Button text="Add a button" tone="accent" onclick={addButton} />
      </Stack>
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => buildFromCode(c)} />
    </>
  );
}
```

## Stack

A row or a column with a gap. `align` places the children across the direction, `justify` along it; `wrap` starts a new line when they do not fit. A child with `grow` takes the free space.

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TextBox, type LayoutAlign, type StackJustify } from '@motifx-community/ui';

const ALIGNS: LayoutAlign[] = ['start', 'center', 'end', 'stretch', 'baseline'];
const JUSTIFIES: StackJustify[] = ['start', 'center', 'end', 'space-between', 'space-evenly'];
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';

/** A Stack's orientation, align, justify, wrap and reverse, and a child that grows. */
export default function StackOptions() {
  const s = reactive({
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    align: 'center' as LayoutAlign,
    justify: 'start' as StackJustify,
    wrap: false,
    reverse: false,
  });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Orientation">
        {(['horizontal', 'vertical'] as const).map((o) => (
          <Button key={o} text={o} size="sm" variant={() => (s.orientation === o ? 'solid' : 'ghost')} aria-pressed={() => s.orientation === o} onclick={() => (s.orientation = o)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Align">
        {ALIGNS.map((a) => (
          <Button key={a} text={a} size="sm" variant={() => (s.align === a ? 'solid' : 'ghost')} aria-pressed={() => s.align === a} onclick={() => (s.align = a)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Justify">
        {JUSTIFIES.map((j) => (
          <Button key={j} text={j} size="sm" variant={() => (s.justify === j ? 'solid' : 'ghost')} aria-pressed={() => s.justify === j} onclick={() => (s.justify = j)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="wrap" size="sm" toggle x-model={() => s.wrap} variant="outline" />
        <Button text="reverse" size="sm" toggle x-model={() => s.reverse} variant="outline" />
      </Stack>
      <Stack
        class="layout-stack-demo"
        orientation={() => s.orientation}
        align={() => s.align}
        justify={() => s.justify}
        wrap={() => s.wrap}
        reverse={() => s.reverse}
        gap="sm"
        padding="sm"
        style={`inline-size: 100%; min-block-size: 10rem; ${FRAME}`}
      >
        <Panel variant="card" padding="sm">One</Panel>
        <Panel variant="card" padding="md">Two, taller</Panel>
        <Panel variant="card" padding="sm">Three</Panel>
        <TextBox label="Grows" labelMode="hidden" placeholder="I grow" grow />
      </Stack>
    </>
  );
}
```

## Spacing

`gap` and `padding` take a step of the spacing scale, a number of pixels or any CSS length.

| Value | Means |
| --- | --- |
| `'xxs' … 'xxl'` | A step of the spacing scale: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, from the `layout.space.*` tokens (the design system's `space.1` … `space.12`). Density and themes reach them. |
| `12` | A number is pixels. |
| `'1.5rem'` | Any CSS length. |
| `'xs md'` | A padding takes one to four values, as in CSS (block-start, inline-end, block-end, inline-start), steps and lengths mixed. They follow the reading direction. |

```tsx
import { reactive } from '@motifx/core';
import { Button, Grid, Panel, Stack } from '@motifx-community/ui';

const STEPS = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';

/** A gap from the spacing steps, a gap in pixels with a two-value padding, and a gap as a CSS length. */
export default function Spacing() {
  const s = reactive({ gap: 'sm' as string });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Gap">
        {STEPS.map((step) => (
          <Button key={step} text={step} size="sm" variant={() => (s.gap === step ? 'solid' : 'ghost')} aria-pressed={() => s.gap === step} onclick={() => (s.gap = step)} />
        ))}
      </Stack>
      <Stack class="layout-gap-demo" orientation="horizontal" gap={() => s.gap} padding="xs">
        <Panel variant="card" padding="sm">A</Panel>
        <Panel variant="card" padding="sm">B</Panel>
        <Panel variant="card" padding="sm">C</Panel>
      </Stack>
      <Stack orientation="horizontal" gap={12} padding="xs md" style={FRAME}>
        <Panel variant="card" padding="sm">12 pixels apart</Panel>
        <Panel variant="card" padding="sm">padding xs md</Panel>
      </Stack>
      <Grid columns="* *" gap="1.5rem" style="inline-size: 100%">
        <Panel variant="card" padding="sm">1.5rem apart</Panel>
        <Panel variant="card" padding="sm">in a Grid</Panel>
      </Grid>
    </>
  );
}
```

## Grid

Rows and columns written like CSS. Children fill the cells in order, or say where they go: `row`, `column`, `rowSpan`, `columnSpan`, counted from 1.

| Tracks | Means |
| --- | --- |
| `'auto 1fr 2fr 120'` | CSS grid tracks; a bare number is pixels. |
| `'* 2*'` | `*` is `1fr`, `2*` is `2fr`. |
| `'minmax(8rem, 1fr) auto'` | Any CSS track, functions included. |
| `['auto', 120, '*']` | The same as a list. |
| `3` | A number: that many equal columns (or rows). |

```tsx
import { reactive } from '@motifx/core';
import { Button, Grid, Stack, TextBox } from '@motifx-community/ui';

/** A form on a Grid whose column count follows state; Street and the buttons span columns. */
export default function GridForm() {
  const s = reactive({ columns: 2 });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Columns">
        {[1, 2, 3].map((n) => (
          <Button key={n} text={`${n} column${n > 1 ? 's' : ''}`} size="sm" variant={() => (s.columns === n ? 'solid' : 'ghost')} aria-pressed={() => s.columns === n} onclick={() => (s.columns = n)} />
        ))}
      </Stack>
      <Grid class="layout-form" columns={() => s.columns} gap="sm" align="end" style="inline-size: 100%">
        <TextBox label="First name" stretch />
        <TextBox label="Last name" stretch />
        <TextBox label="Street" stretch column={1} columnSpan={() => Math.min(2, s.columns)} />
        <TextBox label="City" stretch />
        <TextBox label="Postal code" stretch />
        <Stack orientation="horizontal" justify="end" gap="xs" column="1" columnSpan={() => s.columns}>
          <Button text="Cancel" variant="ghost" />
          <Button text="Save" tone="accent" />
        </Stack>
      </Grid>
    </>
  );
}
```

```tsx
import { Grid, Panel } from '@motifx-community/ui';

/** A fixed column and two flexible ones, a fixed row, and a child placed by row and column. */
export default function GridTracks() {
  return (
    <Grid class="layout-tracks" columns="120 * 2*" rows="auto 4rem" gap="xs" style="inline-size: 100%">
      <Panel variant="card" padding="xs">120px</Panel>
      <Panel variant="card" padding="xs">1fr</Panel>
      <Panel variant="card" padding="xs">2fr</Panel>
      <Panel variant="card" padding="xs" column={2} columnSpan={2}>
        row 2, columns 2–3
      </Panel>
    </Grid>
  );
}
```

## Panel

A plain box: padding, a frame if you want one, and its own scrolling. A scrolling panel is a Tab stop, so it can be scrolled with the keys; `text` names it.

```tsx
import { Panel } from '@motifx-community/ui';

/** A named panel that scrolls, a card and an outline. */
export default function Panels() {
  return (
    <>
      <Panel class="layout-scroll" text="Terms" scrollable="vertical" padding="md" variant="outline" style="block-size: 8rem; inline-size: 18rem">
        <p>1. The service is offered as it is.</p>
        <p>2. You keep the rights to what you upload.</p>
        <p>3. We may change these terms with a notice of 30 days.</p>
        <p>4. Either side may end the agreement at any time.</p>
        <p>5. The law of the place you live in applies.</p>
      </Panel>
      <Panel variant="card" padding="md">
        A card
      </Panel>
      <Panel variant="outline" padding="md">
        An outline
      </Panel>
    </>
  );
}
```

## GroupBox

A titled frame around related controls: a `<fieldset>`, so screen readers name the group by its title and disabling it disables what is inside. The title's `&` key focuses the first control; `collapsible` makes the title show and hide the content.

```tsx
import { reactive } from '@motifx/core';
import { Button, Grid, GroupBox, TextBox } from '@motifx-community/ui';

/** A group with an access key that is enabled from state, and one that opens and closes. */
export default function GroupBoxes() {
  const s = reactive({ editing: true });
  return (
    <>
      <Button text="Enabled" size="sm" variant="outline" toggle x-model={() => s.editing} />
      <Grid columns="* *" gap="md" style="inline-size: 100%" align="start">
        <GroupBox title="&Address" enabled={() => s.editing}>
          <TextBox label="Street" stretch />
          <TextBox label="City" stretch />
        </GroupBox>
        <GroupBox title="More &options" collapsible collapsed>
          <TextBox label="Coupon" stretch />
          <TextBox label="Gift note" stretch />
        </GroupBox>
      </Grid>
    </>
  );
}
```

## DockPanel

Children stick to the edges in the order they come — `top`, `bottom`, `start`, `end` (these two follow the reading direction) — and `fill` takes what is left. A `float` child sits over the rest at its own `left` / `top` / `right` / `bottom`. Laid out with CSS grid: nothing runs when the size changes.

```tsx
import { reactive } from '@motifx/core';
import { Button, DockPanel, Panel, Stack, TextBox, type Dock } from '@motifx-community/ui';

const FOLDERS = ['Inbox', 'Drafts', 'Sent', 'Archive', 'Spam', 'Trash'];
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';
const BAR = 'background: var(--mx-color-bg-bar);';
const LAYER = 'background: var(--mx-color-bg-layer);';

/** A mail app laid out with DockPanel: a header, a sidebar that changes sides, a status bar, a float button and a panel added from code. */
export default function AppShell() {
  const s = reactive({ side: 'start' as Dock, messages: 3 });
  let shell: DockPanel | null = null;
  let notes: Panel | null = null;

  const toggleNotes = () => {
    if (notes) {
      shell?.controls.remove(notes);
      notes = null;
      return;
    }
    notes = new Panel({ dock: 'end', padding: 'sm' });
    notes.element.setAttribute('style', `inline-size: 9rem; ${LAYER}`);
    notes.element.classList.add('layout-notes');
    notes.controls.add(<span>Notes, added from code.</span>);
    shell?.controls.add(notes);
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => `Sidebar: ${s.side}`} size="sm" variant="outline" onclick={() => (s.side = s.side === 'start' ? 'end' : 'start')} />
        <Button text="Notes panel from code" size="sm" variant="outline" onclick={toggleNotes} />
      </Stack>
      <DockPanel class="layout-shell" ref={(c: DockPanel) => (shell = c)} style={`block-size: 22rem; inline-size: 100%; overflow: hidden; ${FRAME}`}>
        <Stack dock="top" orientation="horizontal" align="center" gap="sm" padding="xs sm" style={BAR}>
          <strong>Mail</strong>
          <TextBox label="Search mail" labelMode="hidden" placeholder="Search" grow />
          <Button text="New" tone="accent" onclick={() => s.messages++} />
        </Stack>
        <Panel class="layout-side" dock={() => s.side} scrollable="vertical" padding="xs" text="Mailboxes" style={`inline-size: 11rem; ${LAYER}`}>
          <Stack gap="xxs">
            {FOLDERS.map((f) => (
              <Button key={f} text={f} variant="ghost" stretch />
            ))}
          </Stack>
        </Panel>
        <Stack class="layout-status" dock="bottom" orientation="horizontal" justify="space-between" padding="xxs sm" style={BAR}>
          <span>Ready</span>
          <span>{() => `${s.messages} messages`}</span>
        </Stack>
        <Panel class="layout-content" text="Message" scrollable padding="md">
          <h3 style="margin-block-start: 0">Welcome</h3>
          <p>The header, the folders and the status bar are docked; this panel fills the rest and scrolls on its own.</p>
          <p>Switch the sidebar to the other side, or add a panel from code: the layout follows at once.</p>
        </Panel>
        <Button class="layout-help" dock="float" right={16} bottom={48} text="Help" variant="outline" />
      </DockPanel>
    </>
  );
}
```

## SplitContainer

Two panes, `first` and `second`, with a splitter between them that the pointer drags and the keys move. `fixedPanel` keeps one pane's size when the container is resized; the minimum sizes hold; Enter hides the first pane and brings it back. Split containers nest.

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, SplitContainer, Stack, type SplitPanel, type SplitPosition } from '@motifx-community/ui';

const FOLDERS = ['Inbox', 'Drafts', 'Sent', 'Archive', 'Spam', 'Trash'];
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';
const LAYER = 'background: var(--mx-color-bg-layer);';

/** A split container inside another: a position bound with x-model, minimum sizes, a fixed pane, and hiding a pane from code. */
export default function NestedSplit() {
  const s = reactive({ tree: 180 as SplitPosition, fixed: 'first' as SplitPanel, log: '' });
  let outer: SplitContainer | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Hide folders" size="sm" variant="outline" onclick={() => outer?.collapse('first')} />
        <Button text="Restore" size="sm" variant="outline" onclick={() => outer?.restore()} />
        <Button text={() => `fixedPanel: ${s.fixed}`} size="sm" variant="outline" onclick={() => (s.fixed = s.fixed === 'first' ? 'none' : 'first')} />
        <output class="layout-split-out">{() => `position: ${s.tree}`}</output>
        <output class="layout-split-log">{() => s.log}</output>
      </Stack>
      <SplitContainer
        class="layout-split"
        ref={(c: SplitContainer) => (outer = c)}
        position={180}
        fixedPanel={() => s.fixed}
        firstMinSize={120}
        secondMinSize={200}
        x-model={() => s.tree}
        onSplitterMoved={(e: { position: SplitPosition; byUser: boolean; collapsed: SplitPanel }) => (s.log = `moved${e.byUser ? ' by you' : ''}${e.collapsed !== 'none' ? `, ${e.collapsed} hidden` : ''}`)}
        style={`block-size: 20rem; inline-size: 100%; ${FRAME}`}
      >
        <Panel text="Folders" scrollable padding="sm" style={LAYER}>
          <Stack gap="xxs">
            {FOLDERS.map((f) => (
              <Button key={f} text={f} variant="ghost" stretch />
            ))}
          </Stack>
        </Panel>
        <SplitContainer orientation="vertical" position="65%" secondMinSize={48}>
          <Panel text="Editor" scrollable padding="sm">
            <p>Drag the splitters, or Tab to one and use the arrow keys, Home, End and Enter.</p>
          </Panel>
          <Panel text="Output" scrollable padding="sm" style={LAYER}>
            <code>Build finished in 1.2 s.</code>
          </Panel>
        </SplitContainer>
      </SplitContainer>
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | The splitter is one Tab stop between the panes; a scrolling `Panel` is a Tab stop of its own. |
| `Left / Right (side by side), Up / Down (one over the other)` | Move the splitter by `step`; Left and Right follow what you see in a right-to-left page. |
| `Home / End` | The first pane at its smallest / largest size. |
| `Enter` | Hides the first pane, or restores the splitter where it was. |
| `Alt + key (`&Address`)` | Focuses the first control in a `GroupBox` (Control + Option + key on Apple platforms). |
| `Arrows, Page Up / Down` | Scroll a focused scrolling `Panel`, as the browser does. |

## Accessibility

| Topic | How |
| --- | --- |
| `Splitter` | `role="separator"`, focusable, `aria-valuenow` (the first pane's share, 0–100), `aria-valuemin` / `aria-valuemax`, `aria-orientation`, `aria-controls` the first pane, named from `splitterLabel` or `uiLocale` (the ARIA window splitter pattern). |
| `Hidden pane` | `inert`: out of reach of Tab and screen readers; focus inside moves to the splitter. |
| `GroupBox` | A native `<fieldset>`, named by its `<legend>`; disabled, it disables the native controls inside. A collapsible one has a button with `aria-expanded`. |
| `Panel` | With `text`, a region landmark of that name. Scrolling, it is a Tab stop. |
| `Order` | Stack, Grid and DockPanel place children with CSS only: Tab and screen readers keep the document order, so write the children in reading order. |

## Localization

The only text the containers write is the splitter's name, `uiLocale.strings.resize`, unless `splitterLabel` gives one.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of the kit; the splitters on the page take the new name at once. */
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
        The splitter is named <output class="layout-resize">{() => kitTexts.strings.resize}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-stack` | `data-orientation`, `data-align`, `data-justify`, `data-wrap`, `data-reverse`, `data-inline`; a growing child gets `data-mx-grow`. |
| `.mx-grid` | `data-align`, `data-justify`, `data-inline`; tracks and child places are inline grid properties. |
| `.mx-panel` | `data-variant`, `data-scroll`. |
| `.mx-group-box` | `data-variant`, `data-collapsible`, `data-collapsed`, `data-disabled`; `.mx-group-box__legend`, `__title`, `__toggle`, `__chevron`. |
| `.mx-dock-panel` | Each child gets `data-mx-dock`; its place and the `gap` (a margin on the side facing the rest) are inline. |
| `.mx-split-container` | `data-orientation`, `data-collapsed`, `data-resizable`, `data-dragging`; `.mx-split-container__pane` (`data-pane`), `__splitter`. |
| `--_gap, --_row-gap, --_column-gap` | Written inline from `gap`, `rowGap`, `columnGap` (Stack, Grid, GroupBox). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `layout.space.xxs … xxl` | The spacing steps of `gap` and `padding`. |
| `layout.gap` | The gap of Stack and Grid when none is given. |
| `layout.panel` | Unit: a panel (`outline`: a frame, `card`: a raised surface). |
| `layout.group, layout.group-caption, layout.group-toggle, layout.group-chevron` | Units: a group box (`plain`, `collapsed`), its caption, the button that folds it and its chevron. |
| `layout.group-box.gap, layout.group-box.legend-float` | The gap inside a group box when none is given; where its caption sits. |
| `layout.splitter-handle, layout.splitter-line, layout.splitter-grip` | Units: the splitter (`focus`), its line and its grip (`active`, `disabled`). |
| `layout.splitter.*` | `size` (the area that takes the pointer), `line-width`, `active-width`, `grip-length`, `grip-thickness`. |

## API reference

Every container also has the shared properties of `Control`: `enabled` / `disabled` (cascading to everything inside), `visible`, `tabStop`, `tabIndex`.

### Stack props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'vertical'` | `horizontal` follows the reading direction. |
| `gap` | `Bind<LayoutSpace>` | `layout.gap` | The space between the children. |
| `padding` | `Bind<LayoutSpace>` | — | The space inside the edges. |
| `align` | `Bind<LayoutAlign>` | `'stretch'` | Across the direction: `start`, `center`, `end`, `stretch`, `baseline`. |
| `justify` | `Bind<StackJustify>` | `'start'` | Along it: `start`, `center`, `end`, `space-between`, `space-around`, `space-evenly`. |
| `wrap` | `Bind<boolean>` | `false` | Children that do not fit go on to a new line. |
| `reverse` | `Bind<boolean>` | `false` | The children are laid out from the other end (Tab order stays the document order). |
| `inline` | `Bind<boolean>` | `false` | Flows in a line of text, as wide as its children. |

### Grid props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns, rows` | `Bind<GridTracks>` | one column | See Grid tracks. |
| `gap` | `Bind<LayoutSpace>` | `layout.gap` | Between rows and columns. |
| `rowGap, columnGap` | `Bind<LayoutSpace>` | `gap` | One direction only. |
| `padding` | `Bind<LayoutSpace>` | — | The space inside the edges. |
| `autoRows, autoColumns` | `Bind<number \| string>` | `'auto'` | The size of tracks made as needed (a number is pixels). |
| `flow` | `Bind<GridFlow>` | `'row'` | How children without a place fill the grid: `row`, `column`, `row dense`, `column dense`. |
| `align` | `Bind<LayoutAlign>` | `'stretch'` | Where children sit in their cells, up and down. |
| `justify` | `Bind<GridJustify>` | `'stretch'` | Where children sit in their cells, along the row. |
| `inline` | `Bind<boolean>` | `false` | Flows in a line of text. |

### Panel props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scrollable` | `Bind<boolean \| 'vertical' \| 'horizontal' \| 'both'>` | `false` | Scrolls its content; it is then a Tab stop, so the keys scroll it. |
| `padding` | `Bind<LayoutSpace>` | — | The space inside the edges. |
| `variant` | `Bind<PanelVariant>` | `'plain'` | `plain`, `outline` (a border), `card` (a card surface). |
| `text` | `Bind<string>` | `''` | Names the panel: it becomes a region landmark with that name. |

### GroupBox props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The legend; `&Address` makes Alt+A focus the first control inside. The same property as `text`. |
| `collapsible` | `Bind<boolean>` | `false` | The title is a button that shows and hides the content. |
| `collapsed` | `Bind<boolean>` | `false` | The content is hidden (with `collapsible`). |
| `padding` | `Bind<LayoutSpace>` | `layout.group-box.padding` | The space inside the frame. |
| `gap` | `Bind<LayoutSpace>` | `layout.group-box.gap` | The space between the children (they stack in a column). |
| `variant` | `Bind<GroupBoxVariant>` | `'outline'` | `outline` (a frame, the title on its edge) or `plain` (the title over the content). |

### DockPanel props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `Bind<LayoutSpace>` | — | The space between a docked child and what it docks against. |
| `padding` | `Bind<LayoutSpace>` | — | The space inside the edges. |

### SplitContainer props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'horizontal'` | `horizontal`: the panes side by side, as in Stack; `vertical`: one over the other. |
| `position` | `Bind<SplitPosition>` | `'50%'` | The size of the pane that keeps its size (the first one with `fixedPanel="none"`): pixels, a share, a CSS length. `x-model` binds it. |
| `fixedPanel` | `Bind<'none' \| 'first' \| 'second'>` | `'none'` | The pane that keeps its size when the container is resized. `none`: both grow, the position is kept as a share. |
| `firstMinSize, secondMinSize` | `Bind<number>` | `0` | The smallest size of each pane, in pixels. |
| `collapsed` | `Bind<'none' \| 'first' \| 'second'>` | `'none'` | A pane that is hidden; the other takes all the room. |
| `resizable` | `Bind<boolean>` | `true` | The pointer and the keys move the splitter. |
| `collapsible` | `Bind<boolean>` | `true` | Enter and a double click hide and restore the first pane. |
| `step` | `Bind<number>` | `10` | How far an arrow key moves the splitter, in pixels. |
| `splitterLabel` | `Bind<string>` | `uiLocale.strings.resize` | The splitter's accessible name. |

### Props a child gives its container

| Prop | Read by | Type | Description |
| --- | --- | --- | --- |
| `grow` | Stack | `Bind<boolean \| number>` | Takes the free space along the direction; numbers share it in proportion. |
| `row, column` | Grid | `Bind<number \| string>` | The line it starts at, from 1 (a string goes to CSS as it is: `-1`). |
| `rowSpan, columnSpan` | Grid | `Bind<number>` | How many tracks it covers. |
| `dock` | DockPanel | `Bind<Dock>` | `top`, `bottom`, `start`, `end`, `fill` (default) or `float`. |
| `left, top, right, bottom` | DockPanel | `Bind<number \| string>` | The anchors of a `float` child; a number is pixels; `left` + `right` stretch it. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `SplitContainer.first, second` | read-only | The panes, two `Panel`s: `split.first.controls.add(…)`, `split.second.scrollable = true`. |
| `SplitContainer.splitterElement` | read-only | The `role="separator"` element. |
| `SplitContainer.value` | read/write | `position`, for `x-model`. |
| `GroupBox.legendElement` | read-only | The `<legend>`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `Stack.setGrow(child, grow), growOf(child)` | `void`, value | A child's `grow` from code (a value or a function). |
| `Grid.setCell(child, cell), cellOf(child)` | `void`, `GridCell` | A child's `row`, `column`, `rowSpan`, `columnSpan` from code. |
| `DockPanel.setDock(child, dock), dockOf(child)` | `void`, `Dock` | A child's `dock` from code. |
| `DockPanel.setAnchors(child, anchors)` | `void` | The `left` / `top` / `right` / `bottom` of a `float` child. |
| `SplitContainer.collapse(pane?), restore()` | `void` | Hides a pane (the first by default) / shows both again. |
| `GroupBox.focus()` | `boolean` | Focuses the first control inside, opening a collapsed box. |

### Events

| Event | When |
| --- | --- |
| `SplitContainer.onSplitterMoved(e)` | The splitter moved (at the end of a drag), or a pane was hidden or restored. `e`: `{ position, collapsed, byUser, source }`. |
| `GroupBox.onToggled(e)` | The content was shown or hidden. `e`: `{ collapsed, byUser, source }`. |

`ChildSettings` — the part that reads a child's settings from its props and follows children added later — is exported for containers of your own.
