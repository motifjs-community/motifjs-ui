/** A document as `saveLayout` writes it. */
export interface TabLayoutDocument {
  id: string;
  type: string;
  title: string;
  state?: unknown;
  pinned?: boolean;
  preview?: boolean;
}
