import type { Bind } from '@motifx/core';
import type { AppointmentFormContext } from './appointment-form-context';

/**
 * A value, a tracked function, or a function of the form (its appointment and its data). A function
 * with a parameter is treated as a function of the form.
 */
export type FormBind<V, T> = Bind<V> | ((form: AppointmentFormContext<T>) => V);
