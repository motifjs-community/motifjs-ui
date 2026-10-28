import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CompactBars from './examples/CompactBars';
import DockIde from './examples/DockIde';
import DockOptions from './examples/DockOptions';
import DockSaveRestore from './examples/DockSaveRestore';
import FloatFromCode from './examples/FloatFromCode';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const DROPS = [
  ['A guide of the cross over a group', 'Its middle puts the tab (or the group, or the window) into that group; a side splits that group, as an edge zone does without guides.'],
  ['A guide at an edge of the manager', 'Into the dock area of that side: a tab joins the area\'s group, a group or a window goes along the area. The area is made when there is none, at `dockAreaSize`.'],
  ['A strip', 'Among its tabs, as before; a floating window dropped on a strip gives that group all its documents and closes.'],
  ['The titles of a folded area', 'Into that area.'],
  ['Anywhere else (guides on), or outside every manager', 'Floats: a window of its own at the pointer, as large as the group it came from (`floatingWindowSize`). A floating window moved by its strip stays where it is let go.'],
  ['Over a manager outside its `dragGroup`', 'Refused: nothing floats over another manager.'],
];

const PROPS = [
  ['allowFloat', '`Bind<boolean>`', '`true`', 'Documents and groups can float; a document\'s own `allowFloat` wins.'],
  ['allowDock', '`Bind<boolean>`', '`true`', 'Documents and groups can go to the dock areas; a document\'s own `allowDock` wins.'],
  ['dockSides', "`Bind<readonly ('left' | 'right' | 'top' | 'bottom')[]>`", 'all four', 'Which dock areas documents may go to; a document\'s own `dockSides` wins. `left` is the start side (the right one right to left).'],
  ['allowAutoHide', '`Bind<boolean>`', '`true`', 'Dock areas can fold to the edge; a document with `allowAutoHide: false` keeps its area open.'],
  ['allowHide', '`Bind<boolean>`', '`true`', 'Documents can be hidden (`hide`, "Hide", Ctrl+K X, the close button of an area for a document that cannot close) and shown again where they were; a document\'s own `allowHide` wins.'],
  ['dockGuides', '`Bind<boolean>`', '`false`', 'The guides while dragging; a drop away from them and from the strips floats. Off, a group\'s edge zones work as on the [drag and drop page](/tabdocs/drag), and only outside the manager a drop floats.'],
  ['dockGuideKinds', "`Bind<readonly ('group' | 'edges')[]>`", 'both', 'The cross over the group under the pointer, the four guides at the manager\'s edges.'],
  ['floatingWindowSize', '`Bind<{ width, height } | null>`', '`null`', 'The size a window opens at; `null`: the size of the group it comes from.'],
  ['keepFloatingInView', '`Bind<boolean>`', '`true`', 'Windows stay inside the viewport when moved, resized, or the page gets smaller.'],
  ['closeEmptyWindows', '`Bind<boolean>`', '`true`', 'A window whose last document closes closes too; off, it stays with an empty group.'],
  ['dockOnDoubleClick', '`Bind<boolean>`', '`true`', 'A double click on the empty part of a window\'s strip docks it back.'],
  ['dockAreaSize', '`Bind<Partial<Record<side, number | string>>>`', '`{ left: 240, right: 240, top: 160, bottom: 200 }`', 'The size a new area of each side starts with: pixels, or a share such as `\'25%\'`.'],
  ['dockAreaMinSize', '`Bind<number>`', '`120`', 'The smallest size of an area, in pixels; the documents keep `minGroupWidth` / `minGroupHeight`.'],
  ['autoHideHover, autoHideDelay', '`Bind<boolean>`, `Bind<number>`', '`true`, `500`', 'Resting the pointer on a folded area\'s title slides it out after that many milliseconds, and away from it and the area slides it back.'],
];

