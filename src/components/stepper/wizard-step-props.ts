import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ContentFactory } from '../tabs/PanelContent';

/**
 * Props of `WizardStep`: one step of a `Wizard`, its JSX children the page. Each one is also a settable property.
 * `lazy` and `keepAlive` left unset follow the `Wizard`.
 */
export interface WizardStepProps extends ControlProps {
    /** The step's text in the stepper. The same property as `text`. */
    title?: Bind<string>;
    /** A second line under the title. */
    description?: Bind<string>;
    /** Names the step in `Wizard.value`; without it the step's index does. */
    key?: Bind<string>;
    /** Drawn in the indicator in place of the number. */
    icon?: Bind<IconSource | null | undefined>;
    /** May be skipped; says so under the title. */
    optional?: Bind<boolean>;
    /** `true` draws the step with an error; the wizard sets it when the page does not validate. */
    error?: Bind<boolean>;
    /** Builds the page when it is first shown. */
    lazy?: Bind<boolean | undefined>;
    /** `false`: what `content` made is disposed while the page is hidden and made again when it shows. */
    keepAlive?: Bind<boolean | undefined>;
    /** The kit's fields on the page are validated before the wizard moves on from it. Default `true`. */
    validateFields?: Bind<boolean>;
    /** Asked before the wizard moves on from the page; `false` (or a promise of it) keeps the page and marks the step. */
    validate?: () => boolean | Promise<boolean>;
    /** Makes the page content, called when the page is built (instead of, or after, the JSX children). */
    content?: ContentFactory;
}
