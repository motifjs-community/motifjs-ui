/** What a resource header template gets: the item a group head stands for. */
export interface ResourceHeaderContext {
  /** The appointment field of its kind, and the kind's name. */
  field: string;
  label: string;
  value: unknown;
  /** The resource item itself (`undefined` when only its value is known). */
  item: unknown;
  text: string;
  color: string;
  /** Its level in the groups, from 0 (the outermost). */
  level: number;
  /** The values of its group down to it, by field. */
  values: Record<string, unknown>;
  /** Under `groupByDate`, the date it stands under; otherwise `null`. */
  date: Date | null;
}
