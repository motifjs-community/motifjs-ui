/**
 * What an item of a menu bar merged into another does there: joins the item with its key (`auto`, for an item with a
 * menu; otherwise it is added), is added beside it (`add`), takes its place (`replace`), hides it (`remove`), or stays
 * out (`none`).
 */
export type MenuItemMerge = 'auto' | 'add' | 'replace' | 'remove' | 'none';
