import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import FormMode from './examples/FormMode';
import PopupMode from './examples/PopupMode';
import ValidationRules from './examples/ValidationRules';

const MODES = [
  ['row', 'In the cells, one editor at a time', 'Leaving the row', "The grid's default. With `saveMode: 'batch'` it is the same as `batch`."],
  ['cell', 'In the cells', 'Leaving each cell (Enter, Tab, an arrow, a click elsewhere); a new row on leaving the row', 'A message keeps the cell until it is fixed or Escape.'],
  ['batch', 'In the cells', '`saveChanges()` (“Save changes”)', "Sets the save mode to `'batch'`, whatever `saveMode` says."],
  ['form', 'In a form that takes the row’s place, as wide as the grid', 'Save (or Enter); Cancel and Escape give up', 'Typing on a cell does not open it: Enter, F2, the start-edit click, the `edit` action, `editRow()` and `addRow()` do.'],
  ['popup', 'In the same form in a modal window', 'Save (or Enter); Cancel, Escape and the close button give up', 'Focus stays in the window and comes back to the row.'],
];

const SETTINGS = [
  ['editMode', "`'row'`", 'How rows are edited and when a row is handed to saving (the table above). Changing it to or from `batch` starts again with the data, like `saveMode`.'],
  ['confirmDelete', '`true`', 'Deleting a row (`deleteRow()`, `deleteRows()`, the `remove` action) asks first, once for all the rows an action deletes; not in batch mode, where a deletion is only marked and can be taken back. Texts: `gridConfirmDelete`, `gridConfirmDeleteRows`, `gridConfirmDeleteTitle`.'],
  ['selectTextOnEditStart', '`true`', 'The text of a cell or a form field is selected when its editor opens; off, the caret goes to its end.'],
];

const FORM = [
  ['form.items', '`Bind<(string | FormItem)[]>`', 'every column', 'What the form holds, in order: a column by field name, or a kit `FormItem`. An item whose `field` is a column’s gets that column’s editor (by type, a lookup’s, the column’s own `editor`), with the item’s `label`, `colSpan`, `helpText`, `visible` and `editorProps`; groups (`group`, `items`, `columns`), buttons and `template`s are the form’s own. By default every column, the visible ones first, hidden ones too; a column the user cannot fill shows read-only.'],
  ['form.colCount', '`Bind<number>`', '`2`', 'Columns of the form.'],
  ['form.minColWidth', '`Bind<string>`', '—', 'As many columns as fit, each at least this wide; `colCount` is the most.'],
  ['form.labelMode', "`Bind<'top' | 'side' | 'floating' | 'hidden'>`", "`'top'`", 'Where the labels go.'],
  ['popup.title, popup.showTitle', '`Bind<string>`, `Bind<boolean>`', '“Edit row” / “New row”, `true`', 'The window’s title; hidden, it still names the window for screen readers.'],
  ['popup.width, popup.height', '`Bind<number | string>`', 'as the form needs', 'A CSS length, or pixels.'],
  ['popup.resizable, popup.movable', '`Bind<boolean>`', '`true`', 'Resized from its edges, moved by its title bar.'],
  ['popup.showCloseButton, popup.showMaximize, popup.fullScreen', '`Bind<boolean>`', '`true`, `false`, `false`', 'The close button (it cancels), the maximize button, opening maximized.'],
];

const COLUMN = [
  ['formItem.visible', '`Bind<boolean>`', 'The column in the form or not.'],
  ['formItem.colSpan', "`number | 'all'`", 'Form columns it spans.'],
  ['formItem.label, formItem.helpText', '`Bind<string>`', 'The label (default: the title) and a line under the editor.'],
  ['formItem.editorOptions', '`Record<string, unknown>`', 'Props of its editor in the form only, over the column’s.'],
  ['formItem.order', '`number`', 'Its place in the form; lower first.'],
  ['validationRules', '`GridValidationRule[]`', 'The rules below, checked after `required` and `validate`.'],
];

const RULES = [
  ['required', '`trim` (default `true`)', 'An empty value (spaces only, with `trim`) fails.'],
  ['numeric', '`ignoreEmptyValue` (`true`)', 'A number, or a text that is one.'],
  ['range', '`min`, `max` (`Bind<number | Date>`), `ignoreEmptyValue` (`true`), `reevaluate`', 'Between the bounds; numbers or dates.'],
  ['stringLength', '`min`, `max`, `trim` (`true`), `ignoreEmptyValue` (`false`)', 'The length of the text.'],
  ['pattern', '`pattern` (`Bind<RegExp | string>`), `ignoreEmptyValue` (`true`)', 'Matches; a string is found anywhere in the value, as `new RegExp(pattern)` does.'],
  ['email', '`ignoreEmptyValue` (`true`)', 'An e-mail address.'],
  ['compare', "`comparisonTarget(row)`, `comparisonType` (`'=='`, `'!='`, `'==='`, `'!=='`, `'<'`, `'<='`, `'>'`, `'>='`), `ignoreEmptyValue` (`false`)", 'The value against what the function returns (another field of the row); checked on every check of the row.'],
  ['custom', '`validationCallback({ value, row, column, rule })`, `ignoreEmptyValue` (`false`), `reevaluate` (`false`)', '`true` passes, `false` fails with `message`, a string fails with that text.'],
  ['async', '`validationCallback(…)` returning a promise, `ignoreEmptyValue` (`false`), `reevaluate` (`true`)', 'The answer: `true`, `false`, a message or `{ isValid, message }`; a rejection fails with its message. The row waits for it before it is sent; its cell shows that it is busy.'],
];

