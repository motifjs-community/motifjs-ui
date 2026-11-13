import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CompactBars from './examples/CompactBars';
import DockIde from './examples/DockIde';
import DockOptions from './examples/DockOptions';
import DockSaveRestore from './examples/DockSaveRestore';
import FloatProgrammatically from './examples/FloatProgrammatically';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const DROPS = [
  ['A guide of the cross over a group', 'The middle places the tab, group or window into that group, and a side splits that group, as an edge zone does without guides.'],
  ['A guide at an edge of the manager', 'Places it in the dock area on that side: a tab joins the area\'s group, and a group or window runs along the area. The area is created if necessary, at `dockAreaSize`.'],
  ['A strip', 'Among its tabs, as before. A floating window dropped on a strip gives that group all its documents and closes.'],
  ['The titles of a folded area', 'Into that area.'],
  ['Anywhere else (guides on), or outside every manager', 'Floats in its own window at the pointer, the same size as its original group (`floatingWindowSize`). A floating window moved by its strip stays where it is released.'],
  ['Over a manager outside its `dragGroup`', 'Refused. Nothing floats over another manager.'],
];

const PROPS = [
  ['allowFloat', '`Bind<boolean>`', '`true`', 'Allows documents and groups to float. A document\'s own `allowFloat` takes precedence.'],
  ['allowDock', '`Bind<boolean>`', '`true`', 'Allows documents and groups to move to dock areas. A document\'s own `allowDock` takes precedence.'],
  ['dockSides', "`Bind<readonly ('left' | 'right' | 'top' | 'bottom')[]>`", 'all four', 'The dock areas documents can move to. A document\'s own `dockSides` takes precedence. `left` is the start side (on the right in right-to-left layouts).'],
  ['allowAutoHide', '`Bind<boolean>`', '`true`', 'Allows dock areas to collapse to the edge. A document with `allowAutoHide: false` keeps its area open.'],
  ['allowHide', '`Bind<boolean>`', '`true`', 'Allows documents to be hidden (`hide`, "Hide", Ctrl+K X, or an area\'s close button for a document that cannot be closed) and shown again in their previous place. A document\'s own `allowHide` takes precedence.'],
  ['dockGuides', '`Bind<boolean>`', '`false`', 'The guides shown while dragging. A drop away from them and from the strips floats. When disabled, a group\'s edge zones work as described on the [drag and drop page](/tabdocs/drag), and a drop floats only outside the manager.'],
  ['dockGuideKinds', "`Bind<readonly ('group' | 'edges')[]>`", 'both', 'The cross over the group under the pointer, and the four guides at the edges of the manager.'],
  ['floatingWindowSize', '`Bind<{ width, height } | null>`', '`null`', 'The initial size of a window. `null` uses the size of its original group.'],
  ['keepFloatingInView', '`Bind<boolean>`', '`true`', 'Keeps windows inside the viewport when they are moved or resized, or when the page gets smaller.'],
  ['closeEmptyWindows', '`Bind<boolean>`', '`true`', 'Closes a window when its last document closes. When disabled, the window stays with an empty group.'],
  ['dockOnDoubleClick', '`Bind<boolean>`', '`true`', 'Double-clicking the empty part of a window\'s strip docks it back.'],
  ['dockAreaSize', '`Bind<Partial<Record<side, number | string>>>`', '`{ left: 240, right: 240, top: 160, bottom: 200 }`', 'The initial size of a new area on each side, in pixels or as a share such as `\'25%\'`.'],
  ['dockAreaMinSize', '`Bind<number>`', '`120`', 'The minimum size of an area, in pixels. The documents keep `minGroupWidth` and `minGroupHeight`.'],
  ['autoHideHover, autoHideDelay', '`Bind<boolean>`, `Bind<number>`', '`true`, `500`', 'Resting the pointer on a collapsed area\'s title slides it out after this many milliseconds, and moving away from it and the area slides it back.'],
];

