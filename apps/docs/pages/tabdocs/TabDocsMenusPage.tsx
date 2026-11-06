import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ContextMenus from './examples/ContextMenus';
import Locked from './examples/Locked';
import OpenList from './examples/OpenList';
import Recent from './examples/Recent';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MENU = [
  ['close', 'Close', 'Closes the tab. Its key is shown next to it.'],
  ['closeOthers, closeRight, closeLeft, closeSaved, closeAll', 'Close others / to the right / to the left / saved / all', 'Pinned tabs stay while `keepPinned` is on.'],
  ['copyTitle', 'Copy the title', 'Copies it to the clipboard.'],
  ['keepOpen', 'Keep open', 'Available only on a preview tab.'],
  ['pin, unpin', 'Pin / Unpin', 'Shows whichever applies.'],
  ['splitUp, splitDown, splitLeft, splitRight', 'Split up / down / left / right', 'Creates a new group on that side with the document, or a copy (see `splitCopies`).'],
  ['moveNext, movePrevious', 'Move to the next / previous group', 'Splits if no group exists in that direction.'],
  ['moveTo', 'Move to…', 'Chooses the destination with the keyboard ([Drag and drop](/tabdocs/drag#keys)).'],
  ['moveGroupTo', 'Move group to… (empty strip)', 'The same for the whole group.'],
  ['newDocument', 'New document (empty strip)', 'Available only with `newDocument`.'],
  ['reopenClosed', 'Reopen closed (empty strip)', 'Disabled when nothing can be reopened.'],
  ['lock, unlock', 'Lock group / Unlock group (empty strip)', ''],
];

const PROPS = [
  ['contextMenu', '`Bind<boolean>`', '`true`', 'The context menus of tabs and of the empty strip.'],
  ['menuItems', '`Bind<Partial<Record<TabMenuCommand, boolean>>>`', '`{}`', '`false` hides a built-in item: `{ copyTitle: false }`.'],
  ['openList', '`Bind<boolean>`', '`true`', 'The "…" button in each group\'s toolbar.'],
  ['openListScope, recentListScope', "`Bind<'group' | 'all'>`", "`'group'`", 'Whether the "…" list and the recently used list show the group\'s documents or those of every group.'],
  ['toolbarItems', '`(group) => ToolbarItem[]`', '', 'Application buttons in every group\'s toolbar, created once per group (text, `icon`, `hint`, `tone`, `visible`, `enabled`, `click` …).'],
  ['newDocument', '`(group) => TabDocument | TabDocumentOptions | null`', '', 'Creates a new document when the empty strip is double-clicked, and for the strip menu.'],
  ['historySize', '`Bind<number>`', '`50`', 'The number of activated documents `goBack` remembers. 0 disables the history.'],
  ['closedHistorySize', '`Bind<number>`', '`10`', 'The number of closed documents `reopenClosed` remembers. 0 disables it. Only documents whose content can be recreated (a `content` function, the `factory` or a copy) are kept.'],
  ['keyPreset', "`Bind<'auto' | 'browser' | 'desktop'>`", "`'auto'`", 'The default keys (see Keyboard). `auto` uses the desktop keys when the page runs as an installed app.'],
  ['groupActions', '`Bind<boolean>`', '`true`', 'The split, maximize and "…" buttons.'],
];

const DOCUMENT = [['actions', '`Bind<readonly ToolbarItem[]>`', 'Buttons in the group\'s toolbar while this document is active, placed before the built-in buttons.']];

const METHODS = [
  ['showOpenList(group?)', '`boolean`', 'Opens a group\'s "…" list, to search and open documents, close all, close saved, and lock or unlock.'],
  ['showRecentList(by?)', '`boolean`', 'Opens the recently used list, with the next document (or the last, with `-1`) highlighted.'],
  ['goBack(), goForward()', '`boolean`', 'Activates the previous or next document in the history, in any group. `canGoBack` and `canGoForward` indicate whether one exists (reactive).'],
  ['reopenClosed()', '`TabDocument | null`', 'Reopens the most recently closed document, in its original group and position. `closedDocuments` lists them (reactive).'],
  ['lock(group), unlock(group)', '`boolean`', 'Also available as `group.lock()` and `group.unlock()`. `group.locked` reads the state.'],
  ['openNew(group?)', '`TabDocument | null`', 'Creates a document with `newDocument` and opens it.'],
  ['moveToGroup(doc, which)', '`boolean`', "`'next'`, `'previous'`, or the group on a side (`'left'`, `'right'`, `'up'`, `'down'`). Splits if no group exists in that direction."],
  ['copyTitle(doc)', '`Promise<boolean>`', 'Writes the title to the clipboard.'],
  ['recentDocuments', 'read-only, reactive', 'The open documents of every group, most recently activated first.'],
];

const EVENTS = [
  ['onContextMenuOpening(e)', '`{ document, group, items, byKeyboard }`, cancelable. `document` is `null` for the empty strip. Change `items` (each built-in item has its command in `data`) or add your own.'],
  ['onLocking(e), onLocked(e), onUnlocking(e), onUnlocked(e)', '`{ group, byUser }`. The `…ing` events are cancelable.'],
];