const EVENTS = [
  ['onEditingStart', '`{ field, row, rowIndex, isNew, cancel }`', 'A cell editor, or the form of a row (`field` `\'\'`), is about to open; `cancel` keeps the row as it is.'],
  ['onEditorPreparing', '`{ field, row, isNew, options, cancel }`', 'Before an editor of a cell or of a form field is made: change its props; `cancel` leaves a field out of the form.'],
  ['onEditorPrepared', "`{ field, row, isNew, editor, element, place: 'cell' | 'form' }`", 'An editor was made.'],
  ['onRowValidating', '`{ key, row, isNew, changed, errors, isValid, errorText, cancel }`', 'A row is checked before it is saved, after its cells (and their async rules): add or take out messages in `errors` (by field, `\'\'` the row), or `isValid = false` with `errorText`. Once per check of the row.'],
  ['onInitNewRow, onSaving, onRowInserting, onRowUpdating, onEditCanceling …', 'see [Events](/datagrid/layout#events)', 'The same in every edit mode: Save in a form is a save, Cancel a cancel.'],
];

const METHODS = [
  ['editRow(i) / editRowByKey(key)', '`boolean`', 'Opens the first editor of a row, or its form (`form`, `popup`); by key while the row is loaded.'],
  ['addRow(values?)', '`Promise<boolean>`', 'Opens a new row: in its cells, in place as a form, or in the window.'],
  ['saveEditData()', '`Promise<boolean>`', 'Saves what is being edited, as Save does: the form, else the row being edited; in batch mode every unsaved change.'],
  ['cancelEditData()', '`void`', 'Gives up what is being edited, as Cancel does; in batch mode every unsaved change.'],
  ['closeEditCell()', '`boolean`', 'Keeps the open editor’s value and closes it; in a form, keeps every field’s value.'],
  ['form, popup', 'read/write, live', '`grid.form.colCount = 3`, `grid.popup.width = \'40rem\'`; a function is followed; `onOptionChanged` tells `form.colCount`, `popup.width` ….'],
];

export default function DataGridFormsPage() {
  return (
    <>
      <Section anchor="forms" title="Edit forms and popups">
        <p>
          <Rich text="`settings.editMode` decides how a row is edited and when it is handed to saving; `saveMode` decides how a row handed over is sent — waiting for the answer, in the background, or kept for `saveChanges()`. In `form` mode the row opens as a form in its place, the kit's `FormLayout` with a field per column: each the editor its cell would get, framed and labelled, the messages of the checks under it. The rows after it move down by its height, also in the virtual list. Save (or Enter in a field) saves the row as the save mode says, Cancel or Escape gives it up; focus moves into the form and back to the row. Here the form has two groups; the buttons switch the edit mode." />
        </p>
        <Example files={[...withOrders('FormMode.tsx', 'order-service.ts'), slowAdapterFile]} stack>
          <FormMode />
        </Example>
        <ApiTable head={['editMode', 'Edited', 'Handed to saving', 'Notes']} rows={MODES} />
        <p>
          <Rich text="In `popup` mode the same form opens in the kit's `MxForm` as a modal window: for an existing row and for a new one (`addRow()`, “New row”). Focus stays in the window; Enter presses Save and Escape Cancel; when it closes, focus is back on the row. `popup` sets its title and size, `form` and the columns' `formItem` the fields." />
        </p>
        <Example files={withOrders('PopupMode.tsx')} stack>
          <PopupMode />
        </Example>
        <ApiTable head={['Setting', 'Default', 'What it does']} rows={SETTINGS} />
        <ApiTable head={['Prop', 'Type', 'Default', 'What it does']} rows={FORM} />
        <ApiTable head={['Column field', 'Type', 'What it does']} rows={COLUMN} />
      </Section>

      <Section anchor="rules" title="Validation rules">
        <p>
          <Rich text="A column's `validationRules` are the standard rule set, checked with the kit's own validation rules as a value is written and again before its row is saved; `required` and `validate` keep working before them. The rules run in order and the `async` ones last, together: the row waits for their answer, its cell busy meanwhile. A value is not checked twice: only `reevaluate` (on for `async`) and `compare` run on every check of the row. `onRowValidating` comes after the cells, for the row as a whole. The messages show in the cells, in the form and in the window. Here the server turns down a customer with “test” in the name." />
        </p>
        <Example files={withOrders('ValidationRules.tsx')} stack>
          <ValidationRules />
        </Example>
        <ApiTable head={['Rule type', 'Options', 'Passes when']} rows={RULES} />
        <p>
          <Rich text="Every rule takes a `message` (`Bind<string>`); without it the text comes from `uiLocale` (or the grid's `texts`): `required`, `gridInvalidNumber`, `tooShort` / `tooLong`, `outOfRange` / `tooSmall` / `tooLarge`, `invalidFormat`, `invalidEmail`, `noMatch`, `invalid`." />
        </p>
      </Section>

      <Section anchor="form-api" title="Events and methods">
        <ApiTable head={['Event', 'Gets', 'When']} rows={EVENTS} />
        <ApiTable head={['Member', 'Returns', 'What it does']} rows={METHODS} />
      </Section>
    </>
  );
}
