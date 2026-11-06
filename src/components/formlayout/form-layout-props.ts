import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { ValidationResult } from '../../parts/validation/validation-result';
import type { FormItem } from './form-item';

/** Props of `FormLayout`. Each prop is also a settable, reactive property. */
export interface FormLayoutProps<T extends object> extends ControlProps {
  /** The object the editors show and change, usually a reactive one. */
  data?: Bind<T | null>;
  items?: Bind<readonly FormItem[]>;
  /** Default `1`. */
  columns?: Bind<number>;
  /** With it, as many columns as fit, each at least this wide (a CSS length); `columns` is the most. */
  minColumnWidth?: Bind<string>;
  /** Passed to every editor. Default `'top'`. */
  labelMode?: Bind<FieldLabelMode>;
  readOnly?: Bind<boolean>;
  /** The form was sent and every field passed. */
  onValidSubmit?: (e: { data: T | null; event: Event }) => void;
  /** After the user changed a field and its value was written into the data object: the place to show what follows from it (`refresh()`). */
  onFieldChanged?: (e: { field: string; value: unknown; data: T }) => void;
  /** The form was sent and a field failed. */
  onInvalidSubmit?: (e: ValidationResult) => void;
}
