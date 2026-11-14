# Sparkline

> Charts · @motifx-community/ui 0.1.0-beta.11

A chart the size of a word, for a trend beside a number, in a sentence or in a row of a table. It draws a line, an area, bars, or wins and losses, and marks the values that matter.

## Import

```tsx
import { Sparkline } from '@motifx-community/ui';
```

## Trends beside numbers

`data` takes numbers, or rows with `yField`. The last value is marked by default, and the accessible name sums the values up.

```tsx
import { Sparkline } from '@motifx-community/ui';

const ROWS = [
    { name: 'Visits', now: '12,480', week: [9.1, 9.8, 10.2, 9.7, 11.3, 11.9, 12.5] },
    { name: 'Orders', now: '1,184', week: [1320, 1290, 1250, 1270, 1210, 1190, 1184] },
    { name: 'Returns', now: '38', week: [41, 39, 44, 37, 40, 36, 38] }
];

/** A trend beside each number, in a row of text. The last value is marked. */
export default function Trends() {
    return (
        <table class="sp-table">
            <tbody>
                {ROWS.map((row) => (
                    <tr>
                        <th scope="row">{row.name}</th>
                        <td>{row.now}</td>
                        <td>
                            <Sparkline data={row.week} label={`${row.name} this week`} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
```

## Kinds

`type` draws a line, an area, bars, or wins and losses, which show only whether each value went up or down.

```tsx
import { Sparkline, Stack } from '@motifx-community/ui';

const VALUES = [4, 6, 5, 8, 7, 9, 6, 10, 9, 12, 11, 13];
const RESULTS = [1, -1, 1, 1, -1, 1, -1, -1, 1, 1, 1, -1];

/** A line, an area, bars, and wins and losses. */
export default function Kinds() {
    return (
        <Stack gap="md">
            <span class="sp-line">Line <Sparkline data={VALUES} label="Line" /></span>
            <span class="sp-area">Area <Sparkline type="area" data={VALUES} label="Area" /></span>
            <span class="sp-bar">Bars <Sparkline type="bar" data={VALUES} label="Bars" /></span>
            <span class="sp-winloss">Wins and losses <Sparkline type="winloss" data={RESULTS} label="Results" /></span>
        </Stack>
    );
}
```

## Marked values and an average

`highlight` marks the first, last, lowest or highest value, and `reference` draws a line at a value or at the average. The value under the pointer shows above it.

```tsx
import { Sparkline, Stack } from '@motifx-community/ui';

const TEMPERATURE = [12, 14, 13, 17, 21, 19, 16, 15, 18, 22, 20, 17];

/** The lowest and the highest value marked, and a line at the average. */
export default function Marks() {
    return (
        <Stack gap="md">
            <span class="sp-marks">
                Temperature <Sparkline data={TEMPERATURE} highlight={['min', 'max', 'last']} reference="average" format={{ style: 'unit', unit: 'celsius' }} label="Temperature" height={32} />
            </span>
        </Stack>
    );
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Bind<number[] \| T[] \| null>` | `null` | The values: numbers, or rows with `yField`. They are read and never changed. |
| `yField` | `Bind<string \| (row) => unknown>` | `null` | The field of a row that holds its value. |
| `type` | `Bind<'line' \| 'area' \| 'bar' \| 'winloss'>` | `'line'` | How it draws. |
| `highlight` | `Bind<('first' \| 'last' \| 'min' \| 'max')[]>` | `['last']` for a line or an area | The values marked with a dot. |
| `reference` | `Bind<number \| 'average' \| null>` | `null` | A line across at a value, or at the average. |
| `min, max` | `Bind<number \| null>` | From the values | The ends of its scale. |
| `smooth` | `Bind<boolean>` | `false` | Curves the line, never past the values it joins. |
| `color` | `Bind<string \| null>` | The first chart color | A color of your own. |
| `label` | `Bind<string>` | A kit string | What the values are, for the accessible name. |
| `format` | `Bind<ChartFormat \| null>` | The language's numbers | How a value reads. |
| `tooltip` | `Bind<boolean>` | `true` | The value under the pointer shows above it. |
| `height` | `Bind<number \| null>` | From the design language | The height in pixels. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Name` | It has the role `img`, and its name gives the number of values, the first and the last, the lowest and the highest. |
| `Pointer` | The value under the pointer is a reading aid only: the name already holds the values that matter. |
| `Wins and losses` | Up and down differ in direction as well as in color. |

## Feedback

Loading issues…
