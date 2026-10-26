import { Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Workspace from './examples/Workspace';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function TabDocsWorkspacePage() {
  return (
    <>
      <p class="lead">
        A whole screen made of the kit's parts: a menu bar, the manager, a DataGrid with everything turned on, forms and a tool docked at the bottom. Each
        part is the same component it is on its own page; the manager only holds them.
      </p>

      <Section anchor="desk" title="An order desk">
        <p>
          <Rich text="The orders grid filters, groups, searches, sums, edits in batches and runs row actions, also from its context menu. Its tab shows the unsaved mark while edits wait to be saved. Open a customer from a row (its menu or the actions column): the card opens in the group on the right. Drag a tab to a guide, float it, move it into a new window, or use the menus: the grid keeps its filters, its scroll and its unsaved edits wherever it goes." />
        </p>
        <Example files={code('Workspace.tsx', 'contents.tsx')} stack>
          <Workspace />
        </Example>
      </Section>
    </>
  );
}
