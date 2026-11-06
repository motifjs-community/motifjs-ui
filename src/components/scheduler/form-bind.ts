import type { Bind } from '@motifx/core';
import type { AppointmentFormContext } from './appointment-form-context';

/** A value, a tracked function, or a function of the form (its appointment and its data): a function with a parameter is one of the form. */
export type FormBind<V, T> = Bind<V> | ((form: AppointmentFormContext<T>) => V);
