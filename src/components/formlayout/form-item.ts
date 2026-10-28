import type { Bind, ComponentBase } from '@motifx/core';
import type { ButtonProps } from '../button/button-props';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { FormEditorFactory } from './form-editor-factory';
import type { FormEditorType } from './form-editor-type';
import type { FormTab } from './form-tab';
import type { FormTemplateContext } from './form-template-context';

/**
 * One place of a form: a field of the data object with its editor, a group of items under a
 * caption, tabs of items, a button, or any component of your own.
 */
export interface FormItem {
  /** The property of the data object the editor shows and changes. */
  field?: string;
  label?: Bind<string>;
  /**
   * By name, or by the type of the value when left out. A function makes the editor from the props
   * a named one gets (`label`, `value`, `onValueChanged`, `validationGroup`, `rules` …): any
   * component that takes them is an editor.
   */
  editor?: FormEditorType | FormEditorFactory;
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
  /** Tabs, each with items of its own (they all count when the form is checked). */
  tabs?: readonly FormTab[];
  /** A button; `submit` sends the form after it passes its checks. */
  button?: ButtonProps & { submit?: boolean };
  /** Any component, made for this place (with the form's data, the item's field and its check group). */
  template?: (context: FormTemplateContext) => ComponentBase;
}
