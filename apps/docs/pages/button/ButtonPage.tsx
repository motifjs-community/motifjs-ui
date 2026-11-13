import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Busy from './examples/Busy';
import Disabled from './examples/Disabled';
import DropDown from './examples/DropDown';
import Programmatic from './examples/Programmatic';
import IconAndChildren from './examples/IconAndChildren';
import Localization from './examples/Localization';
import Menu from './examples/Menu';
import Split from './examples/Split';
import Toggle from './examples/Toggle';
import VariantsTonesSizes from './examples/VariantsTonesSizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The caption. `&` marks the access key (`&Save` → Alt+S), and `&&` produces a literal `&`. JSX children follow it.'],
  ['variant', '`Bind<ButtonVariant>`', "`'solid'`", '`solid` (filled and pressable), `outline` (framed) or `ghost` (visible only on hover).'],
  ['tone', '`Bind<ButtonTone>`', "`'standard'`", '`standard`, `accent` for the primary action, or `danger` for a destructive action.'],
  ['size', '`Bind<ButtonSize>`', "`'md'`", '`sm`, `md` or `lg`, which map to the control heights in the density tokens.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An image address or a component (an `<svg>` in JSX, an icon font tag); given as a function, the “more” menu of a toolbar calls it again for its own copy. It is decorative and hidden from screen readers.'],
  ['iconPosition', "`Bind<'start' | 'end'>`", "`'start'`", 'Places the icon before or after the text.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Stretches to the full width of its container.'],
  ['type', "`Bind<'button' | 'submit' | 'reset'>`", "`'button'`", 'The native type. The default is `button`, so a button inside a form never submits by accident.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip (`title`). It also provides the name of an icon-only button.'],
  ['toggle', '`Bind<boolean>`', '`false`', 'Makes it a toggle button. A click turns `pressed` on and off (`aria-pressed`).'],
  ['pressed', '`Bind<boolean>`', '`false`', 'The state of a toggle button. `x-model` provides two-way binding.'],
  ['busy', '`Bind<boolean>`', '`false`', 'Indicates that work is in progress. A spinner appears over the content, clicks are ignored, the size is preserved and `aria-busy` is set.'],
  ['focusableWhenDisabled', '`Bind<boolean>`', '`false`', 'When disabled, the button stays in the Tab order with `aria-disabled`, so a screen reader can find it and announce it as dimmed.'],
  ['split', '`Bind<boolean>`', '`false`', 'With a menu, the button keeps its own action and an arrow next to it opens the menu. Without `split`, the whole button opens the menu.'],
  ['menu', '`Bind<readonly MenuItem[]>`', '—', 'The menu commands, read each time the menu opens.'],
  ['dropDown', '`Bind<ComponentBase | null>`', '—', 'Any content to open instead of a menu, such as a picker or a small form.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Set programmatically with a value or a function, the same as the prop: `b.tone = () => this.state.tone` is tracked, and `b.tone = \'accent\'` replaces it.'],
  ['value', 'read/write', 'Maps to `pressed` for `x-model`.'],
  ['opened', 'read/write, reactive', 'Indicates whether the menu or drop-down is open. Set it to open or close it.'],
  ['hasMenu', 'read-only', 'Indicates whether the button was created with `split`, `menu` or `dropDown`.'],
];

const METHODS = [
  ['open()', '`boolean`', 'Opens the menu or drop-down with focus on its first item. Returns `false` if there is nothing to open, or if the button is disabled or busy.'],
  ['close()', '`void`', 'Closes it. If focus is inside, it returns to the part that opened it.'],
  ['refresh()', '`void`', 'Your menu items can be plain or reactive, and the button reads them as they are. After changing them in place, call `refresh()`. An open menu shows the change immediately.'],
  ['focus()', '`boolean`', 'Sets focus on the button, or on its main part if it has a menu.'],
];

const EVENTS = [
  ['onclick', 'The DOM click event of the button, which runs its own action. With `split`, the arrow and the menu do not raise it. With a menu and no `split`, the click opens the menu.'],
  ['onItemClick(e)', 'Occurs when a menu item is selected, after the item\'s own `click`. `e`: `{ item, source, event }`.'],
];

