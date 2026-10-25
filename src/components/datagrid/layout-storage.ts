/** Where the layout of a grid with `layoutKey` is kept: `localStorage` (default), `sessionStorage`, or your own. */
export interface LayoutStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
