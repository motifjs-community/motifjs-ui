/** A choice of the composer's menus, as the app names it: a way the model works ("Plan"), a model. */
export interface ChatOption {
  value: string;
  label: string;
  /** A dimmer line after the label. */
  description?: string;
}
