/** What an editor holds: a value, or the message of text it cannot read. */
export type EditorValue = { ok: true; value: unknown } | { ok: false; message: string };
