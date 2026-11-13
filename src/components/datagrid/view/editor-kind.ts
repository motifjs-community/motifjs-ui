/** Which editor a cell gets: by the column type, a lookup's, a list's (`multiple`: a `TagBox`), or the column's own. */
export type EditorKind = 'text' | 'number' | 'date' | 'boolean' | 'list' | 'lookup' | 'tags' | 'custom';
