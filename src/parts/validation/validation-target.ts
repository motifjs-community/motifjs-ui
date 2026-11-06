/** Anything a `ValidationGroup` can validate. */
export interface ValidationTarget {
  validate(): Promise<boolean>;
  resetValidation(): void;
  readonly isValid: boolean;
  focus(): boolean;
  readonly element: Element;
}
