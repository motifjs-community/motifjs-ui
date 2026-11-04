# Pagination

> Navigation · @motifx-community/ui 0.1.0-beta.0

Moving through pages of items: the sizes to choose from, where the page stands, the steps and a button per page around the current one. It turns compact when it does not fit. It looks and works as the grid’s pager.

## Import

```tsx
import { Pagination } from '@motifx-community/ui';
```

## From JSX and from code

`x-model` binds the page; `onPageChanged` tells the page size too, so the data can be loaded for both.

```tsx
import { reactive } from '@motifx/core';
import { Pagination, Stack } from '@motifx-community/ui';

/** The page bound with `x-model`, the sizes to choose from; one made with `new` from code. */
export default function FromCode() {
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

## Looks

```tsx
import { Pagination, Stack } from '@motifx-community/ui';

/** The compact look; adaptive in a narrow box (drag its corner); more neighbours; and only the pages. */
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

| Topic | How |
| --- | --- |
| `Landmark` | A `nav` named “Pages” (or its label) in the kit language. |
| `Pages` | Each page button is named “Page 5”; the current one is `aria-current="page"`. |
| `Steps` | Named First page, Previous page, Next page, Last page; disabled at the ends. |
| `Compact` | The page number box is named “Page number”; the info stays readable while hidden. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-pagination` | The pagination. `data-look`: `full` or `compact`. |
| `.mx-pagination__sizes, __size, __size-list` | The page sizes, as buttons or as a drop-down. |
| `.mx-pagination__info, __step, __pages, __page, __gap` | The info, a step (`data-step`), the page buttons and the gaps. |
| `.mx-pagination__jump, __number` | The compact look’s page number box. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `pagination.button-size, .step-variant, .page-variant, .page-tone, .current-variant, .current-tone` | The look of its buttons: the same as the grid’s pager in each language. |
| `pagination.info` | Unit: the info’s text. |
| `pagination.gap, .step-overlap, .number-width, .size-width` | The space between parts, the double arrows, the compact look’s boxes. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `Bind<number>` | `1` | The page, from 1. |
| `value` | `Bind<number>` |  | The same as `page`: what `x-model` binds, two-way. |
| `total` | `Bind<number>` | `0` | How many items there are in all; the pages are counted from it and `pageSize`. |
| `pageSize` | `Bind<number>` | `10` | Items per page; 0: all on one page. |
| `pageCount` | `Bind<number \| null>` | `null` | How many pages, when there is no `total` to count them from. |
| `pageSizes` | `Bind<readonly number[]>` | `[]` | The page sizes to choose from (0: all). Another size keeps the first item of the page in view. |
| `showInfo` | `Bind<boolean>` | `true` | “Page 3 of 12 (250 items)”. |
| `showNavigation` | `Bind<boolean>` | `true` | The first, previous, next and last steps. |
| `neighbors` | `Bind<number>` | `1` | Page buttons on each side of the current one. |
| `mode` | `Bind<PaginationMode>` | `'adaptive'` | `full`, `compact` (a page number box and a drop-down of sizes), `adaptive`: compact while the full one does not fit. |
| `infoText` | `Bind<string>` | `''` | The info of your own: `{page}`, `{count}` and `{total}` are filled in. |
| `label` | `Bind<string>` | the kit’s “Pages” | What screen readers call it; several on a page need one each. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onPageChanged` | event | The page or the page size changed (`page`, `pageSize`), by the user or by code (`byUser`). |
| `goTo(page)` | method | Goes to a page (from 1), as a press would. |
| `pageCount` | read | How many pages there are now. |
| `compact` | read-only | Whether the compact look shows now. |
