import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Duplicates from './examples/Duplicates';
import Look from './examples/Look';
import Pinning from './examples/Pinning';
import Preview from './examples/Preview';
import Sizing from './examples/Sizing';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['previewTabs', '`Bind<boolean>`', '`true`', 'Documents opened with `preview` replace the group\'s preview tab. With `false`, every document opens as a regular tab.'],
  ['pinnedTabSize', "`Bind<'normal' | 'compact' | 'shrink'>`", "`'normal'`", 'Pinned tabs can look like other tabs, show only their icon (or first letter, with the title kept for screen readers), or shrink to `tabMinWidth`.'],
  ['pinnedTabsOnSeparateRow', '`Bind<boolean>`', '`false`', 'Places pinned tabs on their own row, above the others.'],
  ['closeButtonOnPinned', '`Bind<boolean>`', '`false`', 'Shows a close button next to the pin icon on pinned tabs.'],
  ['keepPinned', '`Bind<boolean>`', '`true`', 'Keeps pinned tabs open with Close All, Close Others, Close to the Right or Left, and Close Saved.'],
  ['tabSize', "`Bind<'fit' | 'shrink' | 'fixed'>`", "`'fit'`", 'As wide as their text, shrinking down to `tabMinWidth` before the strip scrolls, or `tabFixedWidth` wide, shrinking down to `tabMinWidth`.'],
  ['tabMinWidth, tabMaxWidth, tabFixedWidth', '`Bind<number>`', '`80`, `0`, `160`', 'In pixels. `tabMaxWidth` limits `fit` and `shrink` tabs, and 0 leaves only the title\'s own limit.'],
  ['wrapTabs', '`Bind<boolean>`', '`false`', 'Tabs that do not fit continue on more rows instead of scrolling.'],
  ['scrollButtons', '`Bind<boolean>`', '`true`', 'Buttons at the ends of a strip that does not fit. The mouse wheel scrolls it sideways in any case.'],
  ['showDescription', "`Bind<'always' | 'duplicates' | 'never'>`", "`'duplicates'`", 'Whether a tab always shows its document\'s description, shows it only when another open document has the same title, or never shows it.'],
  ['allowDuplicate', '`Bind<boolean>`', '`false`', 'Allows the same document to be open in several groups. A document\'s own `allowDuplicate` takes precedence.'],
  ['splitCopies', '`Bind<boolean>`', '`true`', 'When splitting with a document that can be open twice, opens a copy in the new group. Otherwise, the document moves there.'],
];

const DOCUMENT = [
  ['preview', '`Bind<boolean>`', 'An italic preview tab, which the next preview opened in its group replaces. It stays after a double-click, an edit (`dirty`), `keep`, the menu or a move.'],
  ['pinned', '`Bind<boolean>`', 'Pinned tabs come first, in the order they were pinned, and have a pin icon that unpins them. Use `pin` and `unpin` so that events are raised.'],
  ['badge', '`Bind<string | number | boolean | null>`', 'A count or short text after the title. `true` shows a dot.'],
  ['tone', "`Bind<'warning' | 'danger' | 'success' | 'accent' | null>`", 'Colors the title and the badge.'],
  ['description', '`Bind<string>`', 'Displayed as set by `showDescription`, and in the document lists.'],
  ['allowDuplicate', '`Bind<boolean | undefined>`', 'Overrides the manager\'s setting for this document. `undefined` inherits the manager\'s value.'],
  ['clone', '`(copy) => ComponentBase | null`', 'Creates the content of a copy in another group. Without it, a `content` function is called again, or the manager\'s `factory` creates it. A component provided directly cannot be copied.'],
  ['original', 'read-only', 'For a copy, the document it was copied from, or `null` for the document itself. A copy has the same `id` and `type`, and shares every field except `pinned`, `preview` and `contentLifetime`.'],
];

const METHODS = [
  ['open(doc, { preview?, pinned?, … })', '`TabDocument | null`', 'Opens as a preview, replacing the group\'s preview tab, or as a pinned tab. A document open in another group is copied there if it can be open twice.'],
  ['keep(doc)', '`boolean`', 'Keeps a preview tab open.'],
  ['pin(doc), unpin(doc)', '`boolean`', 'Pins to the end of the pinned tabs, or unpins to the first position after them.'],
  ['closeOthers(doc), closeToRight(doc), closeToLeft(doc), closeSaved(group?)', '`Promise<boolean>`', 'Closes several documents, each raising `onClosing`. Pinned tabs stay while `keepPinned` is on.'],
  ['closeAll(group?, pinned?)', '`Promise<boolean>`', 'Pinned tabs stay while `keepPinned` is on, unless `pinned` is `true`.'],
  ['split(group, direction, doc?)', '`TabGroup | null`', 'Copies `doc` into the new group if it can be open twice and `splitCopies` is on. Otherwise, it moves.'],
];

