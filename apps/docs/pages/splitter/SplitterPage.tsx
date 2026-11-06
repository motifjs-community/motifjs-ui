import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Collapsible from './examples/Collapsible';
import Nested from './examples/Nested';
import Sizes from './examples/Sizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['orientation', '`Bind<LayoutOrientation>`', "`'horizontal'`", '`horizontal` places the panes side by side, and `vertical` stacks them.'],
    ['resizable', '`Bind<boolean>`', '`true`', 'Lets users drag handles and move them with the keyboard. A pane\'s own `resizable` takes precedence.'],
    ['collapsible', '`Bind<boolean>`', '`false`', 'Lets every pane be collapsed from its adjacent handle. A pane\'s own `collapsible` takes precedence.'],
    ['step', '`Bind<number>`', '`10`', 'The distance an arrow key moves a handle, in pixels.'],
    ['sizes', '`Bind<readonly (number | string | null)[] | null>`', '`null`', 'The pane sizes in order (pixels, a percentage or `null`). When set, they replace each pane\'s own `size`. After a drag or key press, the sizes in pixels are written to `x-model`.']
];

const PANE_PROPS = [
    ['size', '`Bind<number | string | null>`', '`null`', 'Pixels, a percentage (`\'30%\'`) of the space divided by percentages, or `null` for an equal share of what remains.'],
    ['minSize, maxSize', '`Bind<number>`, `Bind<number | null>`', '`0`, `null`', 'The minimum and maximum size, in pixels.'],
    ['collapsible', '`Bind<boolean | undefined>`', '`undefined`', 'Lets the adjacent handles collapse the pane. `undefined` inherits from the splitter.'],
    ['collapsed', '`Bind<boolean>`', '`false`', 'Indicates that the pane is collapsed, and adjacent panes take its space.'],
    ['resizable', '`Bind<boolean>`', '`true`', 'Lets the adjacent handles change its size.'],
    ['key', '`Bind<string>`', '`\'\'`', 'Identifies the pane. The JSX `key` is also read.'],
    ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Content created with the pane, in addition to the JSX children.'],
    ['padding, scrollable, variant, text', 'Same as `Panel`', '', 'A pane is a `Panel`, with padding, scrolling, a frame and an accessible name (a region).']
];

const MEMBERS = [
    ['onResizing', 'event', 'Occurs while a handle is dragged (`handle`, `sizes` in pixels).'],
    ['onResized', 'event', 'Occurs after a drag ends or a key moves a handle (`handle`, `sizes`).'],
    ['onCollapsing', 'event', 'Occurs before a pane is collapsed or expanded (`pane`, `index`, `collapsed`, `byUser`). Set `cancel = true` to keep the current state.'],
    ['onCollapsed', 'event', 'Occurs after a pane is collapsed or expanded.'],
    ['panes', 'read-only', 'The panes in order, including collapsed ones.'],
    ['currentSizes', 'read-only', 'The current pane sizes in pixels, with 0 for a collapsed pane.'],
    ['count', 'read-only', 'The number of panes.'],
    ['add(pane), insert(index, pane)', '`SplitPane`', 'Adds a pane at the end or at an index.'],
    ['remove(pane)', '`boolean`', 'Removes a pane and disposes it.'],
    ['collapse(pane), expand(pane)', '`boolean`', 'Collapses or expands a pane, by index or object. `onCollapsing` is raised first. A pane\'s own `collapse()` and `expand()` do the same.']
];

const KEYS = [
    ['Tab', 'Each handle that can move or collapse a pane is a Tab stop between its panes.'],
    ['Arrow keys', 'Left and Right (Up and Down when stacked) move the handle by `step` pixels, within the panes\' minimum and maximum sizes. These are reversed on right-to-left pages.'],
    ['Home, End', 'Sets the pane before the handle to its minimum or maximum size.'],
    ['Enter', 'Collapses the pane before the handle or expands it. If that pane cannot collapse, the pane after it is used.']
];

const A11Y = [
    ['A handle', 'A `separator` named “Resize” in the kit language, with `aria-controls` pointing to the pane before it, `aria-orientation`, and `aria-valuenow` as that pane\'s share of the two panes next to the handle.'],
    ['Fold buttons', 'Buttons named “Hide the pane” and “Show the pane”, outside the Tab order. Enter on the handle does the same.'],
    ['A hidden pane', 'Hidden and `inert`. Focus inside it moves to the handle.'],
    ['Panes', 'A pane with `text` is a `region` with that name.']
];

const HOOKS = [
    ['.mx-splitter', 'The splitter. `data-orientation`, and `data-dragging` while a handle is dragged.'],
    ['.mx-splitter__pane', 'A pane (a `Panel`). `data-collapsed` while collapsed.'],
    ['.mx-splitter__handle', 'A handle. `data-resizable`, `data-dragging`.'],
    ['.mx-splitter__grip, .mx-splitter__fold, .mx-splitter__fold-glyph', 'The grip in the middle of a handle, the collapse buttons at either end (`data-side`), and their arrows.']
];

const TOKENS = [
    ['splitter.handle, .line, .grip, .fold, .fold-glyph, .pane', 'Units: the handle (`focus`), the line along it (`active`, `disabled`), the grip (`active`, `disabled`), the collapse buttons (`hover`, `pressed`, `focus`) and their arrows, and a pane (`collapsed`).'],
    ['splitter.size, .line-width, .active-width, .grip-length, .grip-thickness', 'The thickness of the handle and line, the line thickness on hover, and the grip size.']
];

export default function SplitterPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Divides space into any number of resizable panes, arranged side by side or stacked. A handle between each pair of panes can be dragged or moved with the keyboard, and it resizes the two panes next to it. Panes can be collapsed from their handle and can contain another splitter. For two panes where one has a fixed size, see [SplitContainer](/layout)." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Splitter, SplitPane } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Pixels, percentages and remaining space">
                <p>
                    <Rich text="Each `SplitPane` sets its `size`. A pixel value stays fixed when the splitter resizes, a percentage (`'30%'`) divides the space available to percentages, and a pane without a size takes an equal part of what remains. `minSize` and `maxSize` limit the handles. Drag a handle, or focus it and use the arrow keys, Home and End." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="collapsible" title="Collapsing panes">
                <p>
                    <Rich text="A `collapsible` pane gets a button on the adjacent handle. Enter on the handle and a double-click do the same. Adjacent panes take its space, and it returns to its previous size when expanded. `onCollapsing` can cancel the action, and `onCollapsed` reports it." />
                </p>
                <Example stack files={code('Collapsible.tsx')}>
                    <Collapsible />
                </Example>
            </Section>

            <Section anchor="nested" title="Nested splitters">
                <p>
                    <Rich text="A pane is a `Panel`, so you can place a `Splitter` with the other `orientation` inside it, for example to show an editor above an output panel next to a tree." />
                </p>
                <Example stack files={code('Nested.tsx')}>
                    <Nested />
                </Example>
            </Section>

            <Section anchor="sizes" title="Persisting the layout">
                <p>
                    <Rich text="After every move, the pane sizes in pixels are written to `x-model`, and `onResized` reports them. Pass them back as `sizes` to restore a layout. `null` returns to the panes' own sizes." />
                </p>
                <Example stack files={code('Sizes.tsx')}>
                    <Sizes />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
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
                  <Rich text="Splitter props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="SplitPane props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PANE_PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
