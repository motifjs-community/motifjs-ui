import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Free from './examples/Free';
import Programmatic from './examples/Programmatic';
import Targets from './examples/Targets';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['axis', '`Bind<DragAxis>`', "`'both'`", '`both`, `x` or `y`.'],
    ['boundary', "`Bind<'parent' | HTMLElement | null>`", '`null`', 'The draggable stays inside this: its parent, or an element it lies in.'],
    ['handle', '`Bind<string | null>`', '`null`', 'A selector inside the draggable: only a press there drags it, and it takes the Tab stop and the keys.'],
    ['clone', '`Bind<boolean>`', '`false`', 'A copy follows the pointer and the draggable stays where it is; for a drop target to take.'],
    ['group', '`Bind<string | null>`', '`null`', 'Drop targets of the same group take it.'],
    ['data', '`unknown`', '—', 'Anything of your own, given to the drop target with the drop.'],
    ['step', '`Bind<number>`', '`10`', 'Pixels an arrow key moves it by.'],
    ['position', '`Bind<DragPosition | null>`', '`null`', 'Where it stands, in pixels from where it was laid out: given, it is applied; after every drag or key the new place is written to `x-model`.']
];

const TARGET_PROPS = [
    ['group', '`Bind<string | null>`', '`null`', 'Takes the draggables of this group; `null` takes those without one.'],
    ['onDragEntering', 'event', 'A draggable came over it (`draggable`, `data`); `cancel = true` refuses it.'],
    ['onDragLeaving', 'event', 'The draggable left it.'],
    ['onDropped', 'event', 'A draggable was dropped on it: your data is yours to move.']
];

const MEMBERS = [
    ['onDragStarting', 'event', 'A drag is about to begin; `cancel = true` keeps it in place.'],
    ['onDragging', 'event', 'It is being dragged (`x`, `y`, the `target` under the pointer).'],
    ['onDragEnding', 'event', 'The pointer let go; `cancel = true` brings it back where it started.'],
    ['onDragEnded', 'event', 'The drag ended (`x`, `y`, `target`, `dropped`).'],
    ['currentPosition', 'read-only', 'Where it stands now.'],
    ['isDragging', 'read-only', 'A drag is under way.'],
    ['handleElement', 'read-only', 'What takes the press and the keys: the handle, else the draggable itself.']
];

const KEYS = [
    ['Tab', 'The draggable (or its handle) is one stop.'],
    ['Arrow keys', 'Move it by `step` pixels along its axis, inside its boundary; the new place is read out.'],
    ['Escape', 'While dragging: lets go and brings it back where it started.']
];

const A11Y = [
    ['The draggable', 'A `group` with `aria-roledescription="draggable"` named “Move” in the kit language; with a `handle`, that element is a button of that name instead.'],
    ['Dragging', 'A long press lifts it on a touch screen. While it is dragged it lets the pointer through, so the target under it is found; the copy of a `clone` follows the pointer.'],
    ['Targets', 'Marked while a drag of their group is under way, while the draggable is over them, and when they refuse it.']
];

const HOOKS = [
    ['.mx-draggable', 'The draggable. `data-dragging`, `data-handle`, `data-clone`, `data-axis`.'],
    ['.mx-draggable__handle, .mx-draggable__ghost', 'The handle named by `handle`; the copy after the pointer.'],
    ['.mx-drop-target', 'A target. `data-drop-active` during a drag of its group, `data-drop-over`, `data-drop-refused`.']
];

const TOKENS = [
    ['draggable.box, .handle, .ghost', 'Units: the draggable (`draggable`, `dragging`, `focus`), its handle (`hover`, `focus`), the copy.'],
    ['drop-target.target', 'Unit: a target (`active`, `over`, `refused`).']
];

export default function DraggablePage() {
    return (
        <>
            <p class="lead">
                Anything the user moves with the pointer, a finger or the arrow keys, along an axis or inside a boundary, by a handle or as a copy;
                and the targets that take it. For items that change places in a list, see <a rel="router" href="/sortable">Sortable</a>.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Draggable, DropTarget } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Moving things">
                <p>
                    <Rich text="The JSX children are what moves. `boundary` keeps it inside its parent or an element, `axis` keeps it on a line, `handle` names the only part that takes the press and the keys. A drag writes the place to `x-model` and `onDragEnded` tells it; Escape brings it back." />
                </p>
                <Example stack files={code('Free.tsx')}>
                    <Free />
                </Example>
            </Section>

            <Section anchor="targets" title="Drop targets">
                <p>
                    <Rich text="A `DropTarget` of the same `group` takes a draggable dropped on it and is told in `onDropped` with the draggable’s `data`; `onDragEntering` may refuse. With `clone` a copy follows the pointer and the draggable stays, so one thing can be dropped many times. What a drop does to your data is yours." />
                </p>
                <Example stack files={code('Targets.tsx')}>
                    <Targets />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`position` puts it where you say, in pixels from where it was laid out, and `x-model` takes the place back after every drag or key: kept and restored." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
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
                <h3>Draggable props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>DropTarget props and events</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={TARGET_PROPS} />
                <h3>Events, properties and methods</h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