const BAR = [
  ['scrollButtons / compactScrollButtons', '`Bind<boolean>`', '`true` / `false`', 'Buttons that scroll a strip whose tabs do not fit. Without them the wheel (a plain one scrolls sideways), touch and the keys scroll it, a thin scrollbar shows while the pointer is over it, and the "…" button shows how many tabs are not fully in sight ("+2", also in its name).'],
  ['tabSize / compactTabSize', "`Bind<'fit' | 'shrink' | 'fixed'>`", "`'fit'` / `'shrink'`", 'Shrinking, tabs narrow down to the smallest width, the title cut by an ellipsis (the tooltip and the name keep it whole); only then does the strip scroll.'],
  ['tabMinWidth / compactTabMinWidth', '`Bind<number>`', '`80` / `64`', 'The smallest width of a tab, in pixels; a tab keeps its icon, its close button and a few letters whatever it is.'],
  ['singleTabTitle / compactSingleTabTitle', '`Bind<boolean>`', '`false` / `true`', 'A strip with one document shows it as a title: icon, title, unsaved mark, badge and its close button (`closeButton`, the document\'s `closable`). It is still the tab: its menu, keys, drag, double click and tooltip stay. A second document makes tabs again.'],
  ['barButtons / compactBarButtons', "`Bind<readonly TabBarButton[] | 'all' | 'auto'>`", "`'all'` / `'auto'`", "The built-in buttons that stay in the toolbar (`'split'`, `'maximize'`, `'lock'`, `'autoHide'`, `'close'`, `'maximizeWindow'`, `'closeWindow'`). The others, the app's buttons (but those with `overflow: 'never'`), Dock back in a window and the group's commands go into one \"…\" menu, next to its documents and their search. `'auto'`: an area keeps its pin and its close button (`['autoHide', 'close']`), a window its own close button (`['closeWindow']`); a list is followed as it is in both. `'all'`: the whole toolbar, which folds into a menu of its own when narrow, and the list apart."],
  ['barButtonSize / compactBarButtonSize', "`Bind<'normal' | 'small'>`", "`'normal'` / `'small'`", 'How large the toolbar\'s buttons are: small ones are squares of 24 pixels (the smallest pointer target WCAG 2.2 asks for) with a smaller mark and tight gaps; the "+2" count fits them. An area\'s or a window\'s own `barButtonSize` wins.'],
];

const DOCUMENT = [
  ['allowFloat, allowDock, allowAutoHide', '`Bind<boolean | undefined>`', 'This document\'s own settings; `undefined` follows the manager.'],
  ['dockSides', '`Bind<readonly TabDockSide[] | undefined>`', 'The dock areas this document may go to.'],
  ['allowHide', '`Bind<boolean | undefined>`', 'This document\'s own setting; `undefined` follows the manager. Its `closable` decides what a close button of an area does: close it, or hide it.'],
  ['isHidden', 'read-only, reactive', 'Hidden: in no group, its content kept as its `contentLifetime` says; `isOpen` stays `true`. `hide()` and `show(options?)` call the manager.'],
  ['window, dockArea', 'read-only, reactive', 'The floating window or the dock area it is in, `null` elsewhere (also on `TabGroup`).'],
];

const METHODS = [
  ['float(doc | group, rect?)', '`TabWindow | null`', 'Into a window of its own; `rect` is `{ x, y, width, height }` in the viewport.'],
  ['dock(doc | group | window, side?, size?)', '`boolean`', 'Into the dock area of `side`, made at `size` when there is none; without a side, back where it was docked before it floated.'],
  ['autoHide(area | doc, on?)', '`boolean`', 'Folds the area to the edge (`true`) or brings it back.'],
  ['showAutoHidden(doc), hideAutoHidden()', '`boolean`', 'Slides a folded area out with that document shown, or back.'],
  ['moveWindow(w, x, y), resizeWindow(w, width, height)', '`boolean`', 'By code, asking `onLayoutChanging` first; kept in view by `keepFloatingInView`.'],
  ['maximizeWindow(w), restoreWindow(w)', '`boolean`', 'The whole page, and back to its place.'],
  ['closeWindow(w)', '`Promise<boolean>`', 'Closes its documents (each asks through `onClosing`), then the window. Its close button does the same, and hides the documents that cannot close.'],
  ['hide(doc)', '`boolean`', 'Out of its group, not closed: its content is kept as its `contentLifetime` says, and a group, an area or a window it leaves empty goes.'],
  ['show(doc, { group?, side?, index?, active?, focus? })', '`boolean`', 'Back where it was hidden from: its group, else its dock area (made again at its size, folded if it was), else a window where its window was, else among the documents; `group` or `side` name another place. `open(doc)` does the same.'],
  ['hiddenDocuments', 'read-only, reactive', 'The hidden documents, in the order they were hidden; `findDocument(id)` finds them too.'],
  ['focusWindow(w), focusPart(by?)', '`boolean`', 'Brings a window to the front with focus where it was; the next (`-1`: previous) part: the documents, each area, each window.'],
  ['resizeDockArea(area, size)', '`boolean`', 'Pixels, or a share such as `\'25%\'`.'],
  ['floatingWindows, dockAreas', 'read-only, reactive', 'The windows, the one at the back first; the areas, the outermost first. `dockArea(side)` finds one.'],
  ['saveLayout(), loadLayout(layout, factory?)', '`TabLayout` (version 3)', 'Also the areas (`side`, `size`, `autoHide`, their layout), the windows (`rect`, `maximized`, where they dock back, their layout) and the hidden documents (`hidden`, with where they go back). Older layouts still load.'],
];