const BAR = [
  ['scrollButtons / compactScrollButtons', '`Bind<boolean>`', '`true` / `false`', 'Buttons that scroll a strip whose tabs do not fit. Without them, the wheel (plain scrolling moves sideways), touch and the keys scroll it, a thin scrollbar appears while the pointer is over it, and the "…" button shows how many tabs are not fully visible ("+2", also in its name).'],
  ['tabSize / compactTabSize', "`Bind<'fit' | 'shrink' | 'fixed'>`", "`'fit'` / `'shrink'`", 'With shrinking, tabs narrow down to the minimum width and the title is truncated with an ellipsis (the tooltip and the accessible name keep it whole). Only then does the strip scroll.'],
  ['tabMinWidth / compactTabMinWidth', '`Bind<number>`', '`80` / `64`', 'The minimum width of a tab, in pixels. A tab always keeps its icon, its close button and a few letters.'],
  ['singleTabTitle / compactSingleTabTitle', '`Bind<boolean>`', '`false` / `true`', 'A strip with one document shows it as a title: the icon, title, unsaved mark, badge and close button (`closeButton`, and the document\'s `closable`). It remains a tab, with its menu, keys, drag, double-click and tooltip. A second document brings the tabs back.'],
  ['barButtons / compactBarButtons', "`Bind<readonly TabBarButton[] | 'all' | 'auto'>`", "`'all'` / `'auto'`", "The built-in buttons that stay in the toolbar (`'split'`, `'maximize'`, `'lock'`, `'autoHide'`, `'close'`, `'maximizeWindow'`, `'closeWindow'`). The others, application buttons (except those with `overflow: 'never'`), Dock back in a window, and the group commands go into one \"…\" menu, next to the documents and their search. With `'auto'`, an area keeps its pin and close button (`['autoHide', 'close']`), and a window keeps its close button (`['closeWindow']`). A list applies as it is to both. `'all'` keeps the full toolbar, which collapses into its own menu when narrow, with the document list separate."],
  ['barButtonSize / compactBarButtonSize', "`Bind<'normal' | 'small'>`", "`'normal'` / `'small'`", 'The size of the toolbar buttons. Small buttons are 24-pixel squares (the minimum pointer target in WCAG 2.2) with a smaller icon and tighter gaps, and the "+2" count fits them. An area\'s or window\'s own `barButtonSize` takes precedence.'],
];

const DOCUMENT = [
  ['allowFloat, allowDock, allowAutoHide', '`Bind<boolean | undefined>`', 'This document\'s own settings. `undefined` uses the manager\'s.'],
  ['dockSides', '`Bind<readonly TabDockSide[] | undefined>`', 'The dock areas this document can move to.'],
  ['allowHide', '`Bind<boolean | undefined>`', 'This document\'s own setting. `undefined` uses the manager\'s. Its `closable` determines whether an area\'s close button closes or hides it.'],
  ['isHidden', 'read-only, reactive', 'A hidden document is in no group, and its content is kept according to its `contentLifetime`. `isOpen` stays `true`. `hide()` and `show(options?)` call the manager.'],
  ['window, dockArea', 'read-only, reactive', 'The floating window or dock area containing it, otherwise `null` (also on `TabGroup`).'],
];

const METHODS = [
  ['float(doc | group, rect?)', '`TabWindow | null`', 'Moves it into its own window. `rect` is `{ x, y, width, height }` in the viewport.'],
  ['dock(doc | group | window, side?, size?)', '`boolean`', 'Moves it into the dock area on `side`, created at `size` if necessary. Without a side, it returns to where it was docked before it floated.'],
  ['autoHide(area | doc, on?)', '`boolean`', 'Collapses the area to the edge (`true`) or restores it.'],
  ['showAutoHidden(doc), hideAutoHidden()', '`boolean`', 'Slides a collapsed area out with that document shown, or back.'],
  ['moveWindow(w, x, y), resizeWindow(w, width, height)', '`boolean`', 'Programmatic control, raising `onLayoutChanging` first. `keepFloatingInView` keeps the window visible.'],
  ['maximizeWindow(w), restoreWindow(w)', '`boolean`', 'Fills the whole page, and returns to its place.'],
  ['closeWindow(w)', '`Promise<boolean>`', 'Closes its documents (each raising `onClosing`), and then the window. Its close button does the same, and hides documents that cannot be closed.'],
  ['hide(doc)', '`boolean`', 'Removes it from its group without closing it. Its content is kept according to its `contentLifetime`, and a group, area or window it leaves empty is removed.'],
  ['show(doc, { group?, side?, index?, active?, focus? })', '`boolean`', 'Returns it to where it was hidden from: its group, otherwise its dock area (recreated at its size, collapsed if it was), otherwise a window in the same position, otherwise the documents. `group` or `side` names another place. `open(doc)` does the same.'],
  ['hiddenDocuments', 'read-only, reactive', 'The hidden documents, in the order they were hidden. `findDocument(id)` also finds them.'],
  ['focusWindow(w), focusNextPart(by?)', '`boolean`', 'Brings a window to the front with focus where it was, or moves to the next (or with `-1`, previous) part: the documents, each area and each window.'],
  ['resizeDockArea(area, size)', '`boolean`', 'In pixels, or as a share such as `\'25%\'`.'],
  ['floatingWindows, dockAreas', 'read-only, reactive', 'The windows, with the one at the back first, and the areas, with the outermost first. `dockArea(side)` finds one.'],
  ['saveLayout(), loadLayout(layout, factory?)', '`TabLayout` (version 3)', 'Also includes the areas (`side`, `size`, `autoHide`, their layout), the windows (`rect`, `maximized`, where they dock back, their layout) and the hidden documents (`hidden`, with where they return to). Older layouts still load.'],
];

