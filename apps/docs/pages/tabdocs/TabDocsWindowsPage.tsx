import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import NewWindow from './examples/NewWindow';
import WindowLayout from './examples/WindowLayout';
import WindowOptions from './examples/WindowOptions';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const WAYS = [
  ['The tab menu, the strip menu', '"Move into new window" moves the document, or the whole group; on a floating window\'s strip, the whole window. In a new window, "Move back to main window" brings the document (or the group) back.'],
  ['The keys', 'Ctrl + K, then Shift + O: the active document into a new window (`moveToNewWindow`); Ctrl + K, then Shift + D: back (`moveToMainWindow`).'],
  ['A drag past the edge of the browser window', 'Let go outside the page, a new window opens there with what was dragged (`dragOutToNewWindow`). Dragged out of a new window, it goes back to the main window, or into the window under the pointer.'],
  ['"Move to…"', 'Tab and Shift + Tab go through the groups of every window; past floating, the same arrow points at a new window.'],
  ['Code', '`moveToNewWindow(doc | group | floatingWindow, { rect, url })`, `moveToMainWindow(doc | group | window)`, and `move`, `split`, `dock`, `float` with a group of any window.'],
];

const INSIDE = [
  ['Tabs and groups', 'Everything a group does: pinning, previews, the "…" list, the recently used list, splitting, the splitters by the mouse and the keys, maximize is the main window\'s only.'],
  ['Menus, lists, tooltips', 'They open in the new window\'s own top layer: the kit\'s `Popup`, `ContextMenu` and `Tooltip` go to the document of the element they open at.'],
  ['Keys', 'The manager\'s keys, every control\'s shortcuts and access keys: the kit listens in every connected document (`connectDocument`).'],
  ['Content', 'Any component: a form with a `DropDown`, a `DataGrid` with its filter popup and its keys, an `MxForm` dialog opened from it (in that window).'],
  ['Drag and drop', 'Inside the window as in the page: strips, the zones or guides of a group, the edges of its layout. No dock areas and no floating there: those are the main window\'s.'],
  ['The look', 'The page\'s style sheets (also constructed ones) and the attributes of `<html>` and `<body>` (`data-theme`, `data-identity`, density, `dir`, `lang`, classes) are copied and followed: change the theme here and every window follows.'],
];

const LIMITS = [
  ['Frames', 'An `<iframe>` in a document loads again when it moves into another window: browsers do that for every moved frame.'],
  ['`onMounted` of content made there', 'Core waits for the page\'s own document (CORE-REPORTS R30): the manager lets content it makes in a new window arrive in the page for a moment first. A component an app builds later inside such content gets no `onMounted`.'],
  ['The window\'s place', 'Browsers tell when a window is resized, not when it moves: `rect` is read when it is needed.'],
  ['A closed window', 'It is gone before anything can ask: its documents come back (or close, each one asking in the main window). `onWindowClosing` cannot keep it.'],
];

const PROPS = [
  ['allowNewWindow', '`Bind<boolean>`', '`true`', 'Documents, groups and floating windows may move into new windows; a document\'s own `allowNewWindow` wins.'],
  ['newWindowUrl', '`Bind<string>`', '`\'about:blank\'`', 'The page a new window opens, on the page\'s own origin (one of the app\'s, with nothing in it); it is waited for before the move.'],
  ['newWindowTitle', '`Bind<string | ((doc, window) => string)>`', '`\'{title} – {page}\'`', 'The window\'s title: `{title}` is its active document\'s title, `{page}` the page\'s title; it follows them.'],
  ['newWindowSize', '`Bind<{ width, height } | null>`', '`null`', 'The size a new window opens at; `null`: the size of what moves into it.'],
  ['newWindowFallback', "`Bind<'float' | 'none'>`", "`'float'`", 'When the browser opens no window: a floating window in the page instead, or nothing.'],
  ['newWindowCloseAction', "`Bind<'back' | 'close'>`", "`'back'`", 'When a new window closes, its documents go back to the main window (into the group they came from), or close; `onWindowClosing` may change it each time.'],
  ['restoreWindows', "`Bind<'float' | 'reopen' | 'main'>`", "`'float'`", 'What `loadLayout` does with saved new windows: floating windows, windows again (see below), or groups at the right of the main window.'],
  ['openWindow', '`(request) => Window | null`', '`window.open`', 'Opens the window: an application shell, a host page with its own frame, a test. `request` is `{ url, name, features, rect }`.'],
  ['dragOutToNewWindow', '`Bind<boolean>`', '`true`', 'A drag let go past the edge of the browser window opens a new window there; past the edge of a new window it goes back.'],
];

