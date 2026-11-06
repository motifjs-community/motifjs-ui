import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Duplicates from './examples/Duplicates';
import Look from './examples/Look';
import Pinning from './examples/Pinning';
import Preview from './examples/Preview';
import Sizing from './examples/Sizing';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['previewTabs', '`Bind<boolean>`', '`true`', 'Documents opened with `preview` take the place of the group\'s preview tab. `false`: every document opens to stay.'],
  ['pinnedTabSize', "`Bind<'normal' | 'compact' | 'shrink'>`", "`'normal'`", 'Pinned tabs like the others, only their icon (or first letter; the title stays for screen readers), or shrunk to `tabMinWidth`.'],
  ['pinnedTabsOnSeparateRow', '`Bind<boolean>`', '`false`', 'Pinned tabs in a row of their own, above the others.'],
  ['closeButtonOnPinned', '`Bind<boolean>`', '`false`', 'Pinned tabs show a close button next to their pin mark.'],
  ['keepPinned', '`Bind<boolean>`', '`true`', 'Close all, close others, close to the right or left and close saved leave pinned tabs open.'],
  ['tabSize', "`Bind<'fit' | 'shrink' | 'fixed'>`", "`'fit'`", 'As wide as their text; shrinking down to `tabMinWidth` before the strip scrolls; all `tabFixedWidth` wide, shrinking down to `tabMinWidth`.'],
  ['tabMinWidth, tabMaxWidth, tabFixedWidth', '`Bind<number>`', '`80`, `0`, `160`', 'In pixels. `tabMaxWidth` caps `fit` and `shrink` tabs; 0 leaves only the title\'s own limit.'],
  ['wrapTabs', '`Bind<boolean>`', '`false`', 'Tabs that do not fit go on to more rows instead of scrolling.'],
  ['scrollButtons', '`Bind<boolean>`', '`true`', 'Buttons at the ends of a strip that does not fit (the mouse wheel scrolls it sideways either way).'],
  ['showDescription', "`Bind<'always' | 'duplicates' | 'never'>`", "`'duplicates'`", 'A tab shows its document\'s description always, only when another open document has the same title, or never.'],
  ['allowDuplicate', '`Bind<boolean>`', '`false`', 'The same document may be open in several groups; a document\'s own `allowDuplicate` wins.'],
  ['splitCopies', '`Bind<boolean>`', '`true`', 'Splitting with a document that may be open twice opens a copy in the new group; otherwise the document moves there.'],
];

const DOCUMENT = [
  ['preview', '`Bind<boolean>`', 'A preview tab, in italics: the next preview opened in its group takes its place. It stays after a double click, an edit (`dirty`), `keep`, the menu, or a move.'],
  ['pinned', '`Bind<boolean>`', 'Pinned tabs come first, in the order they were pinned, and keep a pin mark that unpins them. Set through `pin` / `unpin` to be asked and told.'],
  ['badge', '`Bind<string | number | boolean | null>`', 'A count or short text after the title; `true` shows a dot.'],
  ['tone', "`Bind<'warning' | 'danger' | 'success' | 'accent' | null>`", 'Colours the title and the badge.'],
  ['description', '`Bind<string>`', 'Shown as `showDescription` says, and in the lists of documents.'],
  ['allowDuplicate', '`Bind<boolean | undefined>`', 'Overrides the manager\'s setting for this document. `undefined` inherits the manager\'s value.'],
  ['clone', '`(copy) => ComponentBase | null`', 'Makes the content of a copy in another group. Without it a `content` function is called again, or the manager\'s `factory` makes it; a component given as it is cannot be copied.'],
  ['original', 'read-only', 'For a copy, the document it was copied from; `null` for the document itself. A copy has the same `id` and `type` and shares every field but `pinned`, `preview` and `contentLifetime`.'],
];

const METHODS = [
  ['open(doc, { preview?, pinned?, … })', '`TabDocument | null`', 'Opens as a preview (replacing the group\'s preview tab) or pinned. A document open in another group is copied there when it may be open twice.'],
  ['keep(doc)', '`boolean`', 'A preview tab stays.'],
  ['pin(doc), unpin(doc)', '`boolean`', 'Pins to the end of the pinned tabs; unpins to the first place after them.'],
  ['closeOthers(doc), closeToRight(doc), closeToLeft(doc), closeSaved(group?)', '`Promise<boolean>`', 'Close several documents, each one asking through `onClosing`; pinned tabs stay while `keepPinned` is on.'],
  ['closeAll(group?, pinned?)', '`Promise<boolean>`', 'Pinned tabs stay while `keepPinned` is on, unless `pinned` is `true`.'],
  ['split(group, direction, doc?)', '`TabGroup | null`', 'Copies `doc` into the new group when it may be open twice and `splitCopies` is on; moves it otherwise.'],
];

