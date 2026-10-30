import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { RecurrenceFrequency } from '../../parts/recurrence/recurrence-frequency';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';

/** Props of `RecurrenceEditor`. Each one is also a settable property: setting it updates the editor. */
export interface RecurrenceEditorProps extends ControlProps {
  /** Names the editor for screen readers. The same property as `text`. */
  label?: Bind<string>;
  /** The rule, as RFC 5545 text (`FREQ=WEEKLY;BYDAY=MO,WE`); empty when it does not repeat. Two-way with `x-model`. */
  value?: Bind<string>;
  /** When what repeats starts: a rule's weekday and day of the month come from it unless it names them. Default now. */
  start?: Bind<Date | null>;
  /** An all-day series: its last date is written as a date. Default `false`. */
  allDay?: Bind<boolean>;
  /** The time zone the series repeats in (an IANA name); its last date ends on that clock. Default: the browser's. */
  timeZone?: Bind<string | null>;
  /** The choices of the repeat list, in order. Default: never, daily, weekly, monthly and yearly. */
  frequencies?: Bind<readonly ('never' | RecurrenceFrequency)[]>;
  /** 0 Sunday … 6 Saturday: the first of the weekday buttons. Default: the locale's. */
  firstDayOfWeek?: Bind<number | null>;
  /** The line under it that says how it repeats. Default `true`. */
  summary?: Bind<boolean>;
  readOnly?: Bind<boolean>;
  /** Default: the page's language. */
  locale?: Bind<string>;
  /** Changes the texts it writes; the rest come from `uiLocale`. */
  texts?: Bind<Partial<UiStrings>>;
  onValueChanged?: (e: ValueChangedEventArgs<string>) => void;
}
