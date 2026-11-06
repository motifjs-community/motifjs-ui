import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import BetweenManagers from './examples/BetweenManagers';
import DragDrop from './examples/DragDrop';
import DragOptions from './examples/DragOptions';
import MoveWithKeys from './examples/MoveWithKeys';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const DROPS = [
  ['Along the strip', 'Reorders the tab. A tab dropped among the pinned tabs becomes pinned, and a tab dropped among the others becomes unpinned (`pinOnDrag`).'],
  ['On another strip', 'Moves the tab to the position under the pointer, or to the end when dropped on the empty part of a strip.'],
  ['The middle of a group', 'Moves the tab into that group, after its active tab (`openPosition`).'],
  ['An edge of a group', 'Splits that group and places the tab in a new group on that side. The edge zones are `dropEdgeSize` deep.'],
  ['An edge of the layout', 'A thin band along the sides of the manager (`layoutEdgeSize`). Creates a new group along that whole side (`layoutEdgeDrop`).'],
  ['Ctrl held (Option on a Mac)', 'Opens a copy there instead, if the document can be open twice (`allowDuplicate`, `copyModifier`).'],
  ['A group, by the empty part of its bar or its handle', 'Moves the group with all its tabs beside another group or along an edge of the layout. When dropped into another group or its strip, its tabs join that group.'],
  ['Outside the manager', 'Floats in its own window (see [Dock and floating windows](/tabdocs/dock)). Where floating is not allowed (`allowFloat`), or over a manager outside its `dragGroup`, the drop is refused (`target: \'outside\'`).'],
];

const PROPS = [
  ['allowDrag', '`Bind<boolean>`', '`true`', 'Allows tabs to be dragged. A document\'s own `allowDrag` takes precedence.'],
  ['allowDragGroups', '`Bind<boolean>`', '`true`', 'Allows groups to be dragged by the empty part of their bar.'],
  ['groupDragHandle', '`Bind<boolean>`', '`false`', 'Adds a handle at the start of each group\'s toolbar for dragging the group, even when its tabs fill the bar. Clicking it, or pressing Enter, starts “Move group to…”.'],
  ['dropSides', "`Bind<readonly ('center' | 'left' | 'right' | 'up' | 'down')[]>`", 'all five', 'The positions a drop on a group\'s content can take. A group\'s own `dropSides` takes precedence.'],
  ['dropEdgeSize', '`Bind<number | string>`', "`'33%'`", 'The depth of the edge zones of a group\'s content, in pixels or as a share.'],
  ['layoutEdgeDrop, layoutEdgeSize', '`Bind<boolean>`, `Bind<number>`', '`true`, `16`', 'Allows drops along the edges of the whole layout, and sets the depth of that band in pixels.'],
  ['dragThreshold', '`Bind<number>`', '`5`', 'The distance in pixels the pointer must move before a press becomes a drag.'],
  ['longPressDelay', '`Bind<number>`', '`500`', 'How long, in milliseconds, a finger or pen must rest on a tab before dragging it. A swipe before that scrolls the strip.'],
  ['dragHoverActivate, dragHoverDelay', '`Bind<boolean>`, `Bind<number>`', '`true`, `750`', 'Pausing on a tab of another group while dragging activates it after this many milliseconds.'],
  ['pinOnDrag', '`Bind<boolean>`', '`true`', 'Dragging across the boundary between pinned and other tabs pins or unpins them. `false` keeps each tab on its side.'],
  ['copyModifier', "`Bind<'auto' | 'ctrl' | 'alt' | 'shift' | 'meta' | 'none'>`", "`'auto'`", 'The key that makes a drop a copy: Ctrl, or Option on Apple platforms.'],
  ['dragGroup', '`Bind<string | null>`', '`null`', 'Managers with the same name accept each other\'s tabs and groups.'],
  ['dragGhost, dragAutoScroll', '`Bind<boolean>`', '`true`', 'The copy of the tab under the pointer, and the strip scrolling near its ends.'],
];

const GROUP = [
  ['allowDrop', '`Bind<boolean>`', '`true`', 'Allows drops into and beside the group. Use `false` for a group that accepts nothing. Saved with the layout.'],
  ['dropSides', '`Bind<readonly TabDropSide[] | null>`', '`null`', 'The group\'s own drop sides. `null` uses the manager\'s setting. Saved with the layout.'],
];

const DOCUMENT = [['allowDrag', '`Bind<boolean | undefined>`', 'Overrides the manager\'s setting for this document. `undefined` inherits the manager\'s value.']];

