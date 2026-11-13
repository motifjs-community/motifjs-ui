import type { ComponentBase } from '@motifx/core';

/** Anything a `ValidationGroup` can validate. */
export interface ValidationTarget {
  validate(): Promise<boolean>;
  resetValidation(): void;
  readonly isValid: boolean;
  focus(): boolean;
  /** The component that stands for the target: its place in the tree orders the failed ones, its `aria-label` names one with no `label`. A field is its own. */
  readonly part: ComponentBase;
}
