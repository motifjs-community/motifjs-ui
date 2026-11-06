import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { GridValidationCallbackArgs } from './grid-validation-callback-args';

/**
 * One validation rule for a column's value. Without a `message`, the text comes from `uiLocale`.
 * `ignoreEmptyValue` lets an empty value pass (by default, `true` for `numeric`, `range`, `pattern` and
 * `email`, and `false` for the others). `reevaluate` runs the rule on every validation of the row, not
 * only when the value changes (by default, `true` for `async`, and `false` for the others). The rules
 * run in order, with the `async` rules last and together. The first that fails provides the message.
 */
export type GridValidationRule<T = any> =
  | { type: 'required'; message?: Bind<string>; trim?: boolean }
  | { type: 'numeric'; message?: Bind<string>; ignoreEmptyValue?: boolean }
  | { type: 'range'; min?: Bind<number | Date>; max?: Bind<number | Date>; message?: Bind<string>; ignoreEmptyValue?: boolean; reevaluate?: boolean }
  | { type: 'stringLength'; min?: Bind<number>; max?: Bind<number>; trim?: boolean; message?: Bind<string>; ignoreEmptyValue?: boolean }
  /** A string pattern is found anywhere in the value, as `new RegExp(pattern)` would. */
  | { type: 'pattern'; pattern: Bind<RegExp | string>; message?: Bind<string>; ignoreEmptyValue?: boolean }
  | { type: 'email'; message?: Bind<string>; ignoreEmptyValue?: boolean }
  /**
   * Compares the value with what `comparisonTarget` returns (for a repeated password,
   * `context.getValue('password')`). The default is `'=='`.
   */
  | {
      type: 'compare';
      comparisonTarget: (row: T, context: data.RowCheckContext<T>) => unknown;
      comparisonType?: '==' | '!=' | '===' | '!==' | '<' | '<=' | '>' | '>=';
      message?: Bind<string>;
      ignoreEmptyValue?: boolean;
    }
  /** `true` passes, `false` fails, and a string fails with that text. */
  | {
      type: 'custom';
      validationCallback: (e: GridValidationCallbackArgs<T>) => boolean | string | null | undefined | void;
      message?: Bind<string>;
      ignoreEmptyValue?: boolean;
      reevaluate?: boolean;
    }
  /**
   * Validated on the server. The promise resolves to `true` (or nothing), `false`, a message, or
   * `{ isValid, message }`, and a rejection fails with its message.
   */
  | {
      type: 'async';
      validationCallback: (e: GridValidationCallbackArgs<T>) => PromiseLike<boolean | string | { isValid: boolean; message?: string } | null | undefined | void>;
      message?: Bind<string>;
      ignoreEmptyValue?: boolean;
      reevaluate?: boolean;
    };
