# Toolbar

> Buttons · @motifx-community/ui 0.1.0-beta.7

A command bar that holds buttons, toggle buttons, menus and fields, organized in groups with separators. The toolbar is a single Tab stop, and the arrow keys move between its controls. Items that do not fit move into an overflow menu at the end. You can define items as data, as JSX children, or both.

## Import

```tsx
import { Toolbar, ToolbarSeparator, type ToolbarItem } from '@motifx-community/ui';
```

## Declarative and programmatic

`items` defines commands as data, where each field is a value or a function. JSX children of any control type follow them. Programmatically, fill a toolbar as you would any control: `toolbar.controls.add(button)`. Every prop is also a property.

```tsx
/** A small outline icon drawn from one path. */
function icon(d: string) {
  return () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');
export const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');
export const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');
export const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');
export const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');
export const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');
export const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');
export const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');
export const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');
export const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');
```

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, Toolbar } from '@motifx-community/ui';

/** A toolbar created with `new` and filled with `controls.add`. */
export default function Programmatic() {
  const s = reactive({ log: '' });
  let added = 0;

  const bar = new Toolbar({ label: 'Actions', size: 'sm' });
  bar.controls.add(new Button({ text: 'First', onclick: () => (s.log = 'First pressed') }));

  const addProgrammatic = () => {
    const n = ++added;
    bar.controls.add(new Button({ text: `Button ${n}`, onclick: () => (s.log = `Button ${n} pressed`) }));
  };

  return (
    <>
      <Button text="Add a button programmatically" variant="outline" onclick={addProgrammatic} />
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />
      <output>{() => s.log}</output>
    </>
  );
}
```

## Toggle groups and separators

A `toggle` item is a toggle button (`aria-pressed`). When bound to the application with a function, it reflects application state. In the example above, Bold, Italic and Underline are independent toggles, and the alignment buttons form a group where one is pressed. `separator` items, or `<ToolbarSeparator />`, draw the lines between groups.

```tsx
/** A small outline icon drawn from one path. */
function icon(d: string) {
  return () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');
export const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');
export const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');
export const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');
export const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');
export const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');
export const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');
export const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');
export const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');
export const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');
```

## Overflow

When `overflow` is `menu` (the default), items that do not fit move into an overflow menu at the end, starting from the last item. The toolbar monitors its own size. Items keep their names in the menu (an icon-only button uses its `hint` or `aria-label`), a toggle becomes a check item, and a menu button becomes a submenu. An item's `overflow` can be `always` or `never`, and fields stay in the bar. `wrap` adds a second row, and `scroll` lets the bar scroll.

```tsx
/** A small outline icon drawn from one path. */
function icon(d: string) {
  return () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');
export const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');
export const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');
export const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');
export const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');
export const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');
export const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');
export const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');
export const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');
export const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');
```

## Orientation, size and fields

`size` and `buttonVariant` apply to child controls that do not set their own. A vertical toolbar uses Up and Down for navigation. A text field inside the toolbar keeps the arrow keys for its text.

```tsx
/** A small outline icon drawn from one path. */
function icon(d: string) {
  return () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');
export const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');
export const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');
export const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');
export const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');
export const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');
export const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');
export const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');
export const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');
export const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the toolbar, to the control used last. Pressing Tab again leaves it. |
| `Right / Left` | Moves to the next or previous control, wrapping at the ends (Left and Right are reversed on right-to-left pages). In a vertical toolbar, use Down and Up. |
| `Home / End` | Moves to the first or last control. |
| `In a text field` | The arrow keys, Home and End move within the text, and Tab leaves the field. |
| `Down on a menu button` | Opens the menu (horizontal toolbar). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Role` | `role="toolbar"` with `aria-orientation`, named by `label`. |
| `Focus` | One Tab stop. The control used last has `tabindex="0"`, and the others have `-1` (roving tabindex). |
| `Separators` | `role="separator"`, oriented across the toolbar. |
| `Toggles` | Toggle items are buttons with `aria-pressed`. |
| `“More” menu` | A menu button named from `uiLocale` (“More options”). Items keep their names (an icon-only button uses its `hint` or `aria-label`), toggles become check items, and menu buttons become submenus. |

## Localization

The only string a toolbar displays on its own is the name of its overflow button, from `uiLocale.strings.moreOptions`.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of the kit; the “more” buttons take the new name at once. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        The “more” button is named <output class="tb-more-name">{() => kitTexts.strings.moreOptions}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-toolbar` | The toolbar. `data-orientation`, `data-size`, `data-overflow`, `data-disabled`. |
| `.mx-toolbar__separator` | A separator. |
| `.mx-toolbar__more` | The overflow button, a `Button` with a menu. |
| `[data-overflowed]` | Set on a control that is currently in the overflow menu. |

### Component tokens

| Token | Description |
| --- | --- |
| `toolbar.height` | The minimum height of the bar, which uses the density-aware bar height. |
| `toolbar.bar, toolbar.separator` | Units: the bar (`vertical`: a column of controls) and the separators. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly ToolbarItem[]>` | `[]` | Items defined as data, drawn before the JSX children (see Items). |
| `label` | `Bind<string>` | `''` | The accessible name of the toolbar (`aria-label`). This is the same property as `text`. |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'horizontal'` | The direction of the toolbar. The arrow keys follow it. |
| `size` | `Bind<ControlSize>` | `'md'` | Applied to child controls that do not set their own `size`. |
| `buttonVariant` | `Bind<ButtonVariant>` | `'ghost'` | Applied to child buttons that do not set their own `variant`. |
| `overflow` | `Bind<'menu' \| 'wrap' \| 'scroll'>` | `'menu'` | `menu` moves items that do not fit into an overflow menu, `wrap` adds a second row, and `scroll` makes the bar scroll. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | `enabled={false}` disables every control inside. |

### ToolbarItem

| Field | Type | Description |
| --- | --- | --- |
| `type` | `Bind<'button' \| 'toggle' \| 'separator' \| 'menu'>` | The default is `'button'`. |
| `text, icon, hint` | `Bind<…>` | The caption (`&Bold` assigns an access key), an icon and a tooltip. An icon-only button is named by its `hint`. |
| `pressed` | `Bind<boolean>` | The state of a toggle. As a function, the item tracks application state, and `click` changes the value it reads. |
| `enabled, visible` | `Bind<boolean>` | Dims the item or removes it. |
| `menu` | `Bind<readonly MenuItem[]>` | The commands of a `menu` item, including submenus, check and radio items, and shortcuts. |
| `overflow` | `Bind<'auto' \| 'always' \| 'never'>` | Controls whether the item can move into the overflow menu, and takes precedence over the toolbar. A JSX child sets it with `data-overflow`. |
| `click` | `(e) => void` | Occurs when the item is pressed, in the bar or in the overflow menu. `e`: `{ item, source, event }`. |
| `data` | `unknown` | A custom value. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `overflowed` | read-only, reactive | The controls currently in the overflow menu. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `controlOf(item)` | `Control \| null` | The control created for an item in `items`. |
| `updateOverflow()` | `void` | Recalculates what fits, for example after a control changes width. |
| `refresh()` | `void` | Your items can be plain or reactive, and the toolbar reads them as they are. After changing them in place, call `refresh()`. The list and each item's fields are read again, and controls for items that remain are kept. |
| `focus()` | `boolean` | Sets focus on the control that Tab reaches. |

### Events

| Event | When |
| --- | --- |
| `onItemClick(e)` | Occurs when an item in `items` is pressed, after its own `click`. `e`: `{ item, source, event }`. |

## Feedback

Loading issues…

## Example files

`Editor.tsx`

```tsx
import { Toolbar } from '@motifx-community/ui';
import { draft } from './draft';
import { editorItems } from './editor-items';

/** An editor toolbar from `items`: buttons, toggles, an alignment group, a menu, and a button kept out of the “more” menu. */
export default function Editor() {
  const preview = () =>
    `font-weight: ${draft.bold ? 600 : 400}; font-style: ${draft.italic ? 'italic' : 'normal'}; text-decoration: ${draft.underline ? 'underline' : 'none'}; text-align: ${draft.align}; inline-size: 100%; margin: 0`;
  return (
    <>
      <Toolbar label="Format" items={editorItems()} style="inline-size: 100%" />
      <p style={preview}>The quick brown fox jumps over the lazy dog.</p>
      <output class="tb-log">{() => draft.log}</output>
    </>
  );
}
```

`editor-items.tsx`

```tsx
import type { ToolbarItem } from '@motifx-community/ui';
import { draft } from './draft';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ImageIcon, ItalicIcon, LinkIcon, RedoIcon, UnderlineIcon, UndoIcon } from './icons';

const did = (what: string) => (draft.log = what);

const align = (value: 'left' | 'center' | 'right', hint: string, Icon: typeof BoldIcon): ToolbarItem => ({
  type: 'toggle',
  icon: () => <Icon />,
  hint,
  pressed: () => draft.align === value,
  click: () => (draft.align = value),
});

/** The items of the editor toolbar, bound to the draft. */
export function editorItems(): ToolbarItem[] {
  return [
    { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },
    { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },
    { type: 'separator' },
    { type: 'toggle', icon: () => <BoldIcon />, hint: 'Bold', pressed: () => draft.bold, click: () => (draft.bold = !draft.bold) },
    { type: 'toggle', icon: () => <ItalicIcon />, hint: 'Italic', pressed: () => draft.italic, click: () => (draft.italic = !draft.italic) },
    { type: 'toggle', icon: () => <UnderlineIcon />, hint: 'Underline', pressed: () => draft.underline, click: () => (draft.underline = !draft.underline) },
    { type: 'separator' },
    align('left', 'Align left', AlignLeftIcon),
    align('center', 'Center', AlignCenterIcon),
    align('right', 'Align right', AlignRightIcon),
    { type: 'separator' },
    {
      type: 'menu',
      text: 'Insert',
      menu: [
        { text: '&Link', icon: () => <LinkIcon />, shortcut: 'Ctrl+K', click: () => did('Insert link') },
        { text: '&Image', icon: () => <ImageIcon />, click: () => did('Insert image') },
        { text: '&Table', items: [2, 3, 4].map((n) => ({ text: `${n} × ${n}`, click: () => did(`Insert a ${n} × ${n} table`) })) },
      ],
    },
    { text: '&Publish', click: () => did('Publish'), overflow: 'never' },
  ];
}
```

`draft.ts`

```tsx
import { reactive } from '@motifx/core';

/** The text the toolbars on this page format: one state, so every toolbar shows the same. */
export const draft = reactive({
  bold: true,
  italic: false,
  underline: false,
  align: 'left' as 'left' | 'center' | 'right',
  log: 'Nothing yet.',
});
```

`icons.tsx`

```tsx
/** A small outline icon drawn from one path. */
function icon(d: string) {
  return () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');
export const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');
export const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');
export const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');
export const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');
export const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');
export const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');
export const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');
export const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');
export const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');
```

`ToggleGroups.tsx`

```tsx
import { Button, Toolbar, ToolbarSeparator } from '@motifx-community/ui';
import { draft } from './draft';
import { BoldIcon, ItalicIcon } from './icons';

/** Toggle buttons as JSX children, bound with x-model, and a separator before a plain button. */
export default function ToggleGroups() {
  return (
    <Toolbar label="Text">
      <Button icon={() => <BoldIcon />} aria-label="Bold" toggle x-model={() => draft.bold} />
      <Button icon={() => <ItalicIcon />} aria-label="Italic" toggle x-model={() => draft.italic} />
      <ToolbarSeparator />
      <Button
        text="Clear"
        onclick={() => {
          draft.bold = draft.italic = draft.underline = false;
        }}
      />
    </Toolbar>
  );
}
```

`Overflow.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Toolbar, type ToolbarOverflow } from '@motifx-community/ui';
import { editorItems } from './editor-items';

const OVERFLOWS: ToolbarOverflow[] = ['menu', 'wrap', 'scroll'];

/** The editor toolbar in less room: a “more” menu, a second row, or a bar that scrolls. */
export default function Overflow() {
  const s = reactive({ width: 100, overflow: 'menu' as ToolbarOverflow });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Width">
        {[100, 70, 45, 25].map((width) => (
          <Button key={width} text={`${width}%`} size="sm" variant={() => (s.width === width ? 'solid' : 'ghost')} aria-pressed={() => s.width === width} onclick={() => (s.width = width)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Overflow">
        {OVERFLOWS.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.overflow === mode ? 'solid' : 'ghost')} aria-pressed={() => s.overflow === mode} onclick={() => (s.overflow = mode)} />
        ))}
      </Stack>
      <div class="tb-frame" style={() => `inline-size: ${s.width}%`}>
        <Toolbar label="Format (narrow)" items={editorItems()} overflow={() => s.overflow} />
      </div>
    </>
  );
}
```

`SizeAndOrientation.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, Toolbar, type ControlSize } from '@motifx-community/ui';
import { ImageIcon, LinkIcon, RedoIcon, UndoIcon } from './icons';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A size given to the controls inside, a text field in a toolbar, and a toolbar that turns vertical. */
export default function SizeAndOrientation() {
  const s = reactive({ size: 'md' as ControlSize, vertical: false, log: '' });
  const did = (what: string) => (s.log = what);
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">
        {SIZES.map((size) => (
          <Button key={size} text={size} size="sm" variant={() => (s.size === size ? 'solid' : 'ghost')} aria-pressed={() => s.size === size} onclick={() => (s.size = size)} />
        ))}
        <Button text="Vertical" size="sm" toggle x-model={() => s.vertical} />
      </Stack>
      <Toolbar label="Find" size={() => s.size}>
        <Button text="Previous" onclick={() => did('Previous')} />
        <TextBox label="Find" labelMode="hidden" placeholder="Find" />
        <Button text="Next" onclick={() => did('Next')} />
      </Toolbar>
      <Toolbar
        label="Tools"
        size={() => s.size}
        orientation={() => (s.vertical ? 'vertical' : 'horizontal')}
        items={[
          { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },
          { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },
          { type: 'separator' },
          { icon: () => <LinkIcon />, hint: 'Link', click: () => did('Link') },
          { icon: () => <ImageIcon />, hint: 'Image', enabled: false },
        ]}
      />
      <output>{() => s.log}</output>
    </>
  );
}
```
