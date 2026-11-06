import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Groups from './examples/Groups';
import Handle from './examples/Handle';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly T[]>`', '—', 'The items, each drawn with `itemTemplate`; without them the JSX children are the items.'],
    ['itemTemplate', '`(item, index) => ComponentBase`', 'the item’s text', 'Makes an item’s component. A function, so it is not bound like the other props.'],
    ['handle', '`Bind<string | null>`', '`null`', 'A selector inside an item that takes the drag and the keys; without one the whole item does.'],
    ['group', '`Bind<string | null>`', '`null`', 'Sortables of one group take each other’s items.'],
    ['allowReordering', '`Bind<boolean>`', '`true`', 'The items can be moved; `false` leaves them as they are.'],
    ['orientation', '`Bind<SortableOrientation>`', "`'vertical'`", '`vertical` or `horizontal`: the drop line and the move keys follow.'],
    ['label', '`Bind<string>`', "`''`", 'What screen readers call the list.']
];

const MEMBERS = [
    ['onDragStarting', 'event', 'A drag (or a move by the keys) is about to start (`item`, `fromIndex`); `cancel = true` refuses.'],
    ['onDragChanging', 'event', 'The place it would land changed (`to`, `toIndex`); `cancel = true` refuses that place.'],
    ['onDragEnding', 'event', 'About to drop; `cancel = true` leaves everything as it was.'],
    ['onReorder', 'event', 'An item moved within this sortable (`fromIndex`, `toIndex`, `item`), by a drop or the keys. Reorder your data here.'],
    ['onRemove, onAdd', 'event', 'An item went to another sortable of the group, and came into one: `from`, `to`, the indexes and the item. Move the data between your arrays here.'],
    ['move(fromIndex, toIndex)', '`boolean`', 'Moves an item programmatically as a drop would, telling `onReorder`.'],
    ['elements', 'read-only', 'The items’ elements, in order.'],
    ['isDragging', 'read-only', 'An item is being dragged.'],
    ['refresh()', '`void`', 'Re-reads the items after they have been changed in place.']
];

const BEHAVIOUR = [
    ['Dragging', 'With the pointer after a few pixels; with a finger after a long press (a finger that moves before that scrolls). A copy follows the pointer, the item stays faint in its place, a line shows where it would land; the list scrolls near its edges.'],
    ['Dropping', 'The item’s element moves there at once and `onReorder` says from where to where: your data is yours to reorder. Across sortables of a group, `onRemove` and `onAdd` say the same on both sides.'],
    ['Items from data', 'With `items`, each item keeps its component as the order changes (the rows are keyed by item): reordering your array moves the rows, no row is made again.'],
    ['Keys', 'The focused item (its handle when there is one) takes Ctrl + Up / Down (Left / Right side by side), Ctrl + Home / End; each move is told to `onReorder` and read out.'],
    ['Escape', 'Cancels a drag; nothing moves.']
];

const A11Y = [
    ['List', 'A `group` named by `label`; the items are whatever you put in it.'],
    ['Items', 'One Tab stop that moves between the items with the keys; an item with a focusable part of its own keeps that. A handle is a button named by you.'],
    ['Moves', 'Each move by the keys is read out: “Moved to 2 of 5”.']
];

const HOOKS = [
    ['.mx-sortable', 'The list. `data-orientation`, `data-sortable`, `data-drop-target` while a dragged item may land here.'],
    ['.mx-sortable__item', 'Each item. `data-dragging` on the one being dragged.'],
    ['.mx-sortable__line', 'The line where a drop would land.'],
    ['.mx-sortable__ghost', 'The copy after the pointer.']
];

const TOKENS = [
    ['sortable.container, .item, .line, .ghost', 'Units: the list (`target`), an item (`sortable`, `dragging`, `focus`), the line (its thickness and colour; standing in a horizontal list), the copy.'],
    ['sortable.gap', 'Between the items.']
];

export default function SortablePage() {
    return (
        <>
            <p class="lead">
              <Rich text="Items the user puts in order by dragging them, with the pointer or a finger, or with the keys; lists of one group take each other’s items. A drop moves the element and tells you the indexes: your data stays yours." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Sortable } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Children as items">
                <p>
                    <Rich text="The JSX children are the items. Drag one, or focus it and press Ctrl + Down; `onReorder` says from where to where, and the app reorders its own data." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="groups" title="Items from data, across lists">
                <p>
                    <Rich text="`items` with an `itemTemplate` draws the rows from your data and keeps each row as the order changes. Two sortables of one `group` take each other’s items: `onRemove` and `onAdd` tell both sides, and each list draws its array again." />
                </p>
                <Example stack files={code('Groups.tsx')}>
                    <Groups />
                </Example>
            </Section>

            <Section anchor="handle" title="A handle, side by side, a refused drag">
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
