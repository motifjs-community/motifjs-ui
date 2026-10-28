import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Busy from './examples/Busy';
import Disabled from './examples/Disabled';
import DropDown from './examples/DropDown';
import FromCode from './examples/FromCode';
import IconAndChildren from './examples/IconAndChildren';
import Localization from './examples/Localization';
import Menu from './examples/Menu';
import Split from './examples/Split';
import Toggle from './examples/Toggle';
import VariantsTonesSizes from './examples/VariantsTonesSizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The caption. `&` marks the access key (`&Save` → Alt+S), `&&` is a literal `&`. JSX children come after it.'],
  ['variant', '`Bind<ButtonVariant>`', "`'solid'`", '`solid` (filled, pressable), `outline` (a frame), `ghost` (only on hover).'],
  ['tone', '`Bind<ButtonTone>`', "`'standard'`", '`standard`, `accent` (the main action), `danger` (a destructive one).'],
  ['size', '`Bind<ButtonSize>`', "`'md'`", '`sm`, `md`, `lg`: the density tokens\' control heights.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An image address, or any element or component (an `<svg>` in JSX, an icon font tag). Decorative: hidden from screen readers.'],
  ['iconPosition', "`Bind<'start' | 'end'>`", "`'start'`", 'The icon before or after the text.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in.'],
  ['type', "`Bind<'button' | 'submit' | 'reset'>`", "`'button'`", 'The native type. `button` by default, so a button in a form never submits by accident.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip (`title`). It also names a button that has only an icon.'],
  ['toggle', '`Bind<boolean>`', '`false`', 'A toggle button: a click turns `pressed` on and off (`aria-pressed`).'],
  ['pressed', '`Bind<boolean>`', '`false`', 'The state of a toggle button. `x-model` binds it two-way.'],
  ['busy', '`Bind<boolean>`', '`false`', 'Work is running: a spinner shows over the content, presses are ignored, the size stays, `aria-busy` is set.'],
  ['focusableWhenDisabled', '`Bind<boolean>`', '`false`', 'Disabled, it keeps its place in the Tab order with `aria-disabled`, so a screen reader finds it and reads it as dimmed.'],
  ['split', '`Bind<boolean>`', '`false`', 'With a menu: the button keeps its own action and an arrow next to it opens the menu. Without it the whole button opens the menu.'],
  ['menu', '`Bind<readonly MenuItem[]>`', '—', 'The commands of the menu, read each time it opens.'],
  ['dropDown', '`Bind<ComponentBase | null>`', '—', 'Any content to open instead of a menu: a picker, a small form.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Set from code with a value or a function, like the prop: `b.tone = () => this.state.tone` is followed, `b.tone = \'accent\'` replaces it.'],
  ['value', 'read/write', '`pressed`, for `x-model`.'],
  ['opened', 'read/write, reactive', 'Whether the menu or drop-down is open; setting it opens or closes it.'],
  ['hasMenu', 'read-only', 'Whether it was created with `split`, `menu` or `dropDown`.'],
];

const METHODS = [
  ['open()', '`boolean`', 'Opens the menu or drop-down with focus on its first item; `false` when there is nothing to open, or it is disabled or busy.'],
  ['close()', '`void`', 'Closes it; focus inside goes back to the part that opened it.'],
  ['focus()', '`boolean`', 'Focuses the button (its main part with a menu).'],
];

const EVENTS = [
  ['onclick', 'The DOM click of the button: its own action. With `split`, the arrow and the menu do not fire it; with a menu and no `split`, the click opens the menu.'],
  ['onItemClick(e)', 'A menu item was chosen, after the item\'s own `click`. `e`: `{ item, source, event }`.'],
];

const ITEM = [
  ['text', '`Bind<string>`', 'The label; `&` marks the key that chooses it while the menu is open.'],
  ['icon', '`Bind<IconSource>`', 'An icon; a function is called each time the item is drawn.'],
  ['hint', '`Bind<string>`', 'A tooltip.'],
  ['enabled', '`Bind<boolean>`', '`false`: shown dimmed, reachable, cannot be chosen.'],
  ['visible', '`Bind<boolean>`', '`false`: left out.'],
  ['checked', '`Bind<boolean>`', 'Given, the item is a `menuitemcheckbox` and shows a check mark when `true`. Flip it in its `click`.'],
  ['beginGroup', '`Bind<boolean>`', 'A line before the item.'],
  ['click(e)', 'function', 'Runs when it is chosen, after the menu closed.'],
  ['data', '`unknown`', 'The app\'s own value.'],
];