const WINDOW = [
  ['rect, isMaximized, isActive', 'read-only, reactive', 'Its position and size (as restored), whether it is maximized, and whether it is the front window of the page.'],
  ['groups, documents, index', 'read-only, reactive', 'Its groups (split in the same way as the document area), their documents, and its position in `floatingWindows`.'],
  ['move, resize, maximize, restore, close, dock(side?), focus', 'methods', 'The manager\'s methods, scoped to this window.'],
  ['scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize', '`Bind<… | null>`, reactive', 'Its strips\' own settings, as a value or a function. `null` (the default) uses the manager\'s `compact…` props. Plain values are saved with the layout (`bar`).'],
];

const AREA = [
  ['side, size, autoHidden, isOpen', 'read-only, reactive', 'Its side, its size as set (in pixels or as a share), whether it is collapsed to the edge, and whether it is slid out.'],
  ['groups, documents, index, rect', 'read-only', 'Its groups, their documents, its position in `dockAreas`, and its box on the screen.'],
  ['resize(size), autoHide(on?), show(doc?)', 'methods', 'The manager\'s methods for this area.'],
  ['scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize', '`Bind<… | null>`, reactive', 'Its strips\' own settings (as on `TabWindow`). `null` uses the manager\'s `compact…` props.'],
];

const EVENTS = [
  ['onFloating(e) / onFloated(e)', '`{ document, group, rect }`, cancelable, and `rect` can be changed. Then `{ document, group, window }`. `document` is `null` for a group.'],
  ['onDocking(e) / onDocked(e)', '`{ document, group, window, side, size }`, cancelable, and `side` and `size` can be changed (`side: null` returns it to where it was docked). Then `{ document, group, area, side }`.'],
  ['onAutoHiding(e) / onAutoHidden(e)', '`{ area, on }`, cancelable, followed by the same.'],
  ['onHiding(e) / onHidden(e)', '`{ document, group }`, cancelable, followed by the same (`group` is the one it left).'],
  ['onShowing(e) / onShown(e)', '`{ document, group, side, index }`, cancelable, and `group` and `index` can be changed (`group: null` creates an area or window for it). Then `{ document, group, index }`.'],
  ['onSlideChanging(e) / onSlideChanged(e)', '`{ area, document, open }`, cancelable. A collapsed area slides out (with `document` shown) or back (`null`).'],
  ['onWindowClosing(e) / onWindowClosed(e)', '`{ window }`, cancelable. Then `{ window, reason }`, where `reason` is `\'closed\'`, `\'docked\'` or `\'empty\'`.'],
  ['onLayoutChanging / onLayoutChanged', "Also includes `'float'`, `'dock'`, `'autoHide'`, `'resizeArea'`, `'moveWindow'`, `'resizeWindow'`, `'maximizeWindow'`, `'restoreWindow'` and `'closeWindow'`, with `window` or `area`. `onLayoutChanged` also includes `'hide'` and `'show'`."],
  ['onDragOver, onDropping, onDropped', "Additional `target` types: `'dock-guide'` (a guide of the cross, with `group` and `side`), `'dock-area'` (with `dockSide`) and `'float'` (with `rect`)."],
];

