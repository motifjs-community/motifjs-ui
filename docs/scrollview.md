# ScrollView

> Navigation · @motifx-community/ui 0.1.0-beta.3

Content that scrolls in a box of its own: the bars shown as told, a pull from the top that asks for what is new, a reach near the end that asks for more. Moved programmatically to a position or to an element.

## Import

```tsx
import { ScrollView } from '@motifx-community/ui';
```

## A box that scrolls

The JSX children are the content. `showScrollbar` says when the bars show; `scrollTo` and `scrollToElement` move the content programmatically, `onScrolled` tells where it stands.

```tsx
import { reactive } from '@motifx/core';
import { Button, ScrollView, Stack, type ScrollViewBars } from '@motifx-community/ui';

const LINES = Array.from({ length: 40 }, (_, i) => `Line ${i + 1} of a long text that needs a box of its own to scroll in.`);
const MODES: ScrollViewBars[] = ['onScroll', 'onHover', 'always', 'never'];

/** A box that scrolls, its bars shown as told; moved programmatically to a line and back to the top. */
export default function Bars() {
    const s = reactive({ bars: 'onScroll' as ScrollViewBars, top: 0 });
    let view!: ScrollView;
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                {MODES.map(mode => (
                    <Button key={mode} text={mode} size="sm" variant={() => (s.bars === mode ? 'solid' : 'outline')} onclick={() => (s.bars = mode)} />
                ))}
                <Button text="Line 20" variant="outline" size="sm" onclick={() => view.scrollToElement(view.content.element.querySelectorAll('p')[19], true)} />
                <Button text="Top" variant="outline" size="sm" onclick={() => view.scrollTo(0, true)} />
                <output class="sv-top">{() => `scrollTop: ${Math.round(s.top)}`}</output>
            </Stack>
            <ScrollView ref={(v: ScrollView) => (view = v)} label="Long text" class="sv-text" showScrollbar={() => s.bars} style="block-size: 12rem" onScrolled={e => (s.top = e.top)}>
                {LINES.map(line => (
                    <p key={line}>{line}</p>
                ))}
            </ScrollView>
        </Stack>
    );
}
```

## Pull to refresh

With `pullToRefresh`, the content pulled down from its top asks `onPullDown`. Set `promise` (or call `release()`) and the panel goes when the work is done.

```tsx
import { reactive } from '@motifx/core';
import { Panel, ScrollView, Stack } from '@motifx-community/ui';

/** Pulled down from the top, the list asks for what is new and shows the panel until the promise settles. */
export default function Pull() {
    const s = reactive({ notes: ['Welcome aboard', 'Your plan was renewed', 'A new comment on "Roadmap"'], count: 0 });
    const reload = () =>
        new Promise<void>(resolve =>
            setTimeout(() => {
                s.count++;
                s.notes = [`Fresh note ${s.count}`, ...s.notes];
                resolve();
            }, 1200)
        );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <span>Drag the list down from its top (a finger, or the mouse) and let go.</span>
            <ScrollView label="Notes" class="sv-notes" pullToRefresh onPullDown={e => (e.promise = reload())} style="block-size: 12rem">
                {s.notes.map(note => (
                    <Panel key={note} variant="outline" padding="sm">
                        {note}
                    </Panel>
                ))}
            </ScrollView>
        </Stack>
    );
}
```

## Load more near the end

With `loadOnReachBottom`, a scroll within `reachBottomOffset` of the end asks `onReachBottom` once; `release()` lets the next reach ask again, `release(true)` says there is no more. Content that does not fill the box asks at once.

```tsx
import { reactive } from '@motifx/core';
import { Panel, ScrollView, Stack } from '@motifx-community/ui';

const TOTAL = 60;
const PAGE = 15;

// A page of rows, as a server would send them.
const fetchRows = (from: number) =>
    new Promise<string[]>(resolve => setTimeout(() => resolve(Array.from({ length: Math.min(PAGE, TOTAL - from) }, (_, i) => `Order #${1000 + from + i}`)), 800));

