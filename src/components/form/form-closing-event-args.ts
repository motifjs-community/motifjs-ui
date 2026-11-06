import type { EventArgs } from '@motifx/core';
import type { FormCloseReason } from './form-close-reason';
import type { FormResult } from './form-result';
import type { MxForm } from './MxForm';

/** The arguments of `onClosing`. Set `cancel = true` to keep the form open, unless its owner is being disposed. */
export interface FormClosingEventArgs extends EventArgs {
  result: FormResult;
  reason: FormCloseReason;
  source: MxForm;
}
