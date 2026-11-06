import type { EventArgs } from '@motifx/core';
import type { Wizard } from './Wizard';

/**
 * Provides data for the event that occurs before the wizard finishes, after the last page is validated. Set
 * `cancel = true` to keep it open, or set `promise` to wait, and it finishes when that resolves to `true`.
 */
export interface WizardFinishingEventArgs extends EventArgs {
    promise?: Promise<boolean>;
    source: Wizard;
}
