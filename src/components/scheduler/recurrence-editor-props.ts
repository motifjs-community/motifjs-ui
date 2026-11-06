import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { RecurrenceFrequency } from '../../parts/recurrence/recurrence-frequency';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';

/** Props of `RecurrenceEditor`. Each one is also a settable property: setting it updates the editor. */
export interface RecurrenceEditorProps extends ControlProps {
  /** The accessible name of the editor. This is the same property as `text`. */
  label?: Bind<string>;
  /**
   * The rule as RFC 5545 text (`FREQ=WEEKLY;BYDAY=MO,WE`), empty when it does not repeat. `x-model`
   * provides two-way binding.
   */
  value?: Bind<string>;
  /**
   * The start of the series. A rule takes its weekday and day of the month from it, unless the rule
   * specifies them. The default is now.
   */
  start?: Bind<Date | null>;
  /** Indicates an all-day series, whose last date is written as a date. The default is `false`. */
  allDay?: Bind<boolean>;
  /**
   * The time zone the series recurs in, as an IANA name. Its last date ends in that zone. The default
   * is the browser's.
   */
  timeZone?: Bind<string | null>;
  /** The options in the repeat list, in order. The default is never, daily, weekly, monthly and yearly. */
  frequencies?: Bind<readonly ('never' | RecurrenceFrequency)[]>;
  /** The first weekday button, from 0 (Sunday) through 6 (Saturday). The default comes from the locale. */
  firstDayOfWeek?: Bind<number | null>;
  /** Shows the line below the editor that describes the recurrence. The default is `true`. */
  summary?: Bind<boolean>;
  readOnly?: Bind<boolean>;
  /** The default is the page's language. */
  locale?: Bind<string>;
  /** Strings that override `uiLocale`. */
  texts?: Bind<Partial<UiStrings>>;
  onValueChanged?: (e: ValueChangedEventArgs<string>) => void;
}
