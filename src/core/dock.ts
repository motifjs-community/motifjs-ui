/**
 * Where a child goes in a container that docks:
 * - `top` / `bottom` / `start` / `end`: sticks to that edge of what is left
 *   of the container, full length, its own size across. `start` / `end`
 *   follow the reading direction (`start` is the left in LTR, the right in RTL);
 * - `fill`: takes what is left;
 * - `float`: positioned freely in the container with `left` / `top` /
 *   `right` / `bottom` (the edges given are the ones it stays anchored to);
 * - `none`: normal flow (the default). In a container that docks, flow
 *   children go into the remaining area.
 */
export type Dock = 'none' | 'top' | 'bottom' | 'start' | 'end' | 'fill' | 'float';

// A dock host is an element whose children may dock (a Panel, the content of
// a GroupBox, a SplitContainer panel). Docking is laid out by CSS grid: each
// docked child takes the next row or column at its edge, in document order,
// and the browser sizes everything. Script runs only when the set of children
// or a child's dock changes, never on resize.

const hosts = new WeakMap<Element, DockHost>();

/** The dock host of `el`, if it is one. */
export function dockHostOf(el: Element | null | undefined): DockHost | undefined {
  return el ? hosts.get(el) : undefined;
}

type Area = [rowStart: number, rowEnd: number, colStart: number, colEnd: number];

export class DockHost {
  private observer: MutationObserver | null = null;
  private scheduled = false;
  /** Children this host gave a grid area, to clear when they leave or stop docking. */
  private placed = new Set<HTMLElement>();

  constructor(readonly element: HTMLElement) {
    hosts.set(element, this);
    this.observer = new MutationObserver((records) => {
      // Children added or removed, or a child's own data-dock changed.
      if (records.some((r) => r.type === 'childList' || (r.target as Element).parentElement === element)) this.schedule();
    });
    this.observer.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-dock'] });
    this.schedule();
  }

  /** Lays the children out again on the next microtask (calls in between merge). */
  schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      this.layout();
    });
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  /** Applies the dock layout now. */
  layout(): void {
    const host = this.element;
    // A fieldset's <legend> is drawn in its border, outside the layout.
    const children = (Array.from(host.children) as HTMLElement[]).filter((el) => el.tagName !== 'LEGEND');
    const dockOf = (el: Element) => el.getAttribute('data-dock') ?? 'none';
    const count = { top: 0, bottom: 0, start: 0, end: 0 };
    let anyDock = false;
    for (const el of children) {
      const d = dockOf(el);
      if (d in count) count[d as keyof typeof count]++;
      if (d !== 'none' && d !== 'float') anyDock = true;
    }

    for (const el of this.placed) {
      if (el.parentElement !== host || !anyDock) this.clear(el);
    }
    if (!anyDock) {
      host.removeAttribute('data-mx-docking');
      host.style.removeProperty('grid-template-rows');
      host.style.removeProperty('grid-template-columns');
      return;
    }

    host.setAttribute('data-mx-docking', '');
    host.style.gridTemplateRows = tracks(count.top, count.bottom);
    host.style.gridTemplateColumns = tracks(count.start, count.end);

    // The remaining rectangle, in grid lines.
    // Grid columns follow the reading direction, so start/end mirror in RTL by themselves.
    let [r0, r1, c0, c1] = [1, count.top + count.bottom + 2, 1, count.start + count.end + 2];
    const center: Area = [count.top + 1, count.top + 2, count.start + 1, count.start + 2];
    for (const el of children) {
      const d = dockOf(el);
      let area: Area | null;
      if (d === 'top') area = [r0, ++r0, c0, c1];
      else if (d === 'bottom') area = [--r1, r1 + 1, c0, c1];
      else if (d === 'start') area = [r0, r1, c0, ++c0];
      else if (d === 'end') area = [r0, r1, --c1, c1 + 1];
      else if (d === 'fill') area = [r0, r1, c0, c1];
      else if (d === 'float') area = null;
      else area = center;
      if (!area) {
        this.clear(el);
        continue;
      }
      el.style.gridRow = `${area[0]} / ${area[1]}`;
      el.style.gridColumn = `${area[2]} / ${area[3]}`;
      this.placed.add(el);
    }
  }

  private clear(el: HTMLElement): void {
    el.style.removeProperty('grid-row');
    el.style.removeProperty('grid-column');
    this.placed.delete(el);
  }
}

/** `auto` tracks for the docked edges around a flexible middle. */
function tracks(start: number, end: number): string {
  return [...Array(start).fill('auto'), 'minmax(0, 1fr)', ...Array(end).fill('auto')].join(' ');
}
