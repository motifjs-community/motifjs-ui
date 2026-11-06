import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';

/**
 * A resource type the appointments use (rooms, people…): the appointment field that holds it and
 * its possible items. The items color the appointments, form the column groups (`groups`) and fill
 * the form's picker. An item's own work hours and days take precedence over the scheduler's, and so
 * do its own `allowDrag`, `allowResize`, `allowEdit` and `allowDelete` (the names of `fields`) for
 * its appointments. `false` on any item of an appointment applies to that appointment.
 */
export interface SchedulerResource<R = Record<string, unknown>> {
  /**
   * The appointment field that holds the item value (`roomId`), or a list of values with
   * `allowMultiple` (`ownerIds`).
   */
  field: string;
  /** The form label, and the name of the type in cells and tooltips. The default is the field. */
  label?: Bind<string>;
  /**
   * The items, in memory or from a data source (loaded once and then tracked). They can be plain or
   * reactive and are read as they are. After changing them in place, call the scheduler's `refreshResources()`.
   */
  items?: Bind<readonly R[] | data.DataSource<R, unknown> | null>;
  /** The item field for its value. The default is `'id'`. */
  valueExpr?: string;
  /** The item field for its name. The default is `'text'`. */
  displayExpr?: string;
  /** The item field for its color, a CSS color. The default is `'color'`. */
  colorExpr?: string;
  /** Allows several items per appointment, so the field holds a list. The default is `false`. */
  allowMultiple?: Bind<boolean>;
  /** Colors appointments by this type, otherwise by the first type with an item color. The default is `false`. */
  useColorAsDefault?: Bind<boolean>;
  /**
   * The item field that references its parent item in the type above it in `groups` (a person's
   * room). When nested, a group shows only its own children.
   */
  parentExpr?: string;
  /**
   * The item fields for its own work hours and days (0 Sunday … 6 Saturday). The defaults are the
   * scheduler's prop names.
   */
  workStartHourExpr?: string;
  workEndHourExpr?: string;
  workDaysExpr?: string;
}