const METHODS = [
  ['moveToNewWindow(target, options?)', '`TabBrowserWindow | null`', '`target`: a document, a group or a floating window; `options`: `{ rect, url }` (`rect` on the screen). `null` when it may not move, `onWindowOpening` cancels, or the browser opens none (then `onError`).'],
  ['moveToMainWindow(target)', '`boolean`', 'A document, a group or a `TabBrowserWindow`: back into the group it came from, else the main window\'s active one. A window left empty closes.'],
  ['closeWindow(window), focusWindow(window)', '`Promise<boolean>`, `boolean`', 'Also for a new window: closing does what `newWindowCloseAction` says.'],
  ['reopenWindows()', '`number`', 'Opens again the saved windows the browser blocked (`restoreWindows: \'reopen\'`); call it from a click or a key.'],
  ['browserWindows', 'read-only, reactive', 'The new windows, the one used last at the end.'],
  ['saveLayout(), loadLayout(layout, factory?)', '`TabLayout` (version 3)', 'Also `browserWindows`: `rect` on the screen, the layout, the group they came from (`home`). Versions 1 and 2 still load.'],
];

const WINDOW = [
  ['window', '`Window`', 'The browser window.'],
  ['element', '`HTMLDivElement`', 'The manager\'s part in that window (`.mx-tabdocs.mx-tabdocs__page`), filling it.'],
  ['rect', 'read-only', 'Its place on the screen and the size of its page, in pixels.'],
  ['groups, documents, activeGroup, activeDocument, index', 'read-only, reactive', 'What it holds; its title follows `activeDocument`.'],
  ['moveToMainWindow(), close(), focus()', 'methods', 'The manager\'s methods for this window.'],
];

const DOCUMENT = [
  ['allowNewWindow', '`Bind<boolean | undefined>`', 'This document\'s own setting; `undefined` follows the manager.'],
  ['browserWindow', 'read-only, reactive', 'The new window it is in, `null` in the main window (also on `TabGroup`).'],
];

const EVENTS = [
  ['onWindowOpening(e) / onWindowOpened(e)', '`{ document, group, window, rect, url }`, cancelable, `rect` and `url` may be changed (`window`: the floating window that moves); then `{ window, document, group }`.'],
  ['onWindowClosing(e) / onWindowClosed(e)', "Also for new windows, with `kind: 'floating' | 'browser'` and `then: 'back' | 'close'` (may be changed). Then `reason`: `'closed'`, `'docked'` (brought back), `'empty'` or `'moved'` (a floating window that went into a new window)."],
  ['onError(e)', "`{ error, document, group, fallback }`: `'windowBlocked'` (no window came) or `'windowNotUsable'` (a page of another origin); `fallback` may be changed."],
  ['onClosing', 'A document of a closed window closes (`newWindowCloseAction: \'close\'`) back in the main window, so a dirty one is asked about there.'],
  ['onLayoutChanging / onLayoutChanged', "Also `'newWindow'` and `'mainWindow'`, with `window`."],
  ['onDragOver, onDropping, onDropped', "New `target` kinds: `'new-window'` (with `rect` on the screen) and `'main-window'`; an `'edge'` place in a new window has `browserWindow`."],
];

const KIT = [
  ['connectDocument(doc), disconnectDocument(doc), pageDocuments()', 'The kit\'s document-wide listeners (keys, access keys, tooltips, the focus guard) work in another same-origin document too; it is disconnected when its window closes.'],
  ['mirrorPage(source, target)', 'Copies the page\'s style sheets and the attributes of `<html>` and `<body>` into another document and keeps them in step; returns the function that stops.'],
  ['ResizeWatch', 'A `ResizeObserver` that follows its elements into another window (a browser\'s observer only reports elements of its own window).'],
];

