import type { EventArgs } from '@motifx/core';
import type { FormCloseReason } from './form-close-reason';
import type { FormResult } from './form-result';
import type { MxForm } from './MxForm';

/** The form is about to close; `cancel = true` keeps it open (not when its owner is going away). */
export interface FormClosingEventArgs extends EventArgs {
  result: FormResult;
  reason: FormCloseReason;
  source: MxForm;
}
