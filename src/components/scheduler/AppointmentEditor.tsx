import { Component, read, untracked, type Bind, type ComponentBase, type Emitter } from '@motifx/core';
import { focusOn, isFocused } from '../../core/focus';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { later } from '../../core/later';
import { everyFrame } from '../../core/measure';
import type { UiStrings } from '../../core/ui-strings';
import { addDays } from '../../parts/dates/add-days';
import { dayStart } from '../../parts/dates/day-start';
import { TimeZone } from '../../parts/dates/time-zone';
import { Popup } from '../../parts/popup/Popup';
import { Button } from '../button/Button';
import { confirm } from '../form/confirm';
import { MxForm } from '../form/MxForm';
import { FormLayout } from '../formlayout/FormLayout';
import type { FormItem } from '../formlayout/form-item';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { AppointmentFormContext } from './appointment-form-context';
import { formItems } from './form-items';
import type { ResourceKind } from './model/ResourceKind';
import type { Resources } from './model/Resources';
import { Stack } from '../layout/Stack';
import { ActionSheet } from '../actionsheet/ActionSheet';
import { BottomSheet } from '../sheet/BottomSheet';
import type { SchedulerPresentationKind } from './scheduler-presentation-kind';
import type { AppointmentAddedEventArgs } from './appointment-added-event-args';
import type { AppointmentAddingEventArgs } from './appointment-adding-event-args';
import type { AppointmentDeletedEventArgs } from './appointment-deleted-event-args';
import type { AppointmentDeletingEventArgs } from './appointment-deleting-event-args';
import type { AppointmentFormData } from './appointment-form-data';
import type { AppointmentUpdatedEventArgs } from './appointment-updated-event-args';
import type { AppointmentUpdatingEventArgs } from './appointment-updating-event-args';
import type { DataErrorEventArgs } from './data-error-event-args';
import type { DragEventArgs } from './drag-event-args';
import type { FormOpeningEventArgs } from './form-opening-event-args';
import type { AppointmentStore } from './model/AppointmentStore';
import type { Draft } from './model/draft';
import type { ResolvedView } from './model/resolved-view';
import type { SchedulerModel } from './model/SchedulerModel';
import { SeriesEdit } from './model/SeriesEdit';
import type { SeriesRun } from './model/series-run';
import { SeriesWriter } from './model/SeriesWriter';
import type { SeriesScope } from './model/series-scope';
import type { AnyPiece } from './model/any-piece';
import { dayCells, viewKind } from './model/view-kind';
import { RecurrenceEditor } from './RecurrenceEditor';
import type { Scheduler } from './Scheduler';
import type { SchedulerCell } from './scheduler-cell';
import type { SchedulerEditing } from './scheduler-editing';
import type { SchedulerFields } from './scheduler-fields';
import type { SchedulerKeys } from './scheduler-keys';
import { isChord } from '../../core/keyboard';
import type { SeriesAction } from './series-action';
import type { SeriesAnsweredEventArgs } from './series-answered-event-args';
import type { SeriesAskingEventArgs } from './series-asking-event-args';
import type { SeriesEditMode } from './series-edit-mode';
import type { DragHost, DragMode } from './view/AppointmentDrag';
import { AppointmentTooltip } from './view/AppointmentTooltip';
import type { TooltipTemplateContext } from './tooltip-template-context';
import { askSeriesScope } from './view/ask-series-scope';
import type { SchedulerHost } from './view/scheduler-host';

const MINUTE = 60_000;
const SCOPES: readonly SeriesScope[] = ['occurrence', 'following', 'series'];
const SCOPE_TEXTS: Record<SeriesScope, keyof UiStrings> = {
  occurrence: 'schedulerSeriesOccurrence',
  following: 'schedulerSeriesFollowing',
  series: 'schedulerSeriesAll',
};

/** The events the editor fires, owned by the scheduler. */
export interface EditorEvents<T> {
  adding: Emitter<AppointmentAddingEventArgs<T>>;
  added: Emitter<AppointmentAddedEventArgs<T>>;
  updating: Emitter<AppointmentUpdatingEventArgs<T>>;
  updated: Emitter<AppointmentUpdatedEventArgs<T>>;
  deleting: Emitter<AppointmentDeletingEventArgs<T>>;
  deleted: Emitter<AppointmentDeletedEventArgs<T>>;
  formOpening: Emitter<FormOpeningEventArgs<T>>;
  dataError: Emitter<DataErrorEventArgs<T>>;
  moveStart: Emitter<DragEventArgs<T>>;
  moving: Emitter<DragEventArgs<T>>;
  moveEnd: Emitter<DragEventArgs<T>>;
  resizeStart: Emitter<DragEventArgs<T>>;
  resizing: Emitter<DragEventArgs<T>>;
  resizeEnd: Emitter<DragEventArgs<T>>;
  seriesAsking: Emitter<SeriesAskingEventArgs<T>>;
  seriesAnswered: Emitter<SeriesAnsweredEventArgs<T>>;
}

/** What the editor uses of its scheduler. */
export interface EditorHost<T> {
  scheduler: Scheduler<T>;
  model: SchedulerModel<T>;
  store: AppointmentStore<T>;
  view: SchedulerHost<T>;
  events: EditorEvents<T>;
  fields(): SchedulerFields;
  /** The appointments loaded. */
  items(): readonly T[];
  editing(): SchedulerEditing<T>;
  /** The resource kinds: the form's pickers. */
  resources: Resources;
  seriesEdit(): SeriesEditMode;
  locale(): string;
  firstDayOfWeek(): number;
  resolvedView(): ResolvedView;
  snapMinutes(): number;
  minDuration(): number;
  tooltip(): boolean;
  text(key: keyof UiStrings, values?: Record<string, unknown>): string;
  say(text: string): void;
  setDraft(draft: Draft<T> | null): void;
  /** The boxes an appointment shows in now, as the view built them. */
  boxesOf(item: T): ComponentBase[];
  scroller(): ComponentBase | null;
  rtl(): boolean;
  keys(): SchedulerKeys;
  /** Ids of the appointments being saved. */
  saving: string[];
  /** How the scheduler shows itself now: on a phone the form and the tooltip come up from the bottom. */
  presentation(): SchedulerPresentationKind;
  /** Draws the view again: what a box shows of its appointment changed here (its tooltip opened or closed). */
  redraw(): void;
}

/**
 * The scheduler's editing: who may change what, adding, changing and deleting through its store
 * with the events first (each may wait for a promise), the appointment form, the tooltip, moving
 * and resizing by the keys, and what a drag does when it is let go. A change to an occurrence of a
 * series asks what it reaches (this one, this and the following, the whole series) and writes what
 * that comes to (`SeriesEdit`); the form, a drag and the keys go the same way.
 */
