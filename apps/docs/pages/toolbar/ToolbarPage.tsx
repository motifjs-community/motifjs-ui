import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Editor from './examples/Editor';
import FromCode from './examples/FromCode';
import Localization from './examples/Localization';
import Overflow from './examples/Overflow';
import SizeAndOrientation from './examples/SizeAndOrientation';
import ToggleGroups from './examples/ToggleGroups';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly ToolbarItem[]>`', '`[]`', 'Items as data, drawn before the JSX children (see Items).'],
  ['label', '`Bind<string>`', "`''`", 'Names the toolbar for screen readers (`aria-label`). The same property as `text`.'],
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'horizontal'`", 'Which way it runs; the arrow keys follow it.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'Given to the controls inside that have no `size` of their own.'],
  ['buttonVariant', '`Bind<ButtonVariant>`', "`'ghost'`", 'Given to the buttons inside that have no `variant` of their own.'],
  ['overflow', "`Bind<'menu' | 'wrap' | 'scroll'>`", "`'menu'`", '`menu`: what does not fit goes into a “more” menu at the end; `wrap`: a second row; `scroll`: the bar scrolls.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', '`enabled={false}` disables every control inside.'],
];

const ITEM = [
  ['type', "`Bind<'button' | 'toggle' | 'separator' | 'menu'>`", "Default `'button'`."],
  ['text, icon, hint', '`Bind<…>`', 'The caption (`&Bold` is an access key), an icon, a tooltip. A button with only an icon is named by its `hint`.'],
  ['pressed', '`Bind<boolean>`', 'A toggle’s state. As a function the item follows the app: its `click` changes what it reads.'],
  ['enabled, visible', '`Bind<boolean>`', 'Dimmed, or left out.'],
  ['menu', '`Bind<readonly MenuItem[]>`', 'The commands of a `menu` item: submenus, check and radio items, shortcuts.'],
  ['overflow', "`Bind<'auto' | 'always' | 'never'>`", 'Whether it may move into the “more” menu; wins over the toolbar. A JSX child says it with `data-overflow`.'],
  ['click', '`(e) => void`', 'Pressed, in the bar or in the “more” menu. `e`: `{ item, source, event }`.'],
  ['data', '`unknown`', 'Your own value.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['overflowed', 'read-only, reactive', 'The controls in the “more” menu now.'],
];

const METHODS = [
  ['controlOf(item)', '`Control | null`', 'The control made for an item of `items`.'],
  ['updateOverflow()', '`void`', 'Works out again what fits, e.g. after a control changed its width.'],
  ['focus()', '`boolean`', 'Focuses the control Tab reaches.'],
];

const EVENTS = [['onItemClick(e)', 'An item of `items` was pressed, after its own `click`. `e`: `{ item, source, event }`.']];

const KEYS = [
  ['Tab', 'Into the toolbar, to the control used last; Tab again leaves it.'],
  ['Right / Left', 'The next / previous control, wrapping around (Left / Right in a right-to-left page). Down / Up when vertical.'],
  ['Home / End', 'The first / last control.'],
  ['In a text field', 'The arrows, Home and End move in the text; Tab leaves.'],
  ['Down on a menu button', 'Opens its menu (horizontal toolbar).'],
];

const A11Y = [
  ['Role', '`role="toolbar"` with `aria-orientation`, named by `label`.'],
  ['Focus', 'One Tab stop: the control used last has `tabindex="0"`, the others `-1` (roving tabindex).'],
  ['Separators', '`role="separator"`, turned across the toolbar.'],
  ['Toggles', 'Toggle items are buttons with `aria-pressed`.'],
  ['“More” menu', 'A menu button named from `uiLocale` (“More options”); the items keep their names (an icon-only button its `hint` or `aria-label`), toggles become check items, menu buttons submenus.'],
];

const HOOKS = [
  ['.mx-toolbar', 'The toolbar. `data-orientation`, `data-size`, `data-overflow`, `data-disabled`.'],
  ['.mx-toolbar__separator', 'A separator.'],
  ['.mx-toolbar__more', 'The “more” button (a `Button` with a menu).'],
  ['[data-overflowed]', 'On a control that is in the “more” menu now.'],
];

const TOKENS = [
  ['toolbar.height', 'The bar’s least height (the density-aware bar height).'],
  ['toolbar.bar, toolbar.separator', 'Units: the bar (`vertical`: a column of controls) and the separators across it.'],
];

export default function ToolbarPage() {
  return (
    <>
      <p class="lead">
        A bar of commands: buttons, toggle buttons, menus and fields in groups between separators. It is one Tab stop and the
        arrow keys move inside it; items that do not fit move into a “more” menu at the end. Items come as data, as JSX
        children, or both.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Toolbar, ToolbarSeparator, type ToolbarItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="`items` describes the commands as data, each field a value or a function; JSX children (any control) come after them. From code, a toolbar is filled like any control: `toolbar.controls.add(button)`. Every prop is also a property." />
        </p>
        <Example title="An editor toolbar" files={code('Editor.tsx', 'editor-items.tsx', 'draft.ts', 'icons.tsx')} stack>
          <Editor />
        </Example>
        <Example title="Filled from code" files={code('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="groups" title="Toggle groups and separators">
        <p>
          <Rich text="A `toggle` item is a toggle button (`aria-pressed`). Bound to the app with a function, it shows the app’s state: Bold, Italic and Underline above are three independent toggles, the alignment buttons a group where one is pressed. `separator` items (or `<ToolbarSeparator />`) draw the lines between groups." />
        </p>
        <Example files={code('ToggleGroups.tsx', 'draft.ts', 'icons.tsx')}>
          <ToggleGroups />
        </Example>
      </Section>

      <Section anchor="overflow" title="Overflow">
        <p>
          <Rich text="With `overflow` set to `menu` (the default) the items that do not fit move into a “more” menu at the end, from the last one back; the toolbar watches its own size. There they keep their names (an icon-only button its `hint` or `aria-label`), a toggle becomes a check item and a menu button a submenu. An item’s `overflow` says `always` or `never`; fields stay in the bar. `wrap` starts a second row, `scroll` lets the bar scroll." />
        </p>
        <Example files={code('Overflow.tsx', 'editor-items.tsx', 'draft.ts', 'icons.tsx')} stack>
          <Overflow />
        </Example>
      </Section>

      <Section anchor="look" title="Orientation, size, fields">
        <p>
          <Rich text="`size` and `buttonVariant` reach the controls inside that have none of their own. A vertical toolbar moves with Up and Down. A text field inside keeps the arrow keys for its text." />
        </p>
        <Example files={code('SizeAndOrientation.tsx', 'icons.tsx')} stack>
          <SizeAndOrientation />
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
          <Rich text="The only text a toolbar writes itself is the name of its “more” button, from `uiLocale.strings.moreOptions`." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>ToolbarItem</h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
