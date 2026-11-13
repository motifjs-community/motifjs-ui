import type { ComponentBase } from '@motifx/core';
import { Field } from '../field/Field';
import { validateTargets } from './validate-targets';
import type { ValidationResult } from './validation-result';
import type { ValidationTarget } from './validation-target';

/** Put on the root element of every control that can be checked. */
export const VALIDATES = 'data-mx-validates';

/**
 * The fields inside `root`, in the order of the component tree. What is not in the page is left out: a part hidden
 * (`motif.hide()`, `x-display`) or not built yet, and everything inside it.
 */
export function fieldsWithin(root: ComponentBase): ValidationTarget[] {
  const found: ValidationTarget[] = [];
  const walk = (part: ComponentBase) => {
    for (const child of part.controls.items) {
      if (child.isDisposed || !child.isBuilt || !child.isVisible) continue;
      if (child instanceof Field) found.push(child);
      walk(child);
    }
  };
  walk(root);
  return found;
}

/** Validates every field inside `root` (a panel, a dialog, a page) without a group. */
export function validateFields(root: ComponentBase, options: { focus?: boolean } = {}): Promise<ValidationResult> {
  return validateTargets(fieldsWithin(root), options.focus !== false);
}