/** Near the end the view asks for more; the indicator stays until the rows are in, and `release(true)` ends it for good when there is no more. */
export default function More() {
    const s = reactive({ rows: [] as string[] });
    const more = () =>
        fetchRows(s.rows.length).then(rows => {
            s.rows = [...s.rows, ...rows];
            return s.rows.length >= TOTAL;
        });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <output class="sv-more-told">{() => (s.rows.length >= TOTAL ? `All ${TOTAL} orders are in.` : `${s.rows.length} of ${TOTAL} orders`)}</output>
            <ScrollView label="Orders" class="sv-orders" loadOnReachBottom reachBottomOffset={80} onReachBottom={e => more().then(done => e.release(done))} style="block-size: 14rem">
                {s.rows.map(row => (
                    <Panel key={row} variant="outline" padding="sm">
                        {row}
                    </Panel>
                ))}
            </ScrollView>
        </Stack>
    );
}
```

## Behaviour

| Topic | How |
| --- | --- |
| `Scrolling` | The box scrolls with the wheel, the keys when focused, a finger, and programmatically. `direction` locks the other axis; the page behind does not scroll on when the content ends. |
| `Scrollbars` | The design system’s bars. With `onScroll` the thumb shows while the content moves and goes a moment after; with `onHover` while the pointer is over the view or focus is in it; `always` leaves them; `never` hides them, the content still scrolls. |
| `Pull to refresh` | From the top, with a finger or the pointer: the content comes down (harder the farther it goes) and the panel above it says to pull, then to release. Let go far enough it refreshes: the spinner turns until `release()` or the promise. A short pull goes back. |
| `Load more` | Within `reachBottomOffset` of the end, `onReachBottom` is asked once; the panel under the content shows meanwhile. Released, the next reach asks again, until `release(true)`. Content that does not fill the box asks at once, and again as it grows. |
| `Texts` | The kit’s, in the kit language, unless the text props say otherwise. |

## Accessibility

| Topic | How |
| --- | --- |
| `Region` | A focusable box named by `label`; the arrow keys, Page Up/Down, Home and End scroll it as the browser does. |
| `Panels` | Live regions: “Refreshing…” and “Loading…” are read when they appear. |
| `Spinners` | Decorative; the texts say what is going on. |
| `Motion` | A finger that pulls does not scroll the page; a finger that scrolls does not pull. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-scroll-view` | The box. `data-direction`, `data-bars`, `data-scrolling` while the content moves, `data-pull` when pulling is on, `data-pulling` during a pull, `data-pull-state` (`pull`, `release`, `refreshing`), `data-loading`. |
| `.mx-scroll-view__content` | What holds the children; it moves down during a pull. |
| `.mx-scroll-view__pull, .mx-scroll-view__pull-text, .mx-scroll-view__pull-spinner` | The panel above the content, its text and the kit’s spinner. |
| `.mx-scroll-view__bottom, .mx-scroll-view__bottom-text, .mx-scroll-view__bottom-spinner` | The panel under the content while more loads. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `scroll-view.box` | Unit: the box (`focus`). |
| `scroll-view.pull, .pull-text, .bottom, .bottom-text` | Units: the two panels (the pull one `release` and `refreshing`) and their texts. |
| `scroll-view.panel-height, .panel-gap` | The panels’ height; the space between a panel’s spinner and its text. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | `Bind<ScrollViewDirection>` | `'vertical'` | `vertical`, `horizontal` or `both`: which way the content scrolls. |
| `showScrollbar` | `Bind<ScrollViewBars>` | `'onScroll'` | When the bars show: `onScroll` while scrolling, `onHover` while the pointer is over the view, `always`, `never`. |
| `pullToRefresh` | `Bind<boolean>` | `false` | Pulling the content down from its top asks `onPullDown` for what is new. |
| `loadOnReachBottom` | `Bind<boolean>` | `false` | Scrolling near the end asks `onReachBottom` for more; so does content that does not reach the end. |
| `reachBottomOffset` | `Bind<number>` | `100` | Pixels before the end at which `onReachBottom` is asked. |
| `pullDownText, releaseText, refreshingText` | `Bind<string>` | the kit’s texts | The pull panel’s texts: while pulling, once far enough, while refreshing. |
| `reachBottomText` | `Bind<string>` | the kit’s “Loading…” | The text under the content while more loads. |
| `label` | `Bind<string>` | `''` | What screen readers call the scrolling region. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onPullDown` | event | The content was pulled down and let go. Load what is new, then `release()`, or set `promise` and the panel goes when it settles. |
| `onReachBottom` | event | The content was scrolled near its end. Load more, then `release()`; `release(true)` says there is no more and the view stops asking. A `promise` releases too. |
| `onScrolled` | event | The position changed: `top`, `left`. |
| `scrollTo(where, smooth?)` | `void` | To a top, or `{ top, left }`; `smooth` animates. |
| `scrollBy({ top, left }, smooth?)` | `void` | By a distance. |
| `scrollToElement(target, smooth?)` | `void` | Brings an element (or a component) of the content into view. |
| `refresh(), release()` | `void` | Starts a refresh as a pull would; ends it. |
| `loadMore(), update()` | `boolean` / `void` | Asks for more now; looks at the position again after the content changed. |
| `scrollTop, scrollLeft` | read-only | Where the content stands. |
| `isRefreshing, isLoading` | read-only | A refresh or a loading is going on. |
| `content` | read-only | The element that holds the children, between the two panels. |
