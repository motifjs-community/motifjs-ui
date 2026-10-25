import { reactive } from '@motifx/core';

/**
 * Named values that are each a plain value or a function that is followed (a function without
 * parameters is a getter; one with parameters is kept as the value). `get` reads one, tracked, and
 * falls back to the defaults; `view` is an object whose fields read and assign them, so
 * `grid.settings.striped = () => state.zebra` binds and `grid.settings.striped = true` sets.
 */
export class Switches<T extends object> {
  readonly view: T;
  private readonly raw: Record<string, unknown>;

  constructor(
    private readonly keys: readonly (keyof T & string)[],
    private readonly defaults: Partial<T> = {},
    given: object = {},
  ) {
    const raw: Record<string, unknown> = {};
    for (const key of keys) raw[key] = (given as Record<string, unknown>)[key];
    this.raw = reactive(raw);
    const names = new Set<string>(keys);
    this.view = new Proxy({} as T, {
      get: (_target, key) => (typeof key === 'string' && names.has(key) ? this.get(key as keyof T & string) : undefined),
      set: (_target, key, value) => {
        if (typeof key !== 'string' || !names.has(key)) return false;
        this.raw[key] = value;
        return true;
      },
      has: (_target, key) => typeof key === 'string' && names.has(key),
      ownKeys: () => [...keys],
      getOwnPropertyDescriptor: (_target, key) =>
        typeof key === 'string' && names.has(key) ? { enumerable: true, configurable: true, writable: true, value: this.get(key as keyof T & string) } : undefined,
    });
  }

  /** The value, or the default while none is set. */
  get<K extends keyof T & string>(key: K): T[K] {
    const own = this.own(key);
    return own === undefined ? (this.defaults[key] as T[K]) : own;
  }

  /** The value set for this key, without the default. */
  own<K extends keyof T & string>(key: K): T[K] | undefined {
    const value = this.raw[key];
    return (typeof value === 'function' && value.length === 0 ? value() : value) as T[K] | undefined;
  }
}
