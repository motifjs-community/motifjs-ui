# ScrollView

> Navigation · @motifx-community/ui 0.1.0-beta.8

A scrollable container with configurable scrollbars, pull-to-refresh, and load-on-scroll near the end of the content. You can scroll it programmatically to a position or an element.

## Import

```tsx
import { ScrollView } from '@motifx-community/ui';
```

## Scrollable content

JSX children are the content. `showScrollbar` sets when scrollbars appear. `scrollTo` and `scrollToElement` scroll programmatically, and `onScrolled` reports the position.

```tsx
import { reactive } from '@motifx/core';
import { Button, ScrollView, Stack, type ScrollViewBars } from '@motifx-community/ui';

const LINES = Array.from({ length: 40 }, (_, i) => `Line ${i + 1} of a long text that needs a box of its own to scroll in.`);
const MODES: ScrollViewBars[] = ['onScroll', 'onHover', 'always', 'never'];

/** A scrolling box with configurable scrollbars, moved programmatically to a line and back to the top. */
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

With `pullToRefresh`, pulling the content down from the top raises `onPullDown`. Set `promise`, or call `release()`, and the panel closes when the work is finished.

```tsx
import { reactive } from '@motifx/core';
import { Panel, ScrollView, Stack } from '@motifx-community/ui';

/** Pulled down from the top, the list requests new items and shows the panel until the promise settles. */
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

## Load more

With `loadOnReachBottom`, scrolling within `reachBottomOffset` of the end raises `onReachBottom` once. `release()` allows the next request, and `release(true)` signals that there is no more data. Content that does not fill the view requests more immediately.

```tsx
import { reactive } from '@motifx/core';
import { Panel, ScrollView, Stack } from '@motifx-community/ui';

const TOTAL = 60;
const PAGE = 15;

// A page of rows, as a server would send them.
const fetchRows = (from: number) =>
    new Promise<string[]>(resolve => setTimeout(() => resolve(Array.from({ length: Math.min(PAGE, TOTAL - from) }, (_, i) => `Order #${1000 + from + i}`)), 800));

/** Near the end, the view requests more data. The indicator stays until the rows arrive, and `release(true)` ends it when there is no more. */
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

## Behavior

| Topic | Details |
| --- | --- |
| `Scrolling` | The box scrolls with the mouse wheel, the keyboard when focused, touch, and code. `direction` locks the other axis, and the page behind does not continue scrolling when the content ends. |
| `Scrollbars` | These are the design system scrollbars. With `onScroll`, the thumb appears while the content moves and hides shortly after. With `onHover`, it appears while the pointer is over the view or focus is inside it. `always` keeps it visible, and `never` hides it while the content still scrolls. |
| `Pull to refresh` | From the top, with a finger or the pointer, the content moves down with increasing resistance, and the panel above it prompts the user to pull and then release. Releasing far enough starts a refresh, and the spinner runs until `release()` or the promise. A short pull returns to its position. |
| `Load more` | Within `reachBottomOffset` of the end, `onReachBottom` is raised once, and the panel below the content is shown meanwhile. After release, the next approach raises it again, until `release(true)`. Content that does not fill the box requests more immediately, and again as it grows. |
| `Texts` | The kit strings in the kit language, unless the text props override them. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Region` | A focusable box named by `label`. The arrow keys, Page Up, Page Down, Home and End scroll it, using the browser's default behavior. |
| `Panels` | Live regions announce “Refreshing…” and “Loading…” when they appear. |
| `Spinners` | Decorative. The text describes what is happening. |
| `Motion` | A finger that pulls does not scroll the page, and a finger that scrolls does not pull. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-scroll-view` | The box. `data-direction`, `data-bars`, `data-scrolling` while the content moves, `data-pull` when pull-to-refresh is on, `data-pulling` during a pull, `data-pull-state` (`pull`, `release`, `refreshing`) and `data-loading`. |
| `.mx-scroll-view__content` | The element that holds the children, which moves down during a pull. |
| `.mx-scroll-view__pull, .mx-scroll-view__pull-text, .mx-scroll-view__pull-spinner` | The panel above the content, its text and the kit spinner. |
| `.mx-scroll-view__bottom, .mx-scroll-view__bottom-text, .mx-scroll-view__bottom-spinner` | The panel below the content while more data loads. |

### Component tokens

| Token | Description |
| --- | --- |
| `scroll-view.box` | Unit: the box (`focus`). |
| `scroll-view.pull, .pull-text, .bottom, .bottom-text` | Units: the two panels (the pull panel has `release` and `refreshing`) and their text. |
| `scroll-view.panel-height, .panel-gap` | The height of the panels, and the space between a panel's spinner and its text. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | `Bind<ScrollViewDirection>` | `'vertical'` | `vertical`, `horizontal` or `both`: the scroll direction. |
| `showScrollbar` | `Bind<ScrollViewBars>` | `'onScroll'` | When scrollbars appear: `onScroll` while scrolling, `onHover` while the pointer is over the view, `always` or `never`. |
| `pullToRefresh` | `Bind<boolean>` | `false` | Pulling the content down from the top raises `onPullDown`. |
| `loadOnReachBottom` | `Bind<boolean>` | `false` | Scrolling near the end raises `onReachBottom`, as does content that does not reach the end. |
| `reachBottomOffset` | `Bind<number>` | `100` | The distance from the end, in pixels, at which `onReachBottom` is raised. |
| `pullDownText, releaseText, refreshingText` | `Bind<string>` | The kit strings | The pull panel text: while pulling, once far enough, and while refreshing. |
| `reachBottomText` | `Bind<string>` | The kit string “Loading…” | The text below the content while more data loads. |
| `label` | `Bind<string>` | `''` | The accessible name of the scrolling region. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onPullDown` | event | Occurs when the content is pulled down and released. Load the new data and call `release()`, or set `promise` and the panel closes when it settles. |
| `onReachBottom` | event | Occurs when the content is scrolled near its end. Load more data and call `release()`. `release(true)` signals that there is no more data, and the view stops requesting. A `promise` also releases it. |
| `onScrolled` | event | Occurs when the position changes: `top`, `left`. |
| `scrollTo(where, smooth?)` | `void` | Scrolls to a top position, or to `{ top, left }`. `smooth` animates the scroll. |
| `scrollBy({ top, left }, smooth?)` | `void` | Scrolls by a distance. |
| `scrollToElement(target, smooth?)` | `void` | Scrolls an element or component of the content into view. |
| `refresh(), release()` | `void` | Starts a refresh as a pull would, or ends it. |
| `loadMore(), update()` | `boolean` / `void` | Requests more data now, or checks the position again after the content changes. |
| `scrollTop, scrollLeft` | read-only | The current scroll position. |
| `isRefreshing, isLoading` | read-only | Indicates that a refresh or a load is in progress. |
| `content` | read-only | The element that holds the children, between the two panels. |

## Feedback

Loading issues…
