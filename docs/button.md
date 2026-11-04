# Button

> Buttons · @motifx-community/ui 0.1.0-beta.0

A native `<button>` drawn from the design tokens: three variants, three tones, three sizes, an icon, an `&` access key. It can be a toggle, show that work is running, and open a menu or any content — from the whole button, or with `split` from an arrow next to it while the button keeps its own action.

## Import

```tsx
import { Button, type MenuItem } from '@motifx-community/ui';
```

## From JSX and from code

Both ways are complete. Every prop takes a value or a function; a function of a reactive object keeps the button in step with it. A property set from code takes the same.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack } from '@motifx-community/ui';

/** A button in JSX, and buttons created with `new`, added and bound from code. */
export default function FromCode() {
  let added = 0;
  let toolbar: Stack | null = null;

  const addFromCode = () => {
    const n = ++added;
    const state = reactive({ marks: '' });
    const b = new Button({ variant: 'outline' });
    b.text = () => `Button ${n}${state.marks}`; // a function is followed
    b.motif.on('click', () => (state.marks += ' ✓'));
    toolbar?.controls.add(b);
  };

  return (
    <>
      <Button text="Add a button from code" onclick={addFromCode} />
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (toolbar = c)} />
    </>
  );
}
```

## Variants, tones, sizes

`solid` buttons are pressable: an opaque fill, a bottom edge, a highlight along the top and a small move when pressed. `outline` has a frame, `ghost` shows only on hover. The tone picks the colors; the size the height, from the density tokens (switch Compact above).

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, type ButtonSize, type ButtonTone, type ButtonVariant } from '@motifx-community/ui';

const VARIANTS: ButtonVariant[] = ['solid', 'outline', 'ghost'];
const TONES: ButtonTone[] = ['standard', 'accent', 'danger'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

/** Every tone in every variant, in the size picked above them. */
export default function VariantsTonesSizes() {
  const s = reactive({ size: 'md' as ButtonSize });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">
        {SIZES.map((size) => (
          <Button
            key={size}
            text={size}
            size="sm"
            variant={() => (s.size === size ? 'solid' : 'ghost')}
            aria-pressed={() => s.size === size}
            onclick={() => (s.size = size)}
          />
        ))}
      </Stack>
      {TONES.map((tone) => (
        <Stack key={tone} orientation="horizontal" wrap align="center">
          {VARIANTS.map((variant) => (
            <Button key={variant} text={`${tone} ${variant}`} tone={tone} variant={variant} size={() => s.size} />
          ))}
        </Stack>
      ))}
    </>
  );
}
```

## Text, icon, children

`text` is the caption; JSX children come after it. `icon` takes an image address or any element or component, before the text or after it (`iconPosition`). A button with only an icon needs a name: give it a `hint`.

```tsx
import { Button } from '@motifx-community/ui';

const SaveIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
  </svg>
);

/** An icon from JSX or from an image address, an icon-only button named by its hint, and JSX children. */
export default function IconAndChildren() {
  return (
    <>
      <Button text="Save" icon={() => <SaveIcon />} />
      <Button text="Next" icon="../favicon.svg" iconPosition="end" variant="outline" />
      <Button icon={() => <SaveIcon />} hint="Save" variant="ghost" />
      <Button tone="accent">
        Total <b>42</b>
      </Button>
    </>
  );
}
```

## Toggle

With `toggle` a click turns `pressed` on and off; `x-model` binds it two-way.

```tsx
import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A toggle button bound two-way with x-model. */
export default function Toggle() {
  const s = reactive({ bold: false });
  return (
    <>
      <Button text="Bold" toggle x-model={() => s.bold} />
      <span>
        bold: <output class="bold-state">{() => String(s.bold)}</output>
      </span>
    </>
  );
}
```

## Busy

While `busy`, a spinner shows over the content, presses are ignored and the size does not change. The text stays for screen readers, with `aria-busy`.

```tsx
import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A button that shows a spinner while its work runs. */
export default function Busy() {
  const s = reactive({ sending: false });

  const send = () => {
    s.sending = true;
    setTimeout(() => (s.sending = false), 1500);
  };

  return <Button text="Send" tone="accent" busy={() => s.sending} onclick={send} />;
}
```

