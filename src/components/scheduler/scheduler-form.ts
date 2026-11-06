import type { Bind } from '@motifx/core';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { FormBind } from './form-bind';
import type { SchedulerFormItem } from './scheduler-form-item';

/**
 * Configures the appointment form without events. `items` lists its contents, in order: a built-in
 * item by its field (`text`, `start`, `end`, `allDay`, `startTimeZone`, `separateEndZone`,
 * `endTimeZone`, or `timeZone` for those three, `recurrenceRule`, `description`), a resource by
 * its field (`roomId`), or a custom item. An item whose `field` matches a built-in item or a
 * resource modifies it (its label, position, added rules, visibility or lock state). Groups, tabs,
 * buttons and templates are also supported.
 */
export interface SchedulerForm<T = unknown> {
  /** The default is the built-in items, with resources after the all-day switch. */
  items?: readonly (string | SchedulerFormItem<T>)[];
  /** The default is `2`. */
  columns?: number;
  /** Fits as many columns as possible, each at least this wide (a CSS length). `columns` sets the maximum. */
  minColumnWidth?: string;
  /** Label placement. The default is set by the design language. */
  labelMode?: Bind<FieldLabelMode>;
  /** The form's title. The default is "New appointment" or "Edit appointment". */
  title?: FormBind<string, T>;
  /** The form's width, as a CSS length. The default is set by the design language. */
  width?: string;
}
