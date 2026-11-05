import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Lazy from './examples/Lazy';
import Pages from './examples/Pages';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['value', '`Bind<string | number | null>`', '`0`', 'The view in sight: its `key`, else its index. `x-model` binds it two-way.'],
    ['loop', '`Bind<boolean>`', '`false`', 'After the last view comes the first; the move goes around the ends, not back across the views between.'],
    ['swipeEnabled', '`Bind<boolean>`', '`true`', 'A finger or a pointer drags the views; a drag far or fast enough lands on the next one.'],
    ['animated', '`Bind<boolean>`', '`true`', 'The views slide into sight. `false` shows the next one at once.'],
    ['lazy', '`Bind<boolean>`', '`true`', 'A view is built when first in sight, then kept (a view’s own `lazy` wins).'],
    ['keepAlive', '`Bind<boolean>`', '`true`', '`false` disposes what a view’s `content` made while the view is out of sight (a view’s own `keepAlive` wins).'],
    ['label', '`Bind<string>`', 'the kit’s “Pages”', 'What screen readers call it.']
];

const VIEW_PROPS = [
    ['title', '`Bind<string>`', '“Page 2 of 3”', 'What screen readers call the view.'],
    ['key', '`Bind<string>`', '`\'\'`', 'Names the view in `value`; the JSX `key` is read too.'],
    ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Content made when the view is first in sight, besides the JSX children.'],
    ['lazy, keepAlive', '`Bind<boolean | undefined>`', '`undefined`', 'The view’s own settings; `undefined` follows the multi-view.'],
    ['visible, enabled', '`Bind<boolean>`', '`true`', 'A hidden view takes no room and is skipped; a disabled one is skipped by `next()` and `previous()` and refused by `goTo()`.']
];

const MEMBERS = [
    ['onSelecting', 'event', 'The view in sight is about to change (`from`, `to`, `fromView`, `toView`, `byUser`); `cancel = true` keeps the one there.'],
    ['onSelectionChanged', 'event', 'The view in sight changed (`index`, `view`, `previous`, `byUser`: by a swipe, else programmatically).'],
    ['views', 'read-only', 'The views in order, hidden ones too.'],
    ['selectedView, selectedIndex', 'read-only', 'The view in sight and its index; `null` and -1 when there is none.'],
    ['count', 'read-only', 'How many views there are.'],
    ['next(), previous()', '`Promise<boolean>`', 'Goes to the next or the previous view that is shown and enabled; `false` at an end without `loop`, or when refused.'],
    ['goTo(view)', '`Promise<boolean>`', 'Goes to a view, by index, key or the `View` itself; `onSelecting` is asked first. A view’s own `select()` does the same.'],
    ['add(view), insert(index, view)', '`View`', 'Adds a view at the end or at an index; one from another multi-view moves here.'],
    ['remove(view)', '`boolean`', 'Removes a view and disposes it; the sight moves to a neighbour.']
];

const A11Y = [
    ['Group', 'A `group` named “Pages” in the kit language; several on one page: give each its own `label`.'],
    ['A view', 'A `group` named by its `title`, else “Page 2 of 3”; the views out of sight are hidden from readers and from the keys (`inert`), so Tab moves only inside the view in sight.'],
    ['Moving', 'A swipe needs a finger or a mouse: give the keys a way too, a `Tabs`, a `Stepper` or buttons bound to the same `value`, as the examples do.']
];

const HOOKS = [
    ['.mx-multi-view', 'The multi-view. `data-swipe` when a drag moves it, `data-dragging` while one does, `data-still` with `animated` off.'],
    ['.mx-multi-view__viewport, .mx-multi-view__track', 'The frame that clips the views and the track that slides in it (`data-dragging`, `data-no-motion`).'],
    ['.mx-multi-view__view', 'A view (`aria-hidden`, `inert` out of sight).']
];

const TOKENS = [
    ['multi-view.frame, .view', 'Units: the frame (`swipeable`, `dragging`) and a view.'],
    ['multi-view.gap', 'Between the views, seen while a finger drags them.']
];

export default function MultiViewPage() {
    return (
        <>
            <p class="lead">
                Pages side by side, one in sight: a swipe or a drag brings the next one, and so do <code>next()</code>, <code>previous()</code> and{' '}
                <code>goTo()</code>, or a <a rel="router" href="/tabs">Tabs</a>, a <a rel="router" href="/stepper">Stepper</a> or buttons bound to the
                same value. The panels of a tab strip without the strip.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { MultiView, View } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Pages driven by a stepper">
                <p>
                    <Rich text="The `View` children are the pages; the one in sight is `value` (a view’s `key`, else its index), `x-model` binds it two-way. Here a `Stepper` shares the value: a press on a step and a swipe on a page move both. A page is built when first in sight (`lazy`)." />
                </p>
                <Example stack files={code('Pages.tsx')}>
                    <Pages />
                </Example>
            </Section>

            <Section anchor="lazy" title="Built when first in sight, kept or not">
                <p>
                    <Rich text="`lazy` (the default) builds a view when it first comes into sight and keeps it; `keepAlive={false}` disposes what a view’s `content` made while it is out of sight, and makes it again the next time. The JSX children stay either way, as in `Tabs`." />
                </p>
                <Example stack files={code('Lazy.tsx')}>
                    <Lazy />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="Made with `new`, views added with `add()` and `insert()`, removed with `remove()`; `loop` goes around the ends, `animated={false}` shows the next view at once." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
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
                <h3>MultiView props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>View props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={VIEW_PROPS} />
                <h3>Events, properties and methods</h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
