import type { ValidationGroup } from '../../parts/validation/ValidationGroup';

/** What a form item's `template` gets: the form's data object, the item's field, and the group the form's fields are checked in. */
export interface FormTemplateContext<T extends object = Record<string, unknown>> {
  data: T | null;
  /** The item's `field`; empty when it has none. */
  field: string;
  /** Add a component of your own to it (its `validationGroup`), and the form checks it with the others. */
  validationGroup: ValidationGroup;
}
