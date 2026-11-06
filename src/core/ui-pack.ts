import type { UiStrings } from './ui-strings';

/** A language pack: all or some of a language's strings. The rest stay in the built-in language. */
export type UiPack = Partial<UiStrings>;
