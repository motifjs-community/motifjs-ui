import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Content from './examples/Content';
import Horizontal from './examples/Horizontal';
import Vertical from './examples/Vertical';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly TimelineItem[]>`', '`[]`', 'The events in order: `date` (a `Date`, an ISO text or milliseconds), `title`, `description`, `glyph` or `icon`, `tone`, `content`, `key`, `data`.'],
    ['orientation', '`Bind<TimelineOrientation>`', "`'vertical'`", '`vertical`: down the page, a card per event; `horizontal`: along a line of dates, the shown event’s card under it.'],
    ['alternate', '`Bind<boolean>`', '`false`', 'Vertical: the cards take turns on either side of the line.'],
    ['collapsible', '`Bind<boolean>`', '`false`', 'Vertical: a card shows its description only when pressed.'],
    ['dateFormat', '`Bind<TimelineDateFormat>`', "`'medium'`", '`short`, `medium`, `long`, or the options of `Intl.DateTimeFormat`; written in the kit’s language.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'Horizontal: the event whose card is shown, its `key` else its index. `x-model` binds it two-way.'],
    ['label', '`Bind<string>`', 'the kit’s “Timeline”', 'What screen readers call it.']
];

const MEMBERS = [
    ['onItemClick', 'event', 'A press on an event’s card or flag (`index`, `item`).'],
    ['onSelectionChanged', 'event', 'Horizontal: the shown event changed (`index`, `item`, `previous`, `byUser`).'],
    ['selectedIndex', 'read-only', 'Horizontal: the index of the shown event; -1 when there is none.'],
    ['count', 'read-only', 'How many events there are.'],
    ['goTo(event)', '`boolean`', 'Horizontal: shows an event by index or key; vertical: unfolds its card.'],
    ['unfold(event, on), isUnfolded(event)', '`void`, `boolean`', 'Vertical, `collapsible`: unfolds or folds a card; whether it is unfolded.'],
    ['formatDate(date)', '`string`', 'A date as the timeline writes it.'],
    ['refresh()', '`void`', 'Reads the items again after they were changed in place.']
];

const KEYS = [
    ['Tab', 'Vertical: the cards that fold are stops, one each. Horizontal: the shown date is the one stop; the track’s buttons are stops too.'],
    ['Arrow keys', 'Horizontal: Left and Right (the other way round in a right-to-left page) show the event before or after; Home and End the first and the last.'],
    ['Enter, Space', 'On a folding card: unfolds or folds it. On a date: shows it.']
];

const A11Y = [
    ['Down the page', 'A `list` named by `label`, one item per event; a date is a `time` element with its ISO value; a folding card is a button with `aria-expanded` over its description.'],
    ['Along the line', 'The dates are tabs (`tablist`, `tab`, `aria-selected`) and the card under them the `tabpanel` they control; the buttons at the ends are named “Earlier” and “Later”.'],
    ['Dots and glyphs', 'Decorative; the tone shows in colour only, so put what matters in the title.']
];

const HOOKS = [
    ['.mx-timeline', 'The timeline. `data-orientation`, `data-alternate`.'],
    ['.mx-timeline__list, .mx-timeline__item', 'The list (the line is its `::before`) and an event (`data-tone`, `data-side`, `data-expanded`, `data-selected`).'],
    ['.mx-timeline__dot, .mx-timeline__dot-glyph, .mx-timeline__dot-icon', 'The dot and what is in it.'],
    ['.mx-timeline__card, .mx-timeline__flag, .mx-timeline__detail', 'A card down the page, a date along the line, the card under the line.'],
    ['.mx-timeline__date, .mx-timeline__title, .mx-timeline__description, .mx-timeline__content', 'The texts and the content of your own.'],
    ['.mx-timeline__track, .mx-timeline__nav, .mx-timeline__nav-glyph', 'The track that scrolls, its buttons and their arrows.']
];

const TOKENS = [
    ['timeline.line, .dot, .dot-glyph, .card, .flag, .date, .title, .description, .detail, .nav, .nav-glyph', 'Units: the line, a dot and its glyph (by tone), a card (`pressable`, `hover`, `pressed`, `focus`, `expanded`), a flag (`hover`, `pressed`, `focus`, `selected`), the texts, the detail, the track buttons.'],
    ['timeline.gap, .dot-gap, .track-gap, .row-gap, .mark-size, .line-thickness', 'Between events, between a dot and its card, between flags, between the track and the detail; the dot’s size; the line’s thickness.']
];

export default function TimelinePage() {
    return (
        <>
            <p class="lead">
              <Rich text="Events in time order: down the page, each a card beside a line with a dot; or along a line of dates, where a press on a date shows that event’s card under the line. The dates are written in the kit’s language. For hours on a calendar, see the [Scheduler](/scheduler)." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Timeline } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Down the page">
                <p>
                    <Rich text="`items` are the events: a `date`, a `title`, a `description`, a `tone` for the dot and a `glyph` in it. `alternate` puts the cards on either side of the line in turn; `collapsible` folds the descriptions until a card is pressed. `onItemClick` tells a press." />
                </p>
                <Example stack files={code('Vertical.tsx')}>
                    <Vertical />
                </Example>
            </Section>

            <Section anchor="horizontal" title="Along a line of dates">
                <p>
                    <Rich text="`orientation='horizontal'` puts the dates on a line that scrolls with the buttons at its ends; the shown event (`value`, `x-model`) has its card under the line. The arrow keys move along the dates. `dateFormat` takes the options of `Intl.DateTimeFormat`." />
                </p>
                <Example stack files={code('Horizontal.tsx')}>
                    <Horizontal />
                </Example>
            </Section>

            <Section anchor="content" title="Any content">
                <p>
                    <Rich text="An item’s `content` makes what goes in its card besides the texts; `icon` puts an icon of your own in the dot. A date with a time is written with it when `dateFormat` says so." />
                </p>
                <Example stack files={code('Content.tsx')}>
                    <Content />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'What it does']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'How']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
