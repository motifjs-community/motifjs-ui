import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ValidationGroup } from '../../parts/validation/ValidationGroup';
import type { SummaryItemClickEventArgs } from './summary-item-click-event-args';

/** Props of `ValidationSummary`. Each one is also a settable property; a function is followed. */
export interface ValidationSummaryProps extends ControlProps {
    /** The group whose failed fields are listed. */
    group?: Bind<ValidationGroup | null>;
    /** The line above the list. Default: the kit's "Please correct the following". */
    header?: Bind<string>;
    /** Default `true`. */
    showHeader?: Bind<boolean>;
    /** A press on a line focuses its field. Default `true`. */
    focusOnClick?: Bind<boolean>;
    /** A line was pressed. */
    onItemClick?: (e: SummaryItemClickEventArgs) => void;
}
