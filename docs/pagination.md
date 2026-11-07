# Pagination

> Navigation · @motifx-community/ui 0.1.0-beta.6

Navigates through pages of items, with page size options, the current position, navigation buttons and a button for each nearby page. It switches to a compact layout when it does not fit, and it looks and works like the DataGrid pager.

## Import

```tsx
import { Pagination } from '@motifx-community/ui';
```

## Declarative and programmatic

`x-model` binds the page, and `onPageChanged` also reports the page size, so data can be loaded for both.

```tsx
import { reactive } from '@motifx/core';
import { Pagination, Stack } from '@motifx-community/ui';

/** The page bound with `x-model`, the available sizes, and one created with `new` programmatically. */
export default function Programmatic() {
  const s = reactive({ page: 3, size: 25 });
  const coded = new Pagination({ label: 'Pages made in code', total: 40, pageSize: 10, mode: 'full', showInfo: false });

  return (
    <Stack gap="lg">
      <Pagination
        label="Orders"
        total={1234}
        pageSizes={[10, 25, 50, 0]}
        pageSize={() => s.size}
        x-model={() => s.page}
        onPageChanged={(e) => e.byUser && (s.size = e.pageSize)}
      />
      <span>{() => `Page ${s.page}, ${s.size || 'all'} per page`}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## Appearance

```tsx
import { Pagination, Stack } from '@motifx-community/ui';

/** The compact layout, adaptive in a narrow box (drag its corner), more neighbors, and page buttons only. */
export default function Looks() {
  return (
    <Stack gap="lg">
      <Pagination label="Compact" mode="compact" total={500} pageSizes={[20, 50]} pageSize={20} page={4} />
      <div style="resize: horizontal; overflow: hidden; inline-size: 26rem; min-inline-size: 22rem; max-inline-size: 100%">
        <Pagination label="Adaptive" total={500} pageSizes={[20, 50]} pageSize={20} page={4} showInfo={false} />
      </div>
      <Pagination label="Two each side" mode="full" neighbors={2} total={1000} page={10} showInfo={false} />
      <Pagination label="Pages only" mode="full" pageCount={7} page={2} showInfo={false} showNavigation={false} />
    </Stack>
  );
}
```

## Accessibility

| Topic | Details |
| --- | --- |
| `Landmark` | A `nav` named “Pages” in the kit language, or by its label. |
| `Paging` | Each page button is named “Page 5”, and the current one has `aria-current="page"`. |
| `Steps` | Named First page, Previous page, Next page and Last page, and disabled at the ends. |
| `Compact` | The page number box is named “Page number”, and the information stays available to screen readers while hidden. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-pagination` | The pagination. `data-look`: `full` or `compact`. |
| `.mx-pagination__sizes, __size, __size-list` | The page sizes, as buttons or a drop-down. |
| `.mx-pagination__info, __step, __pages, __page, __gap` | The information text, a navigation button (`data-step`), the page buttons and the gaps. |
| `.mx-pagination__jump, __number` | The page number box in the compact layout. |

### Component tokens

| Token | Description |
| --- | --- |
| `pagination.button-size, .step-variant, .page-variant, .page-tone, .current-variant, .current-tone` | The appearance of its buttons, which matches the DataGrid pager in each design language. |
| `pagination.info` | Unit: the information text. |
| `pagination.gap, .step-overlap, .number-width, .size-width` | The spacing between parts, the double arrows and the boxes in the compact layout. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `Bind<number>` | `1` | The page number, starting from 1. |
| `value` | `Bind<number>` |  | Same as `page`. This is what `x-model` binds, with two-way binding. |
| `total` | `Bind<number>` | `0` | The total number of items. The page count is derived from this and `pageSize`. |
| `pageSize` | `Bind<number>` | `10` | The number of items per page. 0 shows all items on one page. |
| `pageCount` | `Bind<number \| null>` | `null` | The number of pages, when there is no `total`. |
| `pageSizes` | `Bind<readonly number[]>` | `[]` | The available page sizes (0 means all). Changing the size keeps the first item of the page in view. |
| `showInfo` | `Bind<boolean>` | `true` | “Page 3 of 12 (250 items)”. |
| `showNavigation` | `Bind<boolean>` | `true` | The first, previous, next and last buttons. |
| `neighbors` | `Bind<number>` | `1` | The number of page buttons on each side of the current page. |
| `mode` | `Bind<PaginationMode>` | `'adaptive'` | `full`, `compact` (a page number box and a drop-down of sizes), or `adaptive`, which is compact when the full layout does not fit. |
| `infoText` | `Bind<string>` | `''` | Custom information text. `{page}`, `{count}` and `{total}` are replaced with their values. |
| `label` | `Bind<string>` | The kit string “Pages” | The accessible name. If a page has several, each one needs its own. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onPageChanged` | event | Occurs when the page or the page size changes (`page`, `pageSize`), either by the user or programmatically (`byUser`). |
| `goTo(page)` | method | Goes to a page, starting from 1, as a click would. |
| `pageCount` | Read-only | The current number of pages. |
| `compact` | read-only | Indicates whether the compact layout is currently shown. |

## Feedback

Loading issues…
