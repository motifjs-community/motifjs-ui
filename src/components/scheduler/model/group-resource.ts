/** A resource item at one level of a group (the room, then the person). */
export interface GroupResource {
  /** The appointment field of its kind. */
  field: string;
  value: unknown;
  item: unknown;
  text: string;
  color: string;
}