const KEYS = [
  ['Ctrl + K, then O', 'Floats the active document (`float`).'],
  ['Ctrl + K, then D', 'Docks it back in its previous place (`dock`).'],
  ['Ctrl + K, then Alt + an arrow', 'Docks it in the area on that side (`dockLeft`, `dockRight`, `dockTop`, `dockBottom`).'],
  ['Ctrl + K, then H', 'Collapses the active document\'s area to its edge, or restores it (`toggleAutoHide`).'],
  ['Ctrl + K, then X', 'Hides the focused or active document (`hide`). "Show hidden" in the strip menu or the "…" menu restores it.'],
  ['F6, Shift + F6', 'Moves to the next or previous part: the documents, each dock area and each floating window (`nextPart`, `previousPart`).'],
  ['Ctrl + K, then Space', 'In a window, moves it with the arrow keys and resizes it with Shift + arrow. Enter keeps the change, and Escape reverts it (`moveWindow`, `windowLeft`…`windowTaller`, `windowDone`, `windowCancel`).'],
  ['Ctrl + K, then Shift + M; Ctrl + K, then Shift + W', 'Maximizes or restores the window, or closes it (`maximizeWindow`, `closeWindow`).'],
  ['In a folded area\'s titles', 'The arrow keys move along them (`autoHideNext`, `autoHidePrevious`), Home and End move to the ends, Enter or Space slides the area out, and Escape slides it back.'],
  ['"Move to…"', 'Past the edge of the layout, the same arrow key continues to the dock area on that side, and then to a separate window.'],
];

const A11Y = [
  ['Windows', 'A non-modal `dialog` named "Floating window n". Each of its groups is a `group`, as in the document area. It comes to the front when clicked or focused.'],
  ['Dock areas', 'A `region` named after its side ("Left dock area"). Its splitter is a `separator` with its size as a value, moved with the splitter keys.'],
  ['Folded areas', 'The titles are a `toolbar` ("Hidden on the left") of buttons with `aria-expanded` and with `aria-controls` referencing the area. It is one Tab stop, and the arrow keys move inside it.'],
  ['Close buttons', 'An area\'s close button is named after its action: "Close Notes", or "Hide Explorer" for a document that cannot be closed. A title in that bar has no close button of its own.'],
  ['Announcements', 'Floated, docked (with the area), collapsed and shown, slid out, hidden and shown again, and window closed, maximized and restored are all announced politely.'],
];

const STYLING = [
  ['.mx-tabdocs__window', 'A floating window, with `data-active`, `data-maximized`, `data-moving` and `data-resizing`. Its position and size are `--_x`, `--_y`, `--_w` and `--_h`.'],
  ['.mx-tabdocs__area', 'A dock area, with `data-side`, `data-auto-hide` and `data-open` (slid out). `.mx-tabdocs__area-sash` is its splitter.'],
  ['.mx-tabdocs__autohide, .mx-tabdocs__autohide-tab', 'The titles of a collapsed area. A title has `data-open` while its document is slid out.'],
  ['.mx-tabdocs__guide', 'A dock guide, with `data-kind` (`cross`, `edge`), `data-side` and `data-pointed`.'],
  ['.mx-tabdocs__group[data-compact], [data-title], [data-scroll-buttons], [data-tab-size], [data-bar-close]', 'A group\'s bar: compact, one document as a title, with scroll buttons, how its tabs are sized, and with its own close button (`.mx-tabdocs__bar-close`).'],
  ['.mx-tabdocs__scrollbar, .mx-tabdocs__thumb, .mx-tabdocs__count', 'The thin scrollbar of a strip without scroll buttons, and the count on its "…" button.'],
  ['.mx-tabdocs__group[data-bar-size]', 'The size of its toolbar buttons: `normal` or `small`.'],
  ['tabdocs.scrollbar, thumb, count; bar-button-*, bar-icon-size, title-min', 'Their units, and the sizes of the small toolbar, whose ends leave space for the focus ring (`focus-width`, `focus-offset`).'],
  ['tabdocs.window, area, autohide, autohide-tab, autohide-indicator, guide, guide-icon', 'Their units (a collapsed area: `folded`, `folded-left` …; a guide: `edge`, `pointed`). `floating-min-*`, `folded-tab-height`, `guide-room` and `guide-spacing` are sizes.'],
];