export class AppointmentEditor<T> implements DragHost<T> {
  private tooltipPopup: Popup | null = null;
  /** The appointment the tooltip shows, the object itself. */
  private readonly tooltipState: { value: T | null } = { value: null };
  private tooltipView: AppointmentTooltip<T> | null = null;
  /** The id of the appointment whose tooltip is showing ('' for none). */
  private openedId = '';
  private formShown = false;
  private tooltipSheet: ActionSheet | BottomSheet | null = null;
  /** Moving or resizing by the keys: the draft so far, and the group it left and the one it is in (-1 without groups). */
  private keyDraft: { mode: DragMode; draft: Draft<T>; from: number; group: number } | null = null;
  private readonly series: SeriesEdit<T>;
  private readonly writer: SeriesWriter<T>;

  constructor(private readonly host: EditorHost<T>) {
    // An appointment read again (an edit, a refresh) shows again in its open tooltip.
    host.model.onChanged((change) => {
      if (change === 'layout' && this.openedId) this.drawTooltip();
    });
    this.writer = new SeriesWriter(host.store);
    this.series = new SeriesEdit<T>({
      fields: () => host.fields(),
      occurrences: host.model.occurrences,
      keyOf: (item) => host.store.keyOf(item),
    });
  }

  // Who may change what: the appointment's own field takes precedence over `editing`, and so do its resources' (a field of that name on a resource item).

  private own(item: T, field: keyof SchedulerFields): boolean | undefined {
    const name = this.host.fields()[field];
    const value = givenField(item, name);
    if (typeof value === 'boolean') return value;
    let allowed: boolean | undefined;
    for (const { items } of this.host.resources.itemsOf(item)) {
      for (const resource of items) {
        const says = givenField(resource.item, name);
        if (says === false) return false;
        if (says === true) allowed = true;
      }
    }
    return allowed;
  }

  private locked(item: T): boolean {
    return !!givenField(item, this.host.fields().disabled) || this.isSaving(item);
  }

  canDrag(item: T): boolean {
    return !this.locked(item) && (this.own(item, 'allowDrag') ?? this.host.editing().allowDragging);
  }
  canResize(item: T): boolean {
    return !this.locked(item) && (this.own(item, 'allowResize') ?? this.host.editing().allowResizing);
  }
  canEdit(item: T): boolean {
    return !this.locked(item) && (this.own(item, 'allowEdit') ?? this.host.editing().allowUpdating);
  }
  canDelete(item: T): boolean {
    return !this.locked(item) && (this.own(item, 'allowDelete') ?? this.host.editing().allowDeleting);
  }
  canAdd(): boolean {
    return this.host.editing().allowAdding;
  }
  isSaving(item: T): boolean {
    const series = this.host.model.occurrenceOf(item)?.series;
    return this.host.saving.includes(this.host.model.idOf(item)) || (!!series && this.host.saving.includes(this.host.model.idOf(series)));
  }

  // Writing.

  /** Adds an appointment, the object given itself (asking `onAppointmentAdding` first); resolves to it, or `null` when it was not added. */
  async add(values: Partial<T>, byUser = false): Promise<T | null> {
    const { events, scheduler } = this.host;
    const e: AppointmentAddingEventArgs<T> = { appointment: values, byUser, cancel: false, source: scheduler };
    events.adding.fire(e);
    if (!(await allowed(e))) return null;
    try {
      const saved = await this.host.store.add(e.appointment);
      events.added.fire({ appointment: saved, byUser, source: scheduler });
      this.host.say(this.host.text('schedulerAdded', { text: this.textOf(saved) }));
      return saved;
    } catch (error) {
      events.dataError.fire({ operation: 'add', appointment: e.appointment, error, saved: [], unsaved: [{ kind: 'add', appointment: e.appointment }], undone: true, source: scheduler });
      this.host.say(this.host.text('schedulerSaveFailed'));
      return null;
    }
  }

  /**
   * Changes an appointment (asking `onAppointmentUpdating` first); `false` when it did not change.
   * An occurrence of a series asks what the change reaches, unless `scope` says it.
   */
  async update(item: T, changes: Partial<T>, byUser = false, scope: SeriesScope | null = null): Promise<boolean> {
    const { events, scheduler } = this.host;
    const series = this.host.model.occurrenceOf(item)?.series ?? null;
    if (series) {
      // A new rule cannot be one occurrence's own.
      const scopes = givenValue(changes, this.host.fields().recurrenceRule) !== undefined ? SCOPES.slice(1) : SCOPES;
      scope = scope ?? (await this.scopeFor(item, 'update', byUser, scopes));
      if (!scope) return false;
    }
    const e: AppointmentUpdatingEventArgs<T> = { appointment: item, changes: { ...changes }, byUser, scope, series, cancel: false, source: scheduler };
    events.updating.fire(e);
    if (!(await allowed(e))) return false;
    const id = this.host.model.idOf(series ?? item);
    this.save(id);
    try {
      let added: T | null = null;
      if (series && scope) {
        const run = await this.writer.run(this.series.update(item, e.changes, scope));
        if (run.failed) return this.failed('update', item, run);
        added = run.added;
      } else await this.host.store.update(item, e.changes);
      events.updated.fire({ appointment: item, changes: e.changes, byUser, scope, series, added, source: scheduler });
      return true;
    } catch (error) {
      const write = { kind: 'update' as const, appointment: item, changes: e.changes };
      events.dataError.fire({ operation: 'update', appointment: item, error, saved: [], unsaved: [write], undone: true, source: scheduler });
      this.host.say(this.host.text('schedulerSaveFailed'));
      return false;
    } finally {
      this.unsave(id);
    }
  }

