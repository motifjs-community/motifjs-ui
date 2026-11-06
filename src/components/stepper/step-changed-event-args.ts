import type { Stepper } from './Stepper';

/** Provides data for the event that occurs after the current step changes. */
export interface StepChangedEventArgs {
    index: number;
    /** The item as provided, or `null` if there is no current step. */
    item: unknown;
    previous: number;
    /** `true` for a click on a step, and `false` for a programmatic change. */
    byUser: boolean;
    source: Stepper;
}
