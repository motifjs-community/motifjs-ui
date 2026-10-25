import type { Bind } from '@motifx/core';

/**
 * One check of a value. Without a `message` the text comes from `uiLocale`. Empty values pass
 * every rule except `required` and `compare`.
 */
export type ValidationRule<T = unknown> =
  | { type: 'required'; message?: Bind<string>; enabled?: Bind<boolean> }
  | { type: 'email'; message?: Bind<string>; enabled?: Bind<boolean> }
  | { type: 'url'; message?: Bind<string>; enabled?: Bind<boolean> }
  /** A string pattern must match the whole value, like the HTML `pattern` attribute. */
  | { type: 'pattern'; pattern: Bind<RegExp | string>; message?: Bind<string>; enabled?: Bind<boolean> }
  | { type: 'length'; min?: Bind<number>; max?: Bind<number>; message?: Bind<string>; enabled?: Bind<boolean> }
  | { type: 'range'; min?: Bind<number | Date>; max?: Bind<number | Date>; message?: Bind<string>; enabled?: Bind<boolean> }
  /** Equal to another value (a repeated password); with `not`, different from it. */
  | { type: 'compare'; with: () => unknown; not?: Bind<boolean>; message?: Bind<string>; enabled?: Bind<boolean> }
  /** `true` or nothing passes, `false` fails, a string fails with that text. May be async. */
  | {
      type: 'custom';
      check: (value: T) => CheckResult | Promise<CheckResult>;
      ignoreEmpty?: Bind<boolean>;
      message?: Bind<string>;
      enabled?: Bind<boolean>;
    };

type CheckResult = boolean | string | null | undefined | void;
