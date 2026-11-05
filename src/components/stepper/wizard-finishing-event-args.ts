import type { EventArgs } from '@motifx/core';
import type { Wizard } from './Wizard';

/** The wizard is about to finish (after the last page validated). `cancel = true` keeps it open; `promise` may be set to wait: it finishes when it resolves to `true`. */
export interface WizardFinishingEventArgs extends EventArgs {
    promise?: Promise<boolean>;
    source: Wizard;
}
