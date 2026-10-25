import type { ValidationResult } from './validation-result';
import type { ValidationTarget } from './validation-target';

export async function validateTargets(targets: readonly ValidationTarget[], focus = true): Promise<ValidationResult> {
  const outcomes = await Promise.all(targets.map((target) => target.validate()));
  const invalid = targets
    .filter((_, i) => !outcomes[i])
    .sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  if (focus) invalid.find((target) => target.focus());
  return { valid: !invalid.length, invalid };
}
