import { Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Workspace from './examples/Workspace';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function TabDocsWorkspacePage() {
  return (
    <>
      <p class="lead">
        <Rich text="A complete screen built from kit components: a menu bar, the manager, a DataGrid with every feature enabled, forms, and a tool docked at the bottom. Each part is the same component documented on its own page, and the manager simply hosts them." />
      </p>

      <Section anchor="desk" title="An order desk">
        <p>
          <Rich text="The orders grid supports filtering, grouping, search, summaries, batch editing and row actions, which are also in its context menu. Its tab shows the unsaved mark while edits are waiting to be saved. Open a customer from a row, using its menu or the actions column, and the customer's card opens in the group on the right. Drag a tab to a guide, float it, move it to a new window or use the menus, and the grid keeps its filters, scroll position and unsaved edits wherever it goes." />
        </p>
        <Example files={code('Workspace.tsx', 'contents.tsx')} stack>
          <Workspace />
        </Example>
      </Section>
    </>
  );
}