const ITEM = [
  ['text', '`Bind<string>`', 'The label. `&` marks the key that selects it while the menu is open.'],
  ['icon', '`Bind<IconSource>`', 'An icon. A function is called each time the item is drawn.'],
  ['hint', '`Bind<string>`', 'The tooltip text.'],
  ['enabled', '`Bind<boolean>`', '`false` shows the item dimmed. It stays reachable but cannot be selected.'],
  ['visible', '`Bind<boolean>`', '`false` removes the item.'],
  ['checked', '`Bind<boolean>`', 'When set, the item is a `menuitemcheckbox` and shows a check mark when `true`. Change it in `click`.'],
  ['beginGroup', '`Bind<boolean>`', 'Draws a separator before the item.'],
  ['click(e)', 'function', 'Runs when the item is selected, after the menu closes.'],
  ['data', '`unknown`', 'A custom application value.'],
];

const KEYS = [
  ['Enter, Space', 'Presses the button. With a menu and no `split`, it opens the menu and moves focus to the first item.'],
  ['Alt + key (`&Save`)', 'Presses the button (Control + Option + key on Apple platforms).'],
  ['Down / Up', 'On a button that opens a menu, or on the arrow of a split button, opens the menu and moves focus to the first or last item.'],
  ['Alt + Down', 'On the main part of a split button, opens the menu.'],
  ['In the menu: Down / Up', 'Moves to the next or previous item, wrapping at the ends. Disabled items are reachable.'],
  ['In the menu: Home / End', 'Moves to the first or last item.'],
  ['In the menu: a letter', 'Selects the item with that `&` key. Otherwise, focus moves to the next item that starts with that letter.'],
  ['In the menu: Enter, Space', 'Selects the focused item.'],
  ['Escape', 'Closes the menu or drop-down, and focus returns to the part that opened it.'],
  ['Tab', 'Closes the menu and moves to the next control.'],
];

const A11Y = [
  ['Element', 'A native `<button>` (two with `split`: the button and the arrow), so forms, Enter, Space and screen readers work as expected.'],
  ['Name', 'The text without the `&` marker. An icon-only button is named by its `hint` or by your `aria-label`. The arrow of a split button gets its name from `uiLocale` ("More options").'],
  ['Toggle buttons', '`aria-pressed`.'],
  ['Busy state', '`aria-busy="true"`. The text remains readable under the spinner.'],
  ['Menu', '`aria-haspopup="menu"` and `aria-expanded` on the part that opens the menu. The list has `role="menu"`, items are `menuitem` or `menuitemcheckbox` with `aria-checked`, disabled items have `aria-disabled`, and group separators are `separator`.'],
  ['Drop-down', '`aria-haspopup="dialog"`. The popup has `role="dialog"` and is named by the button\'s text. Focus moves to its first field.'],
  ['Focus ring', 'Shown only during keyboard use, with the design system\'s double ring.'],
];

const HOOKS = [
  ['.mx-button', 'The button, or the group of a button with a menu. `data-variant`, `data-tone`, `data-size`, `data-icon-position`, `data-stretch`, `data-pressed`, `data-busy`, `data-icon`, `data-mode="menu|split"`.'],
  ['.mx-button__face', 'The pressable part: the button itself, or `.mx-button__main` and `.mx-button__arrow`.'],
  ['.mx-button__icon, .mx-button__chevron, .mx-button__spinner', 'The icon, the arrow glyph of a menu button and the busy spinner.'],
  ['.mx-popup', 'The surface the menu opens on (`data-side="bottom|top"`).'],
  ['.mx-menu, .mx-menu__item, .mx-menu__separator', 'The menu, its items and its group separators.'],
];

const TOKENS = [
  ['button.face', 'Unit: the pressable part, with its frame (the bottom side is the key edge), its fill and state layer (`image`) and its focus ring (outline and `glow`). Each appearance is a state (`accent`, `danger`, `outline`, `outline-accent`, `ghost`, …), and each appearance has its own states (`hover`, `toggled-hover`, `open`, `pressed`, `focus`, `toggled`, `disabled`: `outline-hover`, `accent-pressed`, …). There are also `icon-only`, `busy`, and the `main` and `arrow` parts of a split button.'],
  ['button.icon, button.caption, button.chevron, button.spinner, button.divider', 'Units: the icon, the text, the menu arrow (`open`), the busy spinner and the split button divider. Each appearance is a state.'],
  ['button.height.{sm,md,lg}, button.padding.{sm,md,lg}, button.font-size.{sm,md,lg}, button.line-height.{sm,md,lg}', 'Sizes are defined by the density tokens.'],
  ['button.press-offset, button.icon-only-square, button.text-box, button.spinner-duration', 'The distance a solid button moves when pressed, the square icon button, the caption line box and the spinner rotation.'],
  ['popup.surface, menu.*', 'The popup surface and the menu items.'],
];

