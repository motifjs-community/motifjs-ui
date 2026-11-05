import type { EventArgs } from '@motifx/core';
import type { Stepper } from './Stepper';

/**
 * The current step is about to change. `cancel = true` keeps it; `promise` may be set to wait (a validation, a
 * server): the step changes when it resolves to `true`.
 */
export interface StepChangingEventArgs extends EventArgs {
    from: number;
    to: number;
    /** The items as given; `null` when there is none (no current step). */
    fromItem: unknown;
    toItem: unknown;
    /** By a press on a step, else from code. */
    byUser: boolean;
    promise?: Promise<boolean>;
    source: Stepper;
    event?: Event;
}
