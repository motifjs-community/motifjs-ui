import type { ComponentBase } from '@motifx/core';
import type { FormItem } from '../formlayout/form-item';
import type { FormTemplateContext } from '../formlayout/form-template-context';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { AppointmentFormContext } from './appointment-form-context';
import type { FormBind } from './form-bind';
import type { SchedulerFormTab } from './scheduler-form-tab';

/**
 * An item of the appointment form: a kit form item, whose settings may also be functions of the
 * form (shown, locked or required for one appointment only), and whose groups and tabs hold
 * items given the same way.
 */
export interface SchedulerFormItem<T = unknown>
  extends Omit<FormItem, 'label' | 'required' | 'rules' | 'helpText' | 'visible' | 'enabled' | 'readOnly' | 'group' | 'items' | 'tabs' | 'template'> {
  label?: FormBind<string, T>;
  required?: FormBind<boolean, T>;
  /** Added to the rules a built-in item has. */
  rules?: FormBind<readonly ValidationRule[], T>;
  helpText?: FormBind<string, T>;
  visible?: FormBind<boolean, T>;
  enabled?: FormBind<boolean, T>;
  readOnly?: FormBind<boolean, T>;
  group?: FormBind<string, T>;
  items?: readonly (string | SchedulerFormItem<T>)[];
  tabs?: readonly SchedulerFormTab<T>[];
  /** Any MotifJS component, made for this place: bind it to `form.data[place.field]`. */
  template?: (form: AppointmentFormContext<T>, place: FormTemplateContext) => ComponentBase;
}
