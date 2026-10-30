import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Choose from './examples/Choose';
import FromContextMenu from './examples/FromContextMenu';
import InJsx from './examples/InJsx';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly MenuItem[]>`', '`[]`', "The commands: the kit's menu items, with their icons, check and radio marks, tones, `&` keys, groups and submenus (shortcuts are not shown)."],
  ['title', '`Bind<string>`', "`''`", 'A title above the items; it names the sheet (else `label`, else "Actions").'],
  ['message', '`Bind<string>`', "`''`", 'A line under the title that says what the choice is about.'],
  ['showCancel', '`Bind<boolean>`', '`true`', 'A cancel button apart, at the bottom.'],
  ['cancelText', '`Bind<string>`', "`''`", "Its text; empty for `uiLocale`'s Cancel."],
  ['detents', '`Bind<readonly BottomSheetDetent[]>`', "`['fit']`", 'As tall as its items (up to full); any of the bottom sheet\'s heights.'],
  ['onItemClick', '`(e: MenuItemClickEventArgs) => void`', '—', "An item was chosen, after the sheet closed and the item's own `click` ran."],
  ['every BottomSheet prop', 'see BottomSheet', '', 'Modal, the handle, swipe down, Escape, the scrim and the back button work as on the [BottomSheet page](/bottomsheet#api).'],
];

const MEMBERS = [
  ['choose(items?, host?)', '`Promise<MenuItem | null>`', 'Opens it (with these items) and resolves with the item chosen, or `null` when it was closed without one. `host` gives it a place when it has none.'],
  ['open(byKeyboard?)', '`boolean`', 'Opens it; `byKeyboard` puts focus on the first item, else on the list as a menu the pointer opened.'],
  ['chosenItem', 'read-only', 'The item chosen the last time it was open.'],
  ['menu', 'read-only', 'Its `MenuList`.'],
  ['refresh()', '`void`', 'Your items may be plain or reactive; the sheet reads them as they are. After changing them in place, call `refresh()`. The level shown follows.'],
  ['ContextMenu presentation', "`Bind<'menu' | 'sheet' | 'auto'>`", "On `ContextMenu`, default `'menu'`. `'sheet'` opens its items in an action sheet; `'auto'` does when a finger opened it (a long press), or on a screen with only a coarse pointer when not opened by a key. `onOpening`, `onItemClick` and `onClosed` work the same; `actionSheet` is the sheet."],
];

const KEYS = [
  ['Up, Down, Home, End', 'Between the items, round at the ends.'],
  ['Enter, Space, an item\'s `&` letter', 'Chooses it; on a submenu, opens it in place.'],
  ['A letter', 'The next item that starts with it.'],
  ['Escape', 'Closes it without a choice.'],
  ['Tab', 'To the cancel button and back.'],
];

const A11Y = [
  ['Dialog and menu', 'The sheet is a `dialog` named by its title; the items are a `menu` of `menuitem`, `menuitemcheckbox` and `menuitemradio`, as in the kit\'s menus.'],
  ['Focus', 'Opened by a key, on the first item; by a finger or the pointer, on the list. It goes back where it was when the sheet closes.'],
  ['Submenus', 'Open in place of their menu with "Back" first; the arrow at the end of an item says it has one.'],
  ['Touch', 'Items are `control.height.lg` high (`actionsheet.item-height`), larger than the 24 pixels WCAG 2.2 asks for.'],
];

const HOOKS = [
  ['.mx-action-sheet', 'On the bottom sheet\'s layer (`.mx-bottom-sheet`), whose hooks it has.'],
  ['.mx-action-sheet__message', 'The line under the title.'],
  ['.mx-action-sheet__list', 'The menu (`.mx-menu`).'],
  ['.mx-action-sheet__cancel', 'The row of the cancel button.'],
  ['.mx-action-sheet__back', 'The mark of the way back.'],
];

const TOKENS = [
  ['actionsheet.message, actionsheet.back, actionsheet.cancel', 'Units: the message, the mark of the item that goes back out of a submenu (`rtl`), the strip that holds the cancel button.'],
  ['actionsheet.menu.*, actionsheet.cancel-button.*, actionsheet.sheet.*', 'Places: the items, large enough for a finger; the cancel button; the sheet’s content padding.'],
  ['sheet.*', 'The surface, the handle and the title, as on the bottom sheet.'],
];

export default function ActionSheetPage() {
  return (
    <>
      <p class="lead">
        A list of commands that comes up from the bottom, made of the kit's menu items and large enough for a finger, with
        a title, a message and a cancel button apart. A context menu opens its items here on a touch screen.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ActionSheet, type ActionSheetProps } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="choose" title="Choosing from code">
        <p>
          <Rich text="`choose()` opens it and resolves with the item chosen, or `null`. An item with `items` opens its submenu in place, with a way back." />
        </p>
        <Example files={code('Choose.tsx')}>
          <Choose />
        </Example>
      </Section>

      <Section anchor="jsx" title="In JSX">
        <p>
          <Rich text="Bound with `x-model`; check and radio items show their marks, `cancelText` names the cancel button." />
        </p>
        <Example files={code('InJsx.tsx')}>
          <InJsx />
        </Example>
      </Section>

      <Section anchor="context-menu" title="A context menu on a touch screen">
        <p>
          <Rich text="`ContextMenu` has `presentation`: `'menu'` (the default), `'sheet'`, or `'auto'`, which opens an action sheet when a finger opened the menu (a long press). The items, `onOpening` and `onItemClick` stay the same." />
        </p>
        <Example files={code('FromContextMenu.tsx')}>
          <FromContextMenu />
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
          <Rich text="Cancel, the way back and its default name come from `uiLocale.strings` (`cancel`, `back`, `actionSheetLabel`); `cancelText` gives one of your own." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Members</h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