const KEYS = [
  ['Ctrl + Alt + W', 'Ctrl + W, Ctrl + F4', 'Closes the active document (`closeTab`).'],
  ['Alt + Page Down / Page Up', 'Ctrl + Page Down / Page Up', 'Moves to the next or previous tab (`nextTab`, `previousTab`).'],
  ['Ctrl + Alt + 1 … 9', 'Ctrl + 1 … 9', 'Sets focus on a group (`focusGroup`).'],
  ['Ctrl + E, Ctrl + Shift + E', 'Ctrl + Tab, Ctrl + Shift + Tab', 'Opens the recently used list and moves through it while Ctrl is held. Releasing Ctrl opens the highlighted document (`recentNext`, `recentPrevious`).'],
  ['Alt + Left / Right', 'Same', 'Moves back and forward (`goBack`, `goForward`).'],
  ['Ctrl + Alt + Shift + T', 'Ctrl + Shift + T', 'Reopens the most recently closed document (`reopenClosed`).'],
  ['Ctrl + K, then W / U', 'Same', 'Closes the group\'s documents, or its saved documents (`closeAllTabs`, `closeSavedTabs`).'],
  ['Ctrl + K, then Enter', 'Same', 'Keeps a preview tab open (`keepOpen`).'],
  ['Ctrl + K, then Shift + Enter', 'Same', 'Pins or unpins the active document (`togglePin`).'],
  ['Ctrl + K, then Ctrl + P', 'Same', 'Opens the "…" list (`showOpenList`).'],
  ['Ctrl + \\', 'Same', 'Splits to the right (`splitRight`).'],
  ['Shift + F10, the Menu key', 'Same', 'Opens the context menu of the focused tab.'],
];

const A11Y = [
  ['Context menus', 'The kit\'s `ContextMenu`: a `menu` opened by a right-click, Shift+F10 or the Menu key on a tab, and named after the document (or after the group, on the strip). Focus returns to the tab when it closes.'],
  ['The "…" list', 'A single menu with a search field, the documents as a `menu` named “Open documents” (`menuitemradio` items with the displayed document checked, and each announcing its description, group and unsaved changes), and a `menu` of commands. Up and Down move from the search through the documents and commands, typing on a document returns to the search, Tab moves between parts, Enter opens, and Escape closes.'],
  ['The recently used list', 'The same document menu, named “Recently used documents”, with focus on the highlighted document so that it is announced as it moves. It also works without holding a key: the arrow keys move, a letter jumps to a title, Enter opens, and Escape closes.'],
  ['Locked groups', 'A locked group is named “Group 1, locked”, and its toolbar has an “Unlock group” button.'],
  ['Announcements', 'Locked and unlocked are announced politely, like the other changes.'],
];

export default function TabDocsMenusPage() {
  return (
    <>
      <p class="lead">
        <Rich text="The commands around tabs: context menus on tabs and on the empty strip, a searchable list of a group's documents, application toolbar buttons, the recently used list, back and forward, reopening closed documents, locked groups, and keyboard shortcuts for all of them." />
      </p>

      <Section anchor="context-menus" title="Context menus">
        <p>
          <Rich text="Each tab offers the commands for its document, and the empty strip offers the commands for its group. `menuItems` hides built-in items, and `onContextMenuOpening` changes the list for each document or cancels it. `newDocument` creates a document when the empty strip is double-clicked." />
        </p>
        <Example files={code('ContextMenus.tsx', 'files.tsx')} stack>
          <ContextMenus />
        </Example>
        <ApiTable head={['Command', 'Item', 'Note']} rows={MENU} />
      </Section>

      <Section anchor="open-list" title="The open documents list and toolbar buttons">
        <p>
          <Rich text="The “…” button (or Ctrl+K Ctrl+P) lists the group's documents, or the documents of every group with `openListScope: 'all'`. Type to search, and press Enter to open. `toolbarItems` adds application buttons to every group, and a document's `actions` appear while it is active." />
        </p>
        <Example files={code('OpenList.tsx', 'files.tsx')} stack>
          <OpenList />
        </Example>
      </Section>

      <Section anchor="recent" title="Recently used, back and forward, and reopen">
        <p>
          <Rich text="The recently used list switches between documents in the same way as Ctrl+Tab in code editors. `goBack` and `goForward` follow the documents activated in every group, and `reopenClosed` opens the most recently closed document in its original place." />
        </p>
        <Example files={code('Recent.tsx', 'files.tsx')} stack>
          <Recent />
        </Example>
      </Section>

      <Section anchor="locked" title="Locked groups">
        <p>
          <Rich text="`lock(group)` reserves a group for its current contents. `open` without a group uses another group, or a new group beside it when all are locked (a single group still accepts it). The lock is saved with the layout." />
        </p>
        <Example files={code('Locked.tsx', 'contents.tsx')} stack>
          <Locked />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <p>
          <Rich text="A page in a browser tab never receives Ctrl+W, Ctrl+Tab, Ctrl+Shift+T, Ctrl+Page Up/Down and often Ctrl+1…9, because the browser reserves them. A manager therefore starts with keys that reach it, in the same way as the web version of a code editor (Ctrl+Alt in place of a reserved Ctrl, and Ctrl+E, the Quick Open key, for the recent list), and keeps the desktop key as a second option. An installed app (standalone display mode) receives every key, and there `keyPreset: 'auto'` uses `TabDocumentManager.desktopKeys`. `keys` changes any of them, and an empty list disables one." />
        </p>
        <ApiTable head={['Browser tab', 'Installed app', 'Description']} rows={KEYS} />
        <Code
          code={`
// The desktop keys everywhere, and Ctrl+Q to close.
new TabDocumentManager({ keyPreset: 'desktop', keys: { closeTab: ['Ctrl+Q'] } });
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
          <Rich text="TabDocument" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={DOCUMENT} />
        <h3>
          <Rich text="Methods and properties" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Contents']} rows={EVENTS} />
        <p>
          <Rich text="See the [overview](/tabdocs#api) for the rest of the API, and [Tabs](/tabdocs/tabs) for preview and pinned tabs, sizes and copies." />
        </p>
      </Section>
    </>
  );
}
