import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import BetweenManagers from './examples/BetweenManagers';
import DragDrop from './examples/DragDrop';
import DragOptions from './examples/DragOptions';
import MoveWithKeys from './examples/MoveWithKeys';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const DROPS = [
  ['Along the strip', 'Reorders. A tab dropped among the pinned ones is pinned, one dropped among the others unpinned (`pinOnDrag`).'],
  ['On another strip', 'Moves the tab there, at the place under the pointer; on the empty part of a strip, at the end.'],
  ['The middle of a group', 'Moves the tab into that group, after its active tab (`openPosition`).'],
  ['An edge of a group', 'Splits that group: a new group on that side with the tab. The edge zones are `dropEdgeSize` deep.'],
  ['An edge of the layout', 'A thin band along the manager\'s sides (`layoutEdgeSize`): a new group along that whole side (`layoutEdgeDrop`).'],
  ['Ctrl held (Option on a Mac)', 'Opens a copy there instead, when the document may be open twice (`allowDuplicate`, `copyModifier`).'],
  ['A group, by the empty part of its bar or its handle', 'Moves the group with all its tabs beside another group or along an edge of the layout; into another group (or its strip) its tabs join that group.'],
  ['Outside the manager', 'Floats in a window of its own (see [Dock and floating windows](/tabdocs/dock)); where it may not float (`allowFloat`), or over a manager outside its `dragGroup`, it is refused (`target: \'outside\'`).'],
];

const PROPS = [
  ['allowDrag', '`Bind<boolean>`', '`true`', 'Tabs can be dragged; a document\'s own `allowDrag` wins.'],
  ['allowDragGroups', '`Bind<boolean>`', '`true`', 'Groups can be dragged by the empty part of their bar.'],
  ['groupDragHandle', '`Bind<boolean>`', '`false`', 'A handle at the start of each group\'s toolbar to drag the group by, also when its tabs fill the bar; a click on it (or Enter) starts “Move group to…”.'],
  ['dropSides', "`Bind<readonly ('center' | 'left' | 'right' | 'up' | 'down')[]>`", 'all five', 'Where a drop on a group\'s content may go; a group\'s own `dropSides` wins.'],
  ['dropEdgeSize', '`Bind<number | string>`', "`'33%'`", 'How deep the edge zones of a group\'s content are: pixels, or a share.'],
  ['layoutEdgeDrop, layoutEdgeSize', '`Bind<boolean>`, `Bind<number>`', '`true`, `16`', 'Drops along the edges of the whole layout, and how deep that band is, in pixels.'],
  ['dragThreshold', '`Bind<number>`', '`5`', 'How far, in pixels, the pointer moves before a press becomes a drag.'],
  ['longPressDelay', '`Bind<number>`', '`500`', 'How long, in milliseconds, a finger or a pen rests on a tab before it drags it; a swipe before that scrolls the strip.'],
  ['dragHoverActivate, dragHoverDelay', '`Bind<boolean>`, `Bind<number>`', '`true`, `750`', 'Resting on a tab of another group while dragging activates it, after that many milliseconds.'],
  ['pinOnDrag', '`Bind<boolean>`', '`true`', 'Dragging across the border between pinned and other tabs pins or unpins; `false` keeps each tab on its side.'],
  ['copyModifier', "`Bind<'auto' | 'ctrl' | 'alt' | 'shift' | 'meta' | 'none'>`", "`'auto'`", 'The key that makes a drop a copy: Ctrl, Option on Apple platforms.'],
  ['dragGroup', '`Bind<string | null>`', '`null`', 'Managers with the same name take each other\'s tabs and groups.'],
  ['dragGhost, dragAutoScroll', '`Bind<boolean>`', '`true`', 'The copy of the tab under the pointer; the strip scrolling near its ends.'],
];

const GROUP = [
  ['allowDrop', '`Bind<boolean>`', '`true`', 'Drops into the group and beside it; `false` for a group that takes nothing. Saved with the layout.'],
  ['dropSides', '`Bind<readonly TabDropSide[] | null>`', '`null`', 'The group\'s own drop sides; `null` follows the manager. Saved with the layout.'],
];

const DOCUMENT = [['allowDrag', '`Bind<boolean | undefined>`', 'This document\'s own setting; `undefined` follows the manager.']];

