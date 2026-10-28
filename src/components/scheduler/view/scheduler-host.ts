import type { ComponentBase } from '@motifx/core';
import type { UiStrings } from '../../../core/ui-strings';
import type { AppointmentTemplateContext } from '../appointment-template-context';
import type { CellPlace } from '../model/cell-place';
import type { Resources } from '../model/Resources';
import type { ResourceHeaderContext } from '../resource-header-context';
import type { SchedulerModel } from '../model/SchedulerModel';
import type { StripPiece } from '../model/strip-piece';
import type { TimedPiece } from '../model/timed-piece';
import type { SchedulerFields } from '../scheduler-fields';
import type { DragMode } from './AppointmentDrag';
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
  /** Draws a group's head. */
  headerTemplate(): ((context: ResourceHeaderContext) => ComponentBase) | null;
  allDayLines(): number;
  rtl(): boolean;
  template(): ((context: AppointmentTemplateContext<T>) => ComponentBase) | null;
  /** Occurrences and ones changed apart carry their marks. */
  recurrenceMarks(): boolean;
  /** How an appointment's series repeats, in plain words; empty for one that happens once. */
  recurrenceText(item: T): string;
  /** An appointment's own time zone when it is not the scheduler's; empty otherwise. */
  zoneOf(item: T): string;
  /** The lines a week of the month has room for, measured by the month view. */
  setMonthRoom(lines: number): void;
  cellPointerDown(place: CellPlace, e: PointerEvent): void;
  cellClick(place: CellPlace, e: MouseEvent): void;
  cellDblClick(place: CellPlace, e: MouseEvent): void;
  appointmentClick(piece: TimedPiece<T> | StripPiece<T>, e: MouseEvent | KeyboardEvent): void;
  appointmentDblClick(piece: TimedPiece<T> | StripPiece<T>, e: MouseEvent | KeyboardEvent): void;
  appointmentKey(piece: TimedPiece<T> | StripPiece<T>, e: KeyboardEvent): void;
  appointmentPointerDown(piece: TimedPiece<T> | StripPiece<T>, mode: DragMode, e: PointerEvent): void;
  /** Focus left an appointment: a move by the keys goes back. */
  appointmentBlur(): void;
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
  /** The day columns' scroll box, for scrolling to an hour. */
  setScroller(el: HTMLElement | null): void;
}
