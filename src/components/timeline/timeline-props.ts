import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { TimelineItem } from './timeline-item';
import type { TimelineItemClickEventArgs } from './timeline-item-click-event-args';
import type { TimelineSelectionChangedEventArgs } from './timeline-selection-changed-event-args';

/** Down the page with a card per event, or along a line of dates with the selected event's card below it. */
export type TimelineOrientation = 'vertical' | 'horizontal';

/** How a date is formatted: a preset, or `Intl.DateTimeFormat` options. */
export type TimelineDateFormat = 'short' | 'medium' | 'long' | Intl.DateTimeFormatOptions;

/** Props of `Timeline`. Each prop is also a settable property, and a function is tracked. */
export interface TimelineProps extends ControlProps {
    /** The events in order. */
    items?: Bind<readonly TimelineItem[]>;
    /** The default is `'vertical'`. */
    orientation?: Bind<TimelineOrientation>;
    /** In the vertical layout, places cards on alternating sides of the line. The default is `false`. */
    alternate?: Bind<boolean>;
    /** In the vertical layout, shows a card's description only when clicked. The default is `false`. */
    collapsible?: Bind<boolean>;
    /** How the dates are formatted, in the kit language. The default is `'medium'`. */
    dateFormat?: Bind<TimelineDateFormat>;
    /**
     * In the horizontal layout, the event whose card is shown, identified by its `key` or index. `x-model` provides
     * two-way binding. The default is `0`.
     */
    value?: Bind<string | number | null>;
    /** The accessible name. The default is the kit's "Timeline" string. */
    label?: Bind<string>;
    /** Occurs when an event's card or date is clicked. */
    onItemClick?: (e: TimelineItemClickEventArgs) => void;
    /** In the horizontal layout, occurs when the selected event changes. */
    onSelectionChanged?: (e: TimelineSelectionChangedEventArgs) => void;
}
