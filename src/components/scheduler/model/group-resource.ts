/** A resource item at one level of a group (the room, then the person): its value, name and color; the item itself is its kind's `find(value)`. */
export interface GroupResource {
  /** The appointment field of its kind. */
  field: string;
  value: unknown;
  text: string;
  color: string;
}
