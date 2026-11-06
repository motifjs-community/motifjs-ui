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
 * The templates of a scheduler, set on the scheduler or on one view. A view's own template takes
 * precedence. Each is created once for the element it renders, and receives a context whose fields
 * stay up to date.
 */
export interface SchedulerTemplates<T> {
  /** An appointment's content, in place of its text and time. */
  appointmentTemplate?: Template<AppointmentTemplateContext<T>>;
  /** The tooltip's content, in place of its title, times, resources and buttons. */
  appointmentTooltipTemplate?: Template<TooltipTemplateContext<T>>;
  /** A cell's content, for a time cell or a whole-day cell. The cell keeps its appearance, keys and accessible name. */
  dataCellTemplate?: Template<CellTemplateContext>;
  /** A day header: the dates of the day views, the weekdays of a month, or the days of a timeline. */
  dateCellTemplate?: Template<DateTemplateContext>;
  /** An hour of the time ruler or of a timeline scale. */
  timeCellTemplate?: Template<TimeTemplateContext>;
  /** A group header, which represents a resource item. */
  resourceHeaderTemplate?: Template<ResourceHeaderContext>;
  /** An agenda row's content, in place of its time, color and text. */
  agendaRowTemplate?: Template<AgendaRowContext<T>>;
  /** The list opened by "+N more". */
  moreListTemplate?: Template<MoreListContext<T>>;
}
