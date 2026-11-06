import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Options from './examples/Options';
import Overview from './examples/Overview';
import SaveRestore from './examples/SaveRestore';
import UnsavedChanges from './examples/UnsavedChanges';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['label', '`Bind<string>`', "`''`", 'Names the manager: it becomes a `region` landmark. The same property as `text`.'],
  ['closeButton', "`Bind<'always' | 'active' | 'never'>`", "`'always'`", 'Where tabs show a close button: every tab, the active one and the one under the pointer, none. A document with `closable: false` shows none.'],
  ['contentLifetime', "`Bind<'keep' | 'lazy' | 'dispose'>`", "`'keep'`", 'When content is built and how long it lives (see below). A document\'s own value wins.'],
  ['closeEmptyGroups', '`Bind<boolean>`', '`true`', 'A group left without documents closes; the last group never does.'],
  ['openPosition', "`Bind<'afterActive' | 'end' | 'start'>`", "`'afterActive'`", 'Where `open` puts a tab when no `index` is given.'],
  ['afterClose', "`Bind<'recent' | 'left' | 'right'>`", "`'recent'`", 'Which tab becomes active when the active one closes: the one used last, or a neighbour.'],
  ['activation', "`Bind<'auto' | 'manual'>`", "`'auto'`", '`auto`: the arrow keys in a strip activate the tab they reach. `manual`: Enter or Space does.'],
  ['minGroupWidth, minGroupHeight', '`Bind<number>`', '`160`, `100`', 'The smallest size of a group, in pixels; a splitter stops there.'],
  ['resizeStep', '`Bind<number>`', '`10`', 'How far a splitter key moves a splitter, in pixels.'],
  ['groupActions', '`Bind<boolean>`', '`true`', 'The split, maximize and "…" buttons at the end of each strip.'],
  ['maximizeOnDoubleClick', '`Bind<boolean>`', '`true`', 'A double click on a tab maximizes its group, or restores the groups (a preview tab is kept open instead).'],
  ['keyPreset', "`Bind<'auto' | 'browser' | 'desktop'>`", "`'auto'`", 'The keys a manager starts with: keys a browser tab lets through, or a desktop editor\'s; `auto` takes the desktop keys in an installed app.'],
  ['keys', '`Bind<Partial<TabDocumentKeys>>`', 'see Keyboard', 'Changes some keys; the others keep the preset\'s. An empty list turns a key off.'],
  ['factory', '`Bind<(doc) => ComponentBase | null>`', '`null`', 'Makes the content of a document that brings none, usually by its `type`.'],
  ['texts', '`Bind<Partial<UiStrings>>`', '`{}`', 'Texts for this manager only, over `uiLocale.strings`.'],
  ['announce', '`Bind<boolean>`', '`true`', 'Opened, closed, moved, split, maximized: said politely to screen readers.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const DOCUMENT = [
  ['id', '`string`', 'Stays the same for the document\'s life; made up when left out. `findDocument(id)` finds it.'],
  ['type', '`string`', 'The key a layout is restored by: the `loadLayout` factory and the manager\'s `factory` read it.'],
  ['title, description', '`Bind<string>`', 'The tab\'s text; the description follows it, quieter, and tells two documents of the same title apart.'],
  ['icon, badge', '`Bind<IconSource | null>`, `Bind<string | number | null>`', 'An icon before the title; a short text or count after it.'],
  ['tooltip', '`Bind<string>`', 'Shown when the pointer rests on the tab or the tab has focus. Default: the title and the description.'],
  ['dirty', '`Bind<boolean>`', 'Unsaved changes: a dot takes the close button\'s place (the button comes back under the pointer), and screen readers hear “unsaved changes”.'],
  ['closable', '`Bind<boolean>`', 'Default `true`. `false`: no close button, and the user cannot close it (code still can).'],
  ['pinned, preview', '`Bind<boolean>`', 'A pinned tab stays at the start; a preview tab gives its place to the next preview. Saved with the layout. See [Tabs](/tabdocs/tabs).'],
  ['badge, tone, actions, clone, allowDuplicate', '', 'A count or a dot, a colour, toolbar buttons while active, a copy\'s content. See [Tabs](/tabdocs/tabs) and [Menus and keys](/tabdocs/menus).'],
  ['contentLifetime', "`Bind<ContentLifetime | undefined>`", 'This document\'s own lifetime; `undefined` follows the manager.'],
  ['content', '`ComponentBase | (doc) => ComponentBase`', 'The content: a component, or a function that makes it (and makes it again after `dispose`).'],
  ['state', '`Bind<unknown>`', 'The app\'s own data for the document, saved with the layout.'],
  ['manager, group, isOpen, isActive, contentComponent', 'read-only, reactive', 'Where it is open, and the content made for it.'],
  ['activate(focus?), close()', '`boolean`, `Promise<boolean>`', 'The same as the manager\'s methods.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['groups', 'read-only, reactive', 'The groups in layout order: left to right, top to bottom.'],
  ['documents', 'read-only, reactive', 'Every open document, group by group.'],
  ['activeGroup, activeDocument', 'read-only, reactive', 'The group that has focus or had it last, and its active document.'],
  ['maximizedGroup', 'read-only, reactive', 'The maximized group, `null` when none is.'],
  ['recentDocuments, closedDocuments, canGoBack, canGoForward', 'read-only, reactive', 'The documents used last, the ones `reopenClosed` can open, and the history. See [Menus and keys](/tabdocs/menus).'],
  ['TabDocumentManager.browserKeys, TabDocumentManager.desktopKeys', 'static', 'The two key presets.'],
];

const GROUP = [
  ['documents, activeDocument, recentDocuments', 'read-only, reactive', 'In strip order; the active one; the one used last first.'],
  ['index, isActive, isMaximized, isEmpty', 'read-only, reactive', 'Its place in `groups`, from 0, and its state.'],
  ['locked', 'read/write, reactive', 'A locked group takes no document opened without naming the group. `lock()` and `unlock()` ask first and announce it.'],
  ['previewDocument', 'read-only, reactive', 'The group\'s preview tab\'s document, if it has one.'],
  ['open(doc, options?), activate(doc), closeAll(), close(), split(direction, doc?), maximize(), lock(), unlock(), focus()', '', 'The manager\'s methods for this group.'],
];

const METHODS = [
  ['open(doc, { group?, index?, active?, focus? })', '`TabDocument | null`', 'Opens a `TabDocument` (or one made from options) in a group, the active one by default; a document already open is activated. `null` when `onOpening` cancels.'],
  ['close(doc)', '`Promise<boolean>`', 'Closes as the close button does; `false` when `onClosing` keeps it.'],
  ['closeAll(group?)', '`Promise<boolean>`', 'Closes the documents of a group, or of all of them; `false` when some stay.'],
  ['activate(doc, focus?)', '`boolean`', 'Makes it its group\'s active tab and its group the active group; `focus` moves focus into the content.'],
  ['activateNext(group?, focus?), activatePrevious(group?, focus?)', '`boolean`', 'The next or previous tab, around the ends (Ctrl + Page Down / Up).'],
  ['move(doc, group, index?)', '`boolean`', 'To another place in its group, or to another group. The content goes along as it is.'],
  ['split(group, direction, doc?)', '`TabGroup | null`', "A new group on the `'left'`, `'right'`, `'up'` or `'down'` side; `doc` moves into it. `group` `null`: along that edge of the whole layout."],
  ['closeGroup(group)', '`Promise<boolean>`', 'Closes its documents, then the group. The last group stays, empty.'],
  ['focusGroup(group | index)', '`boolean`', 'Makes it active and focuses what had focus in it last.'],
  ['maximizeGroup(group), restoreGroups()', '`boolean`', 'One group takes all the room; the others wait, out of sight, as they were.'],
  ['evenSizes()', '`boolean`', 'Every group of every split the same size.'],
  ['resizeGroup(group, size)', '`boolean`', "A group's size along its split: pixels or a share (`'30%'`); the neighbour after it gives or takes the room."],
  ['findDocument(id), contentOf(doc)', '`TabDocument | null`, `ComponentBase | null`', ''],
  ['saveLayout()', '`TabLayout`', 'The layout as plain JSON (see below).'],
  ['loadLayout(layout, factory?)', '`boolean`', 'Puts a saved layout in place of the current one, whose documents close without asking. `factory(saved)` returns the document, its options or its content.'],
];

const EVENTS = [
  ['onOpening(e), onOpened(e)', '`{ document, group, index, active, byUser }`; `opening` is cancelable and may change `group` and `index`.'],
  ['onClosing(e), onClosed(e)', '`{ document, group, index, byUser }`; `closing` is cancelable, or sets `e.promise` (`Promise<boolean>`) to ask first.'],
  ['onDocumentActivating(e), onDocumentActivated(e)', '`{ document, previous, group, byUser }`; `activating` (a tab is selected) is cancelable; `activated` also runs when another group becomes active.'],
  ['onMoving(e), onMoved(e)', '`{ document, from, fromIndex, to, toIndex, byUser }`; `moving` is cancelable.'],
  ['onSplitting(e), onSplit(e)', '`{ group, direction, document, byUser }` (and `newGroup` after); `splitting` is cancelable. `group` is `null` when the new group goes along an edge of the whole layout.'],
  ['onLayoutChanging(e), onLayoutChanged(e)', "`{ change, group, byUser }`, `change` one of `'split'`, `'closeGroup'`, `'resize'`, `'evenSizes'`, `'maximize'`, `'restore'`, `'move'` (a whole group moved or merged), `'load'`; `changing` is cancelable (a split asks through `onSplitting`)."],
];

const LIFETIME = [
  ['keep (default)', 'Built when the document opens; lives, with its state, until it closes.'],
  ['lazy', 'Built the first time it is shown; then kept.'],
  ['dispose', 'Built when shown, disposed when hidden; made again from `content` (or the manager\'s `factory`) the next time, with the document\'s `state`. A component given as it is cannot be made again, so it is kept.'],
];

const KEYS = [
  ['Alt + Page Down / Page Up (Ctrl + Page Down / Up)', 'The next / previous tab of the active group, around the ends (`nextTab`, `previousTab`).'],
  ['Ctrl + Alt + W (Ctrl + W)', 'Closes the active document (`closeTab`).'],
  ['Ctrl + Alt + 1 … 9 (Ctrl + 1 … 9)', 'Focuses group 1 to 9 (`focusGroup`, written `Ctrl+Alt+{n}`).'],
  ['Ctrl + \\', 'Splits the active group to the right; the active document goes along when it is not the only one, or a copy of it (`splitRight`).'],
  ['Right / Left, Home / End (on a tab)', 'The next / previous, first / last tab; it is activated too unless `activation` is manual (`stripNext`, `stripPrevious`, `stripFirst`, `stripLast`).'],
  ['Enter, Space (on a tab)', 'Activates it.'],
  ['Delete (on a tab)', 'Closes it (`closeFocusedTab`).'],
  ['Arrows, Home / End (on a splitter)', 'Make the group before it smaller or larger by `resizeStep`, as small or as large as it can be (`resizeSmaller`, `resizeLarger`, `resizeMin`, `resizeMax`).'],
  ['Tab', 'From the strip (one stop: the active tab) to the group buttons, the content, the splitter, the next group.'],
];

const A11Y = [
  ['Groups', 'Each group is a `group` named “Group 1”, “Group 2”…; with `label` the manager is a `region`.'],
  ['Tabs', 'A `tablist` per group (“Documents in group 1”) of `tab`s, each controlling its `tabpanel`; a roving `tabindex` keeps one Tab stop per strip. A tab says “unsaved changes” while its document is dirty; `aria-keyshortcuts` names the key that closes it.'],
  ['Splitters', '`separator`s with `aria-orientation`, `aria-valuenow` (the share of the group before it, 0 to 100) and `aria-controls`.'],
  ['Announcements', 'A polite live region says what was opened, closed, moved, split, maximized or restored (`announce`).'],
  ['Focus', 'A group remembers what had focus in it; closing the focused tab moves focus to the tab that takes its place.'],
];

const HOOKS = [
  ['.mx-tabdocs', 'The root; `data-maximized` while a group is maximized, `data-resizing` while a splitter is dragged; `data-tab-size`, `data-pinned-size`, `data-pinned-row`, `data-wrap`, `data-scroll-buttons` from the props.'],
  ['.mx-tabdocs__split', 'A split; `data-orientation`.'],
  ['.mx-tabdocs__sash', 'A splitter (`role="separator"`).'],
  ['.mx-tabdocs__group', 'A group; `data-active`, `data-empty`, `data-maximized`, `data-locked`.'],
  ['.mx-tabdocs__bar, __strip, __tabs, __pinned, __row, __scroll, __actions', 'The strip row; the tab list with its scroll buttons; the `tablist`, its pinned row and the row of the others; the kit Toolbar with the group buttons.'],
  ['.mx-tabdocs__tab', 'A tab; `aria-selected`, `data-dirty`, `data-close` (`always`, `active`), `data-pinned`, `data-preview`, `data-tone`, `data-icon`.'],
  ['.mx-tabdocs__icon, __letter, __title, __description, __badge, __pin, __close, __dirty', 'The parts of a tab; a badge that is a dot has `data-dot`.'],
  ['.mx-tabdocs__popup, __list-title, __list-note, __list-dirty', 'The "…" and recently used lists.'],
  ['.mx-tabdocs__panels, __panel, __empty', 'The content area, a document\'s `tabpanel`, the empty group\'s text.'],
];

const TOKENS = [
  ['tabdocs.manager, group, bar, pinned, panel, empty', 'Units: behind the groups, a group, its strip and the line under it, the pinned tabs\' row, a panel, an empty group\'s text.'],
  ['tabdocs.tab, indicator, title, letter, pin, description, icon, badge, close, dirty', 'Units: a tab (`hover`, `selected`, `before-selected`, `focus`, `dragging`, `title` …; its end side is the line between tabs), the bar on it (`selected`, `active` in the active group), its parts in their tones.'],
  ['tabdocs.scroll, scroll-icon, scrollbar, thumb, count, sash, sash-line', 'Units: the scroll buttons, the thin scrollbar, the count on "…", a splitter and its line (`across`, `active`).'],
  ['tabdocs.tabs-height, tab-inset, tab-spacing, title-max, title-min, icon-room, close-room, pin-room, sash-thickness', 'Sizes the layout counts with (a shrinking tab keeps its icon, its close button and a few letters).'],
  ['tabdocs.indicator-inset, indicator-inset-start, indicator-inset-end', 'Where the bar on a tab stands.'],
  ['tabdocs.focus-width, focus-offset, touch-*', 'The ring\'s room at a small toolbar\'s ends; the sizes for a finger.'],
];

export default function TabDocsPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A document manager in the way code editors arrange files: documents in tabs, tabs in groups, groups split side by side and one under the other. A document's content is any component, a form, a grid or plain text, and it is moved, never made again, when its tab goes to another group. Everything the user does is a method too, asks first and reports after; the whole layout saves to JSON and comes back. Preview and pinned tabs, sizes and copies are on [Tabs](/tabdocs/tabs); context menus, lists and keys on [Menus and keys](/tabdocs/menus)." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TabDocument, TabDocumentManager } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="overview" title="Documents, groups and splits">
        <p>
          <Rich text="Make a manager, give it a size, and `open` documents in it. `split` opens a new group beside one; drag the line between two groups (or focus it and use the arrows), double click it to even the sizes, double click a tab to give its group all the room. The buttons at the end of each strip split and maximize." />
        </p>
        <Example files={code('Overview.tsx', 'contents.tsx', 'orders.ts')} stack>
          <Overview />
        </Example>
      </Section>

      <Section anchor="options" title="Options">
        <p>
          <Rich text="Every behaviour is a prop that takes a value or a function, followed live; a document's own `closable` and `contentLifetime` win over the manager's. Here Alpha cannot be closed and Gamma has unsaved changes." />
        </p>
        <Example files={code('Options.tsx', 'contents.tsx')} stack>
          <Options />
        </Example>
      </Section>

      <Section anchor="code" title="Programmatic use, and the events">
        <p>
          <Rich text="Each thing the user does is also a method (`open`, `close`, `activate`, `split`, `move`, `closeGroup`, `focusGroup`, `maximizeGroup`, `restoreGroups`, `evenSizes`, `resizeGroup`), asks first through a cancelable `on…ing` event and reports through `on…ed`, with `byUser` telling the two apart." />
        </p>
        <Example files={code('Programmatic.tsx', 'contents.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="unsaved" title="Unsaved changes">
        <p>
          <Rich text="`dirty` follows a function of the form's data: the tab shows a dot in place of its close button. `onClosing` sets `e.promise` to ask; the document closes when the promise says `true`." />
        </p>
        <Example files={code('UnsavedChanges.tsx', 'contents.tsx')} stack>
          <UnsavedChanges />
        </Example>
      </Section>

      <Section anchor="layout" title="Saving and restoring the layout">
        <p>
          <Rich text="`saveLayout()` writes plain JSON: the tree of splits with each child's share, the groups with their documents (`id`, `type`, `title`, `state`, `pinned`, `preview`), the active and recently used tabs, the active and maximized group. `loadLayout(json, factory)` builds it again; the factory makes each document by its `type`." />
        </p>
        <Example files={code('SaveRestore.tsx', 'contents.tsx', 'orders.ts')} stack>
          <SaveRestore />
        </Example>
      </Section>

      <Section anchor="lifetime" title="Content lifetime">
        <p>
          <Rich text="`contentLifetime` decides when a document's content is built and how long it lives. Whatever it is, moving a tab or splitting a group never builds the content again: the same component goes along." />
        </p>
        <ApiTable head={['Lifetime', 'Result']} rows={LIFETIME} />
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <p>
          <Rich text="The keys work while focus is inside the manager; each is a list of chords in `keys`, so any of them can be changed or turned off. A browser tab keeps Ctrl+W, Ctrl+Tab, Ctrl+Page Up / Down and often Ctrl+1…9 for itself, so the keys a manager starts with are ones a browser tab lets through, and the desktop key in brackets works too where it can (an installed app takes the desktop keys, `keyPreset`). The recently used list, back and forward, reopening and the other keys are on [Menus and keys](/tabdocs/menus#keyboard)." />
        </p>
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Every text comes from `uiLocale.strings` (`tabDocs…`: the group and strip names, “No open documents”, “unsaved changes”, the buttons, the announcements), in English and Turkish; `texts` changes some for one manager." />
        </p>
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
          <Rich text="TabDocument" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={DOCUMENT} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="TabGroup" />
        </h3>
        <ApiTable head={['Member', 'Access', 'Description']} rows={GROUP} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Contents']} rows={EVENTS} />
      </Section>
    </>
  );
}
