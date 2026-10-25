/** Anything a `ValidationGroup` can check. */
export interface ValidationTarget {
  validate(): Promise<boolean>;
  resetValidation(): void;
  readonly isValid: boolean;
  focus(): boolean;
  readonly element: Element;
}
