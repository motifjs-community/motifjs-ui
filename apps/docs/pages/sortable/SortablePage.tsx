import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Groups from './examples/Groups';
import Handle from './examples/Handle';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly T[]>`', '—', 'The items, each drawn with `itemTemplate`. Without them, the JSX children are the items.'],
    ['itemTemplate', '`(item, index) => ComponentBase`', 'The item text', 'Creates the component for an item. Because it is a function, it is not bound like the other props.'],
    ['handle', '`Bind<string | null>`', '`null`', 'A selector inside an item for the part that handles dragging and the keyboard. Without it, the whole item does.'],
    ['group', '`Bind<string | null>`', '`null`', 'Sortables in the same group can exchange items.'],
    ['allowReordering', '`Bind<boolean>`', '`true`', 'Allows items to be moved. `false` keeps them in place.'],
    ['orientation', '`Bind<SortableOrientation>`', "`'vertical'`", '`vertical` or `horizontal`. The drop line and the move keys follow it.'],
    ['label', '`Bind<string>`', "`''`", 'The accessible name of the list.']
];

const MEMBERS = [
    ['onDragStarting', 'event', 'Occurs before a drag or keyboard move starts (`item`, `fromIndex`). Set `cancel = true` to prevent it.'],
    ['onDragChanging', 'event', 'Occurs when the drop position changes (`to`, `toIndex`). Set `cancel = true` to reject that position.'],
    ['onDragEnding', 'event', 'Occurs before the drop. Set `cancel = true` to leave everything unchanged.'],
    ['onReorder', 'event', 'Occurs when an item moves within this sortable (`fromIndex`, `toIndex`, `item`), by a drop or the keyboard. Reorder your data here.'],
    ['onRemove, onAdd', 'event', 'Occur when an item leaves for another sortable in the group and when it arrives, with `from`, `to`, the indexes and the item. Move the data between your arrays here.'],
    ['move(fromIndex, toIndex)', '`boolean`', 'Moves an item programmatically as a drop would, and raises `onReorder`.'],
    ['itemParts()', '`ComponentBase[]`', 'The components of the items, in order: the rows of `items`, or the children.'],
    ['isDragging', 'read-only', 'Indicates that an item is being dragged.'],
    ['refresh()', '`void`', 'Re-reads the items after they have been changed in place.']
];

const BEHAVIOUR = [
    ['Dragging', 'A drag starts after a few pixels with the pointer, or after a long press with a finger (a finger that moves first scrolls). A copy follows the pointer, the item stays faded in place, and a line shows the drop position. The list scrolls near its edges.'],
    ['Dropping', 'The item\'s element moves there immediately, and `onReorder` reports the old and new positions. Your code reorders the data. Between sortables in a group, `onRemove` and `onAdd` report the same to both sides.'],
    ['Binding to data', 'With `items`, each item keeps its component when the order changes, because rows are keyed by item. Reordering your array moves the rows without recreating them.'],
    ['Keys', 'The focused item, or its handle if it has one, responds to Ctrl + Up and Down (Left and Right when horizontal) and Ctrl + Home and End. Each move is reported to `onReorder` and announced.'],
    ['Escape', 'Cancels a drag, and nothing moves.']
];

const A11Y = [
    ['List', 'A `group` named by `label`. The items are whatever you put in it.'],
    ['Items', 'One Tab stop that moves between items with the keyboard. An item with its own focusable element keeps it. A handle is a button that you name.'],
    ['Moves', 'Each keyboard move is announced: “Moved to 2 of 5”.']
];

const HOOKS = [
    ['.mx-sortable', 'The list. `data-orientation`, `data-sortable`, and `data-drop-target` while a dragged item can land here.'],
    ['.mx-sortable__item', 'Each item. `data-dragging` on the item being dragged.'],
    ['.mx-sortable__line', 'The drop indicator line.'],
    ['.mx-sortable__ghost', 'The copy that follows the pointer.']
];

const TOKENS = [
    ['sortable.container, .item, .line, .ghost', 'Units: the list (`target`), an item (`sortable`, `dragging`, `focus`), the line (its thickness and color, vertical in a horizontal list), and the copy.'],
    ['sortable.gap', 'The gap between items.']
];

export default function SortablePage() {
    return (
        <>
            <p class="lead">
              <Rich text="Lets users reorder items by dragging them with the pointer or a finger, or with the keyboard. Lists in the same group can exchange items. A drop moves the element and reports the indexes, while your data stays under your control." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Sortable } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Using children as items">
                <p>
                    <Rich text="JSX children are the items. Drag one, or focus it and press Ctrl + Down. `onReorder` reports the old and new positions, and the application reorders its own data." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="groups" title="Binding to data and moving between lists">
                <p>
                    <Rich text="`items` with an `itemTemplate` renders rows from your data and keeps each row when the order changes. Two sortables in the same `group` can exchange items. `onRemove` and `onAdd` notify both sides, and each list redraws its array." />
                </p>
                <Example stack files={code('Groups.tsx')}>
                    <Groups />
                </Example>
            </Section>

            <Section anchor="handle" title="Drag handles, horizontal lists and canceling a drag">
                <Example stack files={code('Handle.tsx')}>
                    <Handle />
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
