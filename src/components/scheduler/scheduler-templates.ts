import type { Bind, ComponentBase } from '@motifx/core';
import type { AgendaRowContext } from './agenda-row-context';
import type { AppointmentTemplateContext } from './appointment-template-context';
import type { CellTemplateContext } from './cell-template-context';
import type { DateTemplateContext } from './date-template-context';
import type { MoreListContext } from './more-list-context';
import type { ResourceHeaderContext } from './resource-header-context';
import type { TimeTemplateContext } from './time-template-context';
import type { TooltipTemplateContext } from './tooltip-template-context';

/** A template: a function that makes a MotifJS component from what it gets. */
type Template<C> = Bind<((context: C) => ComponentBase) | null>;

/**
 * The templates a scheduler draws with, component-wide or for one view (a view's own wins). Each
 * is created once for the element it draws and gets a context whose fields follow the element.
 */
export interface SchedulerTemplates<T> {
  /** An appointment's content, in place of its text and time. */
  appointmentTemplate?: Template<AppointmentTemplateContext<T>>;
  /** The tooltip's content, in place of its title, times, resources and buttons. */
  appointmentTooltipTemplate?: Template<TooltipTemplateContext<T>>;
  /** A cell's content (a time cell, a whole day's cell); the cell keeps its own look, keys and name. */
  dataCellTemplate?: Template<CellTemplateContext>;
  /** A day's head: the dates of the day views, the weekdays of the month, a timeline's days. */
  dateCellTemplate?: Template<DateTemplateContext>;
  /** An hour of the time ruler, and of a timeline's scale. */
  timeCellTemplate?: Template<TimeTemplateContext>;
  /** A group's head (a resource item). */
  resourceHeaderTemplate?: Template<ResourceHeaderContext>;
  /** An agenda row's content, in place of its time, color and text. */
  agendaRowTemplate?: Template<AgendaRowContext<T>>;
  /** The list "+N more" opens. */
  moreListTemplate?: Template<MoreListContext<T>>;
}