  /**
   * Deletes an appointment: by the user it asks first (`editing.confirmDelete`), then
   * `onAppointmentDeleting`. An occurrence of a series asks what the delete reaches instead,
   * unless `scope` says it.
   */
  async remove(item: T, byUser = false, scope: SeriesScope | null = null): Promise<boolean> {
    const { events, scheduler } = this.host;
    const series = this.host.model.occurrenceOf(item)?.series ?? null;
    if (series) {
      const asks = !scope && byUser && this.host.seriesEdit() === 'ask';
      scope = scope ?? (await this.scopeFor(item, 'delete', byUser, SCOPES));
      if (!scope) return false;
      // Asked which ones, the user has said yes already.
      if (!asks && byUser && this.host.editing().confirmDelete) {
        if (!(await confirm(this.host.text('schedulerDeleteConfirm', { text: this.textOf(item) }), { tone: 'danger' }))) return false;
      }
    } else if (byUser && this.host.editing().confirmDelete) {
      if (!(await confirm(this.host.text('schedulerDeleteConfirm', { text: this.textOf(item) }), { tone: 'danger' }))) return false;
    }
    const e: AppointmentDeletingEventArgs<T> = { appointment: item, byUser, scope, series, cancel: false, source: scheduler };
    events.deleting.fire(e);
    if (!(await allowed(e))) return false;
    const id = this.host.model.idOf(series ?? item);
    this.save(id);
    try {
      if (series && scope) {
        // The occurrences changed apart go with the series, loaded or not.
        const key = scope === 'occurrence' ? null : this.host.store.keyOf(series!);
        const exceptions = key === null || key === undefined ? [] : await this.host.store.rowsNaming(this.host.fields().recurrenceId, key);
        const run = await this.writer.run(this.series.remove(item, scope, exceptions));
        if (run.failed) return this.failed('delete', item, run);
      } else await this.host.store.remove(item);
      events.deleted.fire({ appointment: item, byUser, scope, series, source: scheduler });
      this.host.say(this.host.text('schedulerDeleted', { text: this.textOf(item) }));
      return true;
    } catch (error) {
      const write = { kind: 'delete' as const, appointment: item };
      events.dataError.fire({ operation: 'delete', appointment: item, error, saved: [], unsaved: [write], undone: true, source: scheduler });
      this.host.say(this.host.text('schedulerSaveFailed'));
      return false;
    } finally {
      this.unsave(id);
    }
  }

  /** An appointment waits for its store: its boxes show it locked until `unsave`. */
  private save(id: string): void {
    this.host.saving.push(id);
    this.host.redraw();
  }

  private unsave(id: string): void {
    const at = this.host.saving.indexOf(id);
    if (at < 0) return;
    this.host.saving.splice(at, 1);
    this.host.redraw();
  }

  /** A change to a series that did not go through: `onDataError` says what was saved and whether it was taken back. */
  private failed(operation: 'update' | 'delete', item: T, run: SeriesRun<T>): false {
    const { saved, unsaved, error } = run;
    const undone = run.undone || !saved.length;
    this.host.events.dataError.fire({ operation, appointment: item, error, saved, unsaved, undone, source: this.host.scheduler });
    this.host.say(this.host.text(undone ? 'schedulerSaveFailed' : 'schedulerSavedInPart'));
    return false;
  }

  // Series.

  /** What a change reaches: the setting's answer, the occurrence programmatically, else the user's answer. */
  private async scopeFor(item: T, action: SeriesAction, byUser: boolean, scopes: readonly SeriesScope[]): Promise<SeriesScope | null> {
    const mode = this.host.seriesEdit();
    if (mode !== 'ask') return scopes.includes(mode) ? mode : scopes[scopes.length - 1];
    if (!byUser) return scopes[0];
    return this.askSeries(item, action, scopes);
  }

  /**
   * Asks the user what a change (or a delete) of an occurrence reaches: `onSeriesAsking` first (it
   * may answer, narrow the choices or cancel), then the question, then `onSeriesAnswered`.
   */
  async askSeries(item: T, action: SeriesAction, scopes: readonly SeriesScope[] = SCOPES, byUser = true): Promise<SeriesScope | null> {
    const { events, scheduler } = this.host;
    const series = this.host.model.occurrenceOf(item)?.series;
    if (!series) return null;
    const e: SeriesAskingEventArgs<T> = { appointment: item, series, action, scopes: [...scopes], scope: null, cancel: false, source: scheduler };
    events.seriesAsking.fire(e);
    let scope: SeriesScope | null = null;
    if (!e.cancel && e.scopes.length) {
      if (e.scope) scope = e.scope;
      else {
        this.hideTooltip();
        const t = (key: keyof UiStrings, values?: Record<string, unknown>) => this.host.text(key, values);
        const del = action === 'delete';
        scope = await askSeriesScope({
          title: () => t(del ? 'schedulerSeriesDelete' : 'schedulerSeriesEdit'),
          text: () => t(del ? 'schedulerSeriesDeleteQuestion' : 'schedulerSeriesEditQuestion', { text: this.textOf(item) }),
          scopes: e.scopes,
          label: (s) => t(SCOPE_TEXTS[s]),
          ok: () => t(del ? 'schedulerDelete' : 'schedulerSave'),
          cancel: () => t('cancel'),
          danger: del,
          host: scheduler,
        });
      }
    }
    events.seriesAnswered.fire({ appointment: item, series, action, scope, byUser, source: scheduler });
    return scope;
  }

  /** An appointment's time as values of its fields: an all-day one's as dates of the browser's clock. */
  timeValues(start: Date, end: Date, allDay: boolean): Partial<T> {
    const fields = this.host.fields();
    const zone = this.host.model.zone;
    return {
      [fields.start]: allDay ? zone.toLocal(start) : start,
      [fields.end]: allDay ? zone.toLocal(end) : end,
      [fields.allDay]: allDay,
    } as Partial<T>;
  }

  // The form.

  /** The appointment form is open. */
  get formOpen(): boolean {
    return this.formShown;
  }

