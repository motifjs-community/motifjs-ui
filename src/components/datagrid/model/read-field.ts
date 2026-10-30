import { givenField } from '../../../core/given-field';

type ValueOf<F> = F extends (...args: never[]) => infer V ? V : F;

/** A field of an object the developer gave, read untracked (`givenField`), typed: a `Bind<V>` field gives `V`. */
export function readField<O extends object, K extends keyof O>(owner: O, key: K): ValueOf<O[K]>;
export function readField<O extends object, K extends keyof O>(owner: O | null | undefined, key: K): ValueOf<O[K]> | undefined;
export function readField<O extends object, K extends keyof O>(owner: O | null | undefined, key: K): ValueOf<O[K]> | undefined {
  return givenField<ValueOf<O[K]> | undefined>(owner, key);
}