export default function ButtonPage() {
  return (
    <>
      <p class="lead">
        <Rich text={'A native `<button>` styled with design tokens. It comes in three variants, three tones and three sizes, and supports an icon and an `&` access key. A button can act as a toggle, indicate that work is in progress, and open a menu or any other content, either from the whole button or from an arrow next to it with `split`, so the button keeps its own action.'} />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Button, type MenuItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Both approaches are fully supported. Every prop accepts a value or a function, and a function that reads a reactive object keeps the button in sync with it. Setting a property programmatically works the same way." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="look" title="Variants, tones and sizes">
        <p>
          <Rich text="`solid` buttons have an opaque fill, a bottom edge, a highlight along the top and a slight movement when pressed. `outline` buttons have a frame, and `ghost` buttons show a background only on hover. The tone sets the colors, and the size sets the height from the density tokens. Turn on Compact above to see the difference." />
        </p>
        <Example files={code('VariantsTonesSizes.tsx')} stack>
          <VariantsTonesSizes />
        </Example>
      </Section>

      <Section anchor="content" title="Text, icons and children">
        <p>
          <Rich text="`text` sets the caption, and JSX children follow it. `icon` accepts an image address or a component, placed before or after the text with `iconPosition`. A button with only an icon needs an accessible name, so give it a `hint`." />
        </p>
        <Example files={code('IconAndChildren.tsx')}>
          <IconAndChildren />
        </Example>
      </Section>

      <Section anchor="toggle" title="Toggle buttons">
        <p>
          <Rich text="With `toggle`, a click turns `pressed` on and off. `x-model` provides two-way binding." />
        </p>
        <Example files={code('Toggle.tsx')}>
          <Toggle />
        </Example>
      </Section>

      <Section anchor="busy" title="Busy state">
        <p>
          <Rich text="While `busy` is set, a spinner appears over the content, clicks are ignored and the size does not change. The text remains available to screen readers, and the button gets `aria-busy`." />
        </p>
        <Example files={code('Busy.tsx')}>
          <Busy />
        </Example>
      </Section>

      <Section anchor="disabled" title="Disabled state">
        <p>
          <Rich text="A disabled button uses the native disabled state, so it leaves the Tab order and cannot be pressed. With `focusableWhenDisabled`, it keeps its place in the Tab order and only gets `aria-disabled`. Keyboard and screen reader users can still reach it, and a hint can explain why it is unavailable." />
        </p>
        <Example files={code('Disabled.tsx')}>
          <Disabled />
        </Example>
      </Section>

      <Section anchor="menu" title="Menu">
        <p>
          <Rich text={'With `menu`, the whole button opens a list of commands. Items can have an icon, a check mark or a group separator, and can be disabled or hidden. While the menu is open, each `&` key selects its item. An item field can be a function, and the open menu tracks what it reads.'} />
        </p>
        <Example files={code('Menu.tsx')}>
          <Menu />
        </Example>
      </Section>

      <Section anchor="split" title="Split button">
        <p>
          <Rich text="With `split`, the button keeps its own action (`onclick`) and an arrow next to it opens the menu. The two parts are separate Tab stops, and Alt+Down on the button also opens the menu. You can change `split` at any time, but the menu itself (`split`, `menu` or `dropDown`) must exist when the button is created, because it divides the button into two parts." />
        </p>
        <Example files={code('Split.tsx')}>
          <Split />
        </Example>
      </Section>

      <Section anchor="dropdown" title="Any content">
        <p>
          <Rich text="`dropDown` opens any component instead of a menu, such as a picker or a small form. Focus moves to its first field, and Escape or a click outside closes it." />
        </p>
        <Example files={code('DropDown.tsx')}>
          <DropDown />
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
          <Rich text="The only string a button displays on its own is the name of a split button's arrow. It comes from `uiLocale.strings`, which starts from the page's `lang` (English and Turkish are included) and can be set to any `UiStrings`. Every button updates immediately. The set is used as provided, so to change one string, assign a new set: `uiLocale.strings = { ...uiLocale.strings, moreOptions: 'Mehr' }`. Changing a string inside the existing set has no effect." />
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
        <p>
          <Rich text="All of these reference design system tokens (see [Tokens](/tokens)). Override one after `styles.css` to restyle every button." />
        </p>
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
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
        <h3>
          <Rich text="MenuItem" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
        <p>
          <Rich text="The menu and the surface it opens on are shared parts, `MenuList` and `Popup`, exported for use in other components." />
        </p>
      </Section>
    </>
  );
}
