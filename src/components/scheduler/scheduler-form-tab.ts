import type { FormBind } from './form-bind';
import type { SchedulerFormItem } from './scheduler-form-item';

/** A tab of the appointment form: its caption and its items (by name, or items of the form's own). */
export interface SchedulerFormTab<T = unknown> {
  title: FormBind<string, T>;
  items: readonly (string | SchedulerFormItem<T>)[];
  columns?: number;
  visible?: FormBind<boolean, T>;
}

