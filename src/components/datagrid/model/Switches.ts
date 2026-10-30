import { reactive, untracked } from '@motifx/core';
import { givenValue } from '../../../core/given-field';

/**
 * Named values that are each a plain value or a function that is followed (a function without
 * parameters is a getter; one with parameters is kept as the value). `get` reads one, tracked, and
 * falls back to the defaults; `view` is an object whose fields read and assign them, so
 * `grid.settings.striped = () => state.zebra` binds and `grid.settings.striped = true` sets.
 *
 * The values are kept as given (an array or an object comes back as it is); a value is followed
 * through its own counter, which grows when a new value is assigned.
 */
export class Switches<T extends object> {
  readonly view: T;
  /** Called after a value is assigned through `view`, with the value read before and after. */
  changed: ((key: keyof T & string, value: unknown, previous: unknown) => void) | null = null;
  private readonly raw: Record<string, unknown> = {};
  private readonly versions: Record<string, number>;

  constructor(
    private readonly keys: readonly (keyof T & string)[],
    private readonly defaults: Partial<T> = {},
    given: object = {},
  ) {
    const versions: Record<string, number> = {};
    for (const key of keys) {
      this.raw[key] = givenValue(given, key);
      versions[key] = 0;
    }
    this.versions = reactive(versions);
    const names = new Set<string>(keys);
    this.view = new Proxy({} as T, {
      get: (_target, key) => (typeof key === 'string' && names.has(key) ? this.get(key as keyof T & string) : undefined),
      set: (_target, key, value) => {
        if (typeof key !== 'string' || !names.has(key)) return false;
        const name = key as keyof T & string;
        const changed = this.changed;
        const previous = changed ? untracked(() => this.get(name)) : undefined;
        this.raw[key] = value;
        this.touch(name);
        if (changed) untracked(() => changed(name, this.get(name), previous));
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
    void this.versions[key];
    const value = this.raw[key];
    return (typeof value === 'function' && value.length === 0 ? value() : value) as T[K] | undefined;
  }

  /** What reads `key` reads it again: its value was changed in place. */
  touch(key: keyof T & string) {
    untracked(() => this.versions[key]++);
  }

  /** What reads any value reads it again. */
  touchAll() {
    for (const key of this.keys) this.touch(key);
  }
}
