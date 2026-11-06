import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ContextMenus from './examples/ContextMenus';
import Locked from './examples/Locked';
import OpenList from './examples/OpenList';
import Recent from './examples/Recent';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MENU = [
  ['close', 'Close', 'The tab; its key is shown next to it.'],
  ['closeOthers, closeRight, closeLeft, closeSaved, closeAll', 'Close others / to the right / to the left / saved / all', 'Pinned tabs stay while `keepPinned` is on.'],
  ['copyTitle', 'Copy the title', 'To the clipboard.'],
  ['keepOpen', 'Keep open', 'Only on a preview tab.'],
  ['pin, unpin', 'Pin / Unpin', 'Whichever applies.'],
  ['splitUp, splitDown, splitLeft, splitRight', 'Split up / down / left / right', 'A new group on that side with the document (or a copy, see `splitCopies`).'],
  ['moveNext, movePrevious', 'Move to the next / previous group', 'Splits when there is no group that way.'],
  ['moveTo', 'Move to…', 'Chooses where the tab goes with the keys ([Drag and drop](/tabdocs/drag#keys)).'],
  ['moveGroupTo', 'Move group to… (empty strip)', 'The same for the whole group.'],
  ['newDocument', 'New document (empty strip)', 'Only with `newDocument`.'],
  ['reopenClosed', 'Reopen closed (empty strip)', 'Dimmed while nothing can be reopened.'],
  ['lock, unlock', 'Lock group / Unlock group (empty strip)', ''],
];

const PROPS = [
  ['contextMenu', '`Bind<boolean>`', '`true`', 'The context menus of tabs and of the empty strip.'],
  ['menuItems', '`Bind<Partial<Record<TabMenuCommand, boolean>>>`', '`{}`', '`false` leaves a built-in item out: `{ copyTitle: false }`.'],
  ['openList', '`Bind<boolean>`', '`true`', 'The "…" button in each group\'s toolbar.'],
  ['openListScope, recentListScope', "`Bind<'group' | 'all'>`", "`'group'`", 'Whether the "…" list and the recently used list show the group\'s documents or every group\'s.'],
  ['toolbarItems', '`(group) => ToolbarItem[]`', '', 'The app\'s buttons in every group\'s toolbar, made once per group (text, `icon`, `hint`, `tone`, `visible`, `enabled`, `click`…).'],
  ['newDocument', '`(group) => TabDocument | TabDocumentOptions | null`', '', 'Makes a new document for a double click on the empty strip and for the strip menu.'],
  ['historySize', '`Bind<number>`', '`50`', 'How many activated documents `goBack` remembers; 0 turns the history off.'],
  ['closedHistorySize', '`Bind<number>`', '`10`', 'How many closed documents `reopenClosed` remembers; 0 turns it off. Only documents whose content can be made again (a `content` function, the `factory`, a copy) are kept.'],
  ['keyPreset', "`Bind<'auto' | 'browser' | 'desktop'>`", "`'auto'`", 'Which keys the manager starts with (see Keyboard); `auto` takes the desktop keys when the page runs installed.'],
  ['groupActions', '`Bind<boolean>`', '`true`', 'The split, maximize and "…" buttons.'],
];

const DOCUMENT = [['actions', '`Bind<readonly ToolbarItem[]>`', 'Buttons in the group\'s toolbar while this document is the active one, before the built-in ones.']];

const METHODS = [
  ['showOpenList(group?)', '`boolean`', 'Opens a group\'s "…" list: the documents to search and open, close all, close saved, lock or unlock.'],
  ['showRecentList(by?)', '`boolean`', 'Opens the recently used list with the next document (or, with `-1`, the last) highlighted.'],
  ['goBack(), goForward()', '`boolean`', 'The document activated before (or after) the current one, in whatever group. `canGoBack`, `canGoForward` say whether there is one (reactive).'],
  ['reopenClosed()', '`TabDocument | null`', 'Opens the document closed last again, in its group and place. `closedDocuments` lists them (reactive).'],
  ['lock(group), unlock(group)', '`boolean`', 'Also `group.lock()`, `group.unlock()`; `group.locked` reads it.'],
  ['openNew(group?)', '`TabDocument | null`', 'Makes a document with `newDocument` and opens it.'],
  ['moveToGroup(doc, which)', '`boolean`', "`'next'`, `'previous'`, or the group on a side (`'left'`, `'right'`, `'up'`, `'down'`); splits when there is no group that way."],
  ['copyTitle(doc)', '`Promise<boolean>`', 'Writes the title to the clipboard.'],
  ['recentDocuments', 'read-only, reactive', 'The open documents of every group, the one activated last first.'],
];

const EVENTS = [
  ['onContextMenuOpening(e)', '`{ document, group, items, byKeyboard }`, cancelable; `document` is `null` for the empty strip. Change `items` (each built-in one has its command in `data`) or add your own.'],
  ['onLocking(e), onLocked(e), onUnlocking(e), onUnlocked(e)', '`{ group, byUser }`; the `…ing` ones are cancelable.'],
];