const METHODS = [
  ['move(doc, group, index?)', '`boolean`', 'What a drop on a strip or into a group does (milestone 1).'],
  ['split(group | null, direction, doc?)', '`TabGroup | null`', 'What a drop on an edge does; `null` splits the whole layout along that edge.'],
  ['moveGroup(group, target | null, side)', '`boolean`', "A whole group beside `target` (`'left'`, `'right'`, `'up'`, `'down'`), into it (`'center'`), or along an edge of the layout (`target` `null`)."],
  ['moveInGroup(doc, by)', '`boolean`', 'A place along the strip (`-1` towards the start), not past the pinned or the other tabs.'],
  ['moveToGroup(doc, which)', '`boolean`', "`'next'`, `'previous'`, or the group on that side (`'left'`, `'right'`, `'up'`, `'down'`); a new group when there is none."],
  ['showMoveTo(doc | group)', '`boolean`', '"Move to…" from the keyboard (see below).'],
  ['cancelDrag()', '`boolean`', 'Stops a drag or "Move to…"; everything goes back.'],
  ['addDropTarget(target, index?)', '`() => void`', 'A target of your own, asked before the built-in one: `placeAt(x, y, drag)`, `marks(place, drag)`, `drop(place, drag)`. Returns the function that removes it.'],
  ['dragging', 'read-only, reactive', '`{ document, group, manager, copy }` while something is dragged, else `null`.'],
  ['dropTargets', 'read-only', 'The targets in the order they are asked.'],
];

const EVENTS = [
  ['onDragStarting(e)', '`{ document, group, pointerType, byKeyboard }`, cancelable; `document` is `null` for a group.'],
  ['onDragOver(e)', "`{ document, from, target, manager, group, index, side, copy, byKeyboard }`: change the place, or `cancel` to refuse it. `target` is `'strip'`, `'group'`, `'edge'`, `'float'`, `'dock-guide'`, `'dock-area'` or `'outside'` (refused)."],
  ['onDropping(e)', 'The same, just before the drop; cancel keeps everything where it is.'],
  ['onDropped(e)', 'Where it ended: `group` is the new group of a split, `document` the copy when one was opened.'],
  ['onDragEnded(e)', '`{ document, from, dropped, byKeyboard }`, dropped or not.'],
  ['onMoving / onMoved, onSplitting / onSplit, onOpening / onOpened, onPinning…', 'Still fire for what the drop does, so there is one way the model changes. A tab from another manager arrives through `onOpening` there, after `onMoving` here.'],
];

const KEYS = [
  ['Alt + Shift + Page Up / Page Down', 'Ctrl + Shift + Page Up / Page Down', 'The active tab a place along its strip (`moveTabLeft`, `moveTabRight`).'],
  ['Ctrl + Alt + Right / Left', 'the same', 'The active document to the next / previous group (`moveToNextGroup`, `moveToPreviousGroup`).'],
  ['Ctrl + K, then Shift + an arrow', 'the same', 'To the group on that side, or into a new group there (`moveToGroupLeft`, `…Right`, `…Up`, `…Down`).'],
  ['Ctrl + K, then M', 'the same', '"Move to…" for the active document (`moveTo`); the tab\'s menu and the strip\'s menu have it too.'],
];

const MOVE_KEYS = [
  ['Arrows', 'A side of the group; again towards that side, the next group that way, or the edge of the layout; the other way, back to the middle (`targetLeft`, `targetRight`, `targetUp`, `targetDown`).'],
  ['Tab, Shift + Tab', 'The next / previous group, its middle (`targetNextGroup`, `targetPreviousGroup`).'],
  ['Enter', 'Moves it there (`targetDrop`).'],
  ['Escape', 'Leaves everything where it was (`targetCancel`); so does a press anywhere.'],
];

const A11Y = [
  ['Every drag has keys', '"Move to…" reaches every place a pointer can: each side of each group, the edges of the layout, other managers of the same `dragGroup`.'],
  ['Announcements', 'Each place "Move to…" points at is said ("New group to the right of group 2", or "cannot go here"), then moved, copied, split, or canceled.'],
  ['Touch and pen', 'A long press starts the drag, so a swipe still scrolls the strip; held still and let go, it opens the tab\'s menu.'],
  ['Escape', 'Cancels a pointer drag too, and puts back what resting on tabs activated and what the strips scrolled.'],
];