  /** Opens the form for an appointment, or for a new one at `cell`; resolves when it closes. */
  async openForm(item: T | null, cell: SchedulerCell | null = null): Promise<void> {
    const { scheduler } = this.host;
    if (item ? !this.canEdit(item) : !this.canAdd()) return;
    this.hideTooltip();
    const fields = this.host.fields();
    const editing = this.host.editing();
    const settings = editing.form ?? {};
    const model = this.host.model;
    // The appointment's fields as they are (a reactive one's too), read once for the form.
    const record = (name: string) => (item ? givenField(item, name) : undefined);
    const time = item ? model.timeOf(item) : null;
    const start = time?.start ?? cell?.start ?? new Date();
    const end = time?.end ?? cell?.end ?? new Date(start.getTime() + this.host.resolvedView().cellDuration * MINUTE);
    const allDay = time?.allDay ?? cell?.allDay ?? false;
    const series = item ? model.seriesOf(item) : null;
    const startZone = String(record(fields.startTimeZone) ?? '');
    const endZone = String(record(fields.endTimeZone) ?? '');
    const kinds = this.host.resources.kinds();
    // An all-day appointment ends at the start of the day after; the form shows its last day.
    const data = {
      text: String(record(fields.text) ?? ''),
      start: allDay ? model.zone.toLocal(start) : this.zoneOf(startZone).toLocal(start),
      end: allDay ? addDays(dayStart(model.zone.toLocal(end)), -1) : this.zoneOf(endZone || startZone).toLocal(end),
      allDay,
      description: String(record(fields.description) ?? ''),
      recurrenceRule: String((series ? givenField(series, fields.recurrenceRule) : record(fields.recurrenceRule)) ?? ''),
      startTimeZone: startZone,
      endTimeZone: endZone,
      // The end has a zone of its own only when it differs from the start's.
      separateEndZone: !!endZone && endZone !== startZone,
      // Each resource: the appointment's own, or (a new one) the cell's group's.
      ...Object.fromEntries(kinds.map((kind) => [kind.field, this.resourceValue(kind, item ? record(kind.field) : cell?.resources?.[kind.field])])),
    } as AppointmentFormData;
    const t = (key: keyof UiStrings, values?: Record<string, unknown>) => this.host.text(key, values);
    const context: AppointmentFormContext<T> = { appointment: item, data, isNew: !item, source: scheduler };
    const builtIns = this.formBuiltIns(item, data, editing, start);
    const order = ['text', 'start', 'end', 'timeZone', 'allDay', ...kinds.map((k) => k.field), 'recurrenceRule', 'description'];
    const items = formItems(settings.items ?? order, builtIns, context);
    const title = settings.title;
    const titleText = () =>
      title === undefined
        ? t(item ? 'schedulerEditAppointment' : 'schedulerNewAppointment')
        : typeof title === 'function' && title.length > 0
          ? (title as (f: AppointmentFormContext<T>) => string)(context)
          : (read(title as Bind<string>) ?? '');
    // On a phone the form is a sheet from the bottom, as tall as the screen allows.
    const phone = this.host.presentation() === 'phone';
    const form = phone
      ? new BottomSheet({ title: titleText, detents: ['full'], showClose: true, dragContent: false })
      : new MxForm({ title: titleText, width: settings.width ?? 'var(--_scheduler-editor-width)', modal: true });
    form.class.add(phone ? 'mx-scheduler__form-sheet' : 'mx-scheduler__form');
    const e: FormOpeningEventArgs<T> = { appointment: item, data, items, form, cancel: false, source: scheduler };
    this.host.events.formOpening.fire(e);
    if (e.cancel) {
      void form.dispose();
      return;
    }
    let layout: FormLayout<AppointmentFormData> | null = null;
    let result = 'cancel';
    const close = (how: string) => {
      result = how;
      if (form instanceof MxForm) form.close(how);
      else form.close('button');
    };
    const save = async () => {
      if (layout && (await layout.validate({ focus: true })).valid) close('ok');
    };
    form.content = (
      <FormLayout<AppointmentFormData>
        data={data}
        items={e.items}
        columns={settings.columns ?? (phone ? 1 : 2)}
        minColumnWidth={settings.minColumnWidth ?? ''}
        labelMode={settings.labelMode}
        ref={(c: FormLayout<AppointmentFormData>) => (layout = c)}
        onFieldChanged={() => this.formChanged(layout)}
      />
    );
    let ok: Button | null = null;
    let cancel: Button | null = null;
    form.footer = (
      <Stack class="mx-scheduler__form-buttons" orientation="horizontal" wrap justify="end">
        <Button
          class="mx-scheduler__form-delete"
          text={() => t('schedulerDelete')}
          tone="danger"
          visible={() => !!item && this.canDelete(item)}
          onclick={() => close('delete')}
        />
        <Button text={() => t('schedulerSave')} tone="accent" ref={(b: Button) => (ok = b)} onclick={() => void save()} />
        <Button text={() => t('cancel')} ref={(b: Button) => (cancel = b)} onclick={() => close('cancel')} />
      </Stack>
    );
    this.formShown = true;
    try {
      if (form instanceof MxForm) {
        form.acceptButton = ok;
        form.cancelButton = cancel;
        result = String((await form.showDialog(scheduler)) ?? 'cancel');
      } else {
        const closed = new Promise<void>((done) => form.onClosed(() => done()));
        if (form.show(scheduler)) await closed;
      }
    } finally {
      this.formShown = false;
    }
    if (result === 'delete' && item) {
      await this.remove(item, true);
      return;
    }
    if (result !== 'ok') return;
    const values = this.formValues(data, editing);
    if (item) await this.update(item, model.occurrenceOf(item) ? this.changed(item, series, values) : values, true);
    else await this.add(values, true);
  }

