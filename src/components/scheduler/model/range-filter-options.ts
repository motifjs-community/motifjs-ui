/** The additional conditions of `rangeFilter`. */
export interface RangeFilterOptions {
  /**
   * Resource fields and the values displayed for each (`{ roomId: [1, 2] }`). Only appointments with
   * one of those values are requested. This applies to single-value fields, not to fields that hold a list.
   */
  resources?: Record<string, readonly unknown[]>;
}
