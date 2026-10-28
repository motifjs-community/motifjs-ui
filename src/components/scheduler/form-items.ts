import { read, type Bind } from '@motifx/core';
import type { FormItem } from '../formlayout/form-item';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { AppointmentFormContext } from './appointment-form-context';
import type { SchedulerFormItem } from './scheduler-form-item';

/** The time zone row: the three items `timeZone` stands for. */
const ZONE = ['startTimeZone', 'separateEndZone', 'endTimeZone'];

/**
 * The appointment form's items from its settings: a built-in item or a resource by its field (the
 * built-in changed by what an item of the same field gives), groups and tabs with their items
 * resolved the same way, the rest as given. A setting given as a function of the form is called
 * with it (and followed).
 */
export function formItems<T>(given: readonly (string | SchedulerFormItem<T>)[], builtIns: Map<string, FormItem[]>, form: AppointmentFormContext<T>): FormItem[] {
  const bind = <V,>(value: unknown): Bind<V> | undefined =>
    typeof value === 'function' && value.length > 0 ? () => (value as (f: AppointmentFormContext<T>) => V)(form) : (value as Bind<V> | undefined);
  const own = (item: SchedulerFormItem<T>): FormItem => {
    const { items, tabs, template, rules, visible, enabled, readOnly, label, required, helpText, group, ...rest } = item;
    const out: FormItem = { ...rest };
    if (label !== undefined) out.label = bind<string>(label);
    if (required !== undefined) out.required = bind<boolean>(required);
    if (helpText !== undefined) out.helpText = bind<string>(helpText);
    if (group !== undefined) out.group = bind<string>(group);
    if (rules !== undefined) out.rules = bind<readonly ValidationRule[]>(rules);
    if (visible !== undefined) out.visible = bind<boolean>(visible);
    if (enabled !== undefined) out.enabled = bind<boolean>(enabled);
    if (readOnly !== undefined) out.readOnly = bind<boolean>(readOnly);
    if (template) out.template = (place) => template(form, place);
    if (items) out.items = list(items);
    if (tabs) out.tabs = tabs.map((tab) => ({ title: bind<string>(tab.title) ?? '', columns: tab.columns, visible: bind<boolean>(tab.visible), items: list(tab.items) }));
    return out;
  };
  const list = (entries: readonly (string | SchedulerFormItem<T>)[]): FormItem[] =>
    entries.flatMap((entry) => {
      if (typeof entry === 'string') return (entry === 'timeZone' ? ZONE : [entry]).flatMap((name) => builtIns.get(name) ?? []);
      const known = entry.field && !entry.template && !entry.items && !entry.tabs ? builtIns.get(entry.field) : undefined;
      if (!known) return [own(entry)];
      return known.map((base) => merge(base, own(entry)));
    });
  return list(given);
}

/** A built-in item changed by the one given: its settings win, its rules add, shown only when both say so, locked when either does. */
function merge(base: FormItem, given: FormItem): FormItem {
  const out: FormItem = { ...base };
  for (const [key, value] of Object.entries(given)) if (value !== undefined) (out as Record<string, unknown>)[key] = value;
  out.editorProps = { ...base.editorProps, ...given.editorProps };
  out.rules = both(base.rules, given.rules);
  out.visible = all(base.visible, given.visible);
  out.enabled = all(base.enabled, given.enabled);
  out.readOnly = any(base.readOnly, given.readOnly);
  return out;
}

function both(a: Bind<readonly ValidationRule[]> | undefined, b: Bind<readonly ValidationRule[]> | undefined): Bind<readonly ValidationRule[]> | undefined {
  if (a === undefined || b === undefined) return a ?? b;
  return () => [...(read(a) ?? []), ...(read(b) ?? [])];
}

function all(a: Bind<boolean> | undefined, b: Bind<boolean> | undefined): Bind<boolean> | undefined {
  if (a === undefined || b === undefined) return a ?? b;
  return () => read(a) !== false && read(b) !== false;
}

function any(a: Bind<boolean> | undefined, b: Bind<boolean> | undefined): Bind<boolean> | undefined {
  if (a === undefined || b === undefined) return a ?? b;
  return () => read(a) === true || read(b) === true;
}
