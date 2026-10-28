import { reactive, type Emitter } from '@motifx/core';
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
import { Stack } from '../layout/Stack';
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
import type { StripPiece } from './model/strip-piece';
import type { TimedPiece } from './model/timed-piece';
import { RecurrenceEditor } from './RecurrenceEditor';
import type { Scheduler } from './Scheduler';
import type { SchedulerCell } from './scheduler-cell';
import type { SchedulerEditing } from './scheduler-editing';
import type { SchedulerFields } from './scheduler-fields';
import type { SeriesAction } from './series-action';
import type { SeriesAnsweredEventArgs } from './series-answered-event-args';
import type { SeriesAskingEventArgs } from './series-asking-event-args';
import type { SeriesEditMode } from './series-edit-mode';
import type { DragHost, DragMode } from './view/AppointmentDrag';
import { AppointmentTooltip, type TooltipState } from './view/AppointmentTooltip';
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
  editing(): SchedulerEditing;
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
  root(): HTMLElement;
  scroller(): HTMLElement | null;
  rtl(): boolean;
  /** Ids of the appointments being saved. */
  saving: string[];
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
  private readonly tooltipState = reactive({ item: null }) as TooltipState<T>;
  /** The id of the appointment whose tooltip is showing ('' for none). */
  private readonly opened = reactive({ id: '' });
  /** Moving or resizing by the keys: the draft so far. */
  private keyDraft: { mode: DragMode; draft: Draft<T> } | null = null;
  private readonly series: SeriesEdit<T>;
  private readonly writer: SeriesWriter<T>;

  constructor(private readonly host: EditorHost<T>) {
    this.writer = new SeriesWriter(host.store);
    this.series = new SeriesEdit<T>({
      fields: () => host.fields(),
      occurrences: host.model.occurrences,
      keyOf: (item) => host.store.keyOf(item),
    });
  }

  // Who may change what: the appointment's own field wins over `editing`.

  private own(item: T, field: keyof SchedulerFields): boolean | undefined {
    const value = (item as Record<string, unknown>)?.[this.host.fields()[field]];
    return typeof value === 'boolean' ? value : undefined;
  }

  private locked(item: T): boolean {
    return !!(item as Record<string, unknown>)?.[this.host.fields().disabled] || this.isSaving(item);
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

  /** Adds an appointment (asking `onAppointmentAdding` first); resolves to it, or `null` when it was not added. */
  async add(values: Partial<T>, byUser = false): Promise<T | null> {
    const { events, scheduler } = this.host;
    const e: AppointmentAddingEventArgs<T> = { appointment: { ...values }, byUser, cancel: false, source: scheduler };
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
      const scopes = (changes as Record<string, unknown>)[this.host.fields().recurrenceRule] !== undefined ? SCOPES.slice(1) : SCOPES;
      scope = scope ?? (await this.scopeFor(item, 'update', byUser, scopes));
      if (!scope) return false;
    }
    const e: AppointmentUpdatingEventArgs<T> = { appointment: item, changes: { ...changes }, byUser, scope, series, cancel: false, source: scheduler };
    events.updating.fire(e);
    if (!(await allowed(e))) return false;
    const id = this.host.model.idOf(series ?? item);
    this.host.saving.push(id);
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
    this.host.saving.push(id);
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

  private unsave(id: string): void {
    const at = this.host.saving.indexOf(id);
    if (at >= 0) this.host.saving.splice(at, 1);
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

  /** What a change reaches: the setting's answer, the occurrence from code, else the user's answer. */
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

  /** Opens the form for an appointment, or for a new one at `cell`; resolves when it closes. */
  async openForm(item: T | null, cell: SchedulerCell | null = null): Promise<void> {
    const { scheduler } = this.host;
    if (item ? !this.canEdit(item) : !this.canAdd()) return;
    this.hideTooltip();
    const fields = this.host.fields();
    const editing = this.host.editing();
    const model = this.host.model;
    const record = (item ?? {}) as Record<string, unknown>;
    const time = item ? model.timeOf(item) : null;
    const start = time?.start ?? cell?.start ?? new Date();
    const end = time?.end ?? cell?.end ?? new Date(start.getTime() + this.host.resolvedView().cellDuration * MINUTE);
    const allDay = time?.allDay ?? cell?.allDay ?? false;
    const series = item ? model.seriesOf(item) : null;
    const startZone = String(record[fields.startTimeZone] ?? '');
    const endZone = String(record[fields.endTimeZone] ?? '');
    // The editors show the browser's clock: the times go there with the fields of their own zone's (or the scheduler's).
    const zoneOf = (name: unknown) => (typeof name === 'string' && name ? TimeZone.of(name) : model.zone);
    // An all-day appointment ends at the start of the day after; the form shows its last day.
    const data = reactive({
      text: String(record[fields.text] ?? ''),
      start: allDay ? model.zone.toLocal(start) : zoneOf(startZone).toLocal(start),
      end: allDay ? addDays(dayStart(model.zone.toLocal(end)), -1) : zoneOf(endZone || startZone).toLocal(end),
      allDay,
      description: String(record[fields.description] ?? ''),
      recurrenceRule: String(((series ?? record) as Record<string, unknown>)[fields.recurrenceRule] ?? ''),
      startTimeZone: startZone,
      endTimeZone: endZone,
      // The end has a zone of its own only when it differs from the start's.
      separateEndZone: !!endZone && endZone !== startZone,
    }) as AppointmentFormData;
    const t = (key: keyof UiStrings, values?: Record<string, unknown>) => this.host.text(key, values);
    /** The moment a form time names, on its zone's clock. */
    const momentOf = (value: Date, zone: unknown) => (data.allDay ? value : zoneOf(zone).fromLocal(value));
    const endAfterStart = (value: unknown) =>
      !(value instanceof Date) ||
      !(data.start instanceof Date) ||
      momentOf(value, (data.separateEndZone && data.endTimeZone) || data.startTimeZone) >= momentOf(data.start, data.startTimeZone) ||
      t('schedulerEndBeforeStart');
    const zones = editing.allowTimeZones ? this.zoneItems(start) : [];
    const own = () => t('schedulerOwnZone', { zone: model.zone.name || TimeZone.localName() });
    /** A zone's whole name, the picker's tooltip where the field is too narrow for it. */
    const zoneText = (name: unknown) => zones.find((z) => z.value === name)?.text ?? '';
    const exception = !!item && model.isException(item);
    const items: FormItem[] = [
      { field: 'text', label: () => t('schedulerSubject'), required: true, colSpan: 'all' },
      { field: 'start', label: () => t('schedulerStart'), editor: 'datetime', required: true, visible: () => !data.allDay },
      {
        field: 'end',
        label: () => t('schedulerEnd'),
        editor: 'datetime',
        required: true,
        visible: () => !data.allDay,
        rules: [{ type: 'custom', check: endAfterStart }],
      },
      { field: 'start', label: () => t('schedulerStart'), editor: 'date', required: true, visible: () => data.allDay },
      {
        field: 'end',
        label: () => t('schedulerEnd'),
        editor: 'date',
        required: true,
        visible: () => data.allDay,
        rules: [{ type: 'custom', check: endAfterStart }],
      },
      // A zone's name is long ("(GMT-3) America/Argentina/Rio Gallegos"): each picker has the whole row, the box its own.
      {
        field: 'startTimeZone',
        label: () => t(data.separateEndZone ? 'schedulerStartTimeZone' : 'schedulerTimeZone'),
        editor: 'dropdown',
        colSpan: 'all',
        editorProps: { items: zones, searchEnabled: true, placeholder: own, clearButton: true, hint: () => zoneText(data.startTimeZone) },
        visible: () => editing.allowTimeZones && !data.allDay,
      },
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
      { field: 'allDay', label: () => t('schedulerAllDay'), editor: 'switch', colSpan: 'all' },
      {
        field: 'recurrenceRule',
        colSpan: 'all',
        visible: () => editing.allowRecurrence && !exception,
        template: () => (
          <RecurrenceEditor
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
      { field: 'description', label: () => t('schedulerDescription'), editor: 'textarea', colSpan: 'all' },
    ];
    const form = new MxForm({ title: () => t(item ? 'schedulerEditAppointment' : 'schedulerNewAppointment'), width: 'var(--_scheduler-editor-width)', modal: true });
    form.class.add('mx-scheduler__form');
    const e: FormOpeningEventArgs<T> = { appointment: item, data, items, form, cancel: false, source: scheduler };
    this.host.events.formOpening.fire(e);
    if (e.cancel) {
      void form.dispose();
      return;
    }
    let layout: FormLayout<AppointmentFormData> | null = null;
    const save = async () => {
      if (layout && (await layout.validate({ focus: true })).valid) form.close('ok');
    };
    form.content = <FormLayout<AppointmentFormData> data={data} items={e.items} columns={2} ref={(c: FormLayout<AppointmentFormData>) => (layout = c)} />;
    let ok: Button | null = null;
    let cancel: Button | null = null;
    form.footer = (
      <Stack class="mx-scheduler__form-buttons" orientation="horizontal" wrap justify="end">
        <Button
          class="mx-scheduler__form-delete"
          text={() => t('schedulerDelete')}
          tone="danger"
          visible={() => !!item && this.canDelete(item)}
          onclick={() => form.close('delete')}
        />
        <Button text={() => t('schedulerSave')} tone="accent" ref={(b: Button) => (ok = b)} onclick={() => void save()} />
        <Button text={() => t('cancel')} ref={(b: Button) => (cancel = b)} onclick={() => form.close('cancel')} />
      </Stack>
    );
    form.acceptButton = ok;
    form.cancelButton = cancel;
    const result = await form.showDialog(scheduler);
    if (result === 'delete' && item) {
      await this.remove(item, true);
      return;
    }
    if (result !== 'ok') return;
    const values = this.formValues(data, editing);
    if (item) await this.update(item, model.occurrenceOf(item) ? this.changed(item, series, values) : values, true);
    else await this.add(values, true);
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
      const old = ((key === fields.recurrenceRule && series ? series : item) as Record<string, unknown>)[key];
      if (!sameValue(old, value)) out[key] = value;
    }
    return out as Partial<T>;
  }

  /** The form's values as the appointment's fields: its own ones by their names, the extra ones as they are. */
  private formValues(data: AppointmentFormData, editing: SchedulerEditing): Partial<T> {
    const fields = this.host.fields();
    const model = this.host.model;
    const start = data.start instanceof Date ? data.start : new Date();
    const end = data.end instanceof Date ? data.end : start;
    const own = ['text', 'start', 'end', 'allDay', 'description', 'recurrenceRule', 'startTimeZone', 'endTimeZone', 'separateEndZone'];
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) if (!own.includes(key)) out[key] = value;
    out[fields.text] = data.text;
    out[fields.description] = data.description;
    if (editing.allowRecurrence) out[fields.recurrenceRule] = String(data.recurrenceRule ?? '');
    if (data.allDay) {
      Object.assign(out, { [fields.start]: dayStart(start), [fields.end]: addDays(dayStart(end), 1), [fields.allDay]: true });
    } else {
      const startZone = String(data.startTimeZone ?? '');
      const ownEnd = data.separateEndZone ? String(data.endTimeZone ?? '') : '';
      const endZone = ownEnd || startZone;
      const from = (startZone ? TimeZone.of(startZone) : model.zone).fromLocal(start);
      const to = (endZone ? TimeZone.of(endZone) : model.zone).fromLocal(end);
      Object.assign(out, this.timeValues(from, to < from ? from : to, false));
      if (editing.allowTimeZones) Object.assign(out, { [fields.startTimeZone]: startZone, [fields.endTimeZone]: ownEnd });
    }
    return out as Partial<T>;
  }

  // The tooltip.

  showTooltip(item: T, anchor: HTMLElement): void {
    const popup = this.tooltip();
    this.tooltipState.item = item;
    popup.open(anchor);
    this.opened.id = this.host.model.idOf(item);
  }

  /** Its tooltip is showing. Reactive. */
  isOpen(item: T): boolean {
    return this.opened.id !== '' && this.opened.id === this.host.model.idOf(item);
  }

  hideTooltip(): void {
    if (this.tooltipPopup?.isOpen) this.tooltipPopup.close();
  }

  private tooltip(): Popup {
    if (this.tooltipPopup) return this.tooltipPopup;
    const popup = new Popup();
    popup.matchWidth = false;
    popup.class.add('mx-scheduler__tooltip-popup');
    popup.controls.add(
      <AppointmentTooltip<T>
        host={this.host.view}
        state={this.tooltipState}
        canEdit={(item: T) => this.canEdit(item)}
        canDelete={(item: T) => this.canDelete(item)}
        edit={(item: T) => void this.openForm(item)}
        remove={(item: T) => {
          popup.close();
          void this.remove(item, true);
        }}
      />,
    );
    popup.onClosed(() => (this.opened.id = ''));
    this.host.scheduler.controls.add(popup);
    this.tooltipPopup = popup;
    return popup;
  }

  // Moving and resizing by the keys.

  /** The keys of a focused appointment; `true` when one was used. */
  key(piece: TimedPiece<T> | StripPiece<T>, e: KeyboardEvent): boolean {
    const item = piece.item;
    const moving = this.keyDraft;
    if (moving && moving.draft.item !== item) this.cancelKeys();
    if (e.key === 'Escape' && this.keyDraft) {
      this.cancelKeys();
      return true;
    }
    if (e.key === 'Enter' && this.keyDraft) {
      const { mode, draft } = this.keyDraft;
      this.keyDraft = null;
      void this.drop(mode, draft, true).finally(() => this.host.setDraft(null));
      return true;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && !this.keyDraft) {
      if (this.canDelete(item)) void this.remove(item, true);
      return true;
    }
    const step = this.arrowStep(e);
    if (!step) return false;
    const mode: DragMode = e.shiftKey ? 'end' : 'move';
    if (mode === 'move' ? !this.canDrag(item) : !this.canResize(item)) return true;
    let current = this.keyDraft;
    if (!current) {
      const time = this.host.model.timeOf(item);
      if (!time) return true;
      const draft: Draft<T> = { item, ...time, copy: false, invalid: false };
      if (!this.starting(mode, draft, true)) return true;
      current = this.keyDraft = { mode, draft };
    }
    const { draft } = current;
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
    next.invalid = !this.over(mode, next, true);
    current.mode = mode;
    current.draft = next;
    this.host.setDraft(next);
    const when = next.allDay
      ? this.host.view.format.range('day', next.start, next.end)
      : `${this.host.view.format.fullDate(next.start)} ${this.host.view.format.timeRange(next.start, next.end)}`;
    this.host.say(this.host.text('schedulerMoving', { text: this.textOf(item), time: when }));
    return true;
  }

  /** Takes a move by the keys back (Escape, or focus leaving it). */
  cancelKeys(): void {
    if (!this.keyDraft) return;
    this.keyDraft = null;
    this.host.setDraft(null);
  }

  /** What an arrow does: Up / Down a snap step (a week in the month), Left / Right a day (mirrored right to left). */
  private arrowStep(e: KeyboardEvent): { minutes: number; days: number } | null {
    if (e.ctrlKey || e.altKey || e.metaKey) return null;
    const month = this.host.resolvedView().type === 'month';
    const across = this.host.rtl() ? -1 : 1;
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

  root(): HTMLElement {
    return this.host.root();
  }
  scroller(): HTMLElement | null {
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
    (mode === 'move' ? this.host.events.moving : this.host.events.resizing).fire(e);
    return !e.cancel;
  }

  async drop(mode: DragMode, draft: Draft<T>, byKeys = false): Promise<void> {
    const e = this.dragArgs(draft, byKeys);
    (mode === 'move' ? this.host.events.moveEnd : this.host.events.resizeEnd).fire(e);
    if (e.cancel || draft.invalid) return;
    const time = this.timeValues(e.start, e.end, e.allDay);
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
      cancel: false,
      source: this.host.scheduler,
    };
  }

  /** A copy of an appointment's fields without its key (a new one gets its own): a copy of an occurrence happens once. */
  private copyOf(item: T): Partial<T> {
    const fields = this.host.fields();
    const copy = { ...(item as object) } as Record<string, unknown>;
    delete copy[fields.key];
    delete copy[fields.recurrenceRule];
    delete copy[fields.recurrenceException];
    delete copy[fields.recurrenceId];
    return copy as Partial<T>;
  }

  private textOf(item: T | Partial<T>): string {
    const value = (item as Record<string, unknown>)?.[this.host.fields().text];
    return value === undefined || value === null || value === '' ? this.host.text('schedulerNoTitle') : String(value);
  }

  dispose(): void {
    this.cancelKeys();
    this.hideTooltip();
  }
}

/** Whether an event let it happen: not cancelled, and its promise (if it set one) resolved to `true`. */
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
  if (typeof a === 'boolean' || typeof b === 'boolean') return !!a === !!b;
  const blank = (v: unknown) => v === undefined || v === null || v === '';
  return a === b || (blank(a) && blank(b));
}
