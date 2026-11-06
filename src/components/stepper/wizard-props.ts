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
    /** Steps made programmatically, each as the props of a `WizardStep` (`title`, `content`, …); the JSX `WizardStep` children come first. */
    steps?: readonly WizardStepProps[];
    /** The current step: its `key`, else its index. `x-model` binds it two-way. Default `0`. */
    value?: Bind<string | number | null>;
    /** The steps are taken in order: a step is reached only after the ones before it. Default `true`. */
    linear?: Bind<boolean>;
    /** `horizontal`: the stepper above the pages; `vertical`: beside them. Default `'horizontal'`. */
    orientation?: Bind<StepperOrientation>;
    /** Where the stepper's texts sit, horizontal only. Default `'bottom'`. */
    labelPosition?: Bind<StepperLabelPosition>;
    /** The stepper's size. Default `'md'`. */
    size?: Bind<ControlSize>;
    /** The stepper is shown. Default `true`. */
    showStepper?: Bind<boolean>;
    /** The steps of the stepper can be pressed. Default `true`. */
    clickable?: Bind<boolean>;
    /** The bar with the Back and Next buttons. Default `true`. */
    showNavigation?: Bind<boolean>;
    /** A page is built when first shown, then kept (a step's own `lazy` wins). Default `true`. */
    lazy?: Bind<boolean>;
    /** `false`: content made by a step's `content` is disposed while hidden (a step's own `keepAlive` wins). Default `true`. */
    keepAlive?: Bind<boolean>;
    /** The buttons' texts; the kit's “Back”, “Next” and “Finish” when not given. */
    previousText?: Bind<string>;
    nextText?: Bind<string>;
    finishText?: Bind<string>;
    /** What screen readers call the stepper. Default: the kit's "Steps". */
    label?: Bind<string>;
    /** The current step is about to change; cancelable, may wait on `promise`. */
    onStepChanging?: (e: StepChangingEventArgs) => void;
    onStepChanged?: (e: StepChangedEventArgs) => void;
    /** The last page validated and the wizard is about to finish; cancelable, may wait on `promise`. */
    onFinishing?: (e: WizardFinishingEventArgs) => void;
    onFinished?: (e: { source: unknown }) => void;
}