const WINDOW = [
  ['rect, isMaximized, isActive', 'read-only, reactive', 'Where it is and how big (as it is restored), maximized, the front window of the page.'],
  ['groups, documents, index', 'read-only, reactive', 'Its groups (split as the documents\' are), their documents, its place in `floatingWindows`.'],
  ['move, resize, maximize, restore, close, dock(side?), focus', 'methods', 'The manager\'s methods for this window.'],
  ['scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize', '`Bind<… | null>`, reactive', 'Its strips\' own settings, a value or a function; `null` (the default) follows the manager\'s `compact…` props. Plain values are saved with the layout (`bar`).'],
];

const AREA = [
  ['side, size, autoHidden, isOpen', 'read-only, reactive', 'Its side; its size as set (pixels or a share); folded to the edge; slid out now.'],
  ['groups, documents, index, rect', 'read-only', 'Its groups, their documents, its place in `dockAreas`, its box on the screen.'],
  ['resize(size), autoHide(on?), show(doc?)', 'methods', 'The manager\'s methods for this area.'],
  ['scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize', '`Bind<… | null>`, reactive', 'Its strips\' own settings (as on `TabWindow`); `null` follows the manager\'s `compact…` props.'],
];

const EVENTS = [
  ['onFloating(e) / onFloated(e)', '`{ document, group, rect }`, cancelable, `rect` may be changed; then `{ document, group, window }`. `document` is `null` for a group.'],
  ['onDocking(e) / onDocked(e)', '`{ document, group, window, side, size }`, cancelable, `side` and `size` may be changed (`side: null`: back where it was docked); then `{ document, group, area, side }`.'],
  ['onAutoHiding(e) / onAutoHidden(e)', '`{ area, on }`, cancelable; then the same.'],
  ['onHiding(e) / onHidden(e)', '`{ document, group }`, cancelable; then the same (`group`: the one it left).'],
  ['onShowing(e) / onShown(e)', '`{ document, group, side, index }`, cancelable, `group` and `index` may be changed (`group: null`: an area or a window is made for it); then `{ document, group, index }`.'],
  ['onSlideChanging(e) / onSlideChanged(e)', '`{ area, document, open }`: a folded area slides out (`document` shown) or back (`null`); cancelable.'],
  ['onWindowClosing(e) / onWindowClosed(e)', '`{ window }`, cancelable; then `{ window, reason }`: `\'closed\'`, `\'docked\'` or `\'empty\'`.'],
  ['onLayoutChanging / onLayoutChanged', "Also `'float'`, `'dock'`, `'autoHide'`, `'resizeArea'`, `'moveWindow'`, `'resizeWindow'`, `'maximizeWindow'`, `'restoreWindow'`, `'closeWindow'`, with `window` or `area`; `onLayoutChanged` also `'hide'` and `'show'`."],
  ['onDragOver, onDropping, onDropped', "New `target` kinds: `'dock-guide'` (a guide of the cross, with `group` and `side`), `'dock-area'` (with `dockSide`), `'float'` (with `rect`)."],
];

