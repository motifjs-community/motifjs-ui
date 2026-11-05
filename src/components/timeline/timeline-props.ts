import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { TimelineItem } from './timeline-item';
import type { TimelineItemClickEventArgs } from './timeline-item-click-event-args';
import type { TimelineSelectionChangedEventArgs } from './timeline-selection-changed-event-args';

/** Down the page with a card per event, or along a line of dates with the chosen event's card under it. */
export type TimelineOrientation = 'vertical' | 'horizontal';

/** How a date is written: a preset, or the options of `Intl.DateTimeFormat`. */
export type TimelineDateFormat = 'short' | 'medium' | 'long' | Intl.DateTimeFormatOptions;

/** Props of `Timeline`. Each one is also a settable property; a function is followed. */
export interface TimelineProps extends ControlProps {
    /** The events, in order. */
    items?: Bind<readonly TimelineItem[]>;
    /** Default `'vertical'`. */
    orientation?: Bind<TimelineOrientation>;
    /** Vertical: the cards take turns on either side of the line. Default `false`. */
    alternate?: Bind<boolean>;
    /** Vertical: a card shows its description only when pressed. Default `false`. */
    collapsible?: Bind<boolean>;
    /** How the dates are written, in the kit's language. Default `'medium'`. */
    dateFormat?: Bind<TimelineDateFormat>;
    /** Horizontal: the event whose card is shown, its `key` else its index. `x-model` binds it two-way. Default `0`. */
    value?: Bind<string | number | null>;
    /** What screen readers call it. Default: the kit's "Timeline". */
    label?: Bind<string>;
    /** A press on an event's card or flag. */
    onItemClick?: (e: TimelineItemClickEventArgs) => void;
    /** Horizontal: the shown event changed. */
    onSelectionChanged?: (e: TimelineSelectionChangedEventArgs) => void;
}