const STYLING = [
  ['.mx-tabdocs[data-dragging]', "While dragging: `move`, `copy` or `none` (what a drop would do now); the cursor follows it."],
  ['.mx-tabdocs__tab[data-dragging], .mx-tabdocs__group[data-dragging]', 'The tab, or the group, being dragged.'],
  ['.mx-tabdocs__ghost', 'The copy under the pointer; `data-kind` (`tab`, `group`), `data-target` (`move`, `copy`, `none`).'],
  ['.mx-tabdocs__drop', 'The translucent area a drop would take; it glides between places (the motion tokens: none with reduced motion).'],
  ['.mx-tabdocs__insert', 'The mark between two tabs.'],
  ['.mx-tabdocs__grip', "The group's handle (`groupDragHandle`), a button of the group's toolbar."],
  ['tabdocs.drop-area-*, drop-mark-*, ghost-*, drag-source-opacity', 'Their tokens.'],
];

export default function TabDocsDragPage() {
  return (
    <>
      <p class="lead">
        Tabs and whole groups dragged as in a code editor: along a strip, to another group, beside a group or along an edge of the layout, between two
        managers, and the same moves from the keyboard. Every drop goes through the methods and events of what it does.
      </p>

      <Section anchor="drag" title="Dragging tabs and groups">
        <p>
          <Rich text="A copy of the tab follows the pointer; a mark shows where it goes among tabs, and a translucent area which half of a group (or all of it) a drop would take. Resting on a tab of another group activates it; the strip scrolls near its ends. The content is moved, never made again." />
        </p>
        <Example files={code('DragDrop.tsx', 'files.tsx')} stack>
          <DragDrop />
        </Example>
        <ApiTable head={['Dropped', 'What happens']} rows={DROPS} />
      </Section>

      <Section anchor="options" title="Settings">
        <p>
          <Rich text="Each part of drag and drop is a setting and changes live; a document's own `allowDrag` and a group's own `allowDrop` and `dropSides` win over the manager's." />
        </p>
        <Example files={code('DragOptions.tsx', 'files.tsx')} stack>
          <DragOptions />
        </Example>
      </Section>

      <Section anchor="between" title="Between two managers">
        <p>
          <Rich text="Managers that share a `dragGroup` take each other's tabs and groups. The tab, its panel and its content go along; the other manager asks through its own `onOpening`, after `onMoving` in the first." />
        </p>
        <Example files={code('BetweenManagers.tsx', 'files.tsx')} stack>
          <BetweenManagers />
        </Example>
      </Section>

      <Section anchor="keys" title="From the keyboard">
        <p>
          <Rich text="Keys move the active tab along its strip or to another group, and “Move to…” (the tab's menu, the strip's menu for a whole group, Ctrl+K M, or `showMoveTo`) reaches every place a drag does, with the same areas shown and each place announced." />
        </p>
        <Example files={code('MoveWithKeys.tsx', 'files.tsx')} stack>
          <MoveWithKeys />
        </Example>
        <ApiTable head={['Browser', 'Installed app (desktop keys)', 'Does']} rows={KEYS} />
        <h3>In “Move to…”</h3>
        <ApiTable head={['Key', 'Does']} rows={MOVE_KEYS} />
      </Section>

      <Section anchor="events" title="Changing or refusing a drop">
        <p>
          <Rich text="`onDragOver` sees each place and may change it or refuse it; `onDropping` may still stop the drop. Then the events of what the drop does fire (`onMoved`, `onSplit`, …) and `onDropped`." />
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
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="api" title="API">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>TabGroup</h3>
        <ApiTable head={['Property', 'Type', 'Default', 'Description']} rows={GROUP} />
        <h3>TabDocument</h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={DOCUMENT} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'What it carries']} rows={EVENTS} />
        <h3>Styling hooks</h3>
        <ApiTable head={['Selector or token', 'What']} rows={STYLING} />
        <p>
          <Rich text="The rest of the API is on the [overview](/tabdocs#api), [Tabs](/tabdocs/tabs) and [Menus and keys](/tabdocs/menus)." />
        </p>
      </Section>
    </>
  );
}
