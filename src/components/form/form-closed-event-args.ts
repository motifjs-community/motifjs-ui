import type { FormCloseReason } from './form-close-reason';
import type { FormResult } from './form-result';
import type { MxForm } from './MxForm';

export interface FormClosedEventArgs {
  result: FormResult;
  reason: FormCloseReason;
  source: MxForm;
}