const A11Y = [
  ['The window', 'Its content is a `main` landmark named after the manager; its groups, strips and tabs are what they are in the page, with the roving tab stop.'],
  ['Focus', 'Moving into a new window by the user focuses the document there; moving back focuses it in the main window.'],
  ['Announcements', 'Politely, in the window that has focus: moved into a new window, back in the main window, window closed, the browser did not open the window.'],
];

export default function TabDocsWindowsPage() {
  return (
    <>
      <p class="lead">
        A document, a group or a floating window moves into a browser window of its own, and back. Its content moves with it, nothing is made again, and
        the new window is a part of the same manager: its tabs, menus, keys and drag work as they do here.
      </p>

      <Section anchor="move" title="Into a new window and back">
        <p>
          <Rich text="Type in the form, choose a city, scroll the orders, then move the tab into a new window: the window opens at the size of the group, beside it, and shows the same component, in the same state. Its title is the active document's. Close the window and its documents come back to the group they came from." />
        </p>
        <Example files={code('NewWindow.tsx', 'contents.tsx')} stack>
          <NewWindow />
        </Example>
        <ApiTable head={['Way', 'What it does']} rows={WAYS} />
      </Section>

      <Section anchor="closing" title="Closing, blocked windows, events">
        <p>
          <Rich text="When a new window closes its documents come back, or close (`newWindowCloseAction`): each one asks through `onClosing` as usual, back in the main window, so a document with unsaved changes is asked about there. A browser opens windows for a page only on a click or a key, and may block them anyway: then `onError` tells, and a floating window opens instead (`newWindowFallback`). Here a switch plays the browser that blocks." />
        </p>
        <Example files={code('WindowOptions.tsx', 'contents.tsx')} stack>
          <WindowOptions />
        </Example>
      </Section>

      <Section anchor="layout" title="Saving the layout with its windows">
        <p>
          <Rich text="`saveLayout` writes each new window: its place on the screen, its layout and the group its documents came from. `loadLayout` puts them back as floating windows by default. To open them as windows again (`restoreWindows: 'reopen'`) the browser wants a click or a key: `loadLayout` called from one opens them right away, and a page that loads its layout on start shows them floating, with a button calling `reopenWindows()`." />
        </p>
        <Example files={code('WindowLayout.tsx', 'contents.tsx')} stack>
          <WindowLayout />
        </Example>
        <Code
          code={`
// On start: no click, so the windows wait as floating windows.
docs.restoreWindows = 'reopen';
docs.loadLayout(JSON.parse(localStorage.layout), restore);
reopenButton.onclick = () => docs.reopenWindows();
`}
        />
      </Section>

      <Section anchor="inside" title="What works in a new window">
        <ApiTable head={['Part', 'How']} rows={INSIDE} />
        <h3>Limits</h3>
        <ApiTable head={['Topic', 'Why']} rows={LIMITS} />
      </Section>

      <Section anchor="events" title="Changing or refusing">
        <Code
          code={`
docs.onWindowOpening((e) => {
  // Reports open on the second screen, wide.
  if (e.document?.type === 'report') e.rect = { x: screen.width, y: 0, width: 1200, height: 800 };
});
docs.onWindowClosing((e) => {
  // Drafts close with their window, everything else comes back.
  if (e.kind === 'browser') e.then = e.window.documents.every((d) => d.type === 'draft') ? 'close' : 'back';
});
docs.onError((e) => {
  if (e.error === 'windowBlocked') toast('Allow pop-ups for this site to open documents in windows of their own.');
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
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>TabBrowserWindow</h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={WINDOW} />
        <h3>TabDocument</h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={DOCUMENT} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'What it carries']} rows={EVENTS} />
        <h3>For other windows in the kit</h3>
        <ApiTable head={['Export', 'What']} rows={KIT} />
        <p>
          <Rich text="The rest of the API is on the [overview](/tabdocs#api), [Tabs](/tabdocs/tabs), [Menus and keys](/tabdocs/menus), [Drag and drop](/tabdocs/drag) and [Dock and floating windows](/tabdocs/dock)." />
        </p>
      </Section>
    </>
  );
}