const METHODS = [
  ['move(doc, group, index?)', '`boolean`', 'What a drop on a strip or into a group performs.'],
  ['split(group | null, direction, doc?)', '`TabGroup | null`', 'What a drop on an edge performs. `null` splits the whole layout along that edge.'],
  ['moveGroup(group, target | null, side)', '`boolean`', "Moves a whole group beside `target` (`'left'`, `'right'`, `'up'`, `'down'`), into it (`'center'`), or along an edge of the layout (`target` is `null`)."],
  ['moveInGroup(doc, by)', '`boolean`', 'Moves one position along the strip (`-1` toward the start), without passing the boundary between pinned and other tabs.'],
  ['moveToGroup(doc, which)', '`boolean`', "`'next'`, `'previous'`, or the group on that side (`'left'`, `'right'`, `'up'`, `'down'`). Creates a new group if there is none."],
  ['showMoveTo(doc | group)', '`boolean`', 'Starts "Move to…" from the keyboard (see below).'],
  ['cancelDrag()', '`boolean`', 'Stops a drag or "Move to…" and restores everything.'],
  ['addDropTarget(target, index?)', '`() => void`', 'A custom target, checked before the built-in one: `placeAt(x, y, drag)`, `marks(place, drag)`, `drop(place, drag)`. Returns a function that removes it.'],
  ['dragging', 'read-only, reactive', '`{ document, group, manager, copy }` during a drag, otherwise `null`.'],
  ['dropTargets', 'read-only', 'The targets in the order they are checked.'],
];

const EVENTS = [
  ['onDragStarting(e)', '`{ document, group, pointerType, byKeyboard }`, cancelable. `document` is `null` for a group.'],
  ['onDragOver(e)', "`{ document, from, target, manager, group, index, side, copy, byKeyboard }`. Change the position, or set `cancel` to refuse it. `target` is `'strip'`, `'group'`, `'edge'`, `'float'`, `'dock-guide'`, `'dock-area'` or `'outside'` (refused)."],
  ['onDropping(e)', 'The same, raised just before the drop. Canceling leaves everything in place.'],
  ['onDropped(e)', 'The result: `group` is the new group of a split, and `document` is the copy when one was opened.'],
  ['onDragEnded(e)', '`{ document, from, dropped, byKeyboard }`, raised whether or not it was dropped.'],
  ['onMoving / onMoved, onSplitting / onSplit, onOpening / onOpened, onPinning…', 'Still occur for the action the drop performs, so the model changes in only one way. A tab from another manager arrives through `onOpening` there, after `onMoving` here.'],
];

const KEYS = [
  ['Alt + Shift + Page Up / Page Down', 'Ctrl + Shift + Page Up / Page Down', 'Moves the active tab one position along its strip (`moveTabLeft`, `moveTabRight`).'],
  ['Ctrl + Alt + Right / Left', 'Same', 'Moves the active document to the next or previous group (`moveToNextGroup`, `moveToPreviousGroup`).'],
  ['Ctrl + K, then Shift + an arrow', 'Same', 'Moves to the group on that side, or to a new group there (`moveToGroupLeft`, `…Right`, `…Up`, `…Down`).'],
  ['Ctrl + K, then M', 'Same', 'Opens "Move to…" for the active document (`moveTo`). It is also in the tab menu and the strip menu.'],
];

const MOVE_KEYS = [
  ['Arrows', 'Chooses a side of the group. Pressing the same direction again moves to the next group in that direction or to the edge of the layout, and the opposite direction returns to the middle (`targetLeft`, `targetRight`, `targetUp`, `targetDown`).'],
  ['Tab, Shift + Tab', 'Moves to the middle of the next or previous group (`targetNextGroup`, `targetPreviousGroup`).'],
  ['Enter', 'Moves it there (`targetDrop`).'],
  ['Escape', 'Cancels and leaves everything in place (`targetCancel`). Clicking anywhere does the same.'],
];

const A11Y = [
  ['Every drag has keys', '"Move to…" reaches every position a pointer can: each side of each group, the edges of the layout, and other managers in the same `dragGroup`.'],
  ['Announcements', 'Each position "Move to…" highlights is announced ("New group to the right of group 2", or "cannot go here"), followed by the result: moved, copied, split or canceled.'],
  ['Touch and pen', 'A long press starts the drag, so a swipe still scrolls the strip. Holding still and releasing opens the tab menu.'],
  ['Escape', 'Also cancels a pointer drag, and restores anything activated by pausing on tabs and any strip scrolling.'],
];

