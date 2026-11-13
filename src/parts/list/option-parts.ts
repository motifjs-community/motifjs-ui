import type { ComponentBase } from '@motifx/core';

/** An option the list drew, by its parts: for an owner that marks an option itself, such as a "Select all" row. */
export interface OptionParts {
  /** The option (`role="option"`). */
  readonly row: ComponentBase<HTMLElement>;
  /** Where the option's text or the owner's template goes. */
  readonly text: ComponentBase<HTMLElement>;
  /** In a list of several choices the check mark's glyph (`data-icon="check"`), else `null`. */
  readonly check: ComponentBase<HTMLElement> | null;
}
