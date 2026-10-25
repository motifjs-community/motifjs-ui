import type { Bind, ComponentBase } from '@motifx/core';
import type { ButtonProps } from '../button/button-props';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { FormEditorType } from './form-editor-type';

/**
 * One place of a form: a field of the data object with its editor, a group of items under a
 * caption, a button, or any component of your own.
 */
export interface FormItem {
  /** The property of the data object the editor shows and changes. */
  field?: string;
  label?: Bind<string>;
  /** By name, or by the type of the value when left out. */
  editor?: FormEditorType;
  /** Props of the editor: `items`, `min`, `mask`… */
  editorProps?: Record<string, unknown>;
  required?: Bind<boolean>;
  rules?: Bind<readonly ValidationRule[]>;
  helpText?: Bind<string>;
  /** Columns it spans; `'all'` the whole row. */
  colSpan?: number | 'all';
  visible?: Bind<boolean>;
  enabled?: Bind<boolean>;
  readOnly?: Bind<boolean>;
  /** A caption over `items`, laid out on `columns` of its own. */
  group?: Bind<string>;
  items?: readonly FormItem[];
  columns?: number;
  /** A button; `submit` sends the form after it passes its checks. */
  button?: ButtonProps & { submit?: boolean };
  /** Any component, made for this place. */
  template?: () => ComponentBase;
}