const KEYS = [
  ['Enter, Space', 'Press the button. With a menu and no `split`: open the menu, focus on its first item.'],
  ['Alt + key (`&Save`)', 'Press it (Control + Option + key on Apple platforms).'],
  ['Down / Up', 'On a button that opens a menu (or on the arrow of a split button): open it, focus on the first / last item.'],
  ['Alt + Down', 'On the main part of a split button: open the menu.'],
  ['In the menu: Down / Up', 'The next / previous item, wrapping around. Disabled items are reachable.'],
  ['In the menu: Home / End', 'The first / last item.'],
  ['In the menu: a letter', 'The item whose `&` key it is is chosen; otherwise focus goes to the next item starting with it.'],
  ['In the menu: Enter, Space', 'Choose the focused item.'],
  ['Escape', 'Close the menu or drop-down; focus goes back to the part that opened it.'],
  ['Tab', 'Close the menu and go on to the next control.'],
];

const A11Y = [
  ['Element', 'A native `<button>` (two with `split`: the button and the arrow), so forms, Enter, Space and screen readers work as they always do.'],
  ['Name', 'The text, without the `&` marker. An icon-only button is named by its `hint` (or your `aria-label`). The arrow of a split button is named from `uiLocale` ("More options").'],
  ['Toggle', '`aria-pressed`.'],
  ['Busy', '`aria-busy="true"`; the text stays readable under the spinner.'],
  ['Menu', '`aria-haspopup="menu"` and `aria-expanded` on the part that opens it; the list is `role="menu"`, items `menuitem` or `menuitemcheckbox` with `aria-checked`, disabled items `aria-disabled`, group lines `separator`.'],
  ['Drop-down', '`aria-haspopup="dialog"`; the popup is `role="dialog"`, named by the button\'s text. Focus goes to its first field.'],
  ['Focus ring', 'Only for keyboard use, the design system\'s double ring.'],
];

const HOOKS = [
  ['.mx-button', 'The button (or the group of a button with a menu). `data-variant`, `data-tone`, `data-size`, `data-icon-position`, `data-stretch`, `data-pressed`, `data-busy`, `data-icon`, `data-mode="menu|split"`.'],
  ['.mx-button__face', 'What is pressed: the button itself, or `.mx-button__main` and `.mx-button__arrow`.'],
  ['.mx-button__icon, .mx-button__chevron, .mx-button__spinner', 'The icon, the arrow glyph of a menu button, the busy spinner.'],
  ['.mx-popup', 'The surface the menu opens on (`data-side="bottom|top"`).'],
  ['.mx-menu, .mx-menu__item, .mx-menu__separator', 'The menu, its items, its group lines.'],
];

const TOKENS = [
  ['button.face', 'Unit: what is pressed, with its frame (the bottom side is a key’s edge), its fill and state layer (`image`) and its focus ring (outline and `glow`). Each look is a state (`accent`, `danger`, `outline`, `outline-accent`, `ghost`, …), and each look in each state too (`hover`, `toggled-hover`, `open`, `pressed`, `focus`, `toggled`, `disabled`: `outline-hover`, `accent-pressed`, …); also `icon-only`, `busy`, and a split button’s `main` and `arrow`.'],
  ['button.icon, button.caption, button.chevron, button.spinner, button.divider', 'Units: the icon, the text, the arrow of a menu (`open`), the busy spinner and the line of a split button, each look a state.'],
  ['button.height.{sm,md,lg}, button.padding.{sm,md,lg}, button.font-size.{sm,md,lg}, button.line-height.{sm,md,lg}', 'Sizes, from the density tokens.'],
  ['button.press-offset, button.icon-only-square, button.text-box, button.spinner-duration', 'How far a solid button moves when pressed, a square icon button, the caption’s line box, the spinner’s turn.'],
  ['popup.surface, menu.*', 'The popup surface and the menu items.'],
];