  /** The built-in items of the form, by the field each edits (the start and the end: as a date and time, and as a date). */
  private formBuiltIns(item: T | null, data: AppointmentFormData, editing: SchedulerEditing<T>, at: Date): Map<string, FormItem[]> {
    const model = this.host.model;
    const t = (key: keyof UiStrings, values?: Record<string, unknown>) => this.host.text(key, values);
    /** The moment a form time names, on its zone's clock. */
    const momentOf = (value: Date, zone: unknown) => (data.allDay ? value : this.zoneOf(zone).fromLocal(value));
    const endAfterStart = (value: unknown) =>
      !(value instanceof Date) ||
      !(data.start instanceof Date) ||
      momentOf(value, (data.separateEndZone && data.endTimeZone) || data.startTimeZone) >= momentOf(data.start, data.startTimeZone) ||
      t('schedulerEndBeforeStart');
    /** The time must be free for it (its blocked times, its work hours, its overlaps, by the scheduler's rules). */
    const free = () => {
      if (!(data.start instanceof Date) || !(data.end instanceof Date)) return true;
      const when = this.formTimes(data);
      const resources: Record<string, unknown> = {};
      for (const kind of this.host.resources.kinds()) resources[kind.field] = data[kind.field];
      const { free: ok, check } = model.check(item ?? ({} as T), when.start, when.end, when.allDay, resources);
      if (ok) return true;
      if (check.overlapping.length) return t('schedulerTaken', { text: this.textOf(check.overlapping[0]) });
      if (check.blocked.length) return t('schedulerBlockedTime', { text: check.blocked[0].text || t('schedulerUnavailable') });
      return check.offHours ? t('schedulerOffHours') : t('schedulerNotFree');
    };
    const endRules: ValidationRule[] = [
      { type: 'custom', check: endAfterStart },
      { type: 'custom', check: free, ignoreEmpty: false },
    ];
    const zones = editing.allowTimeZones ? this.zoneItems(at) : [];
    const own = () => t('schedulerOwnZone', { zone: model.zone.name || TimeZone.localName() });
    /** A zone's whole name, the picker's tooltip where the field is too narrow for it. */
    const zoneText = (name: unknown) => zones.find((z) => z.value === name)?.text ?? '';
    const exception = !!item && model.isException(item);
    const map = new Map<string, FormItem[]>([
      ['text', [{ field: 'text', label: () => t('schedulerSubject'), required: true, colSpan: 'all' }]],
      [
        'start',
        [
          { field: 'start', label: () => t('schedulerStart'), editor: 'datetime', required: true, visible: () => !data.allDay },
          { field: 'start', label: () => t('schedulerStart'), editor: 'date', required: true, visible: () => !!data.allDay },
        ],
      ],
      [
        'end',
        [
          { field: 'end', label: () => t('schedulerEnd'), editor: 'datetime', required: true, visible: () => !data.allDay, rules: endRules },
          { field: 'end', label: () => t('schedulerEnd'), editor: 'date', required: true, visible: () => !!data.allDay, rules: endRules },
        ],
      ],
      // A zone's name is long ("(GMT-3) America/Argentina/Rio Gallegos"): each picker has the whole row, the box its own.
      [
        'startTimeZone',
        [
          {
            field: 'startTimeZone',
            label: () => t(data.separateEndZone ? 'schedulerStartTimeZone' : 'schedulerTimeZone'),
            editor: 'dropdown',
            colSpan: 'all',
            editorProps: { items: zones, searchEnabled: true, placeholder: own, clearButton: true, hint: () => zoneText(data.startTimeZone) },
            visible: () => editing.allowTimeZones && !data.allDay,
          },
        ],
      ],
      [
        'separateEndZone',
        [
          {
            field: 'separateEndZone',
            label: () => t('schedulerSeparateEndZone'),
            editor: 'checkbox',
            colSpan: 'all',
            editorProps: {
              class: 'mx-scheduler__end-zone-switch',
              // Unchecked, the end follows the start's zone again.
              onValueChanged: (e: { value: unknown; byUser: boolean }) => {
                if (!e.byUser) return;
                data.separateEndZone = !!e.value;
                if (!e.value) data.endTimeZone = '';
              },
            },
            visible: () => editing.allowTimeZones && !data.allDay,
          },
        ],
      ],
      [
        'endTimeZone',
        [
          {
            field: 'endTimeZone',
            label: () => t('schedulerEndTimeZone'),
            editor: 'dropdown',
            colSpan: 'all',
            editorProps: {
              items: zones,
              searchEnabled: true,
              placeholder: () => (data.startTimeZone ? String(data.startTimeZone) : own()),
              clearButton: true,
              hint: () => zoneText(data.endTimeZone),
            },
            visible: () => editing.allowTimeZones && !data.allDay && !!data.separateEndZone,
          },
        ],
      ],
      ['allDay', [{ field: 'allDay', label: () => t('schedulerAllDay'), editor: 'switch', colSpan: 'all' }]],
      [
        'recurrenceRule',
        [
          {
            field: 'recurrenceRule',
            colSpan: 'all',
            visible: () => editing.allowRecurrence && !exception,
            template: () => (
              <RecurrenceEditor
                ref={(r: RecurrenceEditor) => (this.recurrence = { editor: r, data })}
                class="mx-scheduler__recurrence"
                x-model={() => data.recurrenceRule}
                start={() => (data.start instanceof Date ? data.start : null)}
                allDay={() => !!data.allDay}
                timeZone={() => (data.startTimeZone ? String(data.startTimeZone) : model.zone.name || null)}
                locale={() => this.host.locale()}
                firstDayOfWeek={() => this.host.firstDayOfWeek()}
              />
            ),
          },
        ],
      ],
      ['description', [{ field: 'description', label: () => t('schedulerDescription'), editor: 'textarea', colSpan: 'all' }]],
    ]);
    for (const kind of this.host.resources.kinds()) map.set(kind.field, [this.resourceItem(kind)]);
    return map;
  }

  /** A resource's picker: a drop-down, or a tag box for several; each item with its color. */
  private resourceItem(kind: ResourceKind<unknown>): FormItem {
    const swatch = (row: unknown) => {
      const color = kind.colorOf(row);
      return color ? <span class="mx-scheduler__resource-swatch" style={{ '--_color': color }} /> : undefined;
    };
    return {
      field: kind.field,
      label: () => kind.label,
      editor: kind.multiple ? 'tagbox' : 'dropdown',
      colSpan: 'all',
      editorProps: {
        // The loaded items: a data source of the scheduler's is not searched from here.
        items: () => kind.items,
        valueField: (row: unknown) => kind.valueOf(row),
        textField: (row: unknown) => kind.textOf(row),
        iconField: (row: unknown) => swatch(row),
        clearButton: true,
        class: 'mx-scheduler__resource-picker',
      },
    };
  }

  /** A resource field's value in the form: a list of the form's own for a kind of several, one value or `null` otherwise. */
  private resourceValue(kind: ResourceKind<unknown>, value: unknown): unknown {
    const list = Array.isArray(value) ? givenList(value) : value === undefined || value === null || value === '' ? [] : [value];
    return kind.multiple ? list : (list[0] ?? null);
  }

  /** A zone by its name, or the scheduler's. */
  private zoneOf(name: unknown): TimeZone {
    return typeof name === 'string' && name ? TimeZone.of(name) : this.host.model.zone;
  }

  /** The moments the form's times name (each on its zone's clock); an all-day one's days whole. */
  private formTimes(data: AppointmentFormData): { start: Date; end: Date; allDay: boolean } {
    const start = data.start instanceof Date ? data.start : new Date();
    const end = data.end instanceof Date ? data.end : start;
    if (data.allDay) {
      const zone = this.host.model.zone;
      return { start: zone.date(TimeZone.wallOfLocal(dayStart(start))), end: zone.date(TimeZone.wallOfLocal(addDays(dayStart(end), 1))), allDay: true };
    }
    const startZone = String(data.startTimeZone ?? '');
    const endZone = (data.separateEndZone ? String(data.endTimeZone ?? '') : '') || startZone;
    const from = this.zoneOf(startZone).fromLocal(start);
    const to = this.zoneOf(endZone).fromLocal(end);
    return { start: from, end: to < from ? from : to, allDay: false };
  }

  /** The time zones a form offers, by their offset at `at`. */
  private zoneItems(at: Date): { value: string; text: string }[] {
    const format = this.host.view.format;
    return TimeZone.names()
      .map((name) => ({ name, offset: TimeZone.of(name).offset(at) }))
      .sort((a, b) => a.offset - b.offset || a.name.localeCompare(b.name))
      .map(({ name }) => ({ value: name, text: format.zoneName(name, at) }));
  }

