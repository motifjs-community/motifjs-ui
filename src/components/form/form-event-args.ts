import type { MxForm } from './MxForm';

/** The arguments of a form event that reports only which form raised it. */
export interface FormEventArgs {
  source: MxForm;
}