const EVENTS = [
  ['onKeeping(e), onKept(e)', '`{ document, group, byUser }`. `keeping` is cancelable.'],
  ['onPinning(e), onPinned(e), onUnpinning(e), onUnpinned(e)', '`{ document, group, byUser }`. The `…ing` events are cancelable.'],
  ['onClosing(e)', 'Also includes `lastCopy`, which is true when no other copy of the document remains open, so prompt about unsaved changes only then. A preview replaced by the next one also closes through this event. If it cancels or sets a promise, the old preview stays open as a regular tab.'],
  ['onSplitting(e), onSplit(e)', 'Also includes `copy`: whether the document is copied (`splitting`), and the copy created (`split`).'],
];

const A11Y = [
  ['Preview and pinned tabs', 'A tab announces “preview” or “pinned” after its title. The pin icon is for pointer use. From the keyboard, use the menu (Shift+F10) or Ctrl+K Shift+Enter to pin and unpin, and Ctrl+K Enter to keep a preview.'],
  ['Compact pinned tabs', 'Show their icon or first letter. The title and description stay in the tab for screen readers.'],
  ['Scroll buttons', 'For pointer use only. The arrow keys reach every tab and scroll it into view.'],
  ['Badges and tones', 'A badge\'s text is part of the tab\'s name. A dot and a tone are color only, so make sure their meaning also appears in the title, the tooltip or the badge text.'],
  ['Announcements', 'Pinned, unpinned and kept open are announced politely, like opened and closed.'],
];

export default function TabDocsTabsPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Tabs that behave as they do in code editors: preview tabs replaced by the next preview, pinned tabs that stay at the start, tabs that shrink, wrap or scroll, counts and colors, and the same document open in two groups." />
      </p>

      <Section anchor="preview" title="Preview tabs">
        <p>
          <Rich text="`open(doc, { preview: true })` opens an italic tab that the next preview in the group replaces, so browsing through files leaves a single tab. Double-clicking the tab, making unsaved changes, calling `keep(doc)`, choosing Keep open in the menu or moving the tab keeps it open." />
        </p>
        <Example files={code('Preview.tsx', 'files.tsx')} stack>
          <Preview />
        </Example>
      </Section>

      <Section anchor="pinning" title="Pinned tabs">
        <p>
          <Rich text="`pin(doc)` moves a tab to the end of the pinned tabs at the start of the strip. It cannot be moved past the other tabs, and Close All leaves it open (`keepPinned`). `pinnedTabSize` shrinks pinned tabs to their icon or a short width, and `pinnedTabsOnSeparateRow` places them on their own row." />
        </p>
        <Example files={code('Pinning.tsx', 'files.tsx')} stack>
          <Pinning />
        </Example>
      </Section>

      <Section anchor="sizing" title="Tab sizes and overflow">
        <p>
          <Rich text="`tabSize` sets the width of tabs. When they still do not fit, the strip scrolls (with the wheel or the scroll buttons, keeping the active tab visible) or, with `wrapTabs`, continues on more rows." />
        </p>
        <Example files={code('Sizing.tsx', 'contents.tsx')} stack>
          <Sizing />
        </Example>
      </Section>

      <Section anchor="look" title="Badges, tones and descriptions">
        <p>
          <Rich text="`badge` is a count, a short text or a dot, and `tone` colors the title and the badge. By default, the description appears only when two open documents have the same title, as set by `showDescription`." />
        </p>
        <Example files={code('Look.tsx', 'files.tsx', 'contents.tsx')} stack>
          <Look />
        </Example>
      </Section>

      <Section anchor="duplicates" title="One document in two groups">
        <p>
          <Rich text="With `allowDuplicate`, a document opens in another group as a copy with its own content (from `clone`, a `content` function or the `factory`), sharing the title, the unsaved changes and the state. Splitting copies the active document, and `splitCopies: false` moves it instead." />
        </p>
        <Example files={code('Duplicates.tsx', 'contents.tsx')} stack>
          <Duplicates />
        </Example>
        <Code
          code={`
docs.onClosing((e) => {
  // Ask only when the last copy closes.
  if (e.document.dirty && e.lastCopy) e.promise = confirm('Close without saving?');
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
        <p>
          <Rich text="See the [overview](/tabdocs#api) for the rest of the API, and [Menus and keys](/tabdocs/menus) for menus, lists and keys." />
        </p>
      </Section>
    </>
  );
}
