import { Component, type ComponentBase } from '@motifx/core';
import { isRtl, rectOf } from '../../core/measure';
import { nextId } from '../../core/next-id';
import { orderControls } from '../../core/order-controls';
import { css, put } from '../../core/part-writes';
import type { LayoutOrientation } from '../layout/layout-orientation';
import { itemPart, type LayoutItem } from './layout-item';
import type { SashOwner } from './sash-owner';
import { detachOthers, dropPart, layoutPart } from './place-node';
import { SplitSash } from './SplitSash';
import type { TabDocumentManager } from './TabDocumentManager';
import { TabGroup } from './TabGroup';

/**
 * A branch of the layout: groups or other splits side by side (`horizontal`) or one under the
 * other, each with its share of the room, a splitter between each two.
 */
export class TabSplit implements SashOwner {
  /** The split as a component: its children's components and its splitters are its children. */
  readonly part: Component<HTMLDivElement>;
  /** The id written on it: the splitter before it names it as what it resizes. */
  readonly id = nextId('tabdocs-split');
  parentSplit: TabSplit | null = null;
  children: LayoutItem[] = [];
  /** One share per child, adding up to 1. */
  sizes: number[] = [];
  private readonly splitters: SplitSash[] = [];

  constructor(
    private readonly manager: TabDocumentManager,
    public orientation: LayoutOrientation,
  ) {
    this.part = new Component<HTMLDivElement>('div');
    this.part.class.add('mx-tabdocs__split');
    this.part.attr.add({ id: this.id });
    layoutPart(this.part, true);
  }

  get rtl(): boolean {
    return isRtl(this.part);
  }

  /** Its splitters, one between each two children, in order. */
  get sashes(): readonly SplitSash[] {
    return this.splitters;
  }

  sashIndex(sash: SplitSash): number {
    return this.splitters.indexOf(sash);
  }

  insert(child: LayoutItem, index: number, share = 1 / (this.children.length + 1)): void {
    const keep = 1 - share;
    this.sizes = this.sizes.map((s) => s * keep);
    this.children.splice(index, 0, child);
    this.sizes.splice(index, 0, this.children.length === 1 ? 1 : share);
    child.parentSplit = this;
  }

  /** Takes a child out; its room goes to the neighbor before it (after it, for the first). */
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

  /** A double click on a splitter evens this split. */
  resetSizes(): void {
    this.manager.evenSizesBy(this, true);
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

  /** The pixels the children share; 0 when not laid out. A layout read: read it before writing. */
  room(): number {
    const vertical = this.orientation === 'vertical';
    let total = 0;
    for (const child of this.children) {
      const box = rectOf(itemPart(child));
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
    put(this.part, 'data-orientation', this.orientation);
    const wanted = Math.max(0, this.children.length - 1);
    while (this.splitters.length < wanted) this.splitters.push(new SplitSash(this, this.manager));
    for (const sash of this.splitters.splice(wanted)) if (sash.part.parent) sash.part.parent.controls.remove(sash.part);
    const order: ComponentBase[] = [];
    this.children.forEach((child, i) => {
      order.push(itemPart(child));
      if (i < wanted) order.push(this.splitters[i].part);
    });
    orderControls(this.part, order);
    // A child that went elsewhere in the tree is placed there; one that left it waits for the manager.
    detachOthers(this.part, order);
    this.children.forEach((child, i) => css(itemPart(child), 'flex', `${this.sizes[i]} 1 0px`));
    this.renderSashes();
  }

  /** The splitters' names and values. */
  renderSashes(): void {
    const label = this.manager.textOf('tabDocsResize');
    this.splitters.forEach((sash, i) => {
      const pair = this.sizes[i] + this.sizes[i + 1];
      put(sash.part, 'aria-orientation', this.orientation === 'horizontal' ? 'vertical' : 'horizontal');
      put(sash.part, 'aria-valuenow', String(Math.round(pair ? (this.sizes[i] / pair) * 100 : 50)));
      put(sash.part, 'aria-label', label);
      put(sash.part, 'aria-controls', this.children[i].id);
    });
  }

  dispose(): void {
    // Its sashes go with it; the groups and splits in it stay alive for the manager.
    this.splitters.splice(0);
    dropPart(this.part);
  }
}
