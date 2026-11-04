# Toolbar

> Buttons · @motifx-community/ui 0.1.0-beta.0

A bar of commands: buttons, toggle buttons, menus and fields in groups between separators. It is one Tab stop and the arrow keys move inside it; items that do not fit move into a “more” menu at the end. Items come as data, as JSX children, or both.

## Import

```tsx
import { Toolbar, ToolbarSeparator, type ToolbarItem } from '@motifx-community/ui';
```

## From JSX and from code

`items` describes the commands as data, each field a value or a function; JSX children (any control) come after them. From code, a toolbar is filled like any control: `toolbar.controls.add(button)`. Every prop is also a property.

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

/** A toolbar made with `new` and filled with `controls.add`. */
export default function FromCode() {
  const s = reactive({ log: '' });
  let added = 0;

  const bar = new Toolbar({ label: 'Actions', size: 'sm' });
  bar.controls.add(new Button({ text: 'First', onclick: () => (s.log = 'First pressed') }));

  const addFromCode = () => {
    const n = ++added;
    bar.controls.add(new Button({ text: `Button ${n}`, onclick: () => (s.log = `Button ${n} pressed`) }));
  };

  return (
    <>
      <Button text="Add a button from code" variant="outline" onclick={addFromCode} />
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />
      <output>{() => s.log}</output>
    </>
  );
}
```

## Toggle groups and separators

A `toggle` item is a toggle button (`aria-pressed`). Bound to the app with a function, it shows the app’s state: Bold, Italic and Underline above are three independent toggles, the alignment buttons a group where one is pressed. `separator` items (or `<ToolbarSeparator />`) draw the lines between groups.

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

With `overflow` set to `menu` (the default) the items that do not fit move into a “more” menu at the end, from the last one back; the toolbar watches its own size. There they keep their names (an icon-only button its `hint` or `aria-label`), a toggle becomes a check item and a menu button a submenu. An item’s `overflow` says `always` or `never`; fields stay in the bar. `wrap` starts a second row, `scroll` lets the bar scroll.

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

## Orientation, size, fields

`size` and `buttonVariant` reach the controls inside that have none of their own. A vertical toolbar moves with Up and Down. A text field inside keeps the arrow keys for its text.

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

| Key | What it does |
| --- | --- |
| `Tab` | Into the toolbar, to the control used last; Tab again leaves it. |
| `Right / Left` | The next / previous control, wrapping around (Left / Right in a right-to-left page). Down / Up when vertical. |
| `Home / End` | The first / last control. |
| `In a text field` | The arrows, Home and End move in the text; Tab leaves. |
| `Down on a menu button` | Opens its menu (horizontal toolbar). |

## Accessibility

| Topic | How |
| --- | --- |
| `Role` | `role="toolbar"` with `aria-orientation`, named by `label`. |
| `Focus` | One Tab stop: the control used last has `tabindex="0"`, the others `-1` (roving tabindex). |
| `Separators` | `role="separator"`, turned across the toolbar. |
| `Toggles` | Toggle items are buttons with `aria-pressed`. |
| `“More” menu` | A menu button named from `uiLocale` (“More options”); the items keep their names (an icon-only button its `hint` or `aria-label`), toggles become check items, menu buttons submenus. |

## Localization

The only text a toolbar writes itself is the name of its “more” button, from `uiLocale.strings.moreOptions`.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of the kit; the “more” buttons take the new name at once. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
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

| Hook | What it is |
| --- | --- |
| `.mx-toolbar` | The toolbar. `data-orientation`, `data-size`, `data-overflow`, `data-disabled`. |
| `.mx-toolbar__separator` | A separator. |
| `.mx-toolbar__more` | The “more” button (a `Button` with a menu). |
| `[data-overflowed]` | On a control that is in the “more” menu now. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `toolbar.height` | The bar’s least height (the density-aware bar height). |
| `toolbar.bar, toolbar.separator` | Units: the bar (`vertical`: a column of controls) and the separators across it. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly ToolbarItem[]>` | `[]` | Items as data, drawn before the JSX children (see Items). |
| `label` | `Bind<string>` | `''` | Names the toolbar for screen readers (`aria-label`). The same property as `text`. |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'horizontal'` | Which way it runs; the arrow keys follow it. |
| `size` | `Bind<ControlSize>` | `'md'` | Given to the controls inside that have no `size` of their own. |
| `buttonVariant` | `Bind<ButtonVariant>` | `'ghost'` | Given to the buttons inside that have no `variant` of their own. |
| `overflow` | `Bind<'menu' \| 'wrap' \| 'scroll'>` | `'menu'` | `menu`: what does not fit goes into a “more” menu at the end; `wrap`: a second row; `scroll`: the bar scrolls. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | `enabled={false}` disables every control inside. |

### ToolbarItem

| Field | Type | Description |
| --- | --- | --- |
| `type` | `Bind<'button' \| 'toggle' \| 'separator' \| 'menu'>` | Default `'button'`. |
| `text, icon, hint` | `Bind<…>` | The caption (`&Bold` is an access key), an icon, a tooltip. A button with only an icon is named by its `hint`. |
| `pressed` | `Bind<boolean>` | A toggle’s state. As a function the item follows the app: its `click` changes what it reads. |
| `enabled, visible` | `Bind<boolean>` | Dimmed, or left out. |
| `menu` | `Bind<readonly MenuItem[]>` | The commands of a `menu` item: submenus, check and radio items, shortcuts. |
| `overflow` | `Bind<'auto' \| 'always' \| 'never'>` | Whether it may move into the “more” menu; wins over the toolbar. A JSX child says it with `data-overflow`. |
| `click` | `(e) => void` | Pressed, in the bar or in the “more” menu. `e`: `{ item, source, event }`. |
| `data` | `unknown` | Your own value. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `overflowed` | read-only, reactive | The controls in the “more” menu now. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `controlOf(item)` | `Control \| null` | The control made for an item of `items`. |
| `updateOverflow()` | `void` | Works out again what fits, e.g. after a control changed its width. |
| `refresh()` | `void` | Your items may be plain or reactive; the toolbar reads them as they are. After changing them in place, call `refresh()`. The list and each item's fields are read again; the controls made for items that stay are kept. |
| `focus()` | `boolean` | Focuses the control Tab reaches. |

### Events

| Event | When |
| --- | --- |
| `onItemClick(e)` | An item of `items` was pressed, after its own `click`. `e`: `{ item, source, event }`. |

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
