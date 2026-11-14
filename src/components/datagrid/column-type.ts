/**
 * How a column's values are compared, formatted and edited. `date` is a calendar day; `datetime` is a day and a time,
 * shown, edited and filtered to the minute.
 */
export type ColumnType = 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'list';
