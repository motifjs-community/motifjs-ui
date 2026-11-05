import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Bars from './examples/Bars';
import More from './examples/More';
import Pull from './examples/Pull';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['direction', '`Bind<ScrollViewDirection>`', "`'vertical'`", '`vertical`, `horizontal` or `both`: which way the content scrolls.'],
    ['showScrollbar', '`Bind<ScrollViewBars>`', "`'onScroll'`", 'When the bars show: `onScroll` while scrolling, `onHover` while the pointer is over the view, `always`, `never`.'],
    ['pullToRefresh', '`Bind<boolean>`', '`false`', 'Pulling the content down from its top asks `onPullDown` for what is new.'],
    ['loadOnReachBottom', '`Bind<boolean>`', '`false`', 'Scrolling near the end asks `onReachBottom` for more; so does content that does not reach the end.'],
    ['reachBottomOffset', '`Bind<number>`', '`100`', 'Pixels before the end at which `onReachBottom` is asked.'],
    ['pullDownText, releaseText, refreshingText', '`Bind<string>`', 'the kit’s texts', 'The pull panel’s texts: while pulling, once far enough, while refreshing.'],
    ['reachBottomText', '`Bind<string>`', 'the kit’s “Loading…”', 'The text under the content while more loads.'],
    ['label', '`Bind<string>`', "`''`", 'What screen readers call the scrolling region.']
];

const MEMBERS = [
    ['onPullDown', 'event', 'The content was pulled down and let go. Load what is new, then `release()`, or set `promise` and the panel goes when it settles.'],
    ['onReachBottom', 'event', 'The content was scrolled near its end. Load more, then `release()`; `release(true)` says there is no more and the view stops asking. A `promise` releases too.'],
    ['onScrolled', 'event', 'The position changed: `top`, `left`.'],
    ['scrollTo(where, smooth?)', '`void`', 'To a top, or `{ top, left }`; `smooth` animates.'],
    ['scrollBy({ top, left }, smooth?)', '`void`', 'By a distance.'],
    ['scrollToElement(target, smooth?)', '`void`', 'Brings an element (or a component) of the content into view.'],
    ['refresh(), release()', '`void`', 'Starts a refresh as a pull would; ends it.'],
    ['loadMore(), update()', '`boolean` / `void`', 'Asks for more now; looks at the position again after the content changed.'],
    ['scrollTop, scrollLeft', 'read-only', 'Where the content stands.'],
    ['isRefreshing, isLoading', 'read-only', 'A refresh or a loading is going on.'],
    ['content', 'read-only', 'The element that holds the children, between the two panels.']
];

const BEHAVIOUR = [
    ['Scrolling', 'The box scrolls with the wheel, the keys when focused, a finger, and programmatically. `direction` locks the other axis; the page behind does not scroll on when the content ends.'],
    ['Scrollbars', 'The design system’s bars. With `onScroll` the thumb shows while the content moves and goes a moment after; with `onHover` while the pointer is over the view or focus is in it; `always` leaves them; `never` hides them, the content still scrolls.'],
    ['Pull to refresh', 'From the top, with a finger or the pointer: the content comes down (harder the farther it goes) and the panel above it says to pull, then to release. Let go far enough it refreshes: the spinner turns until `release()` or the promise. A short pull goes back.'],
    ['Load more', 'Within `reachBottomOffset` of the end, `onReachBottom` is asked once; the panel under the content shows meanwhile. Released, the next reach asks again, until `release(true)`. Content that does not fill the box asks at once, and again as it grows.'],
    ['Texts', 'The kit’s, in the kit language, unless the text props say otherwise.']
];

const A11Y = [
    ['Region', 'A focusable box named by `label`; the arrow keys, Page Up/Down, Home and End scroll it as the browser does.'],
    ['Panels', 'Live regions: “Refreshing…” and “Loading…” are read when they appear.'],
    ['Spinners', 'Decorative; the texts say what is going on.'],
    ['Motion', 'A finger that pulls does not scroll the page; a finger that scrolls does not pull.']
];

const HOOKS = [
    ['.mx-scroll-view', 'The box. `data-direction`, `data-bars`, `data-scrolling` while the content moves, `data-pull` when pulling is on, `data-pulling` during a pull, `data-pull-state` (`pull`, `release`, `refreshing`), `data-loading`.'],
    ['.mx-scroll-view__content', 'What holds the children; it moves down during a pull.'],
    ['.mx-scroll-view__pull, .mx-scroll-view__pull-text, .mx-scroll-view__pull-spinner', 'The panel above the content, its text and the kit’s spinner.'],
    ['.mx-scroll-view__bottom, .mx-scroll-view__bottom-text, .mx-scroll-view__bottom-spinner', 'The panel under the content while more loads.']
];

const TOKENS = [
    ['scroll-view.box', 'Unit: the box (`focus`).'],
    ['scroll-view.pull, .pull-text, .bottom, .bottom-text', 'Units: the two panels (the pull one `release` and `refreshing`) and their texts.'],
    ['scroll-view.panel-height, .panel-gap', 'The panels’ height; the space between a panel’s spinner and its text.']
];

export default function ScrollViewPage() {
    return (
        <>
            <p class="lead">
                Content that scrolls in a box of its own: the bars shown as told, a pull from the top that asks for what is
                new, a reach near the end that asks for more. Moved programmatically to a position or to an element.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { ScrollView } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="A box that scrolls">
                <p>
                    <Rich text="The JSX children are the content. `showScrollbar` says when the bars show; `scrollTo` and `scrollToElement` move the content programmatically, `onScrolled` tells where it stands." />
                </p>
                <Example stack files={code('Bars.tsx')}>
                    <Bars />
                </Example>
            </Section>

            <Section anchor="pull" title="Pull to refresh">
                <p>
                    <Rich text="With `pullToRefresh`, the content pulled down from its top asks `onPullDown`. Set `promise` (or call `release()`) and the panel goes when the work is done." />
                </p>
                <Example stack files={code('Pull.tsx')}>
                    <Pull />
                </Example>
            </Section>

            <Section anchor="more" title="Load more near the end">
                <p>
                    <Rich text="With `loadOnReachBottom`, a scroll within `reachBottomOffset` of the end asks `onReachBottom` once; `release()` lets the next reach ask again, `release(true)` says there is no more. Content that does not fill the box asks at once." />
                </p>
                <Example stack files={code('More.tsx')}>
                    <More />
                </Example>
            </Section>

            <Section anchor="behaviour" title="Behaviour">
                <ApiTable head={['Topic', 'How']} rows={BEHAVIOUR} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'How']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
                <h3>Component tokens</h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>Props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>Events, properties and methods</h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