const EVENTS = [
  ['onKeeping(e), onKept(e)', '`{ document, group, byUser }`; `keeping` is cancelable.'],
  ['onPinning(e), onPinned(e), onUnpinning(e), onUnpinned(e)', '`{ document, group, byUser }`; the `…ing` ones are cancelable.'],
  ['onClosing(e)', 'Also `lastCopy`: no other copy of the document stays open, so ask about unsaved changes only then. A preview replaced by the next one closes through it too: when it cancels (or sets a promise) the old preview stays, kept.'],
  ['onSplitting(e), onSplit(e)', 'Also `copy`: whether the document is copied (`splitting`), the copy made (`split`).'],
];

const A11Y = [
  ['Preview and pinned tabs', 'A tab says “preview” or “pinned” after its title. The pin mark is for the pointer; the menu (Shift+F10) and Ctrl+K Shift+Enter pin and unpin from the keyboard, Ctrl+K Enter keeps a preview.'],
  ['Compact pinned tabs', 'Show their icon or first letter; the title and description stay in the tab for screen readers.'],
  ['Scroll buttons', 'For the pointer only: the arrow keys reach every tab and scroll it into sight.'],
  ['Badges and tones', 'A badge\'s text is part of the tab\'s name; a dot and a tone are colour only, so say what they mean in the title, the tooltip or the badge text.'],
  ['Announcements', 'Pinned, unpinned and kept open are said politely, like opened and closed.'],
];

export default function TabDocsTabsPage() {
  return (
    <>
      <p class="lead">
        <Rich text="What a tab does in a code editor: preview tabs that the next preview replaces, pinned tabs that stay at the start, tabs that shrink, wrap or scroll, counts and colours, and the same document open in two groups." />
      </p>

      <Section anchor="preview" title="Preview tabs">
        <p>
          <Rich text="`open(doc, { preview: true })` opens a tab in italics that the next preview in the group replaces, so looking through files leaves one tab. A double click on the tab, unsaved changes, `keep(doc)`, the menu's Keep open or a move makes it stay." />
        </p>
        <Example files={code('Preview.tsx', 'files.tsx')} stack>
          <Preview />
        </Example>
      </Section>

      <Section anchor="pinning" title="Pinned tabs">
        <p>
          <Rich text="`pin(doc)` moves a tab to the end of the pinned ones at the start of the strip; it cannot be moved past the others, and close all leaves it (`keepPinned`). `pinnedTabSize` shrinks pinned tabs to their icon or a short width, `pinnedTabsOnSeparateRow` gives them a row of their own." />
        </p>
        <Example files={code('Pinning.tsx', 'files.tsx')} stack>
          <Pinning />
        </Example>
      </Section>

      <Section anchor="sizing" title="Tab sizes and overflow">
        <p>
          <Rich text="`tabSize` picks how wide tabs are; when they still do not fit the strip scrolls (wheel, scroll buttons, the active tab always in sight) or, with `wrapTabs`, goes on to more rows." />
        </p>
        <Example files={code('Sizing.tsx', 'contents.tsx')} stack>
          <Sizing />
        </Example>
      </Section>

      <Section anchor="look" title="Badges, tones and descriptions">
        <p>
          <Rich text="`badge` is a count, a short text or a dot; `tone` colours the title and the badge. The description shows only when two open documents share a title, as `showDescription` says." />
        </p>
        <Example files={code('Look.tsx', 'files.tsx', 'contents.tsx')} stack>
          <Look />
        </Example>
      </Section>

      <Section anchor="duplicates" title="One document in two groups">
        <p>
          <Rich text="With `allowDuplicate` a document opens in another group as a copy with content of its own (from `clone`, a `content` function or the `factory`), sharing the title, the unsaved changes and the state. Splitting copies the active document; `splitCopies: false` moves it instead." />
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
          <Rich text="The rest of the API is on the [overview](/tabdocs#api); the menus, the lists and the keys on [Menus and keys](/tabdocs/menus)." />
        </p>
      </Section>
    </>
  );
}
