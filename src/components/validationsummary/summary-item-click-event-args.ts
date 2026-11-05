import type { ValidationTarget } from '../../parts/validation/validation-target';
import type { ValidationSummary } from './ValidationSummary';

/** A line of the summary was pressed. */
export interface SummaryItemClickEventArgs {
    /** The field (or other target) the line stands for. */
    target: ValidationTarget;
    /** The line's text. */
    text: string;
    source: ValidationSummary;
    event: Event;
}
