/** Where an item stores its text or value: a property name or a function. */
export type ItemField<T> = string | ((item: T) => unknown);
