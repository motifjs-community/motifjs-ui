import type { Bind, ComponentBase } from '@motifx/core';
import type { ButtonProps } from '../button/button-props';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { FormEditorFactory } from './form-editor-factory';
import type { FormEditorType } from './form-editor-type';
import type { FormTab } from './form-tab';
import type { FormTemplateContext } from './form-template-context';

/**
 * One entry of a form: a field of the data object with its editor, a group of items under a
 * caption, tabs of items, a button, or any custom component.
 */
export interface FormItem {
  /** The property of the data object that the editor displays and changes. */
  field?: string;
  label?: Bind<string>;
  /**
   * The editor, by name, or by the type of the value when omitted. A function creates the editor from
   * the props a named editor receives (`label`, `value`, `onValueChanged`, `validationGroup`, `rules` …),
   * so any component that accepts them can be an editor.
   */
  editor?: FormEditorType | FormEditorFactory;
  /** The editor's props: `items`, `min`, `mask`… */
  editorProps?: Record<string, unknown>;
  required?: Bind<boolean>;
  rules?: Bind<readonly ValidationRule[]>;
  helpText?: Bind<string>;
  /** The number of columns it spans. Use `'all'` for the whole row. */
  colSpan?: number | 'all';
  visible?: Bind<boolean>;
  enabled?: Bind<boolean>;
  readOnly?: Bind<boolean>;
  /** A caption over `items`, which are laid out on their own `columns`. */
  group?: Bind<string>;
  items?: readonly FormItem[];
  columns?: number;
  /** Tabs, each with its own items, all of which are validated with the form. */
  tabs?: readonly FormTab[];
  /** A button. `submit` submits the form once it passes validation. */
  button?: ButtonProps & { submit?: boolean };
  /** Any component, created for this item with the form's data, the item's field and its validation group. */
  template?: (context: FormTemplateContext) => ComponentBase;
}
