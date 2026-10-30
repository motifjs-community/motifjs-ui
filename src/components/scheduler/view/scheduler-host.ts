import type { ComponentBase } from '@motifx/core';
import type { UiStrings } from '../../../core/ui-strings';
import type { AgendaRowContext } from '../agenda-row-context';
import type { AppointmentTemplateContext } from '../appointment-template-context';
import type { CellTemplateContext } from '../cell-template-context';
import type { DateTemplateContext } from '../date-template-context';
import type { AnyPiece } from '../model/any-piece';
import type { CellPlace } from '../model/cell-place';
import type { Resources } from '../model/Resources';
import type { ResourceHeaderContext } from '../resource-header-context';
import type { SchedulerModel } from '../model/SchedulerModel';
import type { SchedulerFields } from '../scheduler-fields';
import type { MoreListContext } from '../more-list-context';
import type { TimeTemplateContext } from '../time-template-context';
import type { TooltipTemplateContext } from '../tooltip-template-context';
import type { DragMode } from './AppointmentDrag';
import type { TimelineScroll } from './timeline-scroll';
import type { SchedulerFormat } from './SchedulerFormat';

/** What the views of a scheduler use of it: the model, the settings they draw with, and where to send what the user does. */
export interface SchedulerHost<T> {
  model: SchedulerModel<T>;
  format: SchedulerFormat;
  text(key: keyof UiStrings, values?: Record<string, unknown>): string;
  fields(): SchedulerFields;
  showCurrentTime(): boolean;
  dimPast(): boolean;
  /** The resource kinds: the names of an appointment's items. */
  resources: Resources;
  /** The templates of the view shown (its own, else the scheduler's). */
  headerTemplate(): ((context: ResourceHeaderContext) => ComponentBase) | null;
  template(): ((context: AppointmentTemplateContext<T>) => ComponentBase) | null;
  cellTemplate(): ((context: CellTemplateContext) => ComponentBase) | null;
  dateTemplate(): ((context: DateTemplateContext) => ComponentBase) | null;
  timeTemplate(): ((context: TimeTemplateContext) => ComponentBase) | null;
  agendaTemplate(): ((context: AgendaRowContext<T>) => ComponentBase) | null;
  tooltipTemplate(): ((context: TooltipTemplateContext<T>) => ComponentBase) | null;
  moreTemplate(): ((context: MoreListContext<T>) => ComponentBase) | null;
  allDayLines(): number;
  rtl(): boolean;
  /** Occurrences and ones changed apart carry their marks. */
  recurrenceMarks(): boolean;
  /** How an appointment's series repeats, in plain words; empty for one that happens once. */
  recurrenceText(item: T): string;
  /** An appointment's own time zone when it is not the scheduler's; empty otherwise. */
  zoneOf(item: T): string;
  /** The lines a week of the month has room for, measured by the month view. */
  setMonthRoom(lines: number): void;
  /** A timeline row's sizes in pixels, measured by the timeline view. */
  setLineMetrics(metrics: { lane: number; gap: number; min: number }): void;
  cellPointerDown(place: CellPlace, e: PointerEvent): void;
  cellClick(place: CellPlace, e: MouseEvent): void;
  cellDblClick(place: CellPlace, e: MouseEvent): void;
  appointmentClick(piece: AnyPiece<T>, e: MouseEvent | KeyboardEvent): void;
  appointmentDblClick(piece: AnyPiece<T>, e: MouseEvent | KeyboardEvent): void;
  appointmentKey(piece: AnyPiece<T>, e: KeyboardEvent): void;
  appointmentPointerDown(piece: AnyPiece<T>, mode: DragMode, e: PointerEvent): void;
  /** Focus left an appointment: a move by the keys goes back (not when it goes to another box of the same appointment). */
  appointmentBlur(item: T, e: FocusEvent): void;
  /** A finger lifted this appointment last: it shows its handles. */
  touchSelected(item: T): boolean;
  /** The appointment being moved was lifted by a finger. */
  liftedByTouch(): boolean;
  /** Keeps how a part drawn by hand draws itself, to draw it again when an option or a text it shows changes; returns what forgets it. */
  keepDrawn(draw: () => void): () => void;
  canDrag(item: T): boolean;
  canResize(item: T): boolean;
  isSaving(item: T): boolean;
  /** The appointment's tooltip is showing. */
  isOpen(item: T): boolean;
  /** "+N more" of a day, in a group (its index, -1 without groups). */
  openMore(day: Date, group: number, anchor: HTMLElement): void;
  gridKey(e: KeyboardEvent): void;
  /** A view is on the page. */
  viewShown(): void;
  /** The view's scroll box, for scrolling to a time. */
  setScroller(el: HTMLElement | null): void;
  /** The timeline view's scrolling, for scrolling to a time and bringing a cell into view. */
  setTimeline(timeline: TimelineScroll | null): void;
  /** An appointment is being moved or resized (by the pointer or the keys): it is shown where it would go. */
  dragging(): boolean;
  /** The agenda's keys: moving over its rows, opening one. */
  agendaKey(e: KeyboardEvent): void;
}
