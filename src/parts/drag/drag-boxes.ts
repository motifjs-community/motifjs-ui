import type { ComponentBase } from '@motifx/core';
import { componentAt, onLayout, sameWindow, visibleRectOf, type HitCover, type Point, type Rect } from '../../core/measure';

/**
 * The boxes a drag aims at, kept while it lasts: the parts of its candidates on the screen, and of what may cover them,
 * read together the first time they are asked for (in a read, or at the press before anything is written) and again
 * only after something moved them: a scroll or a resize in a window that holds a candidate, or a write of the drag's own
 * (`moved`). Pointer moves answer from them.
 */
export class DragBoxes {
  private readonly rects = new Map<ComponentBase, Rect | null>();
  /** For each candidate, the candidate standing for its window: one per window, watched for scrolls and resizes there. */
  private readonly homes = new Map<ComponentBase, ComponentBase>();
  private readonly windows: ComponentBase[] = [];
  private readonly stops: (() => void)[] = [];
  private fresh = false;

  /**
   * `candidates`: front first, from every window the drag may aim into. `cover`: what may lie over them in the window of
   * a point (`stackCover`), when something can.
   */
  constructor(
    private readonly owner: ComponentBase,
    private readonly candidates: () => readonly ComponentBase[],
    private readonly cover?: (space: ComponentBase) => HitCover,
  ) {}

  /** The drag wrote something that moved them: they are read again when next asked for. */
  moved(): void {
    this.fresh = false;
  }

  /** The front candidate whose part on the screen holds `point`; with `space` (a component of the window the point is in), only that window's. */
  at(point: Point, space?: ComponentBase): ComponentBase | null {
    const list = this.candidates();
    this.read(list);
    const home = space ? (this.windows.find((each) => sameWindow(each, space)) ?? null) : undefined;
    const aimed = home === undefined ? list : list.filter((candidate) => this.homes.get(candidate) === home);
    return componentAt(point, aimed, { cover: space && this.cover ? this.cover(space) : undefined, rects: (component) => this.rectOf(component) });
  }

  /** The kept part of a candidate (or of a surface over them) on the screen, or null when none of it shows. */
  rectOf(component: ComponentBase): Rect | null {
    if (!this.fresh) this.read(this.candidates());
    if (!this.rects.has(component)) this.rects.set(component, visibleRectOf(component));
    return this.rects.get(component) ?? null;
  }

  stop(): void {
    for (const stop of this.stops.splice(0)) stop();
    this.rects.clear();
    this.homes.clear();
    this.windows.length = 0;
  }

  private read(list: readonly ComponentBase[]): void {
    for (const candidate of list) if (!this.homes.has(candidate)) this.homes.set(candidate, this.homeOf(candidate));
    if (this.fresh) return;
    this.rects.clear();
    for (const candidate of list) this.rects.set(candidate, visibleRectOf(candidate));
    this.fresh = true;
  }

  private homeOf(candidate: ComponentBase): ComponentBase {
    const known = this.windows.find((each) => sameWindow(each, candidate));
    if (known) return known;
    this.windows.push(candidate);
    const moved = () => this.moved();
    this.stops.push(onLayout(candidate, 'scroll', moved, { owner: this.owner }), onLayout(candidate, 'page', moved, { owner: this.owner }));
    return candidate;
  }
}
