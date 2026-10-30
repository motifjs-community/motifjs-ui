/**
 * What changed in the grid's own state, told by the parts that changed it and heard by the views once a turn: a view
 * draws again what the names concern. A name is a part of the state (`columns`, `selection`…), or for the grid's own
 * fields `grid.` and the field (`grid.activeRow`). Nothing is followed: a change is told where it is made.
 */
export class GridNotices {
  private readonly told = new Set<string>();
  private readonly listeners = new Set<(told: ReadonlySet<string>) => void>();
  private readonly first = new Set<(told: ReadonlySet<string>) => void>();
  private queued = false;

  /** Tells that `name` changed; the listeners hear it with the rest told in the same turn. */
  tell(name: string): void {
    this.told.add(name);
    if (this.queued) return;
    this.queued = true;
    queueMicrotask(() => this.flush());
  }

  /** Calls `listener` with the names told since the last time; returns the function that stops it. */
  on(listener: (told: ReadonlySet<string>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Calls `listener` before the others: for what the grid does about a change (loads again, lays out). What it tells
   * is heard in the same turn, so the views draw once, what came of it.
   */
  before(listener: (told: ReadonlySet<string>) => void): () => void {
    this.first.add(listener);
    return () => this.first.delete(listener);
  }

  /** Tells the listeners now what was told so far: for code that needs it drawn at once. */
  flush(): void {
    this.queued = false;
    if (!this.told.size) return;
    const told = new Set<string>();
    // A few rounds at most: what keeps telling is heard on the next turn.
    for (let round = 0; round < 8 && this.told.size; round++) {
      const now = new Set(this.told);
      this.told.clear();
      for (const name of now) told.add(name);
      for (const listener of [...this.first]) listener(now);
    }
    for (const name of this.told) told.add(name);
    this.told.clear();
    this.queued = false;
    for (const listener of [...this.listeners]) listener(told);
  }
}
