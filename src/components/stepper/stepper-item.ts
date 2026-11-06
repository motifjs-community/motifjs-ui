import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** One step of a `Stepper`. Its fields can be functions of reactive state, which the stepper tracks. */
export interface StepperItem {
    text: Bind<string>;
    /** A second line below the text. */
    description?: Bind<string>;
    /** Identifies the step in `value`. If omitted, the step's index is used. */
    key?: string;
    /** Displayed in the indicator instead of the number. */
    icon?: Bind<IconSource | null>;
    /** `done` or `error`, regardless of the current step. If omitted, the steps before the current one are done. */
    status?: Bind<'done' | 'error' | 'pending' | null>;
    /** Can be skipped in linear order, and is marked as optional below the text. */
    optional?: Bind<boolean>;
    /** `false` prevents the step from being selected. The default is `true`. */
    enabled?: Bind<boolean>;
    /** A custom application value for the step. */
    data?: unknown;
}
