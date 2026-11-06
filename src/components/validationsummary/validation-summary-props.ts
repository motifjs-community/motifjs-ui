import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ValidationGroup } from '../../parts/validation/ValidationGroup';
import type { SummaryItemClickEventArgs } from './summary-item-click-event-args';

/** Props of `ValidationSummary`. Each prop is also a settable property, and a function is tracked. */
export interface ValidationSummaryProps extends ControlProps {
    /** The group whose invalid fields are listed. */
    group?: Bind<ValidationGroup | null>;
    /** The text above the list. The default is the kit's "Please correct the following" string. */
    header?: Bind<string>;
    /** Shows the header. The default is `true`. */
    showHeader?: Bind<boolean>;
    /** Clicking a line moves focus to its field. The default is `true`. */
    focusOnClick?: Bind<boolean>;
    /** Occurs when a line is clicked. */
    onItemClick?: (e: SummaryItemClickEventArgs) => void;
}
