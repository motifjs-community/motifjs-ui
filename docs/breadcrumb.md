# Breadcrumb

> Navigation · @motifx-community/ui 0.1.0-beta.3

The way to the current page: each step a link or a button, the current page last. Steps that do not fit go into a menu after the first.

## Import

```tsx
import { Breadcrumb } from '@motifx-community/ui';
```

## Links and buttons

A step with `href` is a link; `rel='router'` lets the MotifJS router take it. A step without one is a button: `onItemClick` tells it.

```tsx
import { reactive } from '@motifx/core';
import { Breadcrumb, Stack } from '@motifx-community/ui';

/** Links the router takes (`rel="router"`), a step that is a button, the current page last; one made programmatically. */
export default function Programmatic() {
  const s = reactive({ last: '' });
  const coded = new Breadcrumb({ label: 'Settings path', items: ['Settings', 'Account', 'Security'] });

  // Several on one page: each gets a name of its own.
  return (
    <Stack gap="lg">
      <Breadcrumb
        label="Docs path"
        rel="router"
        items={[{ text: 'Docs', href: '/' }, { text: 'Components', href: '/button' }, 'Display', { text: 'Breadcrumb' }]}
        onItemClick={(e) => (s.last = String((e.item as { text?: string }).text ?? e.item))}
      />
      <span>{() => (s.last ? `Pressed: ${s.last}` : 'Press a step')}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## When they do not fit

```tsx
import { Breadcrumb, Stack } from '@motifx-community/ui';

const PATH = ['Workspace', 'Projects', 'Kit', 'Components', 'Navigation', 'Breadcrumb', 'Examples', 'Overflow'];

/** Steps that do not fit go into the menu after the first; drag the box's corner to see it. `maxItems` caps the count. */
export default function Overflow() {
  return (
    <Stack gap="lg">
      <div style="resize: horizontal; overflow: hidden; inline-size: 22rem; min-inline-size: 10rem; max-inline-size: 100%; padding-block: 0.25rem">
        <Breadcrumb label="Path that fits" items={PATH} />
      </div>
      <Breadcrumb label="Path of three" items={PATH} maxItems={3} />
    </Stack>
  );
}
```

## Sizes

```tsx
import { Breadcrumb, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** Each size, with a disabled step. */
export default function Sizes() {
  return (
    <Stack gap="lg">
      {SIZES.map((size) => (
        <Breadcrumb key={size} label={`Path ${size}`} size={size} items={['Home', { text: 'Archived', enabled: false }, 'Reports', `Size ${size}`]} />
      ))}
    </Stack>
  );
}
```

## Accessibility

| Topic | How |
| --- | --- |
| `Landmark` | A `nav` named “Breadcrumb” in the kit language, holding an ordered list. Several on one page: give each its own `label`. |
| `Current page` | `aria-current="page"`; it is not a link. |
| `Menu` | The steps that do not fit are a menu behind a button named “More pages”; choosing one presses the step itself. |
| `Disabled` | `aria-disabled`; a disabled link loses its address. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-breadcrumb` | The breadcrumb. `data-size`. |
| `.mx-breadcrumb__list, .mx-breadcrumb__item` | The list and each step. |
| `.mx-breadcrumb__link, .mx-breadcrumb__current, .mx-breadcrumb__text` | A pressable step, the current page, a step’s text. |
| `.mx-breadcrumb__divider, .mx-breadcrumb__more` | The divider after a step, and the menu of the steps that do not fit. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `breadcrumb.link, .current, .divider` | Units: a step (`hover`, `pressed`, `focus`, `disabled`), the current page, the divider (its shape: a chevron, a slash in Material). |
| `breadcrumb.height.*, .padding.*, .font-size.*` | A step per size. |
| `breadcrumb.gap, .divider-size` | The space around a divider, and its size. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (BreadcrumbItem \| string)[]>` | `[]` | The steps, the current page last: `BreadcrumbItem`s (`text`, `href`, `icon`, `enabled`, `data`) or plain texts. A step with `href` is a link, one without a button. |
| `rel` | `Bind<string>` | `''` | The links’ `rel`; `router` lets the MotifJS router take them (from the menu too). |
| `maxItems` | `Bind<number \| null>` | as many as fit | The most steps shown; the first and the last stay, those between go into the menu. |
| `lastIsCurrent` | `Bind<boolean>` | `true` | The last step is the current page: not pressable, `aria-current="page"`. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `label` | `Bind<string>` | the kit’s “Breadcrumb” | What screen readers call it. |

### Events and properties

| Member | Kind | Description |
| --- | --- | --- |
| `onItemClick` | event | A step was pressed, on the breadcrumb or in its menu (`item`, `index`); `cancel = true` keeps a link from being followed. |
| `collapsed` | read-only | The indexes of the steps now in the menu. |
