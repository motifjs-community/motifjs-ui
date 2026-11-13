/** A control text with its access key: `&Dosya` → text `Dosya`, key `D` at index 0. */
export interface ParsedAccessKey {
  /** The text without the marker (`&&` becomes `&`). */
  text: string;
  /** The access key as written (`D`), or `null` when the text has none. */
  key: string | null;
  /** The index of the access key in `text`, or -1 if there is none. */
  index: number;
}
