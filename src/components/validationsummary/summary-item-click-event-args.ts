import type { ValidationTarget } from '../../parts/validation/validation-target';
import type { ValidationSummary } from './ValidationSummary';

/** Provides data for the event that occurs when a line of the summary is clicked. */
export interface SummaryItemClickEventArgs {
    /** The field or other target that the line represents. */
    target: ValidationTarget;
    /** The text of the line. */
    text: string;
    source: ValidationSummary;
    event: Event;
}
