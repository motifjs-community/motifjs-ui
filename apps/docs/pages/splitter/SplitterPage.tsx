import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Collapsible from './examples/Collapsible';
import Nested from './examples/Nested';
import Sizes from './examples/Sizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['orientation', '`Bind<LayoutOrientation>`', "`'horizontal'`", '`horizontal`: the panes side by side; `vertical`: one under the other.'],
    ['resizable', '`Bind<boolean>`', '`true`', 'The handles can be dragged and moved with the keys (a pane’s own `resizable` wins).'],
    ['collapsible', '`Bind<boolean>`', '`false`', 'Every pane can be hidden from the handle next to it (a pane’s own `collapsible` wins).'],
    ['step', '`Bind<number>`', '`10`', 'Pixels an arrow key moves a handle.'],
    ['sizes', '`Bind<readonly (number | string | null)[] | null>`', '`null`', 'The panes’ sizes in pane order (pixels, a share or `null`); given, they take the place of the panes’ own `size`. After a drag or a key the pixels are written to `x-model`.']
];

const PANE_PROPS = [
    ['size', '`Bind<number | string | null>`', '`null`', 'Pixels, a share (`\'30%\'`) of the room the shares divide, or `null` for an equal share of what is left.'],
    ['minSize, maxSize', '`Bind<number>`, `Bind<number | null>`', '`0`, `null`', 'The least and the most it gets, in pixels.'],
    ['collapsible', '`Bind<boolean | undefined>`', '`undefined`', 'The handles next to it can hide it; `undefined` follows the splitter.'],
    ['collapsed', '`Bind<boolean>`', '`false`', 'Hidden, the neighbours taking its room.'],
    ['resizable', '`Bind<boolean>`', '`true`', 'The handles next to it can change its size.'],
    ['key', '`Bind<string>`', '`\'\'`', 'Names the pane; the JSX `key` is read too.'],
    ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Content made with the pane, besides the JSX children.'],
    ['padding, scrollable, variant, text', 'as `Panel`', '', 'A pane is a `Panel`: its padding, its own scrolling, a frame, a name (a region).']
];

const MEMBERS = [
    ['onResizing', 'event', 'A handle is being dragged (`handle`, `sizes` in pixels).'],
    ['onResized', 'event', 'A drag ended or a key moved a handle (`handle`, `sizes`).'],
    ['onCollapsing', 'event', 'A pane is about to be hidden or shown again (`pane`, `index`, `collapsed`, `byUser`); `cancel = true` leaves it.'],
    ['onCollapsed', 'event', 'A pane was hidden or shown again.'],
    ['panes', 'read-only', 'The panes in order, hidden ones too.'],
    ['currentSizes', 'read-only', 'The panes’ pixels along the split now; 0 for a hidden pane.'],
    ['count', 'read-only', 'How many panes there are.'],
    ['add(pane), insert(index, pane)', '`SplitPane`', 'Adds a pane at the end or at an index.'],
    ['remove(pane)', '`boolean`', 'Removes a pane and disposes it.'],
    ['collapse(pane), expand(pane)', '`boolean`', 'Hides a pane (by index or the pane itself), or shows it again; `onCollapsing` is asked first. A pane’s own `collapse()` and `expand()` do the same.']
];

const KEYS = [
    ['Tab', 'Each handle that can move or hide a pane is a stop, between the panes it lies between.'],
    ['Arrow keys', 'Left and Right (Up and Down one under the other) move the handle by `step` pixels, within the panes’ least and most sizes; the other way round in a right-to-left page.'],
    ['Home, End', 'Give the pane before the handle its least, or its most.'],
    ['Enter', 'Hides the pane before the handle, or shows it again; when that pane cannot be hidden, the one after.']
];

const A11Y = [
    ['A handle', 'A `separator` named “Resize” in the kit language, with `aria-controls` on the pane before it, `aria-orientation`, and `aria-valuenow` as that pane’s share of the two beside the handle.'],
    ['Fold buttons', 'Buttons named “Hide the pane” and “Show the pane”, out of the Tab order: Enter on the handle does the same.'],
    ['A hidden pane', 'Out of sight and `inert`; focus inside it moves to the handle.'],
    ['Panes', 'A pane with a `text` is a `region` of that name.']
];

const HOOKS = [
    ['.mx-splitter', 'The splitter. `data-orientation`, `data-dragging` while a handle is dragged.'],
    ['.mx-splitter__pane', 'A pane (a `Panel`). `data-collapsed` while hidden.'],
    ['.mx-splitter__handle', 'A handle. `data-resizable`, `data-dragging`.'],
    ['.mx-splitter__grip, .mx-splitter__fold, .mx-splitter__fold-glyph', 'The grip in the middle of a handle, the fold buttons at either end of it (`data-side`), their arrows.']
];

const TOKENS = [
    ['splitter.handle, .line, .grip, .fold, .fold-glyph, .pane', 'Units: the handle (`focus`), the line along it (`active`, `disabled`), the grip (`active`, `disabled`), the fold buttons (`hover`, `pressed`, `focus`) and their arrows, a pane (`collapsed`).'],
    ['splitter.size, .line-width, .active-width, .grip-length, .grip-thickness', 'The handle’s thickness, the line’s, the line’s under the pointer, the grip’s size.']
];

export default function SplitterPage() {
    return (
        <>
            <p class="lead">
                Panes side by side or one under the other, as many as needed, with a handle between each two that the pointer drags and the
                keys move. A handle resizes the two panes beside it; a pane may be hidden from its handle, and may hold another splitter.
                For two panes with one fixed, see <a rel="router" href="/layout">SplitContainer</a>.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Splitter, SplitPane } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Pixels, shares and the rest">
                <p>
                    <Rich text="Each `SplitPane` says its `size`: pixels stay pixels when the splitter changes size, a share (`'30%'`) divides the room the shares get, and a pane without a size takes an equal part of what is left. `minSize` and `maxSize` hold the handles. Drag a handle, or focus it and use the arrow keys, Home and End." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="collapsible" title="Hiding a pane">
                <p>
                    <Rich text="A `collapsible` pane gets a button on the handle next to it; Enter on the handle and a double press do the same. The neighbours take its room, and it comes back where it was. `onCollapsing` may refuse, `onCollapsed` tells." />
                </p>
                <Example stack files={code('Collapsible.tsx')}>
                    <Collapsible />
                </Example>
            </Section>

            <Section anchor="nested" title="One inside another">
                <p>
                    <Rich text="A pane is a `Panel`: put a `Splitter` of the other `orientation` in it for an editor over an output, next to a tree." />
                </p>
                <Example stack files={code('Nested.tsx')}>
                    <Nested />
                </Example>
            </Section>

            <Section anchor="sizes" title="Keeping the layout">
                <p>
                    <Rich text="After every move the panes’ pixels are written to `x-model` (and `onResized` tells). Give them back as `sizes` to restore a layout; `null` starts from the panes’ own sizes again." />
                </p>
                <Example stack files={code('Sizes.tsx')}>
                    <Sizes />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'What it does']} rows={KEYS} />
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
                <h3>Splitter props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>SplitPane props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PANE_PROPS} />
                <h3>Events, properties and methods</h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
