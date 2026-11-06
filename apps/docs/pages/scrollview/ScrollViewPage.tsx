import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Bars from './examples/Bars';
import More from './examples/More';
import Pull from './examples/Pull';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['direction', '`Bind<ScrollViewDirection>`', "`'vertical'`", '`vertical`, `horizontal` or `both`: the scroll direction.'],
    ['showScrollbar', '`Bind<ScrollViewBars>`', "`'onScroll'`", 'When scrollbars appear: `onScroll` while scrolling, `onHover` while the pointer is over the view, `always` or `never`.'],
    ['pullToRefresh', '`Bind<boolean>`', '`false`', 'Pulling the content down from the top raises `onPullDown`.'],
    ['loadOnReachBottom', '`Bind<boolean>`', '`false`', 'Scrolling near the end raises `onReachBottom`, as does content that does not reach the end.'],
    ['reachBottomOffset', '`Bind<number>`', '`100`', 'The distance from the end, in pixels, at which `onReachBottom` is raised.'],
    ['pullDownText, releaseText, refreshingText', '`Bind<string>`', 'The kit strings', 'The pull panel text: while pulling, once far enough, and while refreshing.'],
    ['reachBottomText', '`Bind<string>`', 'The kit string “Loading…”', 'The text below the content while more data loads.'],
    ['label', '`Bind<string>`', "`''`", 'The accessible name of the scrolling region.']
];

const MEMBERS = [
    ['onPullDown', 'event', 'Occurs when the content is pulled down and released. Load the new data and call `release()`, or set `promise` and the panel closes when it settles.'],
    ['onReachBottom', 'event', 'Occurs when the content is scrolled near its end. Load more data and call `release()`. `release(true)` signals that there is no more data, and the view stops requesting. A `promise` also releases it.'],
    ['onScrolled', 'event', 'Occurs when the position changes: `top`, `left`.'],
    ['scrollTo(where, smooth?)', '`void`', 'Scrolls to a top position, or to `{ top, left }`. `smooth` animates the scroll.'],
    ['scrollBy({ top, left }, smooth?)', '`void`', 'Scrolls by a distance.'],
    ['scrollToElement(target, smooth?)', '`void`', 'Scrolls an element or component of the content into view.'],
    ['refresh(), release()', '`void`', 'Starts a refresh as a pull would, or ends it.'],
    ['loadMore(), update()', '`boolean` / `void`', 'Requests more data now, or checks the position again after the content changes.'],
    ['scrollTop, scrollLeft', 'read-only', 'The current scroll position.'],
    ['isRefreshing, isLoading', 'read-only', 'Indicates that a refresh or a load is in progress.'],
    ['content', 'read-only', 'The element that holds the children, between the two panels.']
];

const BEHAVIOUR = [
    ['Scrolling', 'The box scrolls with the mouse wheel, the keyboard when focused, touch, and code. `direction` locks the other axis, and the page behind does not continue scrolling when the content ends.'],
    ['Scrollbars', 'These are the design system scrollbars. With `onScroll`, the thumb appears while the content moves and hides shortly after. With `onHover`, it appears while the pointer is over the view or focus is inside it. `always` keeps it visible, and `never` hides it while the content still scrolls.'],
    ['Pull to refresh', 'From the top, with a finger or the pointer, the content moves down with increasing resistance, and the panel above it prompts the user to pull and then release. Releasing far enough starts a refresh, and the spinner runs until `release()` or the promise. A short pull returns to its position.'],
    ['Load more', 'Within `reachBottomOffset` of the end, `onReachBottom` is raised once, and the panel below the content is shown meanwhile. After release, the next approach raises it again, until `release(true)`. Content that does not fill the box requests more immediately, and again as it grows.'],
    ['Texts', 'The kit strings in the kit language, unless the text props override them.']
];

const A11Y = [
    ['Region', 'A focusable box named by `label`. The arrow keys, Page Up, Page Down, Home and End scroll it, using the browser\'s default behavior.'],
    ['Panels', 'Live regions announce “Refreshing…” and “Loading…” when they appear.'],
    ['Spinners', 'Decorative. The text describes what is happening.'],
    ['Motion', 'A finger that pulls does not scroll the page, and a finger that scrolls does not pull.']
];

const HOOKS = [
    ['.mx-scroll-view', 'The box. `data-direction`, `data-bars`, `data-scrolling` while the content moves, `data-pull` when pull-to-refresh is on, `data-pulling` during a pull, `data-pull-state` (`pull`, `release`, `refreshing`) and `data-loading`.'],
    ['.mx-scroll-view__content', 'The element that holds the children, which moves down during a pull.'],
    ['.mx-scroll-view__pull, .mx-scroll-view__pull-text, .mx-scroll-view__pull-spinner', 'The panel above the content, its text and the kit spinner.'],
    ['.mx-scroll-view__bottom, .mx-scroll-view__bottom-text, .mx-scroll-view__bottom-spinner', 'The panel below the content while more data loads.']
];

const TOKENS = [
    ['scroll-view.box', 'Unit: the box (`focus`).'],
    ['scroll-view.pull, .pull-text, .bottom, .bottom-text', 'Units: the two panels (the pull panel has `release` and `refreshing`) and their text.'],
    ['scroll-view.panel-height, .panel-gap', 'The height of the panels, and the space between a panel\'s spinner and its text.']
];

export default function ScrollViewPage() {
    return (
        <>
            <p class="lead">
              <Rich text="A scrollable container with configurable scrollbars, pull-to-refresh, and load-on-scroll near the end of the content. You can scroll it programmatically to a position or an element." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { ScrollView } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Scrollable content">
                <p>
                    <Rich text="JSX children are the content. `showScrollbar` sets when scrollbars appear. `scrollTo` and `scrollToElement` scroll programmatically, and `onScrolled` reports the position." />
                </p>
                <Example stack files={code('Bars.tsx')}>
                    <Bars />
                </Example>
            </Section>

            <Section anchor="pull" title="Pull to refresh">
                <p>
                    <Rich text="With `pullToRefresh`, pulling the content down from the top raises `onPullDown`. Set `promise`, or call `release()`, and the panel closes when the work is finished." />
                </p>
                <Example stack files={code('Pull.tsx')}>
                    <Pull />
                </Example>
            </Section>

            <Section anchor="more" title="Load more">
                <p>
                    <Rich text="With `loadOnReachBottom`, scrolling within `reachBottomOffset` of the end raises `onReachBottom` once. `release()` allows the next request, and `release(true)` signals that there is no more data. Content that does not fill the view requests more immediately." />
                </p>
                <Example stack files={code('More.tsx')}>
                    <More />
                </Example>
            </Section>

            <Section anchor="behaviour" title="Behavior">
                <ApiTable head={['Topic', 'Details']} rows={BEHAVIOUR} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
