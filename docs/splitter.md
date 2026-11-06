# Splitter

> Navigation · @motifx-community/ui 0.1.0-beta.3

Panes side by side or one under the other, as many as needed, with a handle between each two that the pointer drags and the keys move. A handle resizes the two panes beside it; a pane may be hidden from its handle, and may hold another splitter. For two panes with one fixed, see [SplitContainer](layout.md).

## Import

```tsx
import { Splitter, SplitPane } from '@motifx-community/ui';
```

## Pixels, shares and the rest

Each `SplitPane` says its `size`: pixels stay pixels when the splitter changes size, a share (`'30%'`) divides the room the shares get, and a pane without a size takes an equal part of what is left. `minSize` and `maxSize` hold the handles. Drag a handle, or focus it and use the arrow keys, Home and End.

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

## Hiding a pane

A `collapsible` pane gets a button on the handle next to it; Enter on the handle and a double press do the same. The neighbours take its room, and it comes back where it was. `onCollapsing` may refuse, `onCollapsed` tells.

```tsx
import { reactive } from '@motifx/core';
import { SplitPane, Splitter, Stack } from '@motifx-community/ui';

/** The side panes can be hidden: a button on the handle, Enter on it, or a double press; the middle one cannot. */
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

## One inside another

A pane is a `Panel`: put a `Splitter` of the other `orientation` in it for an editor over an output, next to a tree.

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

## Keeping the layout

After every move the panes’ pixels are written to `x-model` (and `onResized` tells). Give them back as `sizes` to restore a layout; `null` starts from the panes’ own sizes again.

```tsx
import { reactive } from '@motifx/core';
import { Button, SplitPane, Splitter, Stack } from '@motifx-community/ui';

/** The sizes go out to x-model as pixels after every move, and come back: a layout kept and restored. */
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

| Key | What it does |
| --- | --- |
| `Tab` | Each handle that can move or hide a pane is a stop, between the panes it lies between. |
| `Arrow keys` | Left and Right (Up and Down one under the other) move the handle by `step` pixels, within the panes’ least and most sizes; the other way round in a right-to-left page. |
| `Home, End` | Give the pane before the handle its least, or its most. |
| `Enter` | Hides the pane before the handle, or shows it again; when that pane cannot be hidden, the one after. |

## Accessibility

| Topic | How |
| --- | --- |
| `A handle` | A `separator` named “Resize” in the kit language, with `aria-controls` on the pane before it, `aria-orientation`, and `aria-valuenow` as that pane’s share of the two beside the handle. |
| `Fold buttons` | Buttons named “Hide the pane” and “Show the pane”, out of the Tab order: Enter on the handle does the same. |
| `A hidden pane` | Out of sight and `inert`; focus inside it moves to the handle. |
| `Panes` | A pane with a `text` is a `region` of that name. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-splitter` | The splitter. `data-orientation`, `data-dragging` while a handle is dragged. |
| `.mx-splitter__pane` | A pane (a `Panel`). `data-collapsed` while hidden. |
| `.mx-splitter__handle` | A handle. `data-resizable`, `data-dragging`. |
| `.mx-splitter__grip, .mx-splitter__fold, .mx-splitter__fold-glyph` | The grip in the middle of a handle, the fold buttons at either end of it (`data-side`), their arrows. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `splitter.handle, .line, .grip, .fold, .fold-glyph, .pane` | Units: the handle (`focus`), the line along it (`active`, `disabled`), the grip (`active`, `disabled`), the fold buttons (`hover`, `pressed`, `focus`) and their arrows, a pane (`collapsed`). |
| `splitter.size, .line-width, .active-width, .grip-length, .grip-thickness` | The handle’s thickness, the line’s, the line’s under the pointer, the grip’s size. |

## API reference

### Splitter props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `Bind<LayoutOrientation>` | `'horizontal'` | `horizontal`: the panes side by side; `vertical`: one under the other. |
| `resizable` | `Bind<boolean>` | `true` | The handles can be dragged and moved with the keys (a pane’s own `resizable` wins). |
| `collapsible` | `Bind<boolean>` | `false` | Every pane can be hidden from the handle next to it (a pane’s own `collapsible` wins). |
| `step` | `Bind<number>` | `10` | Pixels an arrow key moves a handle. |
| `sizes` | `Bind<readonly (number \| string \| null)[] \| null>` | `null` | The panes’ sizes in pane order (pixels, a share or `null`); given, they take the place of the panes’ own `size`. After a drag or a key the pixels are written to `x-model`. |

### SplitPane props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `Bind<number \| string \| null>` | `null` | Pixels, a share (`'30%'`) of the room the shares divide, or `null` for an equal share of what is left. |
| `minSize, maxSize` | `Bind<number>`, `Bind<number \| null>` | `0`, `null` | The least and the most it gets, in pixels. |
| `collapsible` | `Bind<boolean \| undefined>` | `undefined` | The handles next to it can hide it; `undefined` follows the splitter. |
| `collapsed` | `Bind<boolean>` | `false` | Hidden, the neighbours taking its room. |
| `resizable` | `Bind<boolean>` | `true` | The handles next to it can change its size. |
| `key` | `Bind<string>` | `''` | Names the pane; the JSX `key` is read too. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Content made with the pane, besides the JSX children. |
| `padding, scrollable, variant, text` | as `Panel` |  | A pane is a `Panel`: its padding, its own scrolling, a frame, a name (a region). |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onResizing` | event | A handle is being dragged (`handle`, `sizes` in pixels). |
| `onResized` | event | A drag ended or a key moved a handle (`handle`, `sizes`). |
| `onCollapsing` | event | A pane is about to be hidden or shown again (`pane`, `index`, `collapsed`, `byUser`); `cancel = true` leaves it. |
| `onCollapsed` | event | A pane was hidden or shown again. |
| `panes` | read-only | The panes in order, hidden ones too. |
| `currentSizes` | read-only | The panes’ pixels along the split now; 0 for a hidden pane. |
| `count` | read-only | How many panes there are. |
| `add(pane), insert(index, pane)` | `SplitPane` | Adds a pane at the end or at an index. |
| `remove(pane)` | `boolean` | Removes a pane and disposes it. |
| `collapse(pane), expand(pane)` | `boolean` | Hides a pane (by index or the pane itself), or shows it again; `onCollapsing` is asked first. A pane’s own `collapse()` and `expand()` do the same. |
