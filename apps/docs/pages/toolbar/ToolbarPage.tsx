import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Editor from './examples/Editor';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import Overflow from './examples/Overflow';
import SizeAndOrientation from './examples/SizeAndOrientation';
import ToggleGroups from './examples/ToggleGroups';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const KEYS = [
  ['Tab', 'Moves focus into the toolbar, to the control used last. Pressing Tab again leaves it.'],
  ['Right / Left', 'Moves to the next or previous control, wrapping at the ends (Left and Right are reversed on right-to-left pages). In a vertical toolbar, use Down and Up.'],
  ['Home / End', 'Moves to the first or last control.'],
  ['In a text field', 'The arrow keys, Home and End move within the text, and Tab leaves the field.'],
  ['Down on a menu button', 'Opens the menu (horizontal toolbar).'],
  ['Shift+F10 / Menu key', 'Opens the menu of the right button at the focused item, when the toolbar is `customizable` or the app adds commands to it.'],
];

const A11Y = [
  ['Role', '`role="toolbar"` with `aria-orientation`, named by `label`.'],
  ['Focus', 'One Tab stop. The control used last has `tabindex="0"`, and the others have `-1` (roving tabindex).'],
  ['Separators', '`role="separator"`, oriented across the toolbar.'],
  ['Toggles', 'Toggle items are buttons with `aria-pressed`.'],
  ['“More” menu', 'A menu button named from `uiLocale` (“More options”). Items keep their names (an icon-only button uses its `hint` or `aria-label`), toggles become check items, and menu buttons become submenus.'],
];

const HOOKS = [
  ['.mx-toolbar', 'The toolbar. `data-orientation`, `data-size`, `data-overflow`, `data-disabled`.'],
  ['.mx-toolbar__separator', 'A separator.'],
  ['.mx-toolbar__more', 'The overflow button, a `Button` with a menu.'],
  ['[data-overflowed]', 'Set on a control that is currently in the overflow menu.'],
];

const TOKENS = [
  ['toolbar.height', 'The minimum height of the bar, which uses the density-aware bar height.'],
  ['toolbar.bar, toolbar.separator', 'Units: the bar (`vertical`: a column of controls) and the separators.'],
];

export default function ToolbarPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A command bar that holds buttons, toggle buttons, menus and fields, organized in groups with separators. The toolbar is a single Tab stop, and the arrow keys move between its controls. Items that do not fit move into an overflow menu at the end. You can define items as data, as JSX children, or both. The user can arrange a toolbar and send commands to it from the menus of the page ([Customization](/toolbar/customization)); every prop, method and event is in the [API reference](/toolbar/api)." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Toolbar, ToolbarSeparator, type ToolbarItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="`items` defines commands as data, where each field is a value or a function. JSX children of any control type follow them. Programmatically, fill a toolbar as you would any control: `toolbar.controls.add(button)`. Every prop is also a property." />
        </p>
        <Example title="Editor toolbar" files={code('Editor.tsx', 'editor-items.tsx', 'draft.ts', 'icons.tsx')} stack>
          <Editor />
        </Example>
        <Example title="Building a toolbar programmatically" files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="groups" title="Toggle groups and separators">
        <p>
          <Rich text="A `toggle` item is a toggle button (`aria-pressed`). When bound to the application with a function, it reflects application state. In the example above, Bold, Italic and Underline are independent toggles, and the alignment buttons form a group where one is pressed. `separator` items, or `<ToolbarSeparator />`, draw the lines between groups." />
        </p>
        <Example files={code('ToggleGroups.tsx', 'draft.ts', 'icons.tsx')}>
          <ToggleGroups />
        </Example>
      </Section>

      <Section anchor="overflow" title="Overflow">
        <p>
          <Rich text="When `overflow` is `menu` (the default), items that do not fit move into an overflow menu at the end, starting from the last item. The toolbar monitors its own size. Items keep their names in the menu (an icon-only button uses its `hint` or `aria-label`), a toggle becomes a check item, and a menu button becomes a submenu. An item's `overflow` can be `always` or `never`, and fields stay in the bar. `wrap` adds a second row, and `scroll` lets the bar scroll." />
        </p>
        <Example files={code('Overflow.tsx', 'editor-items.tsx', 'draft.ts', 'icons.tsx')} stack>
          <Overflow />
        </Example>
      </Section>

      <Section anchor="look" title="Orientation, size and fields">
        <p>
          <Rich text="`size` and `buttonVariant` apply to child controls that do not set their own. A vertical toolbar uses Up and Down for navigation. A text field inside the toolbar keeps the arrow keys for its text." />
        </p>
        <Example files={code('SizeAndOrientation.tsx', 'icons.tsx')} stack>
          <SizeAndOrientation />
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
          <Rich text="A toolbar displays on its own the name of its overflow button, from `uiLocale.strings.moreOptions`. A customizable toolbar also writes the commands of its menu (`toolbarHide`, `toolbarDisplay` and the others) and the customizer’s texts (`customizer…`), and its name in the menus that send commands to it is its `label` (`toolbarUnnamed` without one)." />
        </p>
        <Example files={code('Localization.tsx')}>
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
    </>
  );
}
