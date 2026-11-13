import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import FormMode from './examples/FormMode';
import PopupMode from './examples/PopupMode';
import ValidationRules from './examples/ValidationRules';

const MODES = [
  ['row', 'In the cells, with one editor at a time', 'When leaving the row', "The grid's default. With `saveMode: 'batch'`, it is the same as `batch`."],
  ['cell', 'In the cells', 'When leaving each cell (Enter, Tab, an arrow key or a click elsewhere), or for a new row, when leaving the row', 'A validation message keeps the cell open until it is fixed or Escape is pressed.'],
  ['batch', 'In the cells', '`saveChanges()` (“Save changes”)', "Sets the save mode to `'batch'`, regardless of `saveMode`."],
  ['form', 'In a form that replaces the row, as wide as the grid', 'On Save (or Enter). Cancel and Escape discard the edit.', 'Typing on a cell does not open it. Use Enter, F2, the start-edit click, the `edit` action, `editRow()` or `addRow()`.'],
  ['popup', 'In the same form, in a modal window', 'On Save (or Enter). Cancel, Escape and the close button discard the edit.', 'Focus stays in the window and returns to the row.'],
];

const SETTINGS = [
  ['editMode', "`'row'`", 'How rows are edited and when a row is submitted for saving (see the table above). Changing to or from `batch` reloads the data, as with `saveMode`.'],
  ['confirmDelete', '`true`', 'Prompts before deleting a row (`deleteRow()`, `deleteRows()`, the `remove` action), once for all the rows an action deletes. This does not apply in batch mode, where a deletion is only marked and can be undone. Strings: `gridConfirmDelete`, `gridConfirmDeleteRows`, `gridConfirmDeleteTitle`.'],
  ['selectTextOnEditStart', '`true`', 'Selects the text of a cell or form field when its editor opens. When disabled, the caret moves to the end.'],
];

const FORM = [
  ['form.items', '`Bind<(string | FormItem)[]>`', 'Every column', 'The contents of the form, in order: a column by field name, or a kit `FormItem`. An item whose `field` matches a column uses that column\'s editor (by type, a lookup\'s, or the column\'s own `editor`), with the item\'s `label`, `colSpan`, `helpText`, `visible` and `editorProps`. Groups (`group`, `items`, `columns`), buttons and `template` items belong to the form. By default, the form includes every column, visible ones first, and a column the user cannot fill appears read-only.'],
  ['form.colCount', '`Bind<number>`', '`2`', 'The number of columns in the form.'],
  ['form.minColWidth', '`Bind<string>`', '—', 'Fits as many columns as possible, each at least this wide. `colCount` sets the maximum.'],
  ['form.labelMode', "`Bind<'top' | 'side' | 'floating' | 'hidden'>`", "`'top'`", 'Label placement.'],
  ['popup.title, popup.showTitle', '`Bind<string>`, `Bind<boolean>`', '“Edit row” / “New row”, `true`', 'The window\'s title. When hidden, it still names the window for screen readers.'],
  ['popup.width, popup.height', '`Bind<number | string>`', 'As the form requires', 'A CSS length, or pixels.'],
  ['popup.resizable, popup.movable', '`Bind<boolean>`', '`true`', 'Whether it can be resized from its edges and moved by its title bar.'],
  ['popup.showCloseButton, popup.showMaximize, popup.fullScreen', '`Bind<boolean>`', '`true`, `false`, `false`', 'The close button (which cancels), the maximize button, and opening maximized.'],
];

const COLUMN = [
  ['formItem.visible', '`Bind<boolean>`', 'Whether the column appears in the form.'],
  ['formItem.colSpan', "`number | 'all'`", 'The number of form columns it spans.'],
  ['formItem.label, formItem.helpText', '`Bind<string>`', 'The label (by default, the title) and a line of text below the editor.'],
  ['formItem.editorOptions', '`Record<string, unknown>`', 'Props of its editor in the form only, which override the column\'s.'],
  ['formItem.order', '`number`', 'Its position in the form, with lower values first.'],
  ['validationRules', '`GridValidationRule[]`', 'The rules described below, checked after `required` and `validate`.'],
];

const RULES = [
  ['required', '`trim` (default `true`)', 'An empty value (spaces only, with `trim`) is invalid.'],
  ['numeric', '`ignoreEmptyValue` (`true`)', 'A number, or text that represents a number.'],
  ['range', '`min`, `max` (`Bind<number | Date>`), `ignoreEmptyValue` (`true`), `reevaluate`', 'Between the bounds, for numbers or dates.'],
  ['stringLength', '`min`, `max`, `trim` (`true`), `ignoreEmptyValue` (`false`)', 'The length of the text.'],
  ['pattern', '`pattern` (`Bind<RegExp | string>`), `ignoreEmptyValue` (`true`)', 'It matches. A string is found anywhere in the value, as with `new RegExp(pattern)`.'],
  ['email', '`ignoreEmptyValue` (`true`)', 'An email address.'],
  ['compare', "`comparisonTarget(row, context)` (`context.getValue('password')` returns the entered value, otherwise the row's), `comparisonType` (`'=='`, `'!='`, `'==='`, `'!=='`, `'<'`, `'<='`, `'>'`, `'>='`), `ignoreEmptyValue` (`false`)", 'Compares the value with what the function returns, such as another field of the row. Runs on every validation of the row.'],
  ['custom', '`validationCallback({ value, row, context, column, rule })` (`row` is the row itself, and `context` holds the entered values: `values`, `getValue(field)`), `ignoreEmptyValue` (`false`), `reevaluate` (`false`)', '`true` is valid, `false` is invalid with `message`, and a string is invalid with that text.'],
  ['async', '`validationCallback(…)` returning a promise, `ignoreEmptyValue` (`false`), `reevaluate` (`true`)', 'The result: `true`, `false`, a message or `{ isValid, message }`. A rejection is invalid with its message. The row waits for the result before it is sent, and its cell appears busy.'],
];