const KEYS = [
  ['Ctrl + K, then O', 'Floats the active document (`float`).'],
  ['Ctrl + K, then D', 'Docks it back where it was (`dock`).'],
  ['Ctrl + K, then Alt + an arrow', 'Into the dock area on that side (`dockLeft`, `dockRight`, `dockTop`, `dockBottom`).'],
  ['Ctrl + K, then H', 'Folds the active document\'s area to its edge, or brings it back (`toggleAutoHide`).'],
  ['Ctrl + K, then X', 'Hides the focused or active document (`hide`); "Show hidden" in the strip\'s menu or the "…" menu brings it back.'],
  ['F6, Shift + F6', 'The next / previous part: the documents, each dock area, each floating window (`nextPart`, `previousPart`).'],
  ['Ctrl + K, then Space', 'In a window: moves it with the arrows, resizes it with Shift and an arrow; Enter keeps it, Escape puts it back (`moveWindow`, `windowLeft`…`windowTaller`, `windowDone`, `windowCancel`).'],
  ['Ctrl + K, then Shift + M; Ctrl + K, then Shift + W', 'Maximizes or restores the window; closes it (`maximizeWindow`, `closeWindow`).'],
  ['In a folded area\'s titles', 'The arrows go along them (`autoHideNext`, `autoHidePrevious`), Home and End to the ends, Enter or Space slides the area out, Escape back.'],
  ['"Move to…"', 'Past the edge of the layout, the same arrow goes on to the dock area of that side, then to a window of its own.'],
];

const A11Y = [
  ['Windows', 'A non-modal `dialog` named "Floating window n"; each of its groups is a `group` as in the documents\' area. It comes to the front on a press or on focus.'],
  ['Dock areas', 'A `region` named after its side ("Left dock area"); its splitter is a `separator` with its size as a value, moved by the splitter keys.'],
  ['Folded areas', 'Their titles are a `toolbar` ("Hidden on the left") of buttons with `aria-expanded` and `aria-controls` the area; one tab stop, the arrows inside.'],
  ['Close buttons', 'The close button of an area is named after what it does: "Close Notes", or "Hide Explorer" for a document that cannot close. A title in that bar shows no close button of its own.'],
  ['Announcements', 'Floated, docked (with the area), folded and shown, slid out, hidden and shown again, window closed, maximized and restored, politely.'],
];

const STYLING = [
  ['.mx-tabdocs__window', 'A floating window; `data-active`, `data-maximized`, `data-moving`, `data-resizing`. Its place and size are `--_x`, `--_y`, `--_w`, `--_h`.'],
  ['.mx-tabdocs__area', 'A dock area; `data-side`, `data-auto-hide`, `data-open` (slid out). `.mx-tabdocs__area-sash` is its splitter.'],
  ['.mx-tabdocs__autohide, .mx-tabdocs__autohide-tab', 'The titles of a folded area; a title has `data-open` while its document is slid out.'],
  ['.mx-tabdocs__guide', 'A dock guide: `data-kind` (`cross`, `edge`), `data-side`, `data-pointed`.'],
  ['.mx-tabdocs__group[data-compact], [data-title], [data-scroll-buttons], [data-tab-size], [data-bar-close]', 'A group\'s bar: compact, one document as a title, with scroll buttons, how its tabs are sized, with a close button of its own (`.mx-tabdocs__bar-close`).'],
  ['.mx-tabdocs__scrollbar, .mx-tabdocs__thumb, .mx-tabdocs__count', 'The thin scrollbar of a strip without scroll buttons, and the count on its "…" button.'],
  ['.mx-tabdocs__group[data-bar-size]', 'The size of its toolbar\'s buttons: `normal` or `small`.'],
  ['tabdocs.scrollbar, thumb, count; bar-button-*, bar-icon-size, title-min', 'Their units, and the small toolbar\'s sizes; its ends leave room for the focus ring (`focus-width`, `focus-offset`).'],
  ['tabdocs.window, area, autohide, autohide-tab, autohide-indicator, guide, guide-icon', 'Their units (a folded area: `folded`, `folded-left` …; a guide: `edge`, `pointed`); `floating-min-*`, `folded-tab-height`, `guide-room`, `guide-spacing` are sizes.'],
];

