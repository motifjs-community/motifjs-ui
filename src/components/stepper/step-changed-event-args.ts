import type { Stepper } from './Stepper';

/** The current step changed. */
export interface StepChangedEventArgs {
    index: number;
    /** The item as given; `null` when there is no current step. */
    item: unknown;
    previous: number;
    /** By a press on a step, else from code. */
    byUser: boolean;
    source: Stepper;
}
