import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import CustomOperations from './examples/CustomOperations';
import Programmatic from './examples/Programmatic';
import Limits from './examples/Limits';
import Localization from './examples/Localization';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const OPERATIONS = [
  ['string (default)', '`contains`, `notcontains`, `startswith`, `endswith`, `=`, `<>`, `isblank`, `isnotblank`', 'TextBox'],
  ['number', '`=`, `<>`, `<`, `>`, `<=`, `>=`, `between`, `isblank`, `isnotblank`', 'NumberBox (two for `between`)'],
  ['date, datetime', 'As number', 'DateBox (two for `between`)'],
  ['boolean', '`=`, `<>`, `isblank`, `isnotblank`', 'DropDown of `trueText` and `falseText`'],
  ['object', '`isblank`, `isnotblank`', '—'],
  ['a `lookup` field', '`=`, `<>`, `isblank` and `isnotblank`, regardless of type', 'DropDown of the lookup items, with search'],
  ['`in`, `notin` (`anyof`, `noneof`)', 'Set in `filterOperations`', 'TagBox with the lookup items or typed values'],
];

const PROPS = [
  ['value', '`Bind<data.FilterExpression | null>`', '`null`', 'The filter, in data layer format. `x-model` provides two-way binding. Conditions without a value are left out.'],
  ['fields', '`Bind<FilterBuilderField[]>`', '`[]`', 'The fields conditions are built on (see below).'],
  ['customOperations', '`Bind<FilterBuilderCustomOperation[]>`', '`[]`', 'Custom operations (see below).'],
  ['groupOperations', "`Bind<('and' | 'or' | 'notAnd' | 'notOr')[]>`", 'all four', 'The available group joins. The first is the default for a new group.'],
  ['maxGroupLevel', '`Bind<number | null>`', '`null`', '`0` allows no groups, `1` allows groups in the root only, and so on. `null` means no limit.'],
  ['allowHierarchicalFields', '`Bind<boolean>`', '`false`', 'Shows fields with a dotted `dataField` as submenus of their parts.'],
  ['label', '`Bind<string>`', "The `filterBuilderLabel` string", 'The accessible name of the tree. `aria-label` and `aria-labelledby` on the tag also work.'],
  ['texts', '`Bind<Partial<UiStrings>>`', '`{}`', 'Strings for this builder only, which override `uiLocale.strings`.'],
  ['locale', '`Bind<string>`', 'From the page', 'The locale of numbers and dates.'],
  ['size', '`Bind<ControlSize>`', "`'sm'`", 'The size of the buttons and editors.'],
  ['addKeys, removeKeys', '`Bind<string[]>`', "`['Insert']`, `['Delete']`", 'Keys that add a condition to the focused row\'s group and remove the focused row.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const FIELD = [
  ['dataField', '`string`', 'The field the condition filters. Use a dotted path for a nested field.'],
  ['caption', '`Bind<string>`', 'The default is the data field in words (`orderDate` → “Order Date”).'],
  ['dataType', "`Bind<'string' | 'number' | 'date' | 'datetime' | 'boolean' | 'object'>`", "The default is `'string'`. It determines the operations, the editor and how a value is displayed."],
  ['format', '`Intl` options or `(value) => string`', 'How a value is displayed. Number and date editors also accept the options.'],
  ['lookup', '`{ dataSource, valueField?, textField?, allowClearing? }`', 'The values come from a list: an array, or a data source from any adapter.'],
  ['filterOperations', '`Bind<string[]>`', 'The available operations in order, with custom operations by name. The default depends on `dataType`.'],
  ['defaultOperation', '`Bind<string>`', 'The operation for a new condition. The default is the first of `filterOperations`.'],
  ['editor', '`(ctx) => component`', 'A custom editor. `ctx` provides `value`, `setValue`, `close`, `field`, `operation`, `condition` and `builder`.'],
  ['editorOptions', '`Bind<Record<string, unknown>>`', 'Props passed to the kit editor the builder creates.'],
  ['customizeText', '`({ value, valueText, field }) => string`', 'The display text of a value, in the builder and in `filterText`.'],
  ['trueText, falseText', '`Bind<string>`', "The text for a yes/no field. The defaults are the `filterBuilderTrue` and `filterBuilderFalse` strings."],
];

const CUSTOM = [
  ['name, caption', '`string`, `Bind<string>`', 'The name used in `filterOperations`, and the text in the menu and in `filterText`.'],
  ['dataTypes', '`FilterBuilderDataType[]`', 'The data types whose fields offer it automatically, for fields without their own `filterOperations`.'],
  ['hasValue', '`boolean`', 'The default is `true`. `false` shows no value.'],
  ['editor, customizeText', 'Same as on a field', 'The value editor and text for this operation.'],
  ['calculateFilterExpression', '`(value, field) => data.FilterExpression | null`', 'Defines the condition in the value, as any data layer expression, so every adapter can run it.'],
  ['readFilterExpression', '`(expression) => { field, value } | null`', 'Recognizes an expression as this operation, including one read back from storage. Without it, the builder only recognizes expressions it wrote itself.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['root', 'read-only', 'The tree: `{ kind: \'group\', operation, items, parent }` containing `{ kind: \'condition\', field, operation, value, parent }` items. Change it through the methods.'],
  ['filterText', 'read-only, reactive', 'The filter as a single line: `[City] Equals \'Ankara\' And [Amount] Is greater than \'100\'`.'],
  ['model', 'read-only', 'The `FilterBuilderModel`, which provides field operations, text, and conversion between expressions and the tree.'],
  ['treePart, editingCondition', 'read-only', 'The `role="treegrid"` part, and the condition whose editor is open.'],
];

const METHODS = [
  ['addCondition(group?, dataField?)', '`FilterBuilderCondition | null`', 'Adds at the end of a group (the root by default), on a field (the first by default). The events run.'],
  ['addGroup(group?)', '`FilterBuilderGroup | null`', 'Adds a group with one condition. Returns `null` past `maxGroupLevel`.'],
  ['removeItem(item)', '`boolean`', 'Removes a condition, or a group with its contents.'],
  ['setField(condition, dataField), setOperation(condition, op), setConditionValue(condition, value)', '`boolean`', 'An operation or value that no longer fits the new field is reset.'],
  ['setGroupOperation(group, op)', '`boolean`', ''],
  ['clear()', '`void`', 'Clears the tree.'],
  ['openEditor(condition), closeEditor(keep?)', '`boolean`, `void`', 'Controls the value editor programmatically.'],
  ['focusItem(item, part?), focus()', '`boolean`', "Sets focus on a row's button (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`), or on the tree's Tab stop."],
  ['getFilterExpression()', '`data.FilterExpression | null`', 'The value.'],
  ['refresh()', '`void`', 'Your fields and value can be plain or reactive, and the builder reads them as they are. After changing them in place, call `refresh()`. The rows redraw, and a value changed in place is read into the tree.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source }`'],
  ['onItemAdding(e), onItemAdded(e)', 'Occur before and after a condition or group is added: `{ item, group, byUser, source }`. Change `e.item` before it is added, or set `e.cancel = true`.'],
  ['onItemRemoving(e), onItemRemoved(e)', '`{ item, group, byUser, source }`. Set `e.cancel = true` to keep it.'],
  ['onItemChanging(e), onItemChanged(e)', "`{ item, change: 'field' | 'operation' | 'value' | 'groupOperation', value, previousValue, byUser, source }`. Change `e.value`, or set `e.cancel = true`."],
  ['onEditorPreparing(e)', "Occurs before a value editor is created: `{ field, operation, value, condition, part: 'value' | 'from' | 'to', options, editor, setValue }`. Change `e.options` (the kit editor props), set `e.editor` to a custom component that calls `e.setValue`, or set `e.cancel = true` for no editor."],
  ['onEditorPrepared(e)', '`{ field, operation, condition, part, editor }`'],
];

const KEYS = [
  ['Tab', 'Moves focus into the tree, to the button focused last, and out again. The tree is one Tab stop.'],
  ['Right / Left', 'Moves to the next or previous button in the row, reversed on right-to-left pages.'],
  ['Down / Up', 'Moves to the row below or above, on the same button where possible.'],
  ['Home / End; Ctrl + Home / End', 'Moves to the first or last button of the row, or of the tree.'],
  ['Enter, Space', 'Presses the button, which opens its menu or the value editor, adds or removes.'],
  ['Alt + Down', 'Opens the menu of a field, operation, group or add button.'],
  ['F2', 'Opens the value editor.'],
  ['Insert', 'Adds a condition to the row\'s group (`addKeys`).'],
  ['Delete', 'Removes the row\'s condition or group (`removeKeys`).'],
  ['In the editor: Enter, Escape, Tab', 'Accepts the value, discards it, or accepts it and moves on (from “from” to “to” in a range).'],
];

const A11Y = [
  ['Tree', '`role="treegrid"`, named by `label`. Each group and condition is a `row` with `aria-level`, `aria-posinset` and `aria-setsize`, and each button is in a `gridcell`.'],
  ['Buttons', 'Named by their function: “Field: City”, “Operation: Equals”, “Value: Ankara”, “Group operation: And”, “Add” and “Remove condition”. Menu buttons have `aria-haspopup="menu"` and `aria-expanded`, and the choices are `menuitemradio` elements.'],
  ['Editors', 'Kit fields named “City value”, “Amount, from” and “Amount, to”.'],
  ['Focus', 'Roving `tabindex`, so one button is in the Tab order. The focus ring appears only during keyboard use.'],
];

const HOOKS = [
  ['.mx-filter-builder', 'The root.'],
  ['.mx-filter-builder__tree', 'The `treegrid`, with `data-size`.'],
  ['.mx-filter-builder__row', "A group or a condition: `data-kind` (`'group'`, `'condition'`) and `--_level`."],
  ['.mx-filter-builder__cell', "A `gridcell`; `data-part` (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`)."],
  ['.mx-filter-builder__remove, __group, __add, __field, __operation, __value', 'The kit buttons. The value button has `data-empty` while it has no value.'],
  ['.mx-filter-builder__editor', 'The open value editor or editors.'],
];

const TOKENS = [
  ['filterbuilder.container, filterbuilder.tree, filterbuilder.row, filterbuilder.cell, filterbuilder.editor', 'Units: the text, the rows (`group`, `hover`) and the space between them, a button\'s place, and a value editor.'],
  ['filterbuilder.indent', 'The indent of each level.'],
  ['filterbuilder.line-width, line-color, line-offset, elbow-length, elbow-color', 'The line along each group, and the connector to each row.'],
  ['filterbuilder.value-width', 'The minimum width of a value editor field.'],
];

export default function FilterBuilderPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Lets users build a filter visually, using groups joined by And, Or, Not And or Not Or, and conditions made of a field, an operation and a value. Its value is a data layer filter expression, so it works directly with in-memory rows and every adapter. DataGrid opens it from the filter panel, and you can also use it on its own for reports or saved searches." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { FilterBuilder, filterText } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="value" title="The value">
        <p>
          <Rich text="`value` is a `data.FilterExpression` (`data.where`, `data.and`, `data.or`, `data.not`), and `x-model` provides two-way binding. A condition without a value stays in the tree but is left out of the expression. Each value is edited in place with the kit editor for the field's type, and `filterText` renders any filter as a single line using the field captions, formats and lookup text." />
        </p>
        <Example files={code('Basic.tsx', 'sales.ts')} stack>
          <Basic />
        </Example>
      </Section>

      <Section anchor="code" title="Programmatic use, and the events">
        <p>
          <Rich text="Every user action is also a method (`addCondition`, `addGroup`, `removeItem`, `setField`, `setOperation`, `setConditionValue`, `setGroupOperation`, `clear`), and every change raises an event first. `onItemAdding`, `onItemRemoving` and `onItemChanging` can modify or cancel it, followed by the `…ed` events and `onValueChanged`. In this example, the last condition at the root cannot be removed." />
        </p>
        <Example files={code('Programmatic.tsx', 'sales.ts')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="operations" title="Fields and operations">
        <p>
          <Rich text="A field's `dataType` determines the available operations, where the first is the default for a new condition, and its editor. `filterOperations` sets a custom list for a field. Operation names come from the data layer: “Is any of” is `in` and “Is none of” is `notin` (`anyof` and `noneof` are read as these)." />
        </p>
        <ApiTable head={['Field', 'Operations', 'Editor']} rows={OPERATIONS} />
      </Section>

      <Section anchor="custom" title="Custom operations">
        <p>
          <Rich text="A custom operation has a name, a caption, the data types that offer it, its own editor and text, and `calculateFilterExpression`, which defines the condition in the value. The value remains an expression that every adapter can run. The builder recognizes its own conditions while it holds that value, and recognizes any expression when `readFilterExpression` is set." />
        </p>
        <Example files={code('CustomOperations.tsx', 'sales.ts')} stack>
          <CustomOperations />
        </Example>
      </Section>

      <Section anchor="groups" title="Groups, limits and nested fields">
        <p>
          <Rich text="`maxGroupLevel` limits nesting depth, and at the limit the add button adds a condition immediately. `groupOperations` sets the available joins, and `allowHierarchicalFields` turns dotted fields (`customer.address.city`) into submenus." />
        </p>
        <Example files={code('Limits.tsx')} stack>
          <Limits />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="All strings come from `uiLocale.strings` (`filterBuilder…` and `filterOp…`: group and operation names, “Add Condition”, “<enter a value>” and button names). `texts` overrides some for one builder, and `locale` formats its numbers and dates." />
        </p>
        <Example files={code('Localization.tsx', 'sales.ts')} stack>
          <Localization />
        </Example>
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
          <Rich text="FilterBuilderField" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={FIELD} />
        <h3>
          <Rich text="FilterBuilderCustomOperation" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={CUSTOM} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
