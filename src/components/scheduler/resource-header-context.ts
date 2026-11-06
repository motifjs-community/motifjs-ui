/** The context of a resource header template: the item a group header represents. */
export interface ResourceHeaderContext {
  /** The appointment field of its resource type. `label` holds the type's name. */
  field: string;
  label: string;
  value: unknown;
  /** The resource item itself, or `undefined` when only its value is known. */
  item: unknown;
  text: string;
  color: string;
  /** Its level in the groups, starting from 0 for the outermost. */
  level: number;
  /** The values of its group down to this level, by field. */
  values: Record<string, unknown>;
  /** With `groupByDate`, the date it appears under. Otherwise `null`. */
  date: Date | null;
}