export default function TabDocsDockPage() {
  return (
    <>
      <p class="lead">
        Documents and whole groups float in windows of their own in the page and dock again into the documents' groups or into dock areas around them,
        which fold to the manager's edge. The mouse, the keys and the code do the same, through the same events.
      </p>

      <Section anchor="ide" title="Tool areas around the documents">
        <p>
          <Rich text={"A dock area holds groups of its own beside the documents and resizes by its splitter. Folded (the pin in its toolbar, the tab menu, Ctrl+K H, or `autoHide`), only its titles stay at the edge; one of them slides the area out over the documents, and a press outside, Escape or focus leaving slides it back. The close button next to the pin closes the active document, or hides it when it cannot close, as these tools: \"Show hidden\" in the strip's menu or the \"…\" menu, or `show`, puts it back where it was."} />
        </p>
        <Example files={code('DockIde.tsx', 'tools.tsx', 'files.tsx')} stack>
          <DockIde />
        </Example>
        <ApiTable head={['Dropped on', 'What happens']} rows={DROPS} />
      </Section>

      <Section anchor="windows" title="Floating windows">
        <p>
          <Rich text="A window holds groups as the documents' area does, split and resized the same way. It moves by the empty part of its strips, resizes from its edges and corners, comes to the front when pressed, maximizes within the page, and a double click on its strip docks it back. Its documents keep their content: nothing is made again." />
        </p>
        <Example files={code('FloatFromCode.tsx', 'files.tsx')} stack>
          <FloatFromCode />
        </Example>
      </Section>

      <Section anchor="compact" title="Compact bars">
        <p>
          <Rich text={"The bars of dock areas and floating windows are compact, so that the tabs keep the room: no scroll buttons (the wheel, touch and the keys scroll the strip, and the \"…\" button tells how many tabs are out of sight), tabs that shrink before they scroll, one document shown as a title with its close button, and only the pin and the close button of an area, or the close button of a window, beside one \"…\" menu, all of them small buttons, which holds the other buttons above the list of documents. Each part is a setting: the manager's `compact…` props for every area and window, the area's or the window's own (`area.scrollButtons = true`) over them. The documents' bar keeps its whole toolbar by default, and has the same settings without the prefix; new browser windows use it too, as they fill a window of their own."} />
        </p>
        <Example files={code('CompactBars.tsx', 'tools.tsx', 'files.tsx')} stack>
          <CompactBars />
        </Example>
        <ApiTable head={['Prop (documents / compact)', 'Type', 'Default', 'Description']} rows={BAR} />
      </Section>

      <Section anchor="options" title="Settings">
        <p>
          <Rich text="Each part is a setting and changes live; a document's own `allowFloat`, `allowDock`, `dockSides` and `allowAutoHide` win over the manager's. Here package.json may not float and README.md docks only at the bottom." />
        </p>
        <Example files={code('DockOptions.tsx', 'tools.tsx', 'files.tsx')} stack>
          <DockOptions />
        </Example>
      </Section>

      <Section anchor="layout" title="Saving the whole layout">
        <p>
          <Rich text="`saveLayout` writes the dock areas and the floating windows too; `loadLayout` puts them back, and still loads a layout saved before them (version 1)." />
        </p>
        <Example files={code('DockSaveRestore.tsx', 'tools.tsx', 'contents.tsx', 'files.tsx')} stack>
          <DockSaveRestore />
        </Example>
      </Section>

      <Section anchor="events" title="Changing or refusing">
        <Code
          code={`
docs.onDocking((e) => {
  // Reports go to the bottom, whatever side they were dropped on.
  if (e.document?.type === 'report' && e.side) e.side = 'bottom';
});
docs.onFloating((e) => {
  // Windows open in the middle of the page.
  e.rect = { ...e.rect, x: (innerWidth - e.rect.width) / 2, y: 80 };
});
docs.onWindowClosing((e) => {
  if (e.window.documents.some((d) => d.dirty)) e.cancel = !confirm('Close the window?');
});
`}
        />
      </Section>

      <Section anchor="keys" title="From the keyboard">
        <ApiTable head={['Keys', 'Does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="api" title="API">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>TabDocument</h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={DOCUMENT} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>TabWindow</h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={WINDOW} />
        <h3>TabDockArea</h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={AREA} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'What it carries']} rows={EVENTS} />
        <h3>Styling hooks</h3>
        <ApiTable head={['Selector or token', 'What']} rows={STYLING} />
        <p>
          <Rich text="The rest of the API is on the [overview](/tabdocs#api), [Tabs](/tabdocs/tabs), [Menus and keys](/tabdocs/menus) and [Drag and drop](/tabdocs/drag)." />
        </p>
      </Section>
    </>
  );
}
