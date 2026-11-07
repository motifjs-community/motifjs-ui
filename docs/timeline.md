# Timeline

> Display · @motifx-community/ui 0.1.0-beta.6

Displays events in chronological order. In the vertical layout, each event is a card next to a line with a marker. In the horizontal layout, events appear along a line of dates, and selecting a date shows that event's card below the line. Dates are formatted in the kit language. For scheduling by the hour, see [Scheduler](scheduler.md).

## Import

```tsx
import { Timeline } from '@motifx-community/ui';
```

## Vertical layout

`items` defines the events, each with a `date`, a `title`, a `description`, a `tone` for the marker and a `glyph` inside it. `alternate` places the cards on alternating sides of the line, and `collapsible` hides descriptions until a card is clicked. `onItemClick` reports the click.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Timeline } from '@motifx-community/ui';

/** A project shown vertically, with a marker per event colored by its tone. Cards can alternate sides or collapse. */
export default function Vertical() {
    const s = reactive({ alternate: false, collapsible: false, told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Take turns" variant="outline" toggle x-model={() => s.alternate} />
                <Button text="Fold the cards" variant="outline" toggle x-model={() => s.collapsible} />
                <output class="tl-told">{() => s.told}</output>
            </Stack>
            <Timeline
                class="tl-project"
                label="The project"
                alternate={() => s.alternate}
                collapsible={() => s.collapsible}
                onItemClick={e => (s.told = `pressed: ${(e.item as { title: string }).title}`)}
                items={[
                    { date: '2026-01-12', title: 'Kick-off', description: 'The team met and the scope was agreed.', glyph: 'calendar' },
                    { date: '2026-02-20', title: 'Design signed off', description: 'Five languages, every state measured.', tone: 'info', glyph: 'pencil' },
                    { date: '2026-04-03', title: 'Beta', description: 'The first users came in; two slow screens were found.', tone: 'accent', glyph: 'person' },
                    { date: '2026-05-15', title: 'Slow screens fixed', description: 'The grid draws only what is in view.', tone: 'caution' },
                    { date: '2026-06-30', title: 'Shipped', description: 'Version one, on time.', tone: 'success', glyph: 'check' }
                ]}
            />
        </Stack>
    );
}
```

## Horizontal layout

`orientation='horizontal'` places the dates on a scrollable line with buttons at each end. The selected event (`value`, `x-model`) shows its card below the line. The arrow keys move between dates, and `dateFormat` accepts `Intl.DateTimeFormat` options.

```tsx
import { reactive } from '@motifx/core';
import { Stack, Timeline } from '@motifx-community/ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Releases along a line of dates. Clicking a date, or using the arrow keys, shows that release below the line, and the buttons scroll the track. */
export default function Horizontal() {
    const s = reactive({ shown: 'r3' as string | number | null });
    const releases = MONTHS.map((month, i) => ({
        key: `r${i + 1}`,
        date: new Date(2026, i, 15),
        title: `Release ${i + 1}`,
        description: `What ${month} brought: ${i % 3 === 0 ? 'new components' : i % 3 === 1 ? 'fixes and speed' : 'the docs and the languages'}.`,
        tone: i % 3 === 0 ? ('accent' as const) : ('default' as const),
        glyph: i % 3 === 0 ? 'star' : ''
    }));
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Timeline class="tl-releases" label="Releases" orientation="horizontal" dateFormat={{ month: 'short', year: 'numeric' }} items={releases} x-model={() => s.shown} />
            <output class="tl-releases-told">{() => `shown: ${s.shown}`}</output>
        </Stack>
    );
}
```

## Any content

An item's `content` adds custom content to its card, in addition to the text. `icon` places a custom icon in the marker. A date includes the time when `dateFormat` specifies it.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Timeline } from '@motifx-community/ui';

/** Any content in a card: a button that acts on the event, and a custom icon in the marker. */
export default function Content() {
    const s = reactive({ told: '' });
    const act = (what: string) => (
        <Stack orientation="horizontal" gap="sm">
            <Button text={what} variant="outline" size="sm" onclick={() => (s.told = `${what} pressed`)} />
        </Stack>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Timeline
                class="tl-orders"
                label="An order"
                items={[
                    { date: '2026-11-02T09:15:00', title: 'Order placed', description: 'Three items, paid by card.', tone: 'info', content: () => act('See the invoice') },
                    { date: '2026-11-03T14:40:00', title: 'Packed', tone: 'accent', glyph: 'columns' },
                    { date: '2026-11-04T08:00:00', title: 'On its way', description: 'Handed to the courier.', content: () => act('Track it') },
                    { date: '2026-11-05T16:25:00', title: 'Delivered', tone: 'success', glyph: 'check', content: () => act('Rate it') }
                ]}
                dateFormat={{ dateStyle: 'medium', timeStyle: 'short' }}
            />
            <output class="tl-orders-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | In the vertical layout, each collapsible card is a Tab stop. In the horizontal layout, the selected date is one Tab stop, and the track buttons are also Tab stops. |
| `Arrow keys` | In the horizontal layout, Left and Right show the previous or next event (reversed on right-to-left pages), and Home and End show the first and last. |
| `Enter, Space` | On a collapsible card, expands or collapses it. On a date, shows it. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Vertical layout` | A `list` named by `label`, with one item per event. A date is a `time` element with its ISO value, and a collapsible card is a button with `aria-expanded` that controls its description. |
| `Along the line` | The dates are tabs (`tablist`, `tab`, `aria-selected`), and the card below them is the `tabpanel` they control. The buttons at the ends are named “Earlier” and “Later”. |
| `Dots and glyphs` | Decorative. The tone is conveyed only by color, so put important information in the title. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-timeline` | The timeline. `data-orientation`, `data-alternate`. |
| `.mx-timeline__list, .mx-timeline__item` | The list (the line is its `::before`) and an event (`data-tone`, `data-side`, `data-expanded`, `data-selected`). |
| `.mx-timeline__dot, .mx-timeline__dot-glyph, .mx-timeline__dot-icon` | The marker and its content. |
| `.mx-timeline__card, .mx-timeline__flag, .mx-timeline__detail` | A card in the vertical layout, a date in the horizontal layout, and the card below the line. |
| `.mx-timeline__date, .mx-timeline__title, .mx-timeline__description, .mx-timeline__content` | The text and custom content. |
| `.mx-timeline__track, .mx-timeline__nav, .mx-timeline__nav-glyph` | The scrolling track, its buttons and their arrows. |

### Component tokens

| Token | Description |
| --- | --- |
| `timeline.line, .dot, .dot-glyph, .card, .flag, .date, .title, .description, .detail, .nav, .nav-glyph` | Units: the line, a marker and its glyph (by tone), a card (`pressable`, `hover`, `pressed`, `focus`, `expanded`), a date item (`hover`, `pressed`, `focus`, `selected`), the text, the detail card and the track buttons. |
| `timeline.gap, .dot-gap, .track-gap, .row-gap, .mark-size, .line-thickness` | The gap between events, between a marker and its card, between dates, and between the track and the detail card, plus the marker size and line thickness. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly TimelineItem[]>` | `[]` | The events in order: `date` (a `Date`, an ISO string or milliseconds), `title`, `description`, `glyph` or `icon`, `tone`, `content`, `key` and `data`. |
| `orientation` | `Bind<TimelineOrientation>` | `'vertical'` | `vertical` shows a card per event down the page. `horizontal` shows a line of dates with the selected event's card below it. |
| `alternate` | `Bind<boolean>` | `false` | In the vertical layout, places cards on alternating sides of the line. |
| `collapsible` | `Bind<boolean>` | `false` | In the vertical layout, shows a card's description only when clicked. |
| `dateFormat` | `Bind<TimelineDateFormat>` | `'medium'` | `short`, `medium`, `long` or `Intl.DateTimeFormat` options. Dates use the kit language. |
| `value` | `Bind<string \| number \| null>` | `0` | In the horizontal layout, the event whose card is shown, identified by its `key` or index. `x-model` provides two-way binding. |
| `label` | `Bind<string>` | The kit string “Timeline” | The accessible name. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onItemClick` | event | Occurs when an event's card or date is clicked (`index`, `item`). |
| `onSelectionChanged` | event | In the horizontal layout, occurs when the selected event changes (`index`, `item`, `previous`, `byUser`). |
| `selectedIndex` | read-only | In the horizontal layout, the index of the selected event, or -1 if there is none. |
| `count` | read-only | The number of events. |
| `goTo(event)` | `boolean` | In the horizontal layout, shows an event by index or key. In the vertical layout, expands its card. |
| `unfold(event, on), isUnfolded(event)` | `void`, `boolean` | In the vertical layout with `collapsible`, expands or collapses a card, or reports whether it is expanded. |
| `formatDate(date)` | `string` | Formats a date the same way the timeline does. |
| `refresh()` | `void` | Re-reads the items after they have been changed in place. |

## Feedback

Loading issues…
