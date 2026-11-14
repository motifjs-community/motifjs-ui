/**
 * Turns a key into the form in which keys are compared: keys equal once normalized are one key. For keys a source
 * compares its own way, said here so that items in memory follow the same rule and the source is spared the requests
 * that find it out: `(k) => (typeof k === 'string' ? k.trimEnd() : k)` for codes padded with spaces, `toLowerCase()` for
 * ids written in either case. Give one function wherever the same source is read, so they share one cache.
 */
export type NormalizeKey = (key: unknown) => unknown;