  /** The form's values that differ from the occurrence's (its rule: the series'), so the rest of the series keeps its own. */
  private changed(item: T, series: T | null, values: Partial<T>): Partial<T> {
    const fields = this.host.fields();
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(values)) {
      const old = givenField(key === fields.recurrenceRule && series ? series : item, key);
      if (!sameValue(old, value)) out[key] = value;
    }
    return out as Partial<T>;
  }

  /** The form's values as the appointment's fields: its own ones by their names, the extra ones as they are. */
  private formValues(data: AppointmentFormData, editing: SchedulerEditing<T>): Partial<T> {
    const fields = this.host.fields();
    const start = data.start instanceof Date ? data.start : new Date();
    const end = data.end instanceof Date ? data.end : start;
    const own = ['text', 'start', 'end', 'allDay', 'description', 'recurrenceRule', 'startTimeZone', 'endTimeZone', 'separateEndZone'];
    const out: Record<string, unknown> = {};
    // A list the form holds is the form's own (reactive): the appointment gets a plain one.
    for (const [key, value] of Object.entries(data)) if (!own.includes(key)) out[key] = Array.isArray(value) ? givenList(value) : value;
    out[fields.text] = data.text;
    out[fields.description] = data.description;
    if (editing.allowRecurrence) out[fields.recurrenceRule] = String(data.recurrenceRule ?? '');
    if (data.allDay) {
      Object.assign(out, { [fields.start]: dayStart(start), [fields.end]: addDays(dayStart(end), 1), [fields.allDay]: true });
    } else {
      const when = this.formTimes(data);
      Object.assign(out, this.timeValues(when.start, when.end, false));
      if (editing.allowTimeZones) Object.assign(out, { [fields.startTimeZone]: String(data.startTimeZone ?? ''), [fields.endTimeZone]: data.separateEndZone ? String(data.endTimeZone ?? '') : '' });
    }
    return out as Partial<T>;
  }

  /** The recurrence editor of the form open, and the form's data. */
  private recurrence: { editor: RecurrenceEditor; data: AppointmentFormData } | null = null;

  /** The user changed a field: the form shows what follows from it (which fields show, the recurrence's start, day and clock). */
  private formChanged(layout: FormLayout<AppointmentFormData> | null): void {
    layout?.refresh();
    const recurrence = this.recurrence;
    if (!recurrence || recurrence.editor.isDisposed) return;
    const { editor, data } = recurrence;
    editor.start = data.start instanceof Date ? data.start : null;
    editor.allDay = !!data.allDay;
    editor.timeZone = data.startTimeZone ? String(data.startTimeZone) : this.host.model.zone.name || null;
  }

  // The tooltip.

  showTooltip(item: T, anchor: ComponentBase<HTMLElement>): void {
    this.tooltipState.value = item;
    if (this.host.presentation() === 'phone') this.showSheet(item);
    else {
      const popup = this.tooltip();
      this.drawTooltip();
      popup.open(anchor);
    }
    this.setOpened(this.host.model.idOf(item));
  }

  /** The appointment whose tooltip shows ('' for none); its box shows it. */
  private setOpened(id: string): void {
    if (this.openedId === id) return;
    this.openedId = id;
    this.host.redraw();
  }

  /**
   * The tooltip shows its appointment again: another one, or its fields read again. The built-in one draws itself; a
   * template's content is recreated (it reads the appointment as it is then); a phone's sheet gets its texts again.
   */
  private drawTooltip(): void {
    const popup = this.tooltipPopup;
    if (popup) {
      const template = this.host.view.tooltipTemplate();
      if (template !== this.tooltipTemplate || template) this.fillTooltip(popup, template);
      else this.tooltipView?.refresh();
    }
    this.drawSheet?.();
  }

  /** The template the popup's content was created with (`null`: the built-in tooltip). */
  private tooltipTemplate: unknown = undefined;
  /** The content of the popup now. */
  private tooltipContent: ComponentBase | null = null;
  /** Writes the phone's sheet again, while one is open. */
  private drawSheet: (() => void) | null = null;

  private fillTooltip(popup: Popup, template: ReturnType<SchedulerHost<T>['tooltipTemplate']>): void {
    this.tooltipTemplate = template;
    if (this.tooltipContent) popup.controls.remove(this.tooltipContent);
    this.tooltipView = null;
    if (template) {
      const own = new Component<HTMLDivElement>('div');
      own.class.add('mx-scheduler__tooltip-own');
      own.controls.add(template(this.tooltipContext(() => popup.close())));
      this.tooltipContent = own;
    } else {
      const state = this.tooltipState;
      const view = new AppointmentTooltip<T>({
        host: this.host.view,
        item: () => state.value,
        canEdit: (item: T) => this.canEdit(item),
        canDelete: (item: T) => this.canDelete(item),
        edit: (item: T) => void this.openForm(item),
        remove: (item: T) => {
          popup.close();
          void this.remove(item, true);
        },
      });
      this.tooltipView = view;
      this.tooltipContent = view;
    }
    popup.controls.add(this.tooltipContent);
  }

  /** Its tooltip is showing. */
  isOpen(item: T): boolean {
    return this.openedId !== '' && this.openedId === this.host.model.idOf(item);
  }

  hideTooltip(): void {
    if (this.tooltipPopup?.isOpen) this.tooltipPopup.close();
    if (this.tooltipSheet?.isOpen) this.tooltipSheet.close();
  }

  /**
   * A phone's tooltip: an action sheet from the bottom with the appointment's text, its time and how
   * it repeats, and Edit and Delete; with a tooltip template, a sheet with the template in it.
   */
  private showSheet(item: T): void {
    this.tooltipSheet?.close();
    const view = this.host.view;
    const template = view.tooltipTemplate();
    const t = (key: keyof UiStrings) => this.host.text(key);
    let sheet: ActionSheet | BottomSheet;
    // Its fields are read as they are: written once, and again when the tooltip is drawn again.
    if (template) {
      const own = new BottomSheet({ title: this.textOf(item), detents: ['fit', 'full'] });
      sheet = own;
      own.content = this.tooltipOwn(template, () => own.close());
      this.drawSheet = () => {
        own.title = this.textOf(item);
        own.content = this.tooltipOwn(template, () => own.close());
      };
    } else {
      const values = () => {
        const repeats = view.recurrenceText(item);
        return {
          title: this.textOf(item),
          message: [this.timeText(item), repeats && this.host.text('schedulerRepeats', { rule: repeats })].filter(Boolean).join(' · '),
          items: [
            { text: t('schedulerEdit'), visible: this.canEdit(item), click: () => void this.openForm(item) },
            { text: t('schedulerDelete'), tone: 'danger' as const, visible: this.canDelete(item), click: () => void this.remove(item, true) },
          ],
        };
      };
      const actions = new ActionSheet(values());
      sheet = actions;
      this.drawSheet = () => {
        const now = values();
        actions.title = now.title;
        actions.message = now.message;
        actions.items = now.items;
      };
    }
    sheet.class.add('mx-scheduler__tooltip-sheet');
    sheet.onClosed(() => {
      if (this.tooltipSheet !== sheet) return;
      this.tooltipSheet = null;
      this.drawSheet = null;
      this.setOpened('');
    });
    this.tooltipSheet = sheet;
    sheet.show(this.host.scheduler);
  }

  /** An appointment's time as its tooltip says it. */
  private timeText(item: T): string {
    const view = this.host.view;
    const time = view.model.timeOf(item);
    if (!time) return '';
    return time.allDay ? view.format.range('day', time.start, time.end) : `${view.format.fullDate(time.start)}, ${view.format.timeRange(time.start, time.end)}`;
  }

  /** What a tooltip template is given, for the appointment shown; `close` closes what it is in. */
  private tooltipContext(close: () => void): TooltipTemplateContext<T> {
    const state = this.tooltipState;
    const editor = this;
    // Read as they are, again when the tooltip is drawn again.
    const shown = () => state.value;
    return {
      get appointment() {
        return shown();
      },
      get text() {
        const item = shown();
        return item ? editor.textOf(item) : '';
      },
      get time() {
        const item = shown();
        return item ? editor.timeText(item) : '';
      },
      get canEdit() {
        const item = shown();
        return !!item && editor.canEdit(item);
      },
      get canDelete() {
        const item = shown();
        return !!item && editor.canDelete(item);
      },
      edit: () => {
        const item = state.value;
        if (item) void this.openForm(item);
      },
      remove: () => {
        const item = state.value;
        close();
        if (item) void this.remove(item, true);
      },
      close,
    };
  }

  /** A tooltip template's content in the phone's sheet. */
  private tooltipOwn(template: NonNullable<ReturnType<SchedulerHost<T>['tooltipTemplate']>>, close: () => void): ComponentBase {
    const own = new Component<HTMLDivElement>('div');
    own.class.add('mx-scheduler__tooltip-own');
    own.controls.add(template(this.tooltipContext(close)));
    return own;
  }

  private tooltip(): Popup {
    if (this.tooltipPopup) return this.tooltipPopup;
    const popup = new Popup();
    popup.matchWidth = false;
    popup.class.add('mx-scheduler__tooltip-popup');
    popup.onClosed(() => this.setOpened(''));
    this.host.scheduler.controls.add(popup);
    this.tooltipPopup = popup;
    return popup;
  }

  // Moving and resizing by the keys.

  /** The keys of a focused appointment; `true` when one was used. */
  key(piece: AnyPiece<T>, e: KeyboardEvent): boolean {
    const item = this.host.model.itemOf(piece);
    const moving = this.keyDraft;
    if (moving && moving.draft.item !== item) this.cancelKeys();
    if (e.key === 'Escape' && this.keyDraft) {
      this.cancelKeys();
      return true;
    }
    if (e.key === 'Enter' && this.keyDraft) {
      const { mode, draft } = this.keyDraft;
      this.keyDraft = null;
      void this.drop(mode, draft, true).finally(() => {
        this.host.setDraft(null);
        this.keepFocus(item);
      });
      return true;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && !this.keyDraft) {
      if (this.canDelete(item)) void this.remove(item, true);
      return true;
    }
    const groupStep = this.groupStep(e) || this.rowStep(e);
    const step = groupStep ? { minutes: 0, days: 0 } : this.arrowStep(e);
    if (!step) return false;
    const mode: DragMode = e.shiftKey && !groupStep ? 'end' : 'move';
    if (mode === 'move' ? !this.canDrag(item) : !this.canResize(item)) return true;
    let current = this.keyDraft;
    if (!current) {
      const time = this.host.model.timeOf(item);
      if (!time) return true;
      const draft: Draft<T> = { item, ...time, copy: false, invalid: false };
      if (!this.starting(mode, draft, true)) return true;
      current = this.keyDraft = { mode, draft, from: piece.group, group: piece.group };
    }
    const { draft } = current;
    const model = this.host.model;
    if (groupStep) {
      const count = model.state.groups.length;
      const group = Math.max(0, Math.min(count - 1, current.group + groupStep));
      if (group === current.group) return true;
      current.group = group;
    }
    const minutes = step.minutes * MINUTE;
    const days = step.days;
    const zone = this.host.model.zone;
    let next: Draft<T>;
    if (mode === 'move') {
      next = { ...draft, start: zone.addDays(new Date(draft.start.getTime() + minutes), days), end: zone.addDays(new Date(draft.end.getTime() + minutes), days) };
    } else {
      const least = (draft.allDay ? 24 * 60 : this.minDuration()) * MINUTE;
      const end = zone.addDays(new Date(draft.end.getTime() + minutes), days);
      next = { ...draft, end: new Date(Math.max(end.getTime(), draft.start.getTime() + least)) };
    }
    next.resources = mode === 'move' ? model.movedValues(item, model.state.groups[current.from] ?? null, model.state.groups[current.group] ?? null) : null;
    next.invalid = !this.over(mode, next, true);
    current.mode = mode;
    current.draft = next;
    this.host.setDraft(next);
    this.keepFocus(item);
    const when = next.allDay
      ? this.host.view.format.range('day', next.start, next.end)
      : `${this.host.view.format.fullDate(next.start)} ${this.host.view.format.timeRange(next.start, next.end)}`;
    const group = model.state.groups[current.group];
    const where = group && current.group !== current.from ? `${when}, ${group.path.map((p) => p.text).join(', ')}` : when;
    this.host.say(this.host.text(next.invalid ? 'schedulerMovingNotFree' : 'schedulerMoving', { text: this.textOf(item), time: where }));
    return true;
  }

  /** The keys that move a focused appointment to the group before or after (mirrored right to left); 0 for others, or without groups. */
  private groupStep(e: KeyboardEvent): number {
    if (this.host.model.state.groups.length < 2) return 0;
    const keys = this.host.keys();
    const by = isChord(keys.nextGroup, e) ? 1 : isChord(keys.previousGroup, e) ? -1 : 0;
    return this.host.rtl() ? -by : by;
  }

  /** In a timeline, Up and Down move a focused appointment to the row above or below (its group); 0 for other keys, or without groups. */
  private rowStep(e: KeyboardEvent): number {
    if (this.host.model.kind !== 'timeline' || this.host.model.state.groups.length < 2) return 0;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return 0;
    return e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
  }

  /**
   * After a move by the keys, focus stays on the appointment: a box that moved to another row of a
   * timeline is another box (each row holds its own boxes), so focus goes to the new one. The view draws the move
   * now; a box it draws later is looked for in the next frames.
   */
  private keepFocus(item: T): void {
    this.host.model.flush();
    if (this.focusBoxOf(this.host.boxesOf(item))) return;
    let tries = 0;
    everyFrame(
      this.host.scheduler,
      () => this.host.boxesOf(item),
      (boxes) => {
        if (this.focusBoxOf(boxes) || ++tries >= 4) return false;
      },
    );
  }

  /** Focus is on one of an appointment's boxes, or goes to the first; false while it has none. */
  private focusBoxOf(boxes: ComponentBase[]): boolean {
    if (boxes.some(isFocused)) return true;
    if (!boxes.length) return false;
    focusOn(boxes[0]);
    return true;
  }

  /**
   * Focus left a box of `item`: a move by the keys goes back, unless focus went to another box of the same
   * appointment. That is decided once focus is there.
   */
  blurred(item: T): void {
    const moving = this.keyDraft;
    if (!moving) return;
    later(() => {
      if (this.keyDraft === moving && !this.host.boxesOf(item).some(isFocused)) this.cancelKeys();
    });
  }

  /** Takes a move by the keys back (Escape, or focus leaving it). */
  cancelKeys(): void {
    if (!this.keyDraft) return;
    this.keyDraft = null;
    this.host.setDraft(null);
  }

  /**
   * What an arrow does: Up / Down a snap step (a week in the month), Left / Right a day (mirrored
   * right to left). In a timeline the time runs along: Left / Right a snap step (a day in the
   * timeline month); Up / Down go to another row.
   */
  private arrowStep(e: KeyboardEvent): { minutes: number; days: number } | null {
    if (e.ctrlKey || e.altKey || e.metaKey) return null;
    const type = this.host.resolvedView().type;
    const month = type === 'month';
    const across = this.host.rtl() ? -1 : 1;
    if (viewKind(type) === 'timeline') {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return null;
      const by = (e.key === 'ArrowRight' ? 1 : -1) * across;
      return dayCells(type) ? { minutes: 0, days: by } : { minutes: by * this.snapMinutes(), days: 0 };
    }
    switch (e.key) {
      case 'ArrowUp':
        return month ? { minutes: 0, days: -7 } : { minutes: -this.snapMinutes(), days: 0 };
      case 'ArrowDown':
        return month ? { minutes: 0, days: 7 } : { minutes: this.snapMinutes(), days: 0 };
      case 'ArrowLeft':
        return { minutes: 0, days: -across };
      case 'ArrowRight':
        return { minutes: 0, days: across };
      default:
        return null;
    }
  }

  // The drag's host.

  root(): ComponentBase<HTMLElement> {
    return this.host.scheduler;
  }
  scroller(): ComponentBase | null {
    return this.host.scroller();
  }
  get model(): SchedulerModel<T> {
    return this.host.model;
  }
  view(): ResolvedView {
    return this.host.resolvedView();
  }
  snapMinutes(): number {
    return this.host.snapMinutes();
  }
  minDuration(): number {
    return this.host.minDuration();
  }
  canCopy(): boolean {
    return this.host.editing().allowCopying && this.canAdd();
  }
  setDraft(draft: Draft<T> | null): void {
    this.host.setDraft(draft);
  }

  starting(mode: DragMode, draft: Draft<T>, byKeys = false): boolean {
    this.hideTooltip();
    const e = this.dragArgs(draft, byKeys);
    (mode === 'move' ? this.host.events.moveStart : this.host.events.resizeStart).fire(e);
    return !e.cancel;
  }

  over(mode: DragMode, draft: Draft<T>, byKeys = false): boolean {
    const e = this.dragArgs(draft, byKeys);
    // Where the time is not free it may not go, unless the event says it may.
    e.cancel = !this.isFree(draft.copy ? (this.copyOf(draft.item) as T) : draft.item, draft.start, draft.end, draft.allDay, draft.resources ?? null);
    (mode === 'move' ? this.host.events.moving : this.host.events.resizing).fire(e);
    return !e.cancel;
  }

  /** Whether the user may put an appointment at a time (its blocked times, work hours and overlaps, by the scheduler's rules). */
  isFree(item: T, start: Date, end: Date, allDay: boolean, resources: Record<string, unknown> | null): boolean {
    return this.host.model.check(item, start, end, allDay, resources).free;
  }

  async drop(mode: DragMode, draft: Draft<T>, byKeys = false): Promise<void> {
    const e = this.dragArgs(draft, byKeys);
    (mode === 'move' ? this.host.events.moveEnd : this.host.events.resizeEnd).fire(e);
    if (e.cancel || draft.invalid) return;
    const time = { ...this.timeValues(e.start, e.end, e.allDay), ...((e.resources ?? {}) as Partial<T>) };
    if (e.copy) {
      await this.add({ ...this.copyOf(draft.item), ...time }, true);
      return;
    }
    if (await this.update(draft.item, time, true)) {
      const when = e.allDay
        ? this.host.view.format.range('day', e.start, e.end)
        : `${this.host.view.format.fullDate(e.start)} ${this.host.view.format.timeRange(e.start, e.end)}`;
      this.host.say(this.host.text('schedulerMoved', { text: this.textOf(draft.item), time: when }));
    }
  }

  private dragArgs(draft: Draft<T>, byKeys: boolean): DragEventArgs<T> {
    return {
      appointment: draft.item,
      start: draft.start,
      end: draft.end,
      allDay: draft.allDay,
      copy: draft.copy,
      byKeys,
      resources: draft.resources ?? null,
      cancel: false,
      source: this.host.scheduler,
    };
  }

  /** A copy of an appointment's fields without its key (a new one gets its own): a copy of an occurrence happens once. */
  private copyOf(item: T): Partial<T> {
    const fields = this.host.fields();
    const copy = untracked(() => ({ ...(item as object) })) as Record<string, unknown>;
    delete copy[fields.key];
    delete copy[fields.recurrenceRule];
    delete copy[fields.recurrenceException];
    delete copy[fields.recurrenceId];
    return copy as Partial<T>;
  }

  private textOf(item: T | Partial<T>): string {
    const value = givenField(item, this.host.fields().text);
    return value === undefined || value === null || value === '' ? this.host.text('schedulerNoTitle') : String(value);
  }

  dispose(): void {
    this.cancelKeys();
    this.hideTooltip();
  }
}

/** Whether an event let it happen: not canceled, and its promise (if it set one) resolved to `true`. */
async function allowed(e: { cancel: boolean; promise?: Promise<boolean> }): Promise<boolean> {
  if (e.cancel) return false;
  if (!e.promise) return true;
  try {
    return (await e.promise) === true;
  } catch {
    return false;
  }
}

/** Whether a field keeps its value: a date by its time, a switch by on and off, nothing and an empty text alike. */
function sameValue(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) || Array.isArray(b)) {
    const x = Array.isArray(a) ? a : a === undefined || a === null || a === '' ? [] : [a];
    const y = Array.isArray(b) ? b : b === undefined || b === null || b === '' ? [] : [b];
    return x.length === y.length && x.every((v, i) => sameValue(v, y[i]));
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') return !!a === !!b;
  const blank = (v: unknown) => v === undefined || v === null || v === '';
  return a === b || (blank(a) && blank(b));
}
