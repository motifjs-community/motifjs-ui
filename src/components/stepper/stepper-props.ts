import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { StepChangedEventArgs } from './step-changed-event-args';
import type { StepChangingEventArgs } from './step-changing-event-args';
import type { StepperItem } from './stepper-item';
import type { StepperLabelPosition } from './stepper-label-position';
import type { StepperOrientation } from './stepper-orientation';

/** Props of `Stepper`. Each prop is also a settable property, and a function is tracked. */
export interface StepperProps extends ControlProps {
    /** The steps in order: `StepperItem` objects or plain text. */
    items?: Bind<readonly (StepperItem | string)[]>;
    /**
     * The current step, identified by its `key` or index, or `null` for none. `x-model` provides two-way binding.
     * The default is `0`.
     */
    value?: Bind<string | number | null>;
    /**
     * Steps are taken in order: a click reaches a completed step or the one right after the last completed step.
     * The default is `true`.
     */
    linear?: Bind<boolean>;
    /** The default is `'horizontal'`. */
    orientation?: Bind<StepperOrientation>;
    /** The position of the text next to the indicator in a horizontal stepper. The default is `'bottom'`. */
    labelPosition?: Bind<StepperLabelPosition>;
    /** The default is `'md'`. */
    size?: Bind<ControlSize>;
    /** Lets the user click the steps. `false` makes the stepper display only. The default is `true`. */
    clickable?: Bind<boolean>;
    /** Shows the number in the indicator of an upcoming step. The default is `true`. */
    showNumbers?: Bind<boolean>;
    /** The accessible name. The default is the kit's "Steps" string. */
    label?: Bind<string>;
    /** Occurs before the current step changes. This event is cancelable and can wait on `promise`. */
    onStepChanging?: (e: StepChangingEventArgs) => void;
    onStepChanged?: (e: StepChangedEventArgs) => void;
}
