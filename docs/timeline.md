# Timeline

> Display · @motifx-community/ui 0.1.0-beta.3

Events in time order: down the page, each a card beside a line with a dot; or along a line of dates, where a press on a date shows that event’s card under the line. The dates are written in the kit’s language. For hours on a calendar, see the [Scheduler](scheduler.md).

## Import

```tsx
import { Timeline } from '@motifx-community/ui';
```

## Down the page

`items` are the events: a `date`, a `title`, a `description`, a `tone` for the dot and a `glyph` in it. `alternate` puts the cards on either side of the line in turn; `collapsible` folds the descriptions until a card is pressed. `onItemClick` tells a press.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Timeline } from '@motifx-community/ui';

/** A project down the page: a dot per event on the line, coloured by its tone; the cards take turns or fold when told. */
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

## Along a line of dates

`orientation='horizontal'` puts the dates on a line that scrolls with the buttons at its ends; the shown event (`value`, `x-model`) has its card under the line. The arrow keys move along the dates. `dateFormat` takes the options of `Intl.DateTimeFormat`.

```tsx
import { reactive } from '@motifx/core';
import { Stack, Timeline } from '@motifx-community/ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Releases along a line of dates: a press on a date, or the arrow keys, shows that release under the line; the buttons scroll the track. */
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

An item’s `content` makes what goes in its card besides the texts; `icon` puts an icon of your own in the dot. A date with a time is written with it when `dateFormat` says so.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Timeline } from '@motifx-community/ui';

/** Any content in a card: a button to act on the event, an icon of your own in the dot. */
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

| Key | What it does |
| --- | --- |
| `Tab` | Vertical: the cards that fold are stops, one each. Horizontal: the shown date is the one stop; the track’s buttons are stops too. |
| `Arrow keys` | Horizontal: Left and Right (the other way round in a right-to-left page) show the event before or after; Home and End the first and the last. |
| `Enter, Space` | On a folding card: unfolds or folds it. On a date: shows it. |

## Accessibility

| Topic | How |
| --- | --- |
| `Down the page` | A `list` named by `label`, one item per event; a date is a `time` element with its ISO value; a folding card is a button with `aria-expanded` over its description. |
| `Along the line` | The dates are tabs (`tablist`, `tab`, `aria-selected`) and the card under them the `tabpanel` they control; the buttons at the ends are named “Earlier” and “Later”. |
| `Dots and glyphs` | Decorative; the tone shows in colour only, so put what matters in the title. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-timeline` | The timeline. `data-orientation`, `data-alternate`. |
| `.mx-timeline__list, .mx-timeline__item` | The list (the line is its `::before`) and an event (`data-tone`, `data-side`, `data-expanded`, `data-selected`). |
| `.mx-timeline__dot, .mx-timeline__dot-glyph, .mx-timeline__dot-icon` | The dot and what is in it. |
| `.mx-timeline__card, .mx-timeline__flag, .mx-timeline__detail` | A card down the page, a date along the line, the card under the line. |
| `.mx-timeline__date, .mx-timeline__title, .mx-timeline__description, .mx-timeline__content` | The texts and the content of your own. |
| `.mx-timeline__track, .mx-timeline__nav, .mx-timeline__nav-glyph` | The track that scrolls, its buttons and their arrows. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `timeline.line, .dot, .dot-glyph, .card, .flag, .date, .title, .description, .detail, .nav, .nav-glyph` | Units: the line, a dot and its glyph (by tone), a card (`pressable`, `hover`, `pressed`, `focus`, `expanded`), a flag (`hover`, `pressed`, `focus`, `selected`), the texts, the detail, the track buttons. |
| `timeline.gap, .dot-gap, .track-gap, .row-gap, .mark-size, .line-thickness` | Between events, between a dot and its card, between flags, between the track and the detail; the dot’s size; the line’s thickness. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly TimelineItem[]>` | `[]` | The events in order: `date` (a `Date`, an ISO text or milliseconds), `title`, `description`, `glyph` or `icon`, `tone`, `content`, `key`, `data`. |
| `orientation` | `Bind<TimelineOrientation>` | `'vertical'` | `vertical`: down the page, a card per event; `horizontal`: along a line of dates, the shown event’s card under it. |
| `alternate` | `Bind<boolean>` | `false` | Vertical: the cards take turns on either side of the line. |
| `collapsible` | `Bind<boolean>` | `false` | Vertical: a card shows its description only when pressed. |
| `dateFormat` | `Bind<TimelineDateFormat>` | `'medium'` | `short`, `medium`, `long`, or the options of `Intl.DateTimeFormat`; written in the kit’s language. |
| `value` | `Bind<string \| number \| null>` | `0` | Horizontal: the event whose card is shown, its `key` else its index. `x-model` binds it two-way. |
| `label` | `Bind<string>` | the kit’s “Timeline” | What screen readers call it. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onItemClick` | event | A press on an event’s card or flag (`index`, `item`). |
| `onSelectionChanged` | event | Horizontal: the shown event changed (`index`, `item`, `previous`, `byUser`). |
| `selectedIndex` | read-only | Horizontal: the index of the shown event; -1 when there is none. |
| `count` | read-only | How many events there are. |
| `goTo(event)` | `boolean` | Horizontal: shows an event by index or key; vertical: unfolds its card. |
| `unfold(event, on), isUnfolded(event)` | `void`, `boolean` | Vertical, `collapsible`: unfolds or folds a card; whether it is unfolded. |
| `formatDate(date)` | `string` | A date as the timeline writes it. |
| `refresh()` | `void` | Reads the items again after they were changed in place. |
