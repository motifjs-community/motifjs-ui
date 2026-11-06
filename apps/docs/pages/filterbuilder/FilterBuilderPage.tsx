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
  ['date, datetime', 'as number', 'DateBox (two for `between`)'],
  ['boolean', '`=`, `<>`, `isblank`, `isnotblank`', 'DropDown of `trueText` / `falseText`'],
  ['object', '`isblank`, `isnotblank`', '—'],
  ['a `lookup` field', '`=`, `<>`, `isblank`, `isnotblank`, whatever the type', 'DropDown of the lookup items (searched)'],
  ['`in`, `notin` (`anyof`, `noneof`)', 'named in `filterOperations`', 'TagBox: the lookup items, or typed values'],
];

const PROPS = [
  ['value', '`Bind<data.FilterExpression | null>`', '`null`', 'The filter, as the data layer has it. `x-model` binds it two-way. Conditions without their value are left out of it.'],
  ['fields', '`Bind<FilterBuilderField[]>`', '`[]`', 'The fields conditions are built on (see below).'],
  ['customOperations', '`Bind<FilterBuilderCustomOperation[]>`', '`[]`', 'Operations of your own (see below).'],
  ['groupOperations', "`Bind<('and' | 'or' | 'notAnd' | 'notOr')[]>`", 'all four', 'What a group can join with; the first is a new group\'s.'],
  ['maxGroupLevel', '`Bind<number | null>`', '`null`', '`0` allows no groups, `1` groups in the root only, and so on. `null`: no limit.'],
  ['allowHierarchicalFields', '`Bind<boolean>`', '`false`', 'Fields with a dotted `dataField` show as submenus of their parts.'],
  ['label', '`Bind<string>`', "the `filterBuilderLabel` text", 'The tree\'s accessible name; `aria-label` / `aria-labelledby` on the tag work too.'],
  ['texts', '`Bind<Partial<UiStrings>>`', '`{}`', 'Texts for this builder only, over `uiLocale.strings`.'],
  ['locale', '`Bind<string>`', 'the page\'s', 'Locale of numbers and dates.'],
  ['size', '`Bind<ControlSize>`', "`'sm'`", 'The size of the buttons and editors.'],
  ['addKeys, removeKeys', '`Bind<string[]>`', "`['Insert']`, `['Delete']`", 'Keys that add a condition to the focused row\'s group and take the focused row out.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const FIELD = [
  ['dataField', '`string`', 'The field the condition filters; a dotted path for a nested one.'],
  ['caption', '`Bind<string>`', 'Default: the data field in words (`orderDate` → “Order Date”).'],
  ['dataType', "`Bind<'string' | 'number' | 'date' | 'datetime' | 'boolean' | 'object'>`", "Default `'string'`: decides the operations, the editor and how a value reads."],
  ['format', '`Intl` options or `(value) => string`', 'How a value reads; number and date editors take the options too.'],
  ['lookup', '`{ dataSource, valueField?, textField?, allowClearing? }`', 'The values come from a list: an array or a data source of any adapter.'],
  ['filterOperations', '`Bind<string[]>`', 'The operations offered, in order; custom operations by name. Default: by `dataType`.'],
  ['defaultOperation', '`Bind<string>`', 'A new condition\'s operation. Default: the first of `filterOperations`.'],
  ['editor', '`(ctx) => component`', 'An editor of your own: `ctx` has `value`, `setValue`, `close`, `field`, `operation`, `condition`, `builder`.'],
  ['editorOptions', '`Bind<Record<string, unknown>>`', 'Props given to the kit editor the builder makes.'],
  ['customizeText', '`({ value, valueText, field }) => string`', 'The text of a value, in the builder and in `filterText`.'],
  ['trueText, falseText', '`Bind<string>`', "A yes/no field's texts. Default: the `filterBuilderTrue` / `filterBuilderFalse` texts."],
];

const CUSTOM = [
  ['name, caption', '`string`, `Bind<string>`', 'The name used in `filterOperations`; the text in the menu and in `filterText`.'],
  ['dataTypes', '`FilterBuilderDataType[]`', 'The types whose fields offer it without naming it (only fields without their own `filterOperations`).'],
  ['hasValue', '`boolean`', 'Default `true`; `false` shows no value.'],
  ['editor, customizeText', 'as on a field', 'The value\'s editor and text for this operation.'],
  ['calculateFilterExpression', '`(value, field) => data.FilterExpression | null`', 'What the condition is in the value: any expression of the data layer, so every adapter runs it.'],
  ['readFilterExpression', '`(expression) => { field, value } | null`', 'Knows an expression as this operation again, also one read back from storage. Without it the builder knows only the expressions it wrote itself.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['root', 'read-only', 'The tree: `{ kind: \'group\', operation, items, parent }` with `{ kind: \'condition\', field, operation, value, parent }` items. Change it through the methods.'],
  ['filterText', 'read-only, reactive', 'The filter as one line: `[City] Equals \'Ankara\' And [Amount] Is greater than \'100\'`.'],
  ['model', 'read-only', 'The `FilterBuilderModel`: a field\'s operations, texts, the tree of an expression and back.'],
  ['treeElement, editingCondition', 'read-only', 'The `role="treegrid"` element; the condition whose editor is open.'],
];

const METHODS = [
  ['addCondition(group?, dataField?)', '`FilterBuilderCondition | null`', 'At the end of a group (the root by default), on a field (the first by default). The events run.'],
  ['addGroup(group?)', '`FilterBuilderGroup | null`', 'A group with one condition; `null` past `maxGroupLevel`.'],
  ['removeItem(item)', '`boolean`', 'A condition, or a group with what it holds.'],
  ['setField(condition, dataField), setOperation(condition, op), setConditionValue(condition, value)', '`boolean`', 'An operation or value that no longer fits the new field is reset.'],
  ['setGroupOperation(group, op)', '`boolean`', ''],
  ['clear()', '`void`', 'Empties the tree.'],
  ['openEditor(condition), closeEditor(keep?)', '`boolean`, `void`', 'The value editor, programmatically.'],
  ['focusItem(item, part?), focus()', '`boolean`', "A row's button (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`); the tree's Tab stop."],
  ['getFilterExpression()', '`data.FilterExpression | null`', 'The value.'],
  ['refresh()', '`void`', 'Your fields and value may be plain or reactive; the builder reads them as they are. After changing them in place, call `refresh()`. The rows are drawn again; a value changed in place is read into the tree.'],
];

const EVENTS = [
  ['onValueChanged(e)', '`{ value, previousValue, byUser, source }`'],
  ['onItemAdding(e), onItemAdded(e)', 'A condition or group is about to be / was added: `{ item, group, byUser, source }`; change `e.item` before it is added, or `e.cancel = true`.'],
  ['onItemRemoving(e), onItemRemoved(e)', '`{ item, group, byUser, source }`; `e.cancel = true` keeps it.'],
  ['onItemChanging(e), onItemChanged(e)', "`{ item, change: 'field' | 'operation' | 'value' | 'groupOperation', value, previousValue, byUser, source }`; change `e.value`, or `e.cancel = true`."],
  ['onEditorPreparing(e)', "Before a value editor is made: `{ field, operation, value, condition, part: 'value' | 'from' | 'to', options, editor, setValue }`. Change `e.options` (the kit editor's props), set `e.editor` to a component of your own (it calls `e.setValue`), or `e.cancel = true` for none."],
  ['onEditorPrepared(e)', '`{ field, operation, condition, part, editor }`'],
];

const KEYS = [
  ['Tab', 'Into the tree, to the button focused last; out again. One Tab stop.'],
  ['Right / Left', 'The next / previous button of the row (the other way round in right-to-left pages).'],
  ['Down / Up', 'The row below / above, the same button where it has one.'],
  ['Home / End; Ctrl + Home / End', 'The first / last button of the row; of the tree.'],
  ['Enter, Space', 'Presses the button: opens its menu, opens the value editor, adds, removes.'],
  ['Alt + Down', 'Opens the menu of a field, operation, group or add button.'],
  ['F2', 'Opens the value editor.'],
  ['Insert', 'Adds a condition to the row\'s group (`addKeys`).'],
  ['Delete', 'Takes the row\'s condition or group out (`removeKeys`).'],
  ['In the editor: Enter, Escape, Tab', 'Keeps the value; gives it up; keeps it and goes on (from “from” to “to” in a range first).'],
];

const A11Y = [
  ['Tree', '`role="treegrid"`, named by `label`; each group and condition a `row` with `aria-level`, `aria-posinset` and `aria-setsize`; each button in a `gridcell`.'],
  ['Buttons', 'Named with what they are: “Field: City”, “Operation: Equals”, “Value: Ankara”, “Group operation: And”, “Add”, “Remove condition”. Menu buttons have `aria-haspopup="menu"` and `aria-expanded`; the choices are `menuitemradio`s.'],
  ['Editors', 'The kit\'s fields, named “City value”, “Amount, from” and “Amount, to”.'],
  ['Focus', 'Roving `tabindex`: one button is in the Tab order. The focus ring shows for the keyboard only.'],
];

const HOOKS = [
  ['.mx-filter-builder', 'The root.'],
  ['.mx-filter-builder__tree', 'The `treegrid`; `data-size`.'],
  ['.mx-filter-builder__row', "A group or a condition: `data-kind` (`'group'`, `'condition'`), `--_level`."],
  ['.mx-filter-builder__cell', "A `gridcell`; `data-part` (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`)."],
  ['.mx-filter-builder__remove, __group, __add, __field, __operation, __value', 'The kit buttons; the value button has `data-empty` while it has no value.'],
  ['.mx-filter-builder__editor', 'The open value editor(s).'],
];

const TOKENS = [
  ['filterbuilder.container, filterbuilder.tree, filterbuilder.row, filterbuilder.cell, filterbuilder.editor', 'Units: the text, the rows (`group`, `hover`) and the space between them, a button\'s place, a value\'s editor.'],
  ['filterbuilder.indent', 'How far each level moves in.'],
  ['filterbuilder.line-width, line-color, line-offset, elbow-length, elbow-color', 'The line along each group, and an elbow to each row.'],
  ['filterbuilder.value-width', 'The least width of a value editor\'s field.'],
];

export default function FilterBuilderPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A filter builder lets people put a filter together by hand: groups joined by And, Or, Not And or Not Or, and conditions of a field, an operation and a value. Its value is the data layer's filter expression, so it goes to rows in memory and to every adapter as it is. The DataGrid opens it from its filter panel; on its own it serves a report screen or a saved search." />
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
          <Rich text="`value` is a `data.FilterExpression` (`data.where`, `data.and`, `data.or`, `data.not`) and `x-model` binds it both ways. A condition the user has not given a value yet stays in the tree but out of the value. Each value is edited in place with the kit's editor for the field's type; `filterText` writes any filter as one line with the fields' captions, formats and lookup texts." />
        </p>
        <Example files={code('Basic.tsx', 'sales.ts')} stack>
          <Basic />
        </Example>
      </Section>

      <Section anchor="code" title="Programmatic use, and the events">
        <p>
          <Rich text="Every change the user makes is also a method (`addCondition`, `addGroup`, `removeItem`, `setField`, `setOperation`, `setConditionValue`, `setGroupOperation`, `clear`), and every change asks first: `onItemAdding`, `onItemRemoving` and `onItemChanging` can change it or cancel it, the `…ed` events and `onValueChanged` follow. Here the last condition of the root cannot be taken out." />
        </p>
        <Example files={code('Programmatic.tsx', 'sales.ts')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="operations" title="Fields and operations">
        <p>
          <Rich text="A field's `dataType` decides the operations it offers (the first is a new condition's) and its editor; `filterOperations` gives a field its own list. The operation names are the data layer's: “Is any of” is `in`, “Is none of” `notin` (`anyof` and `noneof` are read as them)." />
        </p>
        <ApiTable head={['Field', 'Operations', 'Editor']} rows={OPERATIONS} />
      </Section>

      <Section anchor="custom" title="Custom operations">
        <p>
          <Rich text="A custom operation has a name, a caption, the data types that offer it, an editor and text of its own, and `calculateFilterExpression`: what the condition is in the value. The value stays an expression every adapter runs; the builder knows its own conditions again while it holds that value, and from any expression when `readFilterExpression` is given." />
        </p>
        <Example files={code('CustomOperations.tsx', 'sales.ts')} stack>
          <CustomOperations />
        </Example>
      </Section>

      <Section anchor="groups" title="Groups, limits and nested fields">
        <p>
          <Rich text="`maxGroupLevel` limits how deep groups go (at the limit the add button adds a condition at once), `groupOperations` which joins there are, and `allowHierarchicalFields` turns dotted fields (`customer.address.city`) into submenus." />
        </p>
        <Example files={code('Limits.tsx')} stack>
          <Limits />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Every text comes from `uiLocale.strings` (`filterBuilder…` and `filterOp…`: the group and operation names, “Add Condition”, “<enter a value>”, the buttons' names); `texts` changes some for one builder, `locale` formats its numbers and dates." />
        </p>
        <Example files={code('Localization.tsx', 'sales.ts')} stack>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
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