const KEYS = [
  ['Ctrl + Alt + W', 'Ctrl + W, Ctrl + F4', 'Closes the active document (`closeTab`).'],
  ['Alt + Page Down / Page Up', 'Ctrl + Page Down / Page Up', 'The next / previous tab (`nextTab`, `previousTab`).'],
  ['Ctrl + Alt + 1 … 9', 'Ctrl + 1 … 9', 'Focuses a group (`focusGroup`).'],
  ['Ctrl + E, Ctrl + Shift + E', 'Ctrl + Tab, Ctrl + Shift + Tab', 'The recently used list: opens it, then walks it while Ctrl is held; letting go opens the highlighted document (`recentNext`, `recentPrevious`).'],
  ['Alt + Left / Right', 'the same', 'Back and forward (`goBack`, `goForward`).'],
  ['Ctrl + Alt + Shift + T', 'Ctrl + Shift + T', 'Reopens the document closed last (`reopenClosed`).'],
  ['Ctrl + K, then W / U', 'the same', 'Closes the group\'s documents / the saved ones (`closeAllTabs`, `closeSavedTabs`).'],
  ['Ctrl + K, then Enter', 'the same', 'Keeps a preview tab (`keepOpen`).'],
  ['Ctrl + K, then Shift + Enter', 'the same', 'Pins or unpins the active document (`togglePin`).'],
  ['Ctrl + K, then Ctrl + P', 'the same', 'Opens the "…" list (`showOpenList`).'],
  ['Ctrl + \\', 'the same', 'Splits to the right (`splitRight`).'],
  ['Shift + F10, the Menu key', 'the same', 'The context menu of the focused tab.'],
];

const A11Y = [
  ['Context menus', 'The kit\'s `ContextMenu`: a `menu` opened by the right button, Shift+F10 or the Menu key on a tab, named after the document (or the group, on the strip); focus goes back to the tab when it closes.'],
  ['The "…" list', 'One menu: a search field, the documents as a `menu` named “Open documents” (`menuitemradio` items, the shown one checked; the description, the group and unsaved changes are said with each one) and the `menu` of commands. Up and Down go on from the search through the documents and the commands; typing on a document goes back to the search; Tab goes from part to part; Enter opens; Escape closes.'],
  ['The recently used list', 'The same menu of documents, named “Recently used documents”, with focus on the highlighted document, so it is read as it moves. It works without holding a key: the arrows move, a letter goes to a title, Enter opens, Escape closes.'],
  ['Locked groups', 'A locked group is named “Group 1, locked”; its toolbar has an “Unlock group” button.'],
  ['Announcements', 'Locked and unlocked are said politely, like the other changes.'],
];

export default function TabDocsMenusPage() {
  return (
    <>
      <p class="lead">
        <Rich text="The commands around the tabs: context menus on tabs and on the empty strip, a searchable list of a group's documents, the app's own toolbar buttons, the recently used list, back and forward, reopening what was closed, locked groups, and the keys for all of them." />
      </p>

      <Section anchor="context-menus" title="Context menus">
        <p>
          <Rich text="Every tab has the commands of its document, the empty strip those of its group. `menuItems` leaves built-in items out; `onContextMenuOpening` changes the list for each document or cancels it. `newDocument` makes a document for a double click on the empty strip." />
        </p>
        <Example files={code('ContextMenus.tsx', 'files.tsx')} stack>
          <ContextMenus />
        </Example>
        <ApiTable head={['Command', 'Item', 'Note']} rows={MENU} />
      </Section>

      <Section anchor="open-list" title="The open documents list and toolbar buttons">
        <p>
          <Rich text="The “…” button (or Ctrl+K Ctrl+P) lists the group's documents, or every group's with `openListScope: 'all'`: type to search, Enter opens. `toolbarItems` adds the app's buttons to every group; a document's `actions` show while it is the active one." />
        </p>
        <Example files={code('OpenList.tsx', 'files.tsx')} stack>
          <OpenList />
        </Example>
      </Section>

      <Section anchor="recent" title="Recently used, back and forward, reopen">
        <p>
          <Rich text="The recently used list switches between documents the way code editors do with Ctrl+Tab. `goBack` and `goForward` follow the documents activated in every group; `reopenClosed` opens the last closed one where it was." />
        </p>
        <Example files={code('Recent.tsx', 'files.tsx')} stack>
          <Recent />
        </Example>
      </Section>

      <Section anchor="locked" title="Locked groups">
        <p>
          <Rich text="`lock(group)` keeps a group for what is in it: `open` without a group goes to another one, or to a new group beside it when all are locked (a single group still takes it). The lock is saved with the layout." />
        </p>
        <Example files={code('Locked.tsx', 'contents.tsx')} stack>
          <Locked />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <p>
          <Rich text="A page in a browser tab never receives Ctrl+W, Ctrl+Tab, Ctrl+Shift+T, Ctrl+Page Up / Down and often Ctrl+1…9: the browser keeps them. So a manager starts with keys that reach it there, the way the web version of the editor picks them (Ctrl+Alt for a Ctrl the browser keeps; Ctrl+E, the quick-open key, for the recent list), and keeps the desktop key as a second one. An installed app (display mode standalone) gets every key: there `keyPreset: 'auto'` takes `TabDocumentManager.desktopKeys`. `keys` changes any of them; an empty list turns one off." />
        </p>
        <ApiTable head={['Browser tab', 'Installed app', 'What it does']} rows={KEYS} />
        <Code
          code={`
// The desktop keys everywhere, and Ctrl+Q to close.
new TabDocumentManager({ keyPreset: 'desktop', keys: { closeTab: ['Ctrl+Q'] } });
`}
        />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
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
        <ApiTable head={['Event', 'What it carries']} rows={EVENTS} />
        <p>
          <Rich text="The rest of the API is on the [overview](/tabdocs#api); preview and pinned tabs, sizes and copies on [Tabs](/tabdocs/tabs)." />
        </p>
      </Section>
    </>
  );
}