## Disabled

A disabled button is natively disabled: it leaves the Tab order and cannot be pressed. With `focusableWhenDisabled` it keeps its place and only gets `aria-disabled`, so a keyboard or screen reader user can still find it — and a hint can say why it is off.

```tsx
import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A disabled button leaves the Tab order; with focusableWhenDisabled it keeps its place. */
export default function Disabled() {
  const s = reactive({ enabled: false });
  return (
    <>
      <Button text="Toggle enabled" variant="outline" onclick={() => (s.enabled = !s.enabled)} />
      <Button text="Plain" enabled={() => s.enabled} />
      <Button text="Focusable" enabled={() => s.enabled} focusableWhenDisabled hint="Fill in the form first" />
    </>
  );
}
```

## Menu

With `menu` the whole button opens a list of commands. Items can have an icon, a check mark, a group line, be disabled or hidden; each `&` key chooses its item while the menu is open. An item field may be a function: the open menu follows what it reads.

```tsx
import { reactive } from '@motifx/core';
import { Button, type MenuItem } from '@motifx-community/ui';

const NewIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
  </svg>
);

/** A button that opens a menu: an icon, a disabled item, a check mark, group lines and & keys. */
export default function Menu() {
  const s = reactive({ last: '', wrap: true });

  const fileMenu = (): MenuItem[] => [
    { text: '&New', icon: () => <NewIcon />, click: () => (s.last = 'New') },
    { text: '&Open…', click: () => (s.last = 'Open…') },
    { text: 'Open &recent', enabled: false },
    { text: '&Word wrap', checked: () => s.wrap, beginGroup: true, click: () => (s.wrap = !s.wrap) },
    { text: 'E&xit', beginGroup: true, click: () => (s.last = 'Exit') },
  ];

  return (
    <>
      <Button text="&File" menu={fileMenu} variant="outline" />
      <span>
        Last: <output class="menu-log">{() => s.last || '—'}</output>
      </span>
    </>
  );
}
```

## Split

With `split` the button keeps its own action (`onclick`) and an arrow next to it opens the menu. The two are separate Tab stops; Alt+Down on the button opens the menu too. `split` can change at any time; a menu itself (`split`, `menu` or `dropDown`) must be there when the button is created, since it makes the button two parts.

```tsx
import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A split button: its own action, and an arrow that opens the menu. `split` can be switched off. */
export default function Split() {
  const s = reactive({ last: '', split: true });
  return (
    <>
      <Button
        text="Sa&ve"
        tone="accent"
        split={() => s.split}
        onclick={() => (s.last = 'Save')}
        menu={[
          { text: 'Save &as…', click: () => (s.last = 'Save as…') },
          { text: 'Save a&ll', click: () => (s.last = 'Save all') },
        ]}
      />
      <Button text="split" size="sm" variant="ghost" toggle x-model={() => s.split} />
      <span>
        Last: <output class="split-log">{() => s.last || '—'}</output>
      </span>
    </>
  );
}
```

## Any content

`dropDown` opens any component instead of a menu: a picker, a small form. Focus goes to its first field; Escape or a press outside closes it.

```tsx
import { Button, Stack } from '@motifx-community/ui';

/** A button that opens a small form instead of a menu. */
export default function DropDown() {
  return (
    <Button
      text="Filter"
      variant="outline"
      dropDown={
        <Stack orientation="horizontal" wrap align="center" padding="sm">
          <label>
            From <input name="from" type="date" />
          </label>
          <label>
            To <input name="to" type="date" />
          </label>
        </Stack>
      }
    />
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Enter, Space` | Press the button. With a menu and no `split`: open the menu, focus on its first item. |
| `Alt + key (`&Save`)` | Press it (Control + Option + key on Apple platforms). |
| `Down / Up` | On a button that opens a menu (or on the arrow of a split button): open it, focus on the first / last item. |
| `Alt + Down` | On the main part of a split button: open the menu. |
| `In the menu: Down / Up` | The next / previous item, wrapping around. Disabled items are reachable. |
| `In the menu: Home / End` | The first / last item. |
| `In the menu: a letter` | The item whose `&` key it is is chosen; otherwise focus goes to the next item starting with it. |
| `In the menu: Enter, Space` | Choose the focused item. |
| `Escape` | Close the menu or drop-down; focus goes back to the part that opened it. |
| `Tab` | Close the menu and go on to the next control. |

