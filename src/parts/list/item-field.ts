/** Where an item keeps something (its text, its value): a property name or a function. */
export type ItemField<T> = string | ((item: T) => unknown);
