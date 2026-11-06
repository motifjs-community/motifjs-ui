import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Choose from './examples/Choose';
import FromContextMenu from './examples/FromContextMenu';
import InJsx from './examples/InJsx';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly MenuItem[]>`', '`[]`', "The commands: kit menu items with icons, check and radio marks, tones, `&` keys, groups and submenus. Shortcuts are not shown."],
  ['title', '`Bind<string>`', "`''`", 'A title above the items, which also names the sheet. Otherwise, the name comes from `label`, or is "Actions".'],
  ['message', '`Bind<string>`', "`''`", 'A line below the title that explains the choice.'],
  ['showCancel', '`Bind<boolean>`', '`true`', 'Shows a separate Cancel button at the bottom.'],
  ['cancelText', '`Bind<string>`', "`''`", "Its text. An empty value uses the `uiLocale` Cancel string."],
  ['detents', '`Bind<readonly BottomSheetDetent[]>`', "`['fit']`", 'The height of its items, up to full. Any bottom sheet height works.'],
  ['onItemClick', '`(e: MenuItemClickEventArgs) => void`', '—', "Occurs when an item is selected, after the sheet closes and the item's own `click` runs."],
  ['every BottomSheet prop', 'see BottomSheet', '', 'Modal behavior, the handle, swipe down, Escape, the scrim and the back button work as on the [BottomSheet page](/bottomsheet#api).'],
];

const MEMBERS = [
  ['choose(items?, host?)', '`Promise<MenuItem | null>`', 'Opens the sheet with these items and resolves with the selected item, or `null` if it closes without a selection. `host` gives it a place if it has none.'],
  ['open(byKeyboard?)', '`boolean`', 'Opens the sheet. `byKeyboard` moves focus to the first item. Otherwise, focus moves to the list, as with a menu opened by the pointer.'],
  ['chosenItem', 'read-only', 'The item selected the last time the sheet was open.'],
  ['menu', 'read-only', 'Its `MenuList`.'],
  ['refresh()', '`void`', 'Your items can be plain or reactive, and the sheet reads them as they are. After changing them in place, call `refresh()`. The visible level updates.'],
  ['ContextMenu presentation', "`Bind<'menu' | 'sheet' | 'auto'>`", "On `ContextMenu`, the default is `'menu'`. `'sheet'` opens its items in an action sheet. `'auto'` does so when a finger opened the menu with a long press, or on a screen with only a coarse pointer unless a key opened it. `onOpening`, `onItemClick` and `onClosed` work the same way, and `actionSheet` is the sheet."],
];

const KEYS = [
  ['Up, Down, Home, End', 'Moves between the items, wrapping at the ends.'],
  ['Enter, Space, an item\'s `&` letter', 'Selects the item, or opens a submenu in place.'],
  ['A letter', 'Moves to the next item that starts with that letter.'],
  ['Escape', 'Closes the sheet without a selection.'],
  ['Tab', 'Moves to the Cancel button and back.'],
];

const A11Y = [
  ['Dialog and menu', 'The sheet is a `dialog` named by its title. The items are a `menu` of `menuitem`, `menuitemcheckbox` and `menuitemradio` elements, as in the kit\'s menus.'],
  ['Focus', 'When opened from the keyboard, focus moves to the first item. When opened by touch or pointer, it moves to the list. Focus returns to where it was when the sheet closes.'],
  ['Submenus', 'Submenus replace the menu in place, with "Back" as the first item. An arrow at the end of an item indicates a submenu.'],
  ['Touch', 'Items are `control.height.lg` tall (`actionsheet.item-height`), which exceeds the 24 pixels required by WCAG 2.2.'],
];

const HOOKS = [
  ['.mx-action-sheet', 'Built on the bottom sheet layer (`.mx-bottom-sheet`) and its hooks.'],
  ['.mx-action-sheet__message', 'Text below the title.'],
  ['.mx-action-sheet__list', 'The menu (`.mx-menu`).'],
  ['.mx-action-sheet__cancel', 'The Cancel button row.'],
  ['.mx-action-sheet__back', 'The Back indicator.'],
];

const TOKENS = [
  ['actionsheet.message, actionsheet.back, actionsheet.cancel', 'Units: the message, the Back item indicator (`rtl`), and the strip that holds the Cancel button.'],
  ['actionsheet.menu.*, actionsheet.cancel-button.*, actionsheet.sheet.*', 'Places: touch-sized items, the Cancel button and the sheet content padding.'],
  ['sheet.*', 'The surface, handle and title, as on the bottom sheet.'],
];

export default function ActionSheetPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A list of commands that slides up from the bottom of the screen, built from the kit's menu items and sized for touch. It supports a title, a message and a separate Cancel button. A context menu uses it on touch screens." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ActionSheet, type ActionSheetProps } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="choose" title="Choosing programmatically">
        <p>
          <Rich text="`choose()` opens the sheet and resolves with the selected item, or `null`. An item with `items` opens its submenu in place, with a Back option." />
        </p>
        <Example files={code('Choose.tsx')}>
          <Choose />
        </Example>
      </Section>

      <Section anchor="jsx" title="Using it in JSX">
        <p>
          <Rich text="Bind it with `x-model`. Check and radio items show their marks, and `cancelText` sets the Cancel button text." />
        </p>
        <Example files={code('InJsx.tsx')}>
          <InJsx />
        </Example>
      </Section>

      <Section anchor="context-menu" title="Context menus on touch screens">
        <p>
          <Rich text="`ContextMenu` has a `presentation` prop: `'menu'` (the default), `'sheet'`, or `'auto'`, which opens an action sheet when a finger opened the menu with a long press. The items, `onOpening` and `onItemClick` stay the same." />
        </p>
        <Example files={code('FromContextMenu.tsx')}>
          <FromContextMenu />
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
          <Rich text="Cancel, Back and the default name come from `uiLocale.strings` (`cancel`, `back`, `actionSheetLabel`). `cancelText` sets custom text." />
        </p>
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
          <Rich text="Members" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
