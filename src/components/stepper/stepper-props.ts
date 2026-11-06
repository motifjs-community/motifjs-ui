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
    /** The steps in order: `StepperItem`s or plain texts. */
    items?: Bind<readonly (StepperItem | string)[]>;
    /** The current step: its `key`, else its index. `x-model` binds it two-way. Default `0`; `null` for none. */
    value?: Bind<string | number | null>;
    /** The steps are taken in order: a click reaches a completed step, or the one right after the last completed. Default `true`. */
    linear?: Bind<boolean>;
    /** Default `'horizontal'`. */
    orientation?: Bind<StepperOrientation>;
    /** Where the texts sit next to the indicator in a horizontal stepper. Default `'bottom'`. */
    labelPosition?: Bind<StepperLabelPosition>;
    /** Default `'md'`. */
    size?: Bind<ControlSize>;
    /** The steps can be pressed. `false` shows the way only. Default `true`. */
    clickable?: Bind<boolean>;
    /** The indicator of a step to come shows its number. Default `true`. */
    showNumbers?: Bind<boolean>;
    /** What screen readers call it. Default: the kit's "Steps". */
    label?: Bind<string>;
    /** The current step is about to change; cancelable, may wait on `promise`. */
    onStepChanging?: (e: StepChangingEventArgs) => void;
    onStepChanged?: (e: StepChangedEventArgs) => void;
}
