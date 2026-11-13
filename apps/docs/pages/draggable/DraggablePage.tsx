import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Free from './examples/Free';
import Programmatic from './examples/Programmatic';
import Targets from './examples/Targets';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['axis', '`Bind<DragAxis>`', "`'both'`", '`both`, `x` or `y`.'],
    ['boundary', "`Bind<'parent' | ComponentBase | null>`", '`null`', 'The area it stays inside: its parent, or a component that contains it.'],
    ['handle', '`Bind<string | null>`', '`null`', 'A selector inside the draggable. Only this part starts a drag, and it receives the Tab stop and keyboard input.'],
    ['clone', '`Bind<boolean>`', '`false`', 'A copy follows the pointer and the draggable stays in place, ready to be dropped on a target.'],
    ['group', '`Bind<string | null>`', '`null`', 'Drop targets in the same group accept it.'],
    ['data', '`unknown`', '—', 'Custom data passed to the drop target on drop.'],
    ['step', '`Bind<number>`', '`10`', 'The number of pixels an arrow key moves it.'],
    ['position', '`Bind<DragPosition | null>`', '`null`', 'The position in pixels from its layout position. When set, it is applied, and after every drag or key press the new position is written to `x-model`.']
];

const TARGET_PROPS = [
    ['group', '`Bind<string | null>`', '`null`', 'Accepts draggables in this group. `null` accepts those without a group.'],
    ['onDragEntering', 'event', 'Occurs when a draggable enters (`draggable`, `data`). Set `cancel = true` to reject it.'],
    ['onDragLeaving', 'event', 'Occurs when the draggable leaves.'],
    ['onDropped', 'event', 'Occurs when a draggable is dropped on it. Your code moves the data.']
];

const MEMBERS = [
    ['onDragStarting', 'event', 'Occurs before a drag starts. Set `cancel = true` to keep it in place.'],
    ['onDragging', 'event', 'Occurs during a drag (`x`, `y`, and the `target` under the pointer).'],
    ['onDragEnding', 'event', 'Occurs when the pointer is released. Set `cancel = true` to return it to where it started.'],
    ['onDragEnded', 'event', 'Occurs when the drag ends (`x`, `y`, `target`, `dropped`).'],
    ['currentPosition', 'read-only', 'The current position.'],
    ['isDragging', 'read-only', 'Indicates that a drag is in progress.'],
    ['handlePart', 'read-only', 'The handle that `handle` names, which takes the pointer and the keyboard; `null` when the draggable itself takes them.']
];

const KEYS = [
    ['Tab', 'The draggable, or its handle, is one Tab stop.'],
    ['Arrow keys', 'Moves it by `step` pixels along its axis and inside its boundary, and the new position is announced.'],
    ['Escape', 'During a drag, cancels it and returns the item to where it started.']
];

const A11Y = [
    ['The draggable', 'A `group` with `aria-roledescription="draggable"`, named “Move” in the kit language. With a `handle`, that element is a button with this name instead.'],
    ['Dragging', 'A long press lifts it on a touch screen. During a drag, it lets pointer events pass through so the target underneath can be detected, and a `clone` copy follows the pointer.'],
    ['Targets', 'Marked while a drag from their group is active, while the draggable is over them, and when they reject it.']
];

const HOOKS = [
    ['.mx-draggable', 'The draggable. `data-dragging`, `data-handle`, `data-clone`, `data-axis`.'],
    ['.mx-draggable__handle, .mx-draggable__ghost', 'The handle specified by `handle`, and the copy that follows the pointer.'],
    ['.mx-drop-target', 'A target. `data-drop-active` during a drag from its group, `data-drop-over`, `data-drop-refused`.']
];

const TOKENS = [
    ['draggable.box, .handle, .ghost', 'Units: the draggable (`draggable`, `dragging`, `focus`), its handle (`hover`, `focus`) and the copy.'],
    ['drop-target.target', 'Unit: a target (`active`, `over`, `refused`).']
];

export default function DraggablePage() {
    return (
        <>
            <p class="lead">
              <Rich text="Makes any content movable with the pointer, touch or the arrow keys, optionally along one axis, inside a boundary, by a handle or as a copy. `DropTarget` defines areas that accept it. To reorder items in a list, see [Sortable](/sortable)." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Draggable, DropTarget } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Moving content">
                <p>
                    <Rich text="JSX children are the movable content. `boundary` keeps it inside its parent or a component, `axis` limits it to one direction, and `handle` sets the only part that responds to the pointer and keyboard. A drag writes the position to `x-model`, `onDragEnded` reports it, and Escape returns the content to its start." />
                </p>
                <Example stack files={code('Free.tsx')}>
                    <Free />
                </Example>
            </Section>

            <Section anchor="targets" title="Drop targets">
                <p>
                    <Rich text="A `DropTarget` in the same `group` accepts a draggable dropped on it and receives the draggable's `data` in `onDropped`. `onDragEntering` can reject it. With `clone`, a copy follows the pointer and the original stays, so one item can be dropped many times. Your code decides what a drop does to your data." />
                </p>
                <Example stack files={code('Targets.tsx')}>
                    <Targets />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`position` sets the location in pixels from the element's layout position, and `x-model` receives it after every drag or key press, so you can save and restore it." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
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
                  <Rich text="Draggable props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="DropTarget props and events" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={TARGET_PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