const EVENTS = [
  ['onEditingStart', '`{ field, row, values, getValue, rowIndex, isNew, cancel }`', 'Occurs before a cell editor or a row\'s form (`field` `\'\'`) opens. Set `cancel` to leave the row unchanged. `row` is the row itself (a class instance stays one), `values` holds the entered, unsaved values, and `getValue(field)` returns the entered value, otherwise the row\'s.'],
  ['onEditorPreparing', '`{ field, row, values, getValue, isNew, options, cancel }`', 'Occurs before the editor of a cell or form field is created. Change its props, or set `cancel` to omit a field from the form.'],
  ['onEditorPrepared', "`{ field, row, values, getValue, isNew, editor, part, place: 'cell' | 'form' }`", 'Occurs after an editor is created.'],
  ['onRowValidating', '`{ key, row, values, getValue, isNew, changed, errors, isValid, errorText, cancel }`', 'Occurs when a row is validated before saving, after its cells and their async rules. Add or remove messages in `errors` (by field, with `\'\'` for the row), or set `isValid = false` with `errorText`. Occurs once per validation of the row.'],
  ['onInitNewRow, onSaving, onRowInserting, onRowUpdating, onEditCanceling …', 'See [Events](/datagrid/layout#events)', 'The same in every edit mode: Save in a form is a save, and Cancel is a cancel.'],
];

const METHODS = [
  ['editRow(i) / editRowByKey(key)', '`boolean`', 'Opens the first editor of a row, or its form (`form`, `popup`), by key while the row is loaded.'],
  ['addRow(values?)', '`Promise<boolean>`', 'Opens a new row: in its cells, in place as a form, or in the window.'],
  ['saveEditData()', '`Promise<boolean>`', 'Saves the current edit, as Save does: the form, otherwise the row being edited, and in batch mode every unsaved change.'],
  ['cancelEditData()', '`void`', 'Discards the current edit, as Cancel does, and in batch mode every unsaved change.'],
  ['closeEditCell()', '`boolean`', 'Keeps the open editor\'s value and closes it. In a form, it keeps every field\'s value.'],
  ['form, popup', 'read/write, live', '`grid.form.colCount = 3`, `grid.popup.width = \'40rem\'`. A function is tracked, and `onOptionChanged` reports `form.colCount`, `popup.width` and so on.'],
];

export default function DataGridFormsPage() {
  return (
    <>
      <Section anchor="forms" title="Edit forms and popups">
        <p>
          <Rich text="`settings.editMode` determines how a row is edited and when it is submitted for saving, and `saveMode` determines how a submitted row is sent: waiting for the response, in the background, or held for `saveChanges()`. In `form` mode, the row opens as a form in its place, using the kit's `FormLayout` with one field per column. Each field has the editor its cell would use, with a frame, a label and validation messages below it. The rows after it move down by its height, including in a virtual list. Save (or Enter in a field) saves the row according to the save mode, and Cancel or Escape discards the edit. Focus moves into the form and back to the row. In this example, the form has two groups, and the buttons switch the edit mode." />
        </p>
        <Example files={[...withOrders('FormMode.tsx', 'order-service.ts'), slowAdapterFile]} stack>
          <FormMode />
        </Example>
        <ApiTable head={['editMode', 'Editing location', 'Submitted for saving', 'Notes']} rows={MODES} />
        <p>
          <Rich text="In `popup` mode, the same form opens in the kit's `MxForm` as a modal window, for both existing and new rows (`addRow()`, “New row”). Focus stays in the window, Enter activates Save and Escape activates Cancel, and focus returns to the row when the window closes. `popup` sets the title and size, and `form` and the columns' `formItem` set the fields." />
        </p>
        <Example files={withOrders('PopupMode.tsx')} stack>
          <PopupMode />
        </Example>
        <ApiTable head={['Setting', 'Default', 'Description']} rows={SETTINGS} />
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={FORM} />
        <ApiTable head={['Column field', 'Type', 'Description']} rows={COLUMN} />
      </Section>

      <Section anchor="rules" title="Validation rules">
        <p>
          <Rich text="A column's `validationRules` are validated with the kit's validation rules as a value is entered, and again before its row is saved. `required` and `validate` still run before them. Rules run in order, and `async` rules run last, together. The row waits for their results, with its cell shown as busy in the meantime. A value is not validated twice: only `reevaluate` (on for `async`) and `compare` rules run on every validation of the row. `onRowValidating` occurs after the cells, for the row as a whole. Messages appear in the cells, the form and the window. In this example, the server rejects a customer whose name contains “test”." />
        </p>
        <Example files={withOrders('ValidationRules.tsx')} stack>
          <ValidationRules />
        </Example>
        <ApiTable head={['Rule type', 'Options', 'Valid when']} rows={RULES} />
        <p>
          <Rich text="Every rule accepts a `message` (`Bind<string>`). Without it, the text comes from `uiLocale` (or the grid's `texts`): `required`, `gridInvalidNumber`, `tooShort` / `tooLong`, `outOfRange` / `tooSmall` / `tooLarge`, `invalidFormat`, `invalidEmail`, `noMatch`, `invalid`." />
        </p>
      </Section>

      <Section anchor="form-api" title="Events and methods">
        <ApiTable head={['Event', 'Parameters', 'When']} rows={EVENTS} />
        <ApiTable head={['Member', 'Returns', 'Description']} rows={METHODS} />
      </Section>
    </>
  );
}
