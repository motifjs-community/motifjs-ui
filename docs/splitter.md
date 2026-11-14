# Splitter

> Navigation · @motifx-community/ui 0.1.0-beta.11

Divides space into any number of resizable panes, arranged side by side or stacked. A handle between each pair of panes can be dragged or moved with the keyboard, and it resizes the two panes next to it. Panes can be collapsed from their handle and can contain another splitter. For two panes where one has a fixed size, see [SplitContainer](layout.md).

## Import

```tsx
import { Splitter, SplitPane } from '@motifx-community/ui';
```

## Pixels, percentages and remaining space

Each `SplitPane` sets its `size`. A pixel value stays fixed when the splitter resizes, a percentage (`'30%'`) divides the space available to percentages, and a pane without a size takes an equal part of what remains. `minSize` and `maxSize` limit the handles. Drag a handle, or focus it and use the arrow keys, Home and End.

```tsx
import { SplitPane, Splitter } from '@motifx-community/ui';

/** Three panes: a fixed one in pixels with a least size, one that takes what is left, and a share. */
export default function Basic() {
    return (
        <Splitter class="sp-basic" style="block-size: 240px">
            <SplitPane size={220} minSize={140} padding="md" text="Folders">
                <p class="sp-note">Folders, 220 px to start, never under 140.</p>
            </SplitPane>
            <SplitPane minSize={120} padding="md" text="Messages">
                <p class="sp-note">Messages take what the others leave.</p>
            </SplitPane>
            <SplitPane size="30%" minSize={100} padding="md" text="Preview">
                <p class="sp-note">Preview, three tenths of the room the shares divide.</p>
            </SplitPane>
        </Splitter>
    );
}
```

## Collapsing panes

A `collapsible` pane gets a button on the adjacent handle. Enter on the handle and a double-click do the same. Adjacent panes take its space, and it returns to its previous size when expanded. `onCollapsing` can cancel the action, and `onCollapsed` reports it.

```tsx
import { reactive } from '@motifx/core';
import { SplitPane, Splitter, Stack } from '@motifx-community/ui';

/** The side panes can be collapsed with a button on the handle, Enter on it, or a double-click. The middle pane cannot. */
export default function Collapsible() {
    const s = reactive({ told: '' });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Splitter class="sp-fold" style="block-size: 200px" onCollapsed={e => (s.told = `${e.pane.text} ${e.collapsed ? 'hidden' : 'shown'}`)}>
                <SplitPane size={180} minSize={120} collapsible padding="md" text="Tree">
                    <p class="sp-note">Tree</p>
                </SplitPane>
                <SplitPane minSize={160} padding="md" text="Page">
                    <p class="sp-note">Page</p>
                </SplitPane>
                <SplitPane size={200} minSize={120} collapsible padding="md" text="Properties">
                    <p class="sp-note">Properties</p>
                </SplitPane>
            </Splitter>
            <output class="sp-fold-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Nested splitters

A pane is a `Panel`, so you can place a `Splitter` with the other `orientation` inside it, for example to show an editor above an output panel next to a tree.

```tsx
import { SplitPane, Splitter } from '@motifx-community/ui';

/** A pane may hold another splitter: here the right pane is split the other way. */
export default function Nested() {
    return (
        <Splitter class="sp-nested" style="block-size: 260px">
            <SplitPane size={200} minSize={120} padding="md" text="Navigation">
                <p class="sp-note">Navigation</p>
            </SplitPane>
            <SplitPane minSize={200}>
                <Splitter class="sp-inner" orientation="vertical">
                    <SplitPane minSize={80} padding="md" text="Editor">
                        <p class="sp-note">Editor</p>
                    </SplitPane>
                    <SplitPane size={90} minSize={60} collapsible padding="md" text="Output">
                        <p class="sp-note">Output</p>
                    </SplitPane>
                </Splitter>
            </SplitPane>
        </Splitter>
    );
}
```

## Persisting the layout

After every move, the pane sizes in pixels are written to `x-model`, and `onResized` reports them. Pass them back as `sizes` to restore a layout. `null` returns to the panes' own sizes.

```tsx
import { reactive } from '@motifx/core';
import { Button, SplitPane, Splitter, Stack } from '@motifx-community/ui';

/** The sizes are written to x-model as pixels after every move and can be set back: a layout saved and restored. */
export default function Sizes() {
    const s = reactive({ sizes: null as readonly (number | string | null)[] | null, kept: null as readonly number[] | null, moved: 0 });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Splitter class="sp-sizes" style="block-size: 180px" x-model={() => s.sizes} onResized={() => s.moved++}>
                <SplitPane size={160} minSize={80} padding="md" text="Left">
                    <p class="sp-note">Left</p>
                </SplitPane>
                <SplitPane minSize={80} padding="md" text="Middle">
                    <p class="sp-note">Middle</p>
                </SplitPane>
                <SplitPane size={160} minSize={80} padding="md" text="Right">
                    <p class="sp-note">Right</p>
                </SplitPane>
            </Splitter>
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Keep this layout" variant="outline" onclick={() => (s.kept = (s.sizes as number[] | null)?.slice() ?? null)} />
                <Button text="Restore it" variant="outline" enabled={() => !!s.kept} onclick={() => (s.sizes = s.kept)} />
                <Button text="Start again" variant="outline" onclick={() => (s.sizes = null)} />
                <output class="sp-sizes-told">{() => `sizes: ${JSON.stringify(s.sizes)}, moved ${s.moved} times`}</output>
            </Stack>
        </Stack>
    );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | Each handle that can move or collapse a pane is a Tab stop between its panes. |