const STYLING = [
  ['.mx-tabdocs[data-dragging]', "During a drag: `move`, `copy` or `none`, which is what a drop would do now. The cursor follows it."],
  ['.mx-tabdocs__tab[data-dragging], .mx-tabdocs__group[data-dragging]', 'The tab or group being dragged.'],
  ['.mx-tabdocs__ghost', 'The copy under the pointer, with `data-kind` (`tab`, `group`) and `data-target` (`move`, `copy`, `none`).'],
  ['.mx-tabdocs__drop', 'The translucent area a drop would take. It glides between positions, using the motion tokens (no motion with reduced motion).'],
  ['.mx-tabdocs__insert', 'The marker between two tabs.'],
  ['.mx-tabdocs__grip', "The group's handle (`groupDragHandle`), a button in the group's toolbar."],
  ['tabdocs.drop, drop-fill, insert, ghost', 'Their units (the drag image: `copy`, `refused`; a dragged tab: the `dragging` state of the `tab` unit).'],
];

export default function TabDocsDragPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Drag tabs and whole groups as you would in a code editor: along a strip, to another group, beside a group, along an edge of the layout, or between two managers. The same moves are available from the keyboard, and every drop goes through the methods and events of the action it performs." />
      </p>

      <Section anchor="drag" title="Dragging tabs and groups">
        <p>
          <Rich text="A copy of the tab follows the pointer. A marker shows the position among tabs, and a translucent area shows which half of a group (or all of it) a drop would take. Pausing on a tab of another group activates it, and the strip scrolls near its ends. The content is moved, never recreated." />
        </p>
        <Example files={code('DragDrop.tsx', 'files.tsx')} stack>
          <DragDrop />
        </Example>
        <ApiTable head={['Drop target', 'Result']} rows={DROPS} />
      </Section>

      <Section anchor="options" title="Settings">
        <p>
          <Rich text="Every part of drag and drop is a setting that can change at runtime. A document's own `allowDrag`, and a group's own `allowDrop` and `dropSides`, take precedence over the manager's." />
        </p>
        <Example files={code('DragOptions.tsx', 'files.tsx')} stack>
          <DragOptions />
        </Example>
      </Section>

      <Section anchor="between" title="Between two managers">
        <p>
          <Rich text="Managers that share a `dragGroup` accept each other's tabs and groups. The tab, its panel and its content all move, and the other manager raises its own `onOpening` after `onMoving` in the first." />
        </p>
        <Example files={code('BetweenManagers.tsx', 'files.tsx')} stack>
          <BetweenManagers />
        </Example>
      </Section>

      <Section anchor="keys" title="From the keyboard">
        <p>
          <Rich text="Keys move the active tab along its strip or to another group. “Move to…” (in the tab menu, the strip menu for a whole group, Ctrl+K M or `showMoveTo`) reaches every position a drag can reach, shows the same areas and announces each position." />
        </p>
        <Example files={code('MoveWithKeys.tsx', 'files.tsx')} stack>
          <MoveWithKeys />
        </Example>
        <ApiTable head={['Browser', 'Installed app (desktop keys)', 'Action']} rows={KEYS} />
        <h3>
          <Rich text="In “Move to…”" />
        </h3>
        <ApiTable head={['Key', 'Action']} rows={MOVE_KEYS} />
      </Section>

      <Section anchor="events" title="Changing or refusing a drop">
        <p>
          <Rich text="`onDragOver` sees each position and can change or refuse it, and `onDropping` can still stop the drop. The events of the action then occur (`onMoved`, `onSplit` …), followed by `onDropped`." />
        </p>
        <Code
          code={`
docs.onDragOver((e) => {
  // Reports stay in their own group: no drop anywhere else.
  if (e.document?.type === 'report' && e.group !== e.from) e.cancel = true;
});
docs.onDropping((e) => {
  // A drop on the right edge of a group opens the new group below it instead.
  if (e.target === 'group' && e.side === 'right') e.side = 'down';
});
`}
        />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="api" title="API">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="TabGroup" />
        </h3>
        <ApiTable head={['Property', 'Type', 'Default', 'Description']} rows={GROUP} />
        <h3>
          <Rich text="TabDocument" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={DOCUMENT} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Contents']} rows={EVENTS} />
        <h3>
          <Rich text="Styling hooks" />
        </h3>
        <ApiTable head={['Selector or token', 'Item']} rows={STYLING} />
        <p>
          <Rich text="See the [overview](/tabdocs#api), [Tabs](/tabdocs/tabs) and [Menus and keys](/tabdocs/menus) for the rest of the API." />
        </p>
      </Section>
    </>
  );
}
