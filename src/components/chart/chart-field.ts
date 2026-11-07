/** The field of a row that holds a value, or a function that reads it. */
export type ChartField<T> = (keyof T & string) | ((row: T) => unknown);
