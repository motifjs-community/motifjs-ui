import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Lazy from './examples/Lazy';
import Pages from './examples/Pages';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['value', '`Bind<string | number | null>`', '`0`', 'The visible view, identified by its `key` or index. `x-model` provides two-way binding.'],
    ['loop', '`Bind<boolean>`', '`false`', 'The first view follows the last, and the transition wraps around instead of running back across the views in between.'],
    ['swipeEnabled', '`Bind<boolean>`', '`true`', 'Lets a finger or pointer drag the views. A drag that is far or fast enough moves to the next view.'],
    ['animated', '`Bind<boolean>`', '`true`', 'Animates the transition between views. `false` shows the next view immediately.'],
    ['lazy', '`Bind<boolean>`', '`true`', 'Creates a view when it first becomes visible and then keeps it. A view\'s own `lazy` takes precedence.'],
    ['keepAlive', '`Bind<boolean>`', '`true`', 'With `false`, disposes what a view\'s `content` created while the view is hidden. A view\'s own `keepAlive` takes precedence.'],
    ['label', '`Bind<string>`', 'The kit string “Pages”', 'The accessible name.']
];

const VIEW_PROPS = [
    ['title', '`Bind<string>`', '“Page 2 of 3”', 'The accessible name of the view.'],
    ['key', '`Bind<string>`', '`\'\'`', 'Identifies the view in `value`. The JSX `key` is also read.'],
    ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Content created when the view first becomes visible, in addition to the JSX children.'],
    ['lazy, keepAlive', '`Bind<boolean | undefined>`', '`undefined`', 'The view\'s own settings. `undefined` inherits from the multi-view.'],
    ['visible, enabled', '`Bind<boolean>`', '`true`', 'A hidden view takes no space and is skipped. A disabled view is skipped by `next()` and `previous()`, and `goTo()` rejects it.']
];

const MEMBERS = [
    ['onSelecting', 'event', 'Occurs before the visible view changes (`from`, `to`, `fromView`, `toView`, `byUser`). Set `cancel = true` to keep the current view.'],
    ['onSelectionChanged', 'event', 'Occurs after the visible view changes (`index`, `view`, `previous`, and `byUser` for a swipe, as opposed to code).'],
    ['views', 'read-only', 'The views in order, including hidden ones.'],
    ['selectedView, selectedIndex', 'read-only', 'The visible view and its index, or `null` and -1 if there is none.'],
    ['count', 'read-only', 'The number of views.'],
    ['next(), previous()', '`Promise<boolean>`', 'Moves to the next or previous view that is visible and enabled. Returns `false` at an end without `loop`, or if the change was canceled.'],
    ['goTo(view)', '`Promise<boolean>`', 'Moves to a view by index, key or `View` object. `onSelecting` is raised first. A view\'s own `select()` does the same.'],
    ['add(view), insert(index, view)', '`View`', 'Adds a view at the end or at an index. A view from another multi-view moves here.'],
    ['remove(view)', '`boolean`', 'Removes a view and disposes it. The display moves to an adjacent view.']
];

const A11Y = [
    ['Group', 'A `group` named “Pages” in the kit language. If a page has several, give each one its own `label`.'],
    ['A view', 'A `group` named by its `title`, or “Page 2 of 3”. Views out of sight are hidden from assistive technology and the keyboard (`inert`), so Tab moves only within the visible view.'],
    ['Moving', 'Swiping requires a finger or a mouse, so also provide keyboard access through `Tabs`, a `Stepper` or buttons bound to the same `value`, as the examples do.']
];

const HOOKS = [
    ['.mx-multi-view', 'The multi-view. `data-swipe` when dragging is enabled, `data-dragging` during a drag, and `data-still` with `animated` off.'],
    ['.mx-multi-view__viewport, .mx-multi-view__track', 'The frame that clips the views and the track that moves inside it (`data-dragging`, `data-no-motion`).'],
    ['.mx-multi-view__view', 'A view (`aria-hidden` and `inert` when hidden).']
];

const TOKENS = [
    ['multi-view.frame, .view', 'Units: the frame (`swipeable`, `dragging`) and a view.'],
    ['multi-view.gap', 'The gap between views, visible during a drag.']
];

export default function MultiViewPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Displays one page at a time from a horizontal set. Users move between pages with a swipe or drag, and you can navigate with `next()`, `previous()` and `goTo()`, or with [Tabs](/tabs), a [Stepper](/stepper) or buttons bound to the same value. It works like the panels of a tab control without the tab strip." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { MultiView, View } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Using MultiView with a Stepper">
                <p>
                    <Rich text="The `View` children are the pages. `value` is the visible view, identified by its `key` or index, and `x-model` provides two-way binding. In this example, a `Stepper` shares the value, so pressing a step and swiping a page both update it. A page is created when it first becomes visible (`lazy`)." />
                </p>
                <Example stack files={code('Pages.tsx')}>
                    <Pages />
                </Example>
            </Section>

            <Section anchor="lazy" title="Lazy creation and keeping views alive">
                <p>
                    <Rich text="`lazy`, the default, creates a view when it first becomes visible and then keeps it. `keepAlive={false}` disposes what a view's `content` created while it is hidden and recreates it next time. JSX children are always kept, as in `Tabs`." />
                </p>
                <Example stack files={code('Lazy.tsx')}>
                    <Lazy />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="Create the component with `new`, add views with `add()` and `insert()`, and remove them with `remove()`. `loop` wraps around at the ends, and `animated={false}` shows the next view immediately." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
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
                  <Rich text="MultiView props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="View props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={VIEW_PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
