import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import BarActions from './examples/BarActions';
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
        <p>
          <Rich text="The actions can show in the toolbar (`actionsLocation: 'toolbar'`, the `rowActions` item) or in the bottom bar (`'bottom'`) instead, for the rows they act on: the selected rows, or the active row without selection (`actionsTarget`). With no row nothing shows; with one row its own actions, as the row would show them; with several only the ones every row has, each with the count of rows it runs on (“Approve (3)”), dimmed while it is disabled for one of them (`actionsMultipleEnabled: 'any'` lets it run on the rows where it is enabled). An action’s `location` wins, so “Approve” can sit in the toolbar while “Edit” stays in the row; the column shows only while an action sits there. `onclickMany` runs once with every row; without it `onclick` runs row by row, a promise waited for, with progress and a Stop button over the rows, and the outcome is announced (“2 of 3 done, 1 failed”). The ready `remove` marks all the rows in batch mode and in the other modes sends them in one save (`ChangeTracker.removeRows`: one request when the adapter saves in batches, OData `$batch`, a REST batch endpoint or a SOAP `save`). An action’s `tone` colours its button and its menu items (`'danger'` for the ready `remove`, `'accent'` for `save`)." />
        </p>
        <p>
          <Rich text="Every row's actions are also in its context menu (right click, Shift+F10), wherever they show: inside a selection of several rows the common ones for all of them. With `actionsDisplay: 'menu'` a row shows only its “more” button, with every action in its menu, and the bars one “Actions” menu button; an action's `menu` keeps it in the menu always, or a button always." />
        </p>
        <p>
          <Rich text="After “select all” over a server the rows are not loaded: only actions with `onclickSelection` show then, and they get the selection as `grid.selection` has it (`all`, `keys`, `except`, `filter`) to send to the server, so nothing has to load every row." />
        </p>
        <Example files={withOrders('BarActions.tsx')} stack>
          <BarActions />
        </Example>
        <ApiTable
          head={['Setting', 'Default', 'Description']}
          rows={[
            ['actionsLocation', "`'row'`", "Where the actions show: `'row'`, `'toolbar'` (the `rowActions` toolbar item, at the start; place it through `toolbar.items` like the other items) or `'bottom'` (the start of the bottom bar)."],
            ['actionsTarget', "`'auto'`", "The rows the bars act on: `'selection'`, `'focused'` (the active row) or `'auto'` (the selected rows while selection is on, else the active row)."],
            ['actionsDisplay', "`'auto'`", "`'auto'`: the buttons that fit, the rest in “more”. `'menu'`: only the “more” button per row (the column is as wide as that button; with an action that is a button always, `actionsWidth`), one “Actions” menu button in the bars. The context menu always lists them all."],
            ['actionsMultipleEnabled', "`'all'`", "On several rows an action can be used while it is enabled for all of them, or for any (`'any'`: it runs on those)."],
            ['actionsShowCount', '`true`', 'The count of rows after the text of an action that acts on several (“Approve (3)”).'],
            ['actionsStopOnError', '`false`', 'Row by row, a failed row stops the rest.'],
            ['actionsProgress, actionsStopButton', '`true`, `true`', 'The panel over the rows while an action works on several rows (once one of them returned a promise), and its Stop button.'],
            ['actionsContextMenu', '`true`', 'A row’s actions in its context menu.'],
          ]}
        />
        <ApiTable
          head={['Action field', 'Description']}
          rows={[
            ['id, text, icon, showText, hint', 'As in the row. Rows share an action by its `id`.'],
            ['tone', "`'standard' | 'accent' | 'danger'`, default `'standard'`: the colour of its button and of its item in the “more” menu, the context menu and the bars’ “Actions” menu."],
            ['visible, disabled', '`boolean` or `(row, state) => boolean`, asked for each row; several rows: visible for every row, disabled as `actionsMultipleEnabled` says.'],
            ['location', "`Bind<'row' | 'toolbar' | 'bottom'>`; wins over `actionsLocation`."],
            ['menu', "`Bind<'auto' | 'always' | 'never'>`, default `'auto'`: in the “more” menu when it does not fit, always, or never (a button even in the `'menu'` display)."],
            ['multiple', '`Bind<boolean>`, default `true` (the ready `edit`: `false`): it can run on several rows.'],
            ['multipleEnabled, stopOnError, showCount, contextMenu', 'The action’s own `actionsMultipleEnabled`, `actionsStopOnError`, `actionsShowCount`, `actionsContextMenu`; each wins.'],
            ['beginGroup', 'A line before it in a menu.'],
            ['onclick(row, state)', 'Runs for one row; on several rows (without `onclickMany`) for each in turn. A promise is waited for; a throw, a rejection or a promise of `false` counts the row as failed.'],
            ['onclickMany(rows, e)', 'Runs once for several rows (one row too without `onclick`). `e`: `{ location, signal, progress(done, total?) }`; `signal` is aborted by Stop.'],
            ['onclickSelection(selection, e)', 'Runs for a selection whose rows are not loaded (“select all” over a server), with the selection state; only such actions show then.'],
          ]}
        />
        <ApiTable
          head={['Member', 'Gets / returns', 'Description']}
          rows={[
            ['onActionRunning', '`{ action, rows, selection, location, cancel }`', 'An action is about to run (in a row, a bar, a row’s menu or programmatically); `cancel` keeps it from running. `rows` is empty for a selection that is not loaded.'],
            ['onActionRan', '`{ action, rows, location, done, failed, canceled, errors }`', 'An action ran. Without a listener, what failed rows threw goes to the console.'],
            ['runAction(id, rows?)', '`Promise<GridActionRanEventArgs | null>`', 'Runs an action on `rows`, or on the rows the bars act on now, where it is visible and enabled; `null` when it is not there or was cancelled.'],
            ['actionTargets', '`T[]`, reactive', 'The rows the bars act on now; empty for a selection that is not loaded.'],
            ['barActions', '`GridBarAction[]`, reactive', 'The actions the toolbar and the bottom bar show now: `{ action, location, text, count, disabled, rows }`.'],
            ['stopAction()', '`void`', 'Stops the action working on several rows, as its Stop button does.'],
          ]}
        />
      </Section>
    </>
  );
}
