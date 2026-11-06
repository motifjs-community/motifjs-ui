import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Content from './examples/Content';
import Horizontal from './examples/Horizontal';
import Vertical from './examples/Vertical';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly TimelineItem[]>`', '`[]`', 'The events in order: `date` (a `Date`, an ISO string or milliseconds), `title`, `description`, `glyph` or `icon`, `tone`, `content`, `key` and `data`.'],
    ['orientation', '`Bind<TimelineOrientation>`', "`'vertical'`", '`vertical` shows a card per event down the page. `horizontal` shows a line of dates with the selected event\'s card below it.'],
    ['alternate', '`Bind<boolean>`', '`false`', 'In the vertical layout, places cards on alternating sides of the line.'],
    ['collapsible', '`Bind<boolean>`', '`false`', 'In the vertical layout, shows a card\'s description only when clicked.'],
    ['dateFormat', '`Bind<TimelineDateFormat>`', "`'medium'`", '`short`, `medium`, `long` or `Intl.DateTimeFormat` options. Dates use the kit language.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'In the horizontal layout, the event whose card is shown, identified by its `key` or index. `x-model` provides two-way binding.'],
    ['label', '`Bind<string>`', 'The kit string “Timeline”', 'The accessible name.']
];

const MEMBERS = [
    ['onItemClick', 'event', 'Occurs when an event\'s card or date is clicked (`index`, `item`).'],
    ['onSelectionChanged', 'event', 'In the horizontal layout, occurs when the selected event changes (`index`, `item`, `previous`, `byUser`).'],
    ['selectedIndex', 'read-only', 'In the horizontal layout, the index of the selected event, or -1 if there is none.'],
    ['count', 'read-only', 'The number of events.'],
    ['goTo(event)', '`boolean`', 'In the horizontal layout, shows an event by index or key. In the vertical layout, expands its card.'],
    ['unfold(event, on), isUnfolded(event)', '`void`, `boolean`', 'In the vertical layout with `collapsible`, expands or collapses a card, or reports whether it is expanded.'],
    ['formatDate(date)', '`string`', 'Formats a date the same way the timeline does.'],
    ['refresh()', '`void`', 'Re-reads the items after they have been changed in place.']
];

const KEYS = [
    ['Tab', 'In the vertical layout, each collapsible card is a Tab stop. In the horizontal layout, the selected date is one Tab stop, and the track buttons are also Tab stops.'],
    ['Arrow keys', 'In the horizontal layout, Left and Right show the previous or next event (reversed on right-to-left pages), and Home and End show the first and last.'],
    ['Enter, Space', 'On a collapsible card, expands or collapses it. On a date, shows it.']
];

const A11Y = [
    ['Vertical layout', 'A `list` named by `label`, with one item per event. A date is a `time` element with its ISO value, and a collapsible card is a button with `aria-expanded` that controls its description.'],
    ['Along the line', 'The dates are tabs (`tablist`, `tab`, `aria-selected`), and the card below them is the `tabpanel` they control. The buttons at the ends are named “Earlier” and “Later”.'],
    ['Dots and glyphs', 'Decorative. The tone is conveyed only by color, so put important information in the title.']
];

const HOOKS = [
    ['.mx-timeline', 'The timeline. `data-orientation`, `data-alternate`.'],
    ['.mx-timeline__list, .mx-timeline__item', 'The list (the line is its `::before`) and an event (`data-tone`, `data-side`, `data-expanded`, `data-selected`).'],
    ['.mx-timeline__dot, .mx-timeline__dot-glyph, .mx-timeline__dot-icon', 'The marker and its content.'],
    ['.mx-timeline__card, .mx-timeline__flag, .mx-timeline__detail', 'A card in the vertical layout, a date in the horizontal layout, and the card below the line.'],
    ['.mx-timeline__date, .mx-timeline__title, .mx-timeline__description, .mx-timeline__content', 'The text and custom content.'],
    ['.mx-timeline__track, .mx-timeline__nav, .mx-timeline__nav-glyph', 'The scrolling track, its buttons and their arrows.']
];

const TOKENS = [
    ['timeline.line, .dot, .dot-glyph, .card, .flag, .date, .title, .description, .detail, .nav, .nav-glyph', 'Units: the line, a marker and its glyph (by tone), a card (`pressable`, `hover`, `pressed`, `focus`, `expanded`), a date item (`hover`, `pressed`, `focus`, `selected`), the text, the detail card and the track buttons.'],
    ['timeline.gap, .dot-gap, .track-gap, .row-gap, .mark-size, .line-thickness', 'The gap between events, between a marker and its card, between dates, and between the track and the detail card, plus the marker size and line thickness.']
];

export default function TimelinePage() {
    return (
        <>
            <p class="lead">
              <Rich text="Displays events in chronological order. In the vertical layout, each event is a card next to a line with a marker. In the horizontal layout, events appear along a line of dates, and selecting a date shows that event's card below the line. Dates are formatted in the kit language. For scheduling by the hour, see [Scheduler](/scheduler)." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Timeline } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Vertical layout">
                <p>
                    <Rich text="`items` defines the events, each with a `date`, a `title`, a `description`, a `tone` for the marker and a `glyph` inside it. `alternate` places the cards on alternating sides of the line, and `collapsible` hides descriptions until a card is clicked. `onItemClick` reports the click." />
                </p>
                <Example stack files={code('Vertical.tsx')}>
                    <Vertical />
                </Example>
            </Section>

            <Section anchor="horizontal" title="Horizontal layout">
                <p>
                    <Rich text="`orientation='horizontal'` places the dates on a scrollable line with buttons at each end. The selected event (`value`, `x-model`) shows its card below the line. The arrow keys move between dates, and `dateFormat` accepts `Intl.DateTimeFormat` options." />
                </p>
                <Example stack files={code('Horizontal.tsx')}>
                    <Horizontal />
                </Example>
            </Section>

            <Section anchor="content" title="Any content">
                <p>
                    <Rich text="An item's `content` adds custom content to its card, in addition to the text. `icon` places a custom icon in the marker. A date includes the time when `dateFormat` specifies it." />
                </p>
                <Example stack files={code('Content.tsx')}>
                    <Content />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
