import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { ValidationResult } from '../../parts/validation/validation-result';
import type { FormItem } from './form-item';

/** Props of `FormLayout`. Each prop is also a settable, reactive property. */
export interface FormLayoutProps<T extends object> extends ControlProps {
  /** The object the editors display and change, usually a reactive one. */
  data?: Bind<T | null>;
  items?: Bind<readonly FormItem[]>;
  /** The number of grid columns. The default is `1`. */
  columns?: Bind<number>;
  /** As many columns as fit, each at least this wide (a CSS length). `columns` sets the maximum. */
  minColumnWidth?: Bind<string>;
  /** Passed to every editor. The default is `'top'`. */
  labelMode?: Bind<FieldLabelMode>;
  readOnly?: Bind<boolean>;
  /** Occurs when the form is submitted and every field is valid. */
  onValidSubmit?: (e: { data: T | null; event: Event }) => void;
  /**
   * Occurs after the user changes a field and its value is written to the data object. This is where to
   * show what depends on it (`refresh()`).
   */
  onFieldChanged?: (e: { field: string; value: unknown; data: T }) => void;
  /** Occurs when the form is submitted and a field is invalid. */
  onInvalidSubmit?: (e: ValidationResult) => void;
}
