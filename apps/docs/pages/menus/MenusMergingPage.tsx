import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import MergedDocuments from './examples/MergedDocuments';
import MergedMenus from './examples/MergedMenus';
import MergedWindow from './examples/MergedWindow';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MERGE = [
  ['auto', 'The default. An item with a menu joins the app’s item with the same key; any other item is added.'],
  ['add', 'Always added beside the app’s items, even when one has the same key.'],
  ['replace', 'Takes the place of the app’s item with the same key.'],
  ['remove', 'Takes the app’s item with the same key away while the bar is merged.'],
  ['none', 'Stays out of the app’s bar.'],
];

const WHEN = [
  ['shown', 'The default. Merged while the bar’s place (`mergeScope`, its parent by default) is shown: the tab or the document shown.'],
  ['focus', 'Merged while focus is in its place, such as a window that is not modal.'],
  ['manual', 'Merged only by `merge()` and unmerged by `unmerge()`.'],
];

export default function MenusMergingPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A page can have several bars: the app’s bar, and the bars of documents, windows and tabs. The bar of the document in use shows its items in the app’s bar, so the user always finds the commands in one place." />
      </p>

      <Section anchor="merging" title="Merging into the app’s bar">
        <p>
          <Rich text="The app’s bar is marked `mergeHost`; a page with several such bars names them with `mergeName` (`'main'` by default). The bar of a document names the app’s bar with `mergeInto`, by name or as the bar itself; the two can be anywhere in the component tree. While it is merged, its items are shown in the app’s bar and it hides itself (`hideWhenMerged`)." />
        </p>
        <p>
          <Rich text="`mergeAt` places an item: an index, or `{ before: key }` or `{ after: key }`. A merged item’s action, `onItemClick` and the user’s changes stay with its own bar, and it takes another access key when the app’s bar already uses its letter." />
        </p>
        <Example files={code('MergedMenus.tsx')} stack>
          <MergedMenus />
        </Example>
        <ApiTable head={['merge', 'What the item does in the app’s bar']} rows={MERGE} />
      </Section>

      <Section anchor="when" title="When a bar merges">
        <ApiTable head={['mergeWhen', 'Merged']} rows={WHEN} />
        <p>
          <Rich text="The app’s bar reports the bars that come and go with `onMerged` and `onUnmerged`; `mergedBars`, `mergedInto` and `mergedItems` tell what is merged now. A bar that waits for an app’s bar not yet created merges when it comes." />
        </p>
      </Section>

      <Section anchor="documents" title="Documents of a TabDocumentManager">
        <p>
          <Rich text="Each document has a bar in its content; the bar of the active document is the one shown, so its menus are in the app’s bar. A document moved into a browser window of its own is shown there too: its menus stay in the app’s bar of the main window, beside those of the document shown in the main window, until the window closes." />
        </p>
        <Example files={code('MergedDocuments.tsx')} stack>
          <MergedDocuments />
        </Example>
      </Section>

      <Section anchor="window" title="A window">
        <p>
          <Rich text="A window that is not modal stays open while the user works elsewhere, so its bar merges while focus is in it (`mergeWhen: 'focus'`)." />
        </p>
        <Example files={code('MergedWindow.tsx')} stack>
          <MergedWindow />
        </Example>
      </Section>
    </>
  );
}
