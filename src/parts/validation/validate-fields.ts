import type { ComponentBase } from '@motifx/core';
import { controlOf } from '../../core/control-map';
import { validateTargets } from './validate-targets';
import type { ValidationResult } from './validation-result';
import type { ValidationTarget } from './validation-target';

/** Put on the root element of every control that can be checked. */
export const VALIDATES = 'data-mx-validates';

export function fieldsWithin(root: ComponentBase | Element): ValidationTarget[] {
  const element = root instanceof Element ? root : (root.element as Element);
  return Array.from(element.querySelectorAll(`[${VALIDATES}]`))
    .map((el) => controlOf(el) as unknown as ValidationTarget | undefined)
    .filter((target): target is ValidationTarget => !!target && typeof target.validate === 'function');
}

/** Checks every field inside `root` (a panel, a dialog, a page) without a group. */
export function validateFields(root: ComponentBase | Element, options: { focus?: boolean } = {}): Promise<ValidationResult> {
  return validateTargets(fieldsWithin(root), options.focus !== false);
}
