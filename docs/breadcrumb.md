# Breadcrumb

> Navigation · @motifx-community/ui 0.1.0-beta.7

Shows the path to the current page. Each step is a link or button, and the current page comes last. Steps that do not fit move into a menu after the first step.

## Import

```tsx
import { Breadcrumb } from '@motifx-community/ui';
```

## Links and buttons

A step with `href` is a link, and `rel='router'` lets the MotifJS router handle it. A step without `href` is a button, and `onItemClick` reports the click.

```tsx
import { reactive } from '@motifx/core';
import { Breadcrumb, Stack } from '@motifx-community/ui';

/** Links handled by the router (`rel="router"`), a step that is a button, the current page last, and one created programmatically. */
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

## Overflow

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

| Topic | Details |
| --- | --- |
| `Landmark` | A `nav` named “Breadcrumb” in the kit language, containing an ordered list. If a page has several, give each one its own `label`. |
| `Current page` | `aria-current="page"`. The current page is not a link. |
| `Menu` | Steps that do not fit go into a menu behind a button named “More pages”. Choosing one activates the step itself. |
| `Disabled state` | `aria-disabled`. A disabled link loses its address. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-breadcrumb` | The breadcrumb. `data-size`. |
| `.mx-breadcrumb__list, .mx-breadcrumb__item` | The list and each step. |
| `.mx-breadcrumb__link, .mx-breadcrumb__current, .mx-breadcrumb__text` | A pressable step, the current page and the step text. |
| `.mx-breadcrumb__divider, .mx-breadcrumb__more` | The separator after a step, and the menu of overflow steps. |

### Component tokens

| Token | Description |
| --- | --- |
| `breadcrumb.link, .current, .divider` | Units: a step (`hover`, `pressed`, `focus`, `disabled`), the current page, and the separator (its shape is a chevron, or a slash in Material). |
| `breadcrumb.height.*, .padding.*, .font-size.*` | A step, per size. |
| `breadcrumb.gap, .divider-size` | The spacing around a separator, and its size. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (BreadcrumbItem \| string)[]>` | `[]` | The steps, with the current page last: `BreadcrumbItem` objects (`text`, `href`, `icon`, `enabled`, `data`) or plain text. A step with `href` is a link, and one without is a button. |
| `rel` | `Bind<string>` | `''` | The `rel` of the links. `router` lets the MotifJS router handle them, including from the menu. |
| `maxItems` | `Bind<number \| null>` | As many as fit | The maximum number of steps shown. The first and last stay, and those in between move to the menu. |
| `lastIsCurrent` | `Bind<boolean>` | `true` | Makes the last step the current page, which cannot be pressed and has `aria-current="page"`. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `label` | `Bind<string>` | The kit string “Breadcrumb” | The accessible name. |

### Events and properties

| Member | Type | Description |
| --- | --- | --- |
| `onItemClick` | event | Occurs when a step is pressed, on the breadcrumb or in its menu (`item`, `index`). Set `cancel = true` to prevent following a link. |
| `collapsed` | read-only | The indexes of the steps currently in the menu. |

## Feedback

Loading issues…
