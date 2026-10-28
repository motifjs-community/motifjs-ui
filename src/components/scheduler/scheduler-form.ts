import type { Bind } from '@motifx/core';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { FormBind } from './form-bind';
import type { SchedulerFormItem } from './scheduler-form-item';

/**
 * The appointment form, set up without events. `items` says what it holds, in order: a built-in
 * item by its field (`text`, `start`, `end`, `allDay`, `startTimeZone`, `separateEndZone`,
 * `endTimeZone`, or `timeZone` for those three, `recurrenceRule`, `description`), a resource by
 * its field (`roomId`), or an item of your own. An item whose `field` is a built-in's or a
 * resource's changes that one (its label, place, rules added, shown or locked); groups, tabs,
 * buttons and templates are the form's own.
 */
export interface SchedulerForm<T = unknown> {
  /** Default: the built-in items, the resources after the all-day switch. */
  items?: readonly (string | SchedulerFormItem<T>)[];
  /** Default `2`. */
  columns?: number;
  /** With it, as many columns as fit, each at least this wide (a CSS length); `columns` is the most. */
  minColumnWidth?: string;
  /** Where the labels go. Default: the design language's. */
  labelMode?: Bind<FieldLabelMode>;
  /** The form's title. Default "New appointment" / "Edit appointment". */
  title?: FormBind<string, T>;
  /** The form's width (a CSS length). Default: the design language's. */
  width?: string;
}
