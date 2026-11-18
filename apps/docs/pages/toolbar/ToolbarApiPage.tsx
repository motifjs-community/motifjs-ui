import { ApiTable, Rich, Section } from '../../shared/doc';

const PROPS = [
  ['items', '`Bind<readonly ToolbarItem[]>`', '`[]`', 'Items defined as data, drawn before the JSX children.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the toolbar (`aria-label`), and its name in the menus that send commands to it. This is the same property as `text`.'],
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'horizontal'`", 'The direction of the toolbar. The arrow keys follow it.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'Applied to child controls that do not set their own `size`.'],
  ['buttonVariant', '`Bind<ButtonVariant>`', "`'ghost'`", 'Applied to child buttons that do not set their own `variant`.'],
  ['overflow', "`Bind<'menu' | 'wrap' | 'scroll'>`", "`'menu'`", '`menu` moves items that do not fit into an overflow menu, `wrap` adds a second row, and `scroll` makes the bar scroll.'],
  ['customizable', '`Bind<boolean>`', '`false`', 'The user can hide, move and rename the items of `items`, add commands and separators and choose what a button shows, from the menu of a right-click or Shift+F10 and in the customizer. Each item can say otherwise.'],
  ['customization', '`Bind<ToolbarCustomization | null>`', '`null`', 'What the user changed, as `onCustomized` reported it, to restore.'],
  ['commands', '`Bind<readonly ToolbarItem[]>`', 'The app’s commands', 'The commands the user can add, each with a `key`.'],
  ['customizer', '`Bind<boolean>`', '`true`', 'The menu of a right-click offers the customizer when `customizable` is on.'],
  ['customizerKeyboard', '`Bind<boolean>`', '`true`', 'The customizer has a Keyboard page ([ShortcutEditor](/shortcuteditor)).'],
  ['acceptCommands', '`Bind<boolean>`', '`true`', 'A customizable toolbar takes commands sent from the menus of the page.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', '`enabled={false}` disables every control inside.'],
];

const ITEM = [
  ['key', '`string | number`', 'Names the item in `customization`. The default is its position.'],
  ['type', "`Bind<'button' | 'toggle' | 'separator' | 'menu'>`", "The default is `'button'`."],
  ['command', '`string`', 'The command of the app the item runs (see [Commands and shortcuts](/commands)): what the item is not given comes from it.'],
  ['text, icon, hint', '`Bind<…>`', 'The caption (`&Bold` assigns an access key), an icon and a tooltip. An icon-only button is named by its `hint`.'],
  ['display', "`Bind<'icon' | 'text' | 'both'>`", "What the button shows. The default is `'both'`; the user's choice wins."],
  ['pressed', '`Bind<boolean>`', 'The state of a toggle. As a function, the item tracks application state, and `click` changes the value it reads.'],
  ['enabled, visible', '`Bind<boolean>`', 'Dims the item or removes it.'],
  ['menu', '`Bind<readonly MenuItem[]>`', 'The commands of a `menu` item, including submenus, check and radio items, and shortcuts.'],
  ['overflow', "`Bind<'auto' | 'always' | 'never'>`", 'Controls whether the item can move into the overflow menu, and takes precedence over the toolbar. A JSX child sets it with `data-overflow`.'],
  ['customizable', '`Bind<boolean>`', '`false` keeps the item where it is and shown in a customizable toolbar.'],
  ['click', '`(e) => void`', 'Occurs when the item is pressed, in the bar or in the overflow menu. `e`: `{ item, source, event }`.'],
  ['data', '`unknown`', 'A custom value.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['customization', 'read/write', 'Reading it gives a copy of what the user changed so far, to save.'],
  ['overflowed', 'read-only, reactive', 'The controls currently in the overflow menu.'],
];

const METHODS = [
  ['controlOf(item)', '`Control | null`', 'The control created for an item in `items`. It stays the same while the user moves, renames or changes the item.'],
  ['openCustomizer()', '`boolean`', 'Opens the customizer. Returns `false` when it is already open.'],
  ['updateOverflow()', '`void`', 'Recalculates what fits, for example after a control changes width.'],
  ['refresh()', '`void`', 'Your items can be plain or reactive, and the toolbar reads them as they are. After changing them in place, call `refresh()`. The list and each item\'s fields are read again, and controls for items that remain are kept.'],
  ['focus()', '`boolean`', 'Sets focus on the control that Tab reaches.'],
];

const EVENTS = [
  ['onItemClick(e)', 'Occurs when an item in `items` is pressed, after its own `click`. `e`: `{ item, source, event }`.'],
  ['onCustomized(e)', 'Occurs when the user changed the toolbar. `e`: `{ customization, source }`, everything changed so far.'],
  ['onCustomMenuOpening(e)', 'Occurs before the menu of a right-click opens. `e`: `{ item, path, items, cancel, byKeyboard, event, source }`; change `items` or set `cancel`.'],
];

const TYPES = [
  ['ToolbarCustomization', '`{ hidden?, order?, texts?, added?, display? }`: what the user changed (see [Customization](/toolbar/customization#saving)).'],
  ['ToolbarAddedItem', '`{ id, command?, separator? }`: a command or a separator the user added.'],
  ['ToolbarItemDisplay', "`'icon' | 'text' | 'both'`"],
  ['ToolbarCustomizedEventArgs', '`{ customization, source }`'],
  ['ToolbarCustomMenuOpeningEventArgs', '`{ item, path, items, cancel, byKeyboard, event, source }`: `item` is `null` on the bar outside the items.'],
];

export default function ToolbarApiPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Every prop, property, method and event of `Toolbar`, and the fields of its items." />
      </p>

      <Section anchor="props" title="Props">
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
      </Section>

      <Section anchor="item" title="ToolbarItem">
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
      </Section>

      <Section anchor="properties" title="Properties">
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
      </Section>

      <Section anchor="methods" title="Methods">
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
      </Section>

      <Section anchor="events" title="Events">
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>

      <Section anchor="types" title="Types">
        <ApiTable head={['Type', 'Shape']} rows={TYPES} />
      </Section>
    </>
  );
}
