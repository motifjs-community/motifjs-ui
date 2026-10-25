/** One place of a parsed mask: a fixed character or one the user types. */
export type MaskSlot = { literal: string } | { test: RegExp; optional: boolean; transform?: 'upper' | 'lower' };
