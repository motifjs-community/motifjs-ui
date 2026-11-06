import type { ValidationGroup } from '../../parts/validation/ValidationGroup';

/** What a form item's `template` receives: the form's data object, the item's field, and the form's validation group. */
export interface FormTemplateContext<T extends object = Record<string, unknown>> {
  data: T | null;
  /** The item's `field`, or an empty string if it has none. */
  field: string;
  /** Add a custom component to it (its `validationGroup`), and the form validates it with the others. */
  validationGroup: ValidationGroup;
}
