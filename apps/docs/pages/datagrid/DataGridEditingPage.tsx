import { Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import BatchSave from './examples/BatchSave';
import NewRows from './examples/NewRows';
import RowActions from './examples/RowActions';
import SaveModes from './examples/SaveModes';

export default function DataGridEditingPage() {
  return (
    <>
      <Section anchor="editing" title="Editing and save modes">
        <p>
          <Rich text="Typing on a cell, Enter, F2 or a double-click opens its editor; only the active cell has one. What is typed goes into the row's draft in the grid's `ChangeTracker`, kept by key, and the row is saved when it is left: `wait` sends it and waits, `background` sends it through one queue and goes on, `batch` keeps everything until “Save changes”. A row with a message cannot be left; Escape gives up. This service turns down a note with “error” in it." />
        </p>
        <Example files={[...withOrders('SaveModes.tsx', 'order-service.ts'), slowAdapterFile]} stack>
          <SaveModes />
        </Example>
      </Section>

      <Section anchor="batch" title="Saving all at once">
        <p>
          <Rich text="With `saveMode: 'batch'` every edit, new row and deletion waits for `saveChanges()`; then the deletions, the updates and the new rows go out, each kind in one call, and rows the server turns down keep their marks. Here over a server that loads by page: the changes stay while the pages turn, and the page's own buttons follow `hasChanges`." />
        </p>
        <Example files={[...withOrders('BatchSave.tsx', 'order-service.ts'), slowAdapterFile]} stack>
          <BatchSave />
        </Example>
      </Section>

      <Section anchor="new-rows" title="New rows">
        <p>
          <Rich text="`addRow()` or the toolbar's “New row” opens a row at the bottom (the grid goes to the very end; in a virtual list only the last block is loaded) or at the top, with its first cell a new row can fill in edit mode. Tab on the last cell of a new row saves it and opens the next one; Escape drops it; one left untouched goes by itself." />
        </p>
        <Example files={withOrders('NewRows.tsx')} stack>
          <NewRows />
        </Example>
      </Section>

      <Section anchor="actions" title="Row actions">
        <p>
          <Rich text="`actions` gives each row its buttons, as a list or as a function of the row and its state (`isNew`, `isEditing`, `isDirty`, `isSaving`, `hasError`, `isRemoved`, `isSelected`); when what the function reads changes, the row's buttons change. The grid's ready actions are named by strings. The buttons that do not fit the column go into the “more” menu, the first ones in the list stay. The column sits at the start or the end, pinned to its edge or scrolling with the rows." />
        </p>
        <Example files={withOrders('RowActions.tsx')} stack>
          <RowActions />
        </Example>
      </Section>
    </>
  );
}
