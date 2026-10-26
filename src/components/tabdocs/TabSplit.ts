import { nextId } from '../../core/next-id';
import type { LayoutOrientation } from '../layout/layout-orientation';
import type { LayoutItem } from './layout-item';
import { placeNode } from './place-node';
import { SplitSash } from './SplitSash';
import type { TabDocumentManager } from './TabDocumentManager';
import { TabGroup } from './TabGroup';

/**
 * A branch of the layout: groups or other splits side by side (`horizontal`) or one under the
 * other, each with its share of the room, a splitter between each two.
 */
export class TabSplit {
  readonly element: HTMLDivElement;
  parentSplit: TabSplit | null = null;
  children: LayoutItem[] = [];
  /** One share per child, adding up to 1. */
  sizes: number[] = [];
  private readonly sashes: SplitSash[] = [];

  constructor(
    private readonly manager: TabDocumentManager,
    public orientation: LayoutOrientation,
  ) {
    this.element = manager.element.ownerDocument.createElement('div');
    this.element.className = 'mx-tabdocs__split';
    this.element.id = nextId('tabdocs-split');
  }

  get rtl(): boolean {
    const view = this.element.ownerDocument.defaultView;
    return !!view && view.getComputedStyle(this.element).direction === 'rtl';
  }

  sashIndex(sash: SplitSash): number {
    return this.sashes.indexOf(sash);
  }

  insert(child: LayoutItem, index: number, share = 1 / (this.children.length + 1)): void {
    const keep = 1 - share;
    this.sizes = this.sizes.map((s) => s * keep);
    this.children.splice(index, 0, child);
    this.sizes.splice(index, 0, this.children.length === 1 ? 1 : share);
    child.parentSplit = this;
  }

  /** Takes a child out; its room goes to the neighbour before it (after it, for the first). */
  remove(child: LayoutItem): void {
    const index = this.children.indexOf(child);
    if (index < 0) return;
    const [share] = this.sizes.splice(index, 1);
    this.children.splice(index, 1);
    if (this.children.length) this.sizes[Math.max(0, index - 1)] += share;
    child.parentSplit = null;
  }

  replace(child: LayoutItem, next: LayoutItem): void {
    const index = this.children.indexOf(child);
    if (index < 0) return;
    this.children[index] = next;
    next.parentSplit = this;
    child.parentSplit = null;
  }

  even(): void {
    this.sizes = this.children.map(() => 1 / this.children.length);
  }

  /** Moves the splitter after child `index` by `delta` pixels, within the smallest sizes. */
  resizeBy(index: number, delta: number): boolean {
    const room = this.room();
    if (!room || index < 0 || index >= this.children.length - 1) return false;
    const a = this.sizes[index] * room;
    const b = this.sizes[index + 1] * room;
    const low = Math.min(this.minSize(this.children[index]), a + b);
    const high = Math.max(low, a + b - this.minSize(this.children[index + 1]));
    const next = Math.min(Math.max(a + delta, low), high);
    const pair = this.sizes[index] + this.sizes[index + 1];
    this.sizes[index] = (pair * next) / (a + b);
    this.sizes[index + 1] = pair - this.sizes[index];
    this.render();
    return true;
  }

  /** The pixels the children share; 0 when not laid out. */
  room(): number {
    const vertical = this.orientation === 'vertical';
    let total = 0;
    for (const child of this.children) {
      const box = child.element.getBoundingClientRect();
      total += vertical ? box.height : box.width;
    }
    return total;
  }

  /** The smallest size of a child along this split. */
  minSize(item: LayoutItem): number {
    if (item instanceof TabGroup) return this.orientation === 'vertical' ? this.manager.minGroupHeight : this.manager.minGroupWidth;
    const sizes = item.children.map((c) => this.minSize(c));
    return item.orientation === this.orientation ? sizes.reduce((a, b) => a + b, 0) : Math.max(0, ...sizes);
  }

  /** Puts the children and splitters in place and gives each child its share. */
  render(): void {
    const el = this.element;
    el.dataset.orientation = this.orientation;
    const wanted = Math.max(0, this.children.length - 1);
    while (this.sashes.length < wanted) this.sashes.push(new SplitSash(this, this.manager));
    for (const sash of this.sashes.splice(wanted)) sash.element.remove();
    const order: Element[] = [];
    this.children.forEach((child, i) => {
      order.push(child.element);
      if (i < wanted) order.push(this.sashes[i].element);
    });
    order.forEach((node, i) => placeNode(el, node, el.children[i] ?? null));
    while (el.children.length > order.length) el.lastElementChild!.remove();
    this.children.forEach((child, i) => (child.element.style.flex = `${this.sizes[i]} 1 0px`));
    this.renderSashes();
  }

  /** The splitters' names and values. */
  renderSashes(): void {
    const label = this.manager.textOf('tabDocsResize');
    this.sashes.forEach((sash, i) => {
      const el = sash.element;
      const pair = this.sizes[i] + this.sizes[i + 1];
      el.setAttribute('aria-orientation', this.orientation === 'horizontal' ? 'vertical' : 'horizontal');
      el.setAttribute('aria-valuenow', String(Math.round(pair ? (this.sizes[i] / pair) * 100 : 50)));
      el.setAttribute('aria-label', label);
      el.setAttribute('aria-controls', this.children[i].element.id);
    });
  }

  dispose(): void {
    for (const sash of this.sashes.splice(0)) sash.element.remove();
    this.element.remove();
  }
}
