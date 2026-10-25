import type { ValidationTarget } from './validation-target';

export interface ValidationResult {
  valid: boolean;
  /** In page order. */
  invalid: ValidationTarget[];
}
