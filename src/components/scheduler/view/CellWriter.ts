import { untracked, type ComponentBase } from '@motifx/core';
import { CellAttributes } from './CellAttributes';

/**
 * The cells of a big grid, written once when they are created and again only when what they show changes: a cell
 * has no bindings of its own (thousands of them would each follow the same few values), the view calls `writeLook`
 * or `writeFocus` from one watch of those values, and listens once for all its cells (`placeOf`).
 */
export class CellWriter<K> {
  private readonly cells = new Map<number, { key: K; c: ComponentBase }>();

  constructor(
    /** Writes what the cell shows: its place, its day and time, its words. */
    private readonly look: (key: K, cell: CellAttributes) => void,
    /** Writes whether the keys are on the cell and whether it is selected. */
    private readonly focus: (key: K, cell: CellAttributes) => void,
  ) {}

  /** A cell was created: written at once. */
  add(id: number, key: K, c: ComponentBase): void {
    untracked(() => {
      this.cells.set(id, { key, c });
      const cell = new CellAttributes(c);
      this.look(key, cell);
      this.focus(key, cell);
    });
  }

  /** Every cell went (they are recreated). */
  clear(): void {
    this.cells.clear();
  }

  /** A cell went: let go of it (not of another made for the same place since). */
  delete(id: number, c: ComponentBase): void {
    if (this.cells.get(id)?.c === c) this.cells.delete(id);
  }

  /** Every cell's key, to see which show something else now (`write` them). */
  forEach(fn: (key: K, id: number) => void): void {
    untracked(() => this.cells.forEach(({ key }, id) => fn(key, id)));
  }

  /** Every cell with its key, as it is now (another cell template fills the same cells again). */
  each(fn: (key: K, c: ComponentBase) => void): void {
    untracked(() => this.cells.forEach(({ key, c }) => fn(key, c)));
  }

  /** A cell again, all of it: its key shows something else now. */
  write(id: number): void {
    const cell = this.cells.get(id);
    if (!cell) return;
    untracked(() => {
      const attributes = new CellAttributes(cell.c);
      this.look(cell.key, attributes);
      this.focus(cell.key, attributes);
    });
  }

  writeLook(): void {
    untracked(() => this.cells.forEach(({ key, c }) => this.look(key, new CellAttributes(c))));
  }

  /** The focus and the selection again: of every cell, or (`ids`) of those only. */
  writeFocus(ids?: Iterable<number>): void {
    untracked(() => {
      if (!ids) return this.cells.forEach(({ key, c }) => this.focus(key, new CellAttributes(c)));
      for (const id of ids) {
        const cell = this.cells.get(id);
        if (cell) this.focus(cell.key, new CellAttributes(cell.c));
      }
    });
  }

  /** The key of the first cell `test` picks. */
  find(test: (cell: ComponentBase) => boolean): K | undefined {
    for (const { key, c } of this.cells.values()) if (test(c)) return key;
    return undefined;
  }

  /** The cell an event is on: the cell itself or what it holds. */
  placeOf(e: Event): K | undefined {
    return this.find((cell) => cell.motif.isEventFrom(e));
  }
}
