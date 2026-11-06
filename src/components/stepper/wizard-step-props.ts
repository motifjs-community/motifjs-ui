import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ContentFactory } from '../tabs/PanelContent';

/**
 * Props of `WizardStep`, one step of a `Wizard`, with the JSX children as the page. Each prop is also a settable
 * property. `lazy` and `keepAlive` inherit from the `Wizard` when they are omitted.
 */
export interface WizardStepProps extends ControlProps {
    /** The step text in the stepper. This is the same property as `text`. */
    title?: Bind<string>;
    /** A second line below the title. */
    description?: Bind<string>;
    /** Identifies the step in `Wizard.value`. If omitted, the step's index is used. */
    key?: Bind<string>;
    /** Displayed in the indicator instead of the number. */
    icon?: Bind<IconSource | null | undefined>;
    /** Can be skipped, and is marked as optional below the title. */
    optional?: Bind<boolean>;
    /** `true` shows the step with an error. The wizard sets it when the page fails validation. */
    error?: Bind<boolean>;
    /** Creates the page when it is first shown. */
    lazy?: Bind<boolean | undefined>;
    /** With `false`, what `content` created is disposed while the page is hidden and recreated when it is shown. */
    keepAlive?: Bind<boolean | undefined>;
    /** The kit fields on the page are validated before the wizard moves on. The default is `true`. */
    validateFields?: Bind<boolean>;
    /** Runs before the wizard moves on from the page. `false`, or a promise of it, keeps the page and marks the step. */
    validate?: () => boolean | Promise<boolean>;
    /** Creates the page content, either instead of or after the JSX children. */
    content?: ContentFactory;
}
