import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { StepChangedEventArgs } from './step-changed-event-args';
import type { StepChangingEventArgs } from './step-changing-event-args';
import type { StepperLabelPosition } from './stepper-label-position';
import type { StepperOrientation } from './stepper-orientation';
import type { WizardFinishingEventArgs } from './wizard-finishing-event-args';
import type { WizardStepProps } from './wizard-step-props';

/** Props of `Wizard`. Each prop is also a settable property, and a function is tracked. */
export interface WizardProps extends ControlProps {
    /**
     * Steps created programmatically, each as `WizardStep` props (`title`, `content`, …). JSX `WizardStep` children come
     * first.
     */
    steps?: readonly WizardStepProps[];
    /** The current step, identified by its `key` or index. `x-model` provides two-way binding. The default is `0`. */
    value?: Bind<string | number | null>;
    /** Steps are taken in order: a step can be reached only after the previous ones. The default is `true`. */
    linear?: Bind<boolean>;
    /**
     * `horizontal` places the stepper above the pages, and `vertical` places it next to them. The default is
     * `'horizontal'`.
     */
    orientation?: Bind<StepperOrientation>;
    /** The position of the stepper text, in the horizontal orientation only. The default is `'bottom'`. */
    labelPosition?: Bind<StepperLabelPosition>;
    /** The size of the stepper. The default is `'md'`. */
    size?: Bind<ControlSize>;
    /** Shows the stepper. The default is `true`. */
    showStepper?: Bind<boolean>;
    /** Lets the user click the stepper steps. The default is `true`. */
    clickable?: Bind<boolean>;
    /** Shows the bar with the Back and Next buttons. The default is `true`. */
    showNavigation?: Bind<boolean>;
    /** Creates a page when first shown and then keeps it. A step's own `lazy` takes precedence. The default is `true`. */
    lazy?: Bind<boolean>;
    /**
     * With `false`, content created by a step's `content` is disposed while hidden. A step's own `keepAlive` takes
     * precedence. The default is `true`.
     */
    keepAlive?: Bind<boolean>;
    /** The button text. The kit strings "Back", "Next" and "Finish" are used when omitted. */
    previousText?: Bind<string>;
    nextText?: Bind<string>;
    finishText?: Bind<string>;
    /** The accessible name of the stepper. The default is the kit's "Steps" string. */
    label?: Bind<string>;
    /** Occurs before the current step changes. This event is cancelable and can wait on `promise`. */
    onStepChanging?: (e: StepChangingEventArgs) => void;
    onStepChanged?: (e: StepChangedEventArgs) => void;
    /**
     * Occurs when the last page is valid and the wizard is about to finish. This event is cancelable and can wait on
     * `promise`.
     */
    onFinishing?: (e: WizardFinishingEventArgs) => void;
    onFinished?: (e: { source: unknown }) => void;
}