## Accessibility

| Topic | How |
| --- | --- |
| `Element` | A native `<button>` (two with `split`: the button and the arrow), so forms, Enter, Space and screen readers work as they always do. |
| `Name` | The text, without the `&` marker. An icon-only button is named by its `hint` (or your `aria-label`). The arrow of a split button is named from `uiLocale` ("More options"). |
| `Toggle` | `aria-pressed`. |
| `Busy` | `aria-busy="true"`; the text stays readable under the spinner. |
| `Menu` | `aria-haspopup="menu"` and `aria-expanded` on the part that opens it; the list is `role="menu"`, items `menuitem` or `menuitemcheckbox` with `aria-checked`, disabled items `aria-disabled`, group lines `separator`. |
| `Drop-down` | `aria-haspopup="dialog"`; the popup is `role="dialog"`, named by the button's text. Focus goes to its first field. |
| `Focus ring` | Only for keyboard use, the design system's double ring. |

## Localization

The only text a button writes itself is the name of a split button's arrow. It comes from `uiLocale.strings`, which starts with the page's `lang` (English and Turkish ship) and can be set to any `UiStrings`; every button follows at once. The set is kept as it is given: to change one text, assign a new set (`uiLocale.strings = { ...uiLocale.strings, moreOptions: 'Mehr' }`); a text changed inside the set is not seen.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** The name of a split button's arrow, from uiLocale: a shipped language or a text of your own. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Own text" variant="outline" onclick={() => (uiLocale.strings = { ...uiLocale.strings, moreOptions: 'Mehr' })} />
      <span>
        The arrow above is named <output class="arrow-name">{() => kitTexts.strings.moreOptions}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-button` | The button (or the group of a button with a menu). `data-variant`, `data-tone`, `data-size`, `data-icon-position`, `data-stretch`, `data-pressed`, `data-busy`, `data-icon`, `data-mode="menu\|split"`. |
| `.mx-button__face` | What is pressed: the button itself, or `.mx-button__main` and `.mx-button__arrow`. |
| `.mx-button__icon, .mx-button__chevron, .mx-button__spinner` | The icon, the arrow glyph of a menu button, the busy spinner. |
| `.mx-popup` | The surface the menu opens on (`data-side="bottom\|top"`). |
| `.mx-menu, .mx-menu__item, .mx-menu__separator` | The menu, its items, its group lines. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `button.face` | Unit: what is pressed, with its frame (the bottom side is a key’s edge), its fill and state layer (`image`) and its focus ring (outline and `glow`). Each look is a state (`accent`, `danger`, `outline`, `outline-accent`, `ghost`, …), and each look in each state too (`hover`, `toggled-hover`, `open`, `pressed`, `focus`, `toggled`, `disabled`: `outline-hover`, `accent-pressed`, …); also `icon-only`, `busy`, and a split button’s `main` and `arrow`. |
| `button.icon, button.caption, button.chevron, button.spinner, button.divider` | Units: the icon, the text, the arrow of a menu (`open`), the busy spinner and the line of a split button, each look a state. |
| `button.height.{sm,md,lg}, button.padding.{sm,md,lg}, button.font-size.{sm,md,lg}, button.line-height.{sm,md,lg}` | Sizes, from the density tokens. |
| `button.press-offset, button.icon-only-square, button.text-box, button.spinner-duration` | How far a solid button moves when pressed, a square icon button, the caption’s line box, the spinner’s turn. |
| `popup.surface, menu.*` | The popup surface and the menu items. |

All of them reference design-system tokens; see [Tokens](tokens.md). Override one after `styles.css` to restyle every button.

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | The caption. `&` marks the access key (`&Save` → Alt+S), `&&` is a literal `&`. JSX children come after it. |
| `variant` | `Bind<ButtonVariant>` | `'solid'` | `solid` (filled, pressable), `outline` (a frame), `ghost` (only on hover). |
| `tone` | `Bind<ButtonTone>` | `'standard'` | `standard`, `accent` (the main action), `danger` (a destructive one). |
| `size` | `Bind<ButtonSize>` | `'md'` | `sm`, `md`, `lg`: the density tokens' control heights. |
| `icon` | `Bind<IconSource \| null>` | — | An image address, or any element or component (an `<svg>` in JSX, an icon font tag). Decorative: hidden from screen readers. |
| `iconPosition` | `Bind<'start' \| 'end'>` | `'start'` | The icon before or after the text. |
| `stretch` | `Bind<boolean>` | `false` | Fills the width of what it sits in. |
| `type` | `Bind<'button' \| 'submit' \| 'reset'>` | `'button'` | The native type. `button` by default, so a button in a form never submits by accident. |
| `hint` | `Bind<string>` | `''` | A tooltip (`title`). It also names a button that has only an icon. |
| `toggle` | `Bind<boolean>` | `false` | A toggle button: a click turns `pressed` on and off (`aria-pressed`). |
| `pressed` | `Bind<boolean>` | `false` | The state of a toggle button. `x-model` binds it two-way. |
| `busy` | `Bind<boolean>` | `false` | Work is running: a spinner shows over the content, presses are ignored, the size stays, `aria-busy` is set. |
| `focusableWhenDisabled` | `Bind<boolean>` | `false` | Disabled, it keeps its place in the Tab order with `aria-disabled`, so a screen reader finds it and reads it as dimmed. |
| `split` | `Bind<boolean>` | `false` | With a menu: the button keeps its own action and an arrow next to it opens the menu. Without it the whole button opens the menu. |
| `menu` | `Bind<readonly MenuItem[]>` | — | The commands of the menu, read each time it opens. |
| `dropDown` | `Bind<ComponentBase \| null>` | — | Any content to open instead of a menu: a picker, a small form. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Set from code with a value or a function, like the prop: `b.tone = () => this.state.tone` is followed, `b.tone = 'accent'` replaces it. |
| `value` | read/write | `pressed`, for `x-model`. |
| `opened` | read/write, reactive | Whether the menu or drop-down is open; setting it opens or closes it. |
| `hasMenu` | read-only | Whether it was created with `split`, `menu` or `dropDown`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open()` | `boolean` | Opens the menu or drop-down with focus on its first item; `false` when there is nothing to open, or it is disabled or busy. |
| `close()` | `void` | Closes it; focus inside goes back to the part that opened it. |
| `refresh()` | `void` | Your menu items may be plain or reactive; the button reads them as they are. After changing them in place, call `refresh()`. An open menu shows the change at once. |
| `focus()` | `boolean` | Focuses the button (its main part with a menu). |

### Events

| Event | When |
| --- | --- |
| `onclick` | The DOM click of the button: its own action. With `split`, the arrow and the menu do not fire it; with a menu and no `split`, the click opens the menu. |
| `onItemClick(e)` | A menu item was chosen, after the item's own `click`. `e`: `{ item, source, event }`. |

### MenuItem

| Field | Type | Description |
| --- | --- | --- |
| `text` | `Bind<string>` | The label; `&` marks the key that chooses it while the menu is open. |
| `icon` | `Bind<IconSource>` | An icon; a function is called each time the item is drawn. |
| `hint` | `Bind<string>` | A tooltip. |
| `enabled` | `Bind<boolean>` | `false`: shown dimmed, reachable, cannot be chosen. |
| `visible` | `Bind<boolean>` | `false`: left out. |
| `checked` | `Bind<boolean>` | Given, the item is a `menuitemcheckbox` and shows a check mark when `true`. Flip it in its `click`. |
| `beginGroup` | `Bind<boolean>` | A line before the item. |
| `click(e)` | function | Runs when it is chosen, after the menu closed. |
| `data` | `unknown` | The app's own value. |

The menu and the surface it opens on are shared parts, `MenuList` and `Popup`, exported for other components to use.
