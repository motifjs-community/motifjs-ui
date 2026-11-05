import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** One step of a `Stepper`. Its fields may be functions of reactive state: the stepper follows them. */
export interface StepperItem {
    text: Bind<string>;
    /** A second line under the text. */
    description?: Bind<string>;
    /** Names the step in `value`; without it the step's index does. */
    key?: string;
    /** Drawn in the indicator in place of the number. */
    icon?: Bind<IconSource | null>;
    /** `done` or `error` whatever the current step is; left out, the steps before the current one are done. */
    status?: Bind<'done' | 'error' | 'pending' | null>;
    /** May be skipped in linear order; says so under the text. */
    optional?: Bind<boolean>;
    /** `false` keeps it from being chosen. Default `true`. */
    enabled?: Bind<boolean>;
    /** The app's own value for the step. */
    data?: unknown;
}