export default function TabDocsDockPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Documents and whole groups can float in their own windows within the page, and dock again into document groups or into dock areas around them, which can collapse to the edge of the manager. The mouse, the keyboard and the API all perform the same actions through the same events." />
      </p>

      <Section anchor="ide" title="Tool areas around the documents">
        <p>
          <Rich text={"A dock area holds its own groups beside the documents and resizes with its splitter. When collapsed (with the pin in its toolbar, the tab menu, Ctrl+K H or `autoHide`), only its titles stay at the edge. Clicking a title slides the area out over the documents, and clicking outside, pressing Escape or moving focus away slides it back. The close button next to the pin closes the active document, or hides it if it cannot be closed, as with these tools. \"Show hidden\" in the strip menu or the \"…\" menu, or `show`, returns it to its previous place."} />
        </p>
        <Example files={code('DockIde.tsx', 'tools.tsx', 'files.tsx')} stack>
          <DockIde />
        </Example>
        <ApiTable head={['Drop target', 'Result']} rows={DROPS} />
      </Section>

      <Section anchor="windows" title="Floating windows">
        <p>
          <Rich text="A window holds groups in the same way as the document area, split and resized the same way. It moves by the empty part of its strips, resizes from its edges and corners, comes to the front when clicked, and maximizes within the page. Double-clicking its strip docks it back. Its documents keep their content, and nothing is recreated." />
        </p>
        <Example files={code('FloatProgrammatically.tsx', 'files.tsx')} stack>
          <FloatProgrammatically />
        </Example>
      </Section>

      <Section anchor="compact" title="Compact bars">
        <p>
          <Rich text={"The bars of dock areas and floating windows are compact, to leave more space for tabs. There are no scroll buttons (the wheel, touch and keys scroll the strip, and the \"…\" button shows how many tabs are out of view), tabs shrink before they scroll, a single document appears as a title with its close button, and an area shows only its pin and close button, or a window only its close button, as small buttons beside one \"…\" menu that holds the other buttons above the document list. Each of these is a setting: the manager's `compact…` props apply to every area and window, and an area's or window's own value (`area.scrollButtons = true`) takes precedence. The document bar keeps its full toolbar by default and has the same settings without the prefix. New browser windows use it too, because they fill their own window."} />
        </p>
        <Example files={code('CompactBars.tsx', 'tools.tsx', 'files.tsx')} stack>
          <CompactBars />
        </Example>
        <ApiTable head={['Prop (documents / compact)', 'Type', 'Default', 'Description']} rows={BAR} />
      </Section>

      <Section anchor="options" title="Settings">
        <p>
          <Rich text="Every part is a setting that can change at runtime, and a document's own `allowFloat`, `allowDock`, `dockSides` and `allowAutoHide` take precedence over the manager's. In this example, package.json cannot float and README.md docks only at the bottom." />
        </p>
        <Example files={code('DockOptions.tsx', 'tools.tsx', 'files.tsx')} stack>
          <DockOptions />
        </Example>
      </Section>

      <Section anchor="layout" title="Saving the whole layout">
        <p>
          <Rich text="`saveLayout` also writes the dock areas and floating windows, and `loadLayout` restores them. Layouts saved in the earlier format (version 1) still load." />
        </p>
        <Example files={code('DockSaveRestore.tsx', 'tools.tsx', 'contents.tsx', 'files.tsx')} stack>
          <DockSaveRestore />
        </Example>
      </Section>

      <Section anchor="events" title="Changing or canceling">
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
        <ApiTable head={['Keys', 'Action']} rows={KEYS} />
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
          <Rich text="TabDocument" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={DOCUMENT} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="TabWindow" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Description']} rows={WINDOW} />
        <h3>
          <Rich text="TabDockArea" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Description']} rows={AREA} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Contents']} rows={EVENTS} />
        <h3>
          <Rich text="Styling hooks" />
        </h3>
        <ApiTable head={['Selector or token', 'Item']} rows={STYLING} />
        <p>
          <Rich text="See the [overview](/tabdocs#api), [Tabs](/tabdocs/tabs), [Menus and keys](/tabdocs/menus) and [Drag and drop](/tabdocs/drag) for the rest of the API." />
        </p>
      </Section>
    </>
  );
}
