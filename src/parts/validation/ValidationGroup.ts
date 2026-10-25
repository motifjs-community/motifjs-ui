import { createSignal } from '@motifx/core';
import { validateTargets } from './validate-targets';
import type { ValidationResult } from './validation-result';
import type { ValidationTarget } from './validation-target';

/**
 * Fields checked together, e.g. the fields of one form.
 *
 * @example
 * const group = new ValidationGroup();
 * <TextBox label="Name" required validationGroup={group} />
 * <Button text="Save" onclick={async () => (await group.validate()).valid && this.save()} />
 */
export class ValidationGroup {
  private readonly members = new Set<ValidationTarget>();
  private readonly version = createSignal(0);

  /** Returns the function that removes it again. */
  add(target: ValidationTarget): () => void {
    this.members.add(target);
    this.changed();
    return () => this.remove(target);
  }

  remove(target: ValidationTarget): void {
    if (this.members.delete(target)) this.changed();
  }

  get targets(): readonly ValidationTarget[] {
    void this.version.value;
    return [...this.members];
  }

  get isValid(): boolean {
    return this.targets.every((target) => target.isValid);
  }

  /** Checks every member; the first one that failed gets focus unless `focus` is `false`. */
  validate(options: { focus?: boolean } = {}): Promise<ValidationResult> {
    return validateTargets(this.targets, options.focus !== false);
  }

  reset(): void {
    for (const target of this.members) target.resetValidation();
  }

  private changed(): void {
    this.version.value = this.version.peek() + 1;
  }
}