| `Arrow keys` | Left and Right (Up and Down when stacked) move the handle by `step` pixels, within the panes' minimum and maximum sizes. These are reversed on right-to-left pages. |
| `Home, End` | Sets the pane before the handle to its minimum or maximum size. |
| `Enter` | Collapses the pane before the handle or expands it. If that pane cannot collapse, the pane after it is used. |

## Accessibility

| Topic | Details |
| --- | --- |
| `A handle` | A `separator` named “Resize” in the kit language, with `aria-controls` pointing to the pane before it, `aria-orientation`, and `aria-valuenow` as that pane's share of the two panes next to the handle. |
| `Fold buttons` | Buttons named “Hide the pane” and “Show the pane”, outside the Tab order. Enter on the handle does the same. |
| `A hidden pane` | Hidden and `inert`. Focus inside it moves to the handle. |
| `Panes` | A pane with `text` is a `region` with that name. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-splitter` | The splitter. `data-orientation`, and `data-dragging` while a handle is dragged. |
| `.mx-splitter__pane` | A pane (a `Panel`). `data-collapsed` while collapsed. |
| `.mx-splitter__handle` | A handle. `data-resizable`, `data-dragging`. |
| `.mx-splitter__grip, .mx-splitter__fold, .mx-splitter__fold-glyph` | The grip in the middle of a handle, the collapse buttons at either end (`data-side`), and their arrows. |

### Component tokens

| Token | Description |
| --- | --- |
| `splitter.handle, .line, .grip, .fold, .fold-glyph, .pane` | Units: the handle (`focus`), the line along it (`active`, `disabled`), the grip (`active`, `disabled`), the collapse buttons (`hover`, `pressed`, `focus`) and their arrows, and a pane (`collapsed`). |
| `splitter.size, .line-width, .active-width, .grip-length, .grip-thickness` | The thickness of the handle and line, the line thickness on hover, and the grip size. |

## API reference

### Splitter props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `Bind<LayoutOrientation>` | `'horizontal'` | `horizontal` places the panes side by side, and `vertical` stacks them. |
| `resizable` | `Bind<boolean>` | `true` | Lets users drag handles and move them with the keyboard. A pane's own `resizable` takes precedence. |
| `collapsible` | `Bind<boolean>` | `false` | Lets every pane be collapsed from its adjacent handle. A pane's own `collapsible` takes precedence. |
| `step` | `Bind<number>` | `10` | The distance an arrow key moves a handle, in pixels. |
| `sizes` | `Bind<readonly (number \| string \| null)[] \| null>` | `null` | The pane sizes in order (pixels, a percentage or `null`). When set, they replace each pane's own `size`. After a drag or key press, the sizes in pixels are written to `x-model`. |

### SplitPane props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `Bind<number \| string \| null>` | `null` | Pixels, a percentage (`'30%'`) of the space divided by percentages, or `null` for an equal share of what remains. |
| `minSize, maxSize` | `Bind<number>`, `Bind<number \| null>` | `0`, `null` | The minimum and maximum size, in pixels. |
| `collapsible` | `Bind<boolean \| undefined>` | `undefined` | Lets the adjacent handles collapse the pane. `undefined` inherits from the splitter. |
| `collapsed` | `Bind<boolean>` | `false` | Indicates that the pane is collapsed, and adjacent panes take its space. |
| `resizable` | `Bind<boolean>` | `true` | Lets the adjacent handles change its size. |
| `key` | `Bind<string>` | `''` | Identifies the pane. The JSX `key` is also read. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Content created with the pane, in addition to the JSX children. |
| `padding, scrollable, variant, text` | Same as `Panel` |  | A pane is a `Panel`, with padding, scrolling, a frame and an accessible name (a region). |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onResizing` | event | Occurs while a handle is dragged (`handle`, `sizes` in pixels). |
| `onResized` | event | Occurs after a drag ends or a key moves a handle (`handle`, `sizes`). |
| `onCollapsing` | event | Occurs before a pane is collapsed or expanded (`pane`, `index`, `collapsed`, `byUser`). Set `cancel = true` to keep the current state. |
| `onCollapsed` | event | Occurs after a pane is collapsed or expanded. |
| `panes` | read-only | The panes in order, including collapsed ones. |
| `currentSizes` | read-only | The current pane sizes in pixels, with 0 for a collapsed pane. |
| `count` | read-only | The number of panes. |
| `add(pane), insert(index, pane)` | `SplitPane` | Adds a pane at the end or at an index. |
| `remove(pane)` | `boolean` | Removes a pane and disposes it. |
| `collapse(pane), expand(pane)` | `boolean` | Collapses or expands a pane, by index or object. `onCollapsing` is raised first. A pane's own `collapse()` and `expand()` do the same. |

## Feedback

Loading issues…
