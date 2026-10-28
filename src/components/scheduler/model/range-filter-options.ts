/** What else `rangeFilter` keeps to. */
export interface RangeFilterOptions {
  /**
   * Resource fields and the values shown of each (`{ roomId: [1, 2] }`): only appointments with one
   * of them come. For fields that hold one value; a field holding a list cannot be asked this way.
   */
  resources?: Record<string, readonly unknown[]>;
}
