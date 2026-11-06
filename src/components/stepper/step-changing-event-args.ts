import type { EventArgs } from '@motifx/core';
import type { Stepper } from './Stepper';

/**
 * Provides data for the event that occurs before the current step changes. Set `cancel = true` to keep it, or set
 * `promise` to wait (for a validation or a server), and the step changes when it resolves to `true`.
 */
export interface StepChangingEventArgs extends EventArgs {
    from: number;
    to: number;
    /** The items as provided, or `null` if there is no current step. */
    fromItem: unknown;
    toItem: unknown;
    /** `true` for a click on a step, and `false` for a programmatic change. */
    byUser: boolean;
    promise?: Promise<boolean>;
    source: Stepper;
    event?: Event;
}
