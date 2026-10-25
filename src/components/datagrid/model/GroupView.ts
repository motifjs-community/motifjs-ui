import type { GroupItemEntry } from './group-item-entry';
import type { GroupNode } from './group-node';

/** A run of the list: one group's row or footer, or data rows `from` to `to - 1` (in group order). */
interface Run {
  at: number;
  node: GroupNode | null;
  footer: boolean;
  from: number;
  to: number;
}

/**
 * The grouped rows as one list, the way they show: each group's row, then, while it is expanded,
 * its groups or its rows, and its footer row when there are `footers`. A collapsed group stands for
 * all of its rows with its own row only. The list is kept as runs, so finding a place is a binary
 * search however many rows there are.
 */
export class GroupView {
  /** Places in the list. */
  readonly size: number;
  private readonly runs: Run[] = [];
  /** The runs of data rows, in data order. */
  private readonly rowRuns: Run[] = [];
  private readonly placeOf = new Map<string, number>();
  private readonly footerPlaceOf = new Map<string, number>();

  constructor(
    readonly roots: readonly GroupNode[],
    readonly expanded: (node: GroupNode) => boolean,
    readonly footers = false,
  ) {
    let at = 0;
    const walk = (nodes: readonly GroupNode[]) => {
      for (const node of nodes) {
        this.runs.push({ at, node, footer: false, from: -1, to: -1 });
        this.placeOf.set(node.id, at);
        at++;
        if (!expanded(node)) continue;
        if (node.children) walk(node.children);
        else if (node.count > 0) {
          const run = { at, node: null, footer: false, from: node.start, to: node.start + node.count };
          this.runs.push(run);
          this.rowRuns.push(run);
          at += node.count;
        }
        if (footers) {
          this.footerPlaceOf.set(node.id, at);
          this.runs.push({ at: at++, node, footer: true, from: -1, to: -1 });
        }
      }
    };
    walk(roots);
    this.size = at;
  }

  /** Rows in every group. */
  get rowCount(): number {
    let n = 0;
    for (const node of this.roots) n += node.count;
    return n;
  }

  /** What sits at place `i`, or `null` past the end. */
  itemAt(i: number): GroupItemEntry | null {
    if (i < 0 || i >= this.size) return null;
    const run = this.runs[this.runAt(i)];
    return run.node ? { node: run.node, data: -1, footer: run.footer } : { node: null, data: run.from + i - run.at, footer: false };
  }

  /** The place of a data row, or -1 while a collapsed group hides it. */
  placeOfRow(d: number): number {
    let lo = 0;
    let hi = this.rowRuns.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const run = this.rowRuns[mid];
      if (d < run.from) hi = mid - 1;
      else if (d >= run.to) lo = mid + 1;
      else return run.at + d - run.from;
    }
    return -1;
  }

  /** The place of a group's row, or -1 while a collapsed group above hides it. */
  placeOfGroup(id: string): number {
    return this.placeOf.get(id) ?? -1;
  }

  /** The place of a group's footer, or -1 while it does not show. */
  placeOfFooter(id: string): number {
    return this.footerPlaceOf.get(id) ?? -1;
  }

  /** The groups a data row is in, from the top level down. */
  groupsOfRow(d: number): GroupNode[] {
    const out: GroupNode[] = [];
    let nodes: readonly GroupNode[] | null = this.roots;
    while (nodes) {
      const node: GroupNode | undefined = nodes.find((n) => d >= n.start && d < n.start + n.count);
      if (!node) break;
      out.push(node);
      nodes = node.children;
    }
    return out;
  }

  /** Where a data row shows: its own place, else the row of the collapsed group that hides it. */
  shownPlaceOfRow(d: number): number {
    const own = this.placeOfRow(d);
    if (own >= 0) return own;
    for (const node of this.groupsOfRow(d)) if (!this.expanded(node)) return this.placeOfGroup(node.id);
    return -1;
  }

  /** The data rows shown at places `first` to `end - 1`, as runs `[from, to)`. */
  rowsBetween(first: number, end: number): [number, number][] {
    const out: [number, number][] = [];
    if (end <= first || !this.runs.length) return out;
    for (let r = this.runAt(Math.max(0, first)); r < this.runs.length; r++) {
      const run = this.runs[r];
      if (run.at >= end) break;
      if (run.node) continue;
      const from = run.from + Math.max(0, first - run.at);
      const to = run.from + Math.min(run.to - run.from, end - run.at);
      if (to > from) out.push([from, to]);
    }
    return out;
  }

  /** Every group, in order, levels below included. */
  allGroups(): GroupNode[] {
    const out: GroupNode[] = [];
    const walk = (nodes: readonly GroupNode[]) => {
      for (const node of nodes) {
        out.push(node);
        if (node.children) walk(node.children);
      }
    };
    walk(this.roots);
    return out;
  }

  private runAt(i: number): number {
    let lo = 0;
    let hi = this.runs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.runs[mid].at <= i) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
}