export default function ButtonPage() {
  return (
    <>
      <p class="lead">
        A native <code>&lt;button&gt;</code> drawn from the design tokens: three variants, three tones, three sizes, an
        icon, an <code>&amp;</code> access key. It can be a toggle, show that work is running, and open a menu or any
        content — from the whole button, or with <code>split</code> from an arrow next to it while the button keeps its
        own action.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Button, type MenuItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Both ways are complete. Every prop takes a value or a function; a function of a reactive object keeps the button in step with it. A property set from code takes the same." />
        </p>
        <Example files={code('FromCode.tsx')}>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="look" title="Variants, tones, sizes">
        <p>
          <code>solid</code> buttons are pressable: an opaque fill, a bottom edge, a highlight along the top and a small
          move when pressed. <code>outline</code> has a frame, <code>ghost</code> shows only on hover. The tone picks the
          colors; the size the height, from the density tokens (switch Compact above).
        </p>
        <Example files={code('VariantsTonesSizes.tsx')} stack>
          <VariantsTonesSizes />
        </Example>
      </Section>

      <Section anchor="content" title="Text, icon, children">
        <p>
          <Rich text="`text` is the caption; JSX children come after it. `icon` takes an image address or any element or component, before the text or after it (`iconPosition`). A button with only an icon needs a name: give it a `hint`." />
        </p>
        <Example files={code('IconAndChildren.tsx')}>
          <IconAndChildren />
        </Example>
      </Section>

      <Section anchor="toggle" title="Toggle">
        <p>
          <Rich text="With `toggle` a click turns `pressed` on and off; `x-model` binds it two-way." />
        </p>
        <Example files={code('Toggle.tsx')}>
          <Toggle />
        </Example>
      </Section>

      <Section anchor="busy" title="Busy">
        <p>
          <Rich text="While `busy`, a spinner shows over the content, presses are ignored and the size does not change. The text stays for screen readers, with `aria-busy`." />
        </p>
        <Example files={code('Busy.tsx')}>
          <Busy />
        </Example>
      </Section>

      <Section anchor="disabled" title="Disabled">
        <p>
          <Rich text="A disabled button is natively disabled: it leaves the Tab order and cannot be pressed. With `focusableWhenDisabled` it keeps its place and only gets `aria-disabled`, so a keyboard or screen reader user can still find it — and a hint can say why it is off." />
        </p>
        <Example files={code('Disabled.tsx')}>
          <Disabled />
        </Example>
      </Section>

      <Section anchor="menu" title="Menu">
        <p>
          <Rich text="With `menu` the whole button opens a list of commands. Items can have an icon, a check mark, a group line, be disabled or hidden; each `&` key chooses its item while the menu is open. An item field may be a function: the open menu follows what it reads." />
        </p>
        <Example files={code('Menu.tsx')}>
          <Menu />
        </Example>
      </Section>

      <Section anchor="split" title="Split">
        <p>
          <Rich text="With `split` the button keeps its own action (`onclick`) and an arrow next to it opens the menu. The two are separate Tab stops; Alt+Down on the button opens the menu too. `split` can change at any time; a menu itself (`split`, `menu` or `dropDown`) must be there when the button is created, since it makes the button two parts." />
        </p>
        <Example files={code('Split.tsx')}>
          <Split />
        </Example>
      </Section>

      <Section anchor="dropdown" title="Any content">
        <p>
          <Rich text="`dropDown` opens any component instead of a menu: a picker, a small form. Focus goes to its first field; Escape or a press outside closes it." />
        </p>
        <Example files={code('DropDown.tsx')}>
          <DropDown />
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
          <Rich text="The only text a button writes itself is the name of a split button's arrow. It comes from `uiLocale.strings`, which starts with the page's `lang` (English and Turkish ship) and can be set to any `UiStrings`; every button follows at once." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
        <p>
          All of them reference design-system tokens; see <a rel="router" href="/tokens">Tokens</a>. Override one after{' '}
          <code>styles.css</code> to restyle every button.
        </p>
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
        <h3>MenuItem</h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
        <p>
          <Rich text="The menu and the surface it opens on are shared parts, `MenuList` and `Popup`, exported for other components to use." />
        </p>
      </Section>
    </>
  );
}
