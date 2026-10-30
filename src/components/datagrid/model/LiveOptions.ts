import { reactive, untracked } from '@motifx/core';

/**
 * Options of any name, kept as given (an array or an object comes back as it is). `view` reads and
 * assigns them; a read is followed through one counter, which grows when a value is assigned.
 */
export class LiveOptions<T extends object> {
  readonly view: T;
  private readonly raw: Record<PropertyKey, unknown> = {};
  /** Called when the state changed (the grid tells its views). */
  notify: ((name: string) => void) | null = null;
  private tell() {
    this.notify?.('live');
  }
  private readonly version = reactive({ n: 0 });

  constructor(given: object | undefined) {
    if (given) untracked(() => Object.assign(this.raw, given));
    const raw = this.raw;
    this.view = new Proxy({} as T, {
      get: (_target, key) => {
        void this.version.n;
        return raw[key];
      },
      set: (_target, key, value) => {
        raw[key] = value;
        this.touch();
        return true;
      },
      deleteProperty: (_target, key) => {
        delete raw[key];
        this.touch();
        return true;
      },
      has: (_target, key) => {
        void this.version.n;
        return key in raw;
      },
      ownKeys: () => {
        void this.version.n;
        return Reflect.ownKeys(raw);
      },
      getOwnPropertyDescriptor: (_target, key) => (Object.hasOwn(raw, key) ? { enumerable: true, configurable: true, writable: true, value: raw[key] } : undefined),
    });
  }

  /** What reads the options reads them again: a value was changed in place. */
  touch() {
    untracked(() => this.version.n++);
    this.tell();
  }
}
