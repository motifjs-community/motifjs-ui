import type { GroupResource } from './group-resource';

/** A resource item an appointment has, with the item itself (`undefined` when no item has its value). */
export interface ResourceEntry extends GroupResource {
  item: unknown;
}
