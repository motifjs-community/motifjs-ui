# Chart: References and selection

> Charts · @motifx-community/ui 0.1.0-beta.7

Reference lines and bands give the values a target, a limit or a period, and the reader can choose values to act on.

## Reference lines and bands

`references` draws a line at a value or a position, or a band between two, with an optional label.

```tsx
/** Twelve months of made-up figures, shared by the examples. */
export const SALES = [
    { month: 'Jan', online: 4200, stores: 6100, returns: 310 },
    { month: 'Feb', online: 4600, stores: 5800, returns: 280 },
    { month: 'Mar', online: 5900, stores: 6400, returns: 420 },
    { month: 'Apr', online: 6300, stores: 6000, returns: 390 },
    { month: 'May', online: 7100, stores: 6600, returns: 450 },
    { month: 'Jun', online: 7600, stores: 7000, returns: 520 },
    { month: 'Jul', online: 8200, stores: 6800, returns: 610 },
    { month: 'Aug', online: 8000, stores: 6500, returns: 580 },
    { month: 'Sep', online: 8900, stores: 7200, returns: 640 },
    { month: 'Oct', online: 9400, stores: 7600, returns: 700 },
    { month: 'Nov', online: 11200, stores: 8800, returns: 930 },
    { month: 'Dec', online: 12800, stores: 10100, returns: 1100 }
];
```

## Choosing values

`pointSelection` lets a click or Enter choose one value or several. `onSelectionChanged` gives the values chosen, `selectedPoints` reads them and `clearSelection()` lets them go.

```tsx
/** Twelve months of made-up figures, shared by the examples. */
export const SALES = [
    { month: 'Jan', online: 4200, stores: 6100, returns: 310 },
    { month: 'Feb', online: 4600, stores: 5800, returns: 280 },
    { month: 'Mar', online: 5900, stores: 6400, returns: 420 },
    { month: 'Apr', online: 6300, stores: 6000, returns: 390 },
    { month: 'May', online: 7100, stores: 6600, returns: 450 },
    { month: 'Jun', online: 7600, stores: 7000, returns: 520 },
    { month: 'Jul', online: 8200, stores: 6800, returns: 610 },
    { month: 'Aug', online: 8000, stores: 6500, returns: 580 },
    { month: 'Sep', online: 8900, stores: 7200, returns: 640 },
    { month: 'Oct', online: 9400, stores: 7600, returns: 700 },
    { month: 'Nov', online: 11200, stores: 8800, returns: 930 },
    { month: 'Dec', online: 12800, stores: 10100, returns: 1100 }
];
```

## Feedback

Loading issues…

## Example files

`References.tsx`

```tsx
import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** A target across the values, and a period marked on the positions. */
export default function References() {
    return (
        <Chart
            class="ch-refs"
            title="Online sales against the target"
            data={SALES}
            xField="month"
            references={[
                { value: 8000, label: 'Target' },
                { axis: 'x', from: 'Jun', to: 'Aug', label: 'Summer sale' }
            ]}
            series={[{ type: 'bar', yField: 'online', name: 'Online' }]}
        />
    );
}
```

`sales.ts`

```tsx
/** Twelve months of made-up figures, shared by the examples. */
export const SALES = [
    { month: 'Jan', online: 4200, stores: 6100, returns: 310 },
    { month: 'Feb', online: 4600, stores: 5800, returns: 280 },
    { month: 'Mar', online: 5900, stores: 6400, returns: 420 },
    { month: 'Apr', online: 6300, stores: 6000, returns: 390 },
    { month: 'May', online: 7100, stores: 6600, returns: 450 },
    { month: 'Jun', online: 7600, stores: 7000, returns: 520 },
    { month: 'Jul', online: 8200, stores: 6800, returns: 610 },
    { month: 'Aug', online: 8000, stores: 6500, returns: 580 },
    { month: 'Sep', online: 8900, stores: 7200, returns: 640 },
    { month: 'Oct', online: 9400, stores: 7600, returns: 700 },
    { month: 'Nov', online: 11200, stores: 8800, returns: 930 },
    { month: 'Dec', online: 12800, stores: 10100, returns: 1100 }
];
```

`Selection.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** A click, or Enter with the keyboard, chooses months; a second click lets one go. */
export default function Selection() {
    const s = reactive({ chosen: 'Nothing chosen' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-select"
                label="Online sales"
                data={SALES.slice(0, 6)}
                xField="month"
                pointSelection="multiple"
                series={[{ type: 'bar', yField: 'online', name: 'Online' }]}
                onSelectionChanged={(e) => (s.chosen = e.points.length ? e.points.map((p) => p.xText).join(', ') : 'Nothing chosen')}
            />
            <output class="ch-select-told">{() => s.chosen}</output>
        </Stack>
    );
}
```
