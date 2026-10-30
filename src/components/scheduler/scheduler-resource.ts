import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';

/**
 * A kind of resource the appointments use (rooms, people…): the appointment field that holds it
 * and the items it can be. Its items colour the appointments, make the groups of the columns
 * (`groups`) and the picker of the form; an item's own work hours and days win over the
 * scheduler's, and so do its own `allowDrag`, `allowResize`, `allowEdit` and `allowDelete` (the
 * names of `fields`) for its appointments: `false` on any of an appointment's items keeps it so.
 */
export interface SchedulerResource<R = Record<string, unknown>> {
  /** The appointment field that holds the item's value (`roomId`), or a list of them with `allowMultiple` (`ownerIds`). */
  field: string;
  /** What it is called: the form's label, and how the cells and the tooltip name it. Default: the field. */
  label?: Bind<string>;
  /** The items, in memory or from a data source (loaded once, then followed); plain or reactive, read as they are: after changing them in place, call the scheduler's `refreshResources()`. */
  items?: Bind<readonly R[] | data.DataSource<R, unknown> | null>;
  /** The item field of its value. Default `'id'`. */
  valueExpr?: string;
  /** The item field of its name. Default `'text'`. */
  displayExpr?: string;
  /** The item field of its colour (a CSS colour). Default `'color'`. */
  colorExpr?: string;
  /** An appointment may have several of them: the field holds a list. Default `false`. */
  allowMultiple?: Bind<boolean>;
  /** Appointments take the colour of this kind (else of the first kind whose item has one). Default `false`. */
  useColorAsDefault?: Bind<boolean>;
  /** The item field naming its item of the kind above it in `groups` (a person's room): nested, a group shows only its own. */
  parentExpr?: string;
  /** The item fields of its own work hours and work days (0 Sunday … 6 Saturday). Default the scheduler's option names. */
  workStartHourExpr?: string;
  workEndHourExpr?: string;
  workDaysExpr?: string;
}
