/** Where the layout of a grid with `layoutKey` is saved: `localStorage` (the default), `sessionStorage`, or a custom store. */
export interface LayoutStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
