import type { Bind } from '@motifx/core';
import type { GridValidationCallbackArgs } from './grid-validation-callback-args';

/**
 * One check of a column's value, the standard rule set. Without a `message` the text comes from
 * `uiLocale`. `ignoreEmptyValue` lets an empty value pass (default: `true` for `numeric`, `range`,
 * `pattern` and `email`, `false` for the others); `reevaluate` runs the rule on every check of the row,
 * not only when the value changed (default: `true` for `async`, `false` for the others). The
 * rules run in order, the `async` ones last and together; the first that fails gives the message.
 */
export type GridValidationRule<T = any> =
  | { type: 'required'; message?: Bind<string>; trim?: boolean }
  | { type: 'numeric'; message?: Bind<string>; ignoreEmptyValue?: boolean }
  | { type: 'range'; min?: Bind<number | Date>; max?: Bind<number | Date>; message?: Bind<string>; ignoreEmptyValue?: boolean; reevaluate?: boolean }
  | { type: 'stringLength'; min?: Bind<number>; max?: Bind<number>; trim?: boolean; message?: Bind<string>; ignoreEmptyValue?: boolean }
  /** A string pattern is found anywhere in the value, as `new RegExp(pattern)` would. */
  | { type: 'pattern'; pattern: Bind<RegExp | string>; message?: Bind<string>; ignoreEmptyValue?: boolean }
  | { type: 'email'; message?: Bind<string>; ignoreEmptyValue?: boolean }
  /** The value compared with what `comparisonTarget` returns (a repeated password). Default `'=='`. */
  | {
      type: 'compare';
      comparisonTarget: (row: T) => unknown;
      comparisonType?: '==' | '!=' | '===' | '!==' | '<' | '<=' | '>' | '>=';
      message?: Bind<string>;
      ignoreEmptyValue?: boolean;
    }
  /** `true` passes, `false` fails, a string fails with that text. */
  | {
      type: 'custom';
      validationCallback: (e: GridValidationCallbackArgs<T>) => boolean | string | null | undefined | void;
      message?: Bind<string>;
      ignoreEmptyValue?: boolean;
      reevaluate?: boolean;
    }
  /**
   * Checked on the server: the promise resolves to `true` (or nothing), `false`, a message, or
   * `{ isValid, message }`; a rejection fails with its message.
   */
  | {
      type: 'async';
      validationCallback: (e: GridValidationCallbackArgs<T>) => PromiseLike<boolean | string | { isValid: boolean; message?: string } | null | undefined | void>;
      message?: Bind<string>;
      ignoreEmptyValue?: boolean;
      reevaluate?: boolean;
    };
