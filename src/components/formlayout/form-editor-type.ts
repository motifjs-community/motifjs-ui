/** The editors a form knows by name. Register more with `FormLayout.editors`. */
export type FormEditorType =
  | 'text'
  | 'password'
  | 'email'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'time'
  | 'checkbox'
  | 'switch'
  | 'dropdown'
  | 'combobox'
  | 'lookup'
  | 'radio'
  | 'slider'
  | (string & {});
