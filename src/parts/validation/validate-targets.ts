import { compareTreeOrder } from '../../core/component-tree';
import type { ValidationResult } from './validation-result';
import type { ValidationTarget } from './validation-target';

/** In the order of the component tree, by the parts of the targets. */
function inTreeOrder(a: ValidationTarget, b: ValidationTarget): number {
  return compareTreeOrder(a.part, b.part);
}

export async function validateTargets(targets: readonly ValidationTarget[], focus = true): Promise<ValidationResult> {
  const outcomes = await Promise.all(targets.map((target) => target.validate()));
  const invalid = targets.filter((_, i) => !outcomes[i]).sort(inTreeOrder);
  if (focus) invalid.find((target) => target.focus());
  return { valid: !invalid.length, invalid };
}
