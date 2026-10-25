import type { Bind, ComponentBase, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { ChildSettings } from './ChildSettings';
import type { Dock } from './dock';
import type { DockChildProps } from './dock-child-props';
import type { DockPanelProps } from './dock-panel-props';
import type { LayoutSpace } from './layout-space';
import { setPadding } from './set-padding';
import { spaceValue } from './space-value';

const OWN = ['gap', 'padding'] as const;

const SETTINGS = ['dock', 'left', 'top', 'right', 'bottom'] as const;

const DOCKS = new Set<Dock>(['top', 'bottom', 'start', 'end', 'fill', 'float']);

const ANCHORS = [
  ['left', 'left'],
  ['top', 'inset-block-start'],
  ['right', 'right'],
  ['bottom', 'inset-block-end'],
] as const;

/** The margin that holds the gap: on the side of a docked child that faces the rest. */
const FACING: Partial<Record<Dock, string>> = {
  top: 'margin-block-end',
  bottom: 'margin-block-start',
  start: 'margin-inline-end',
  end: 'margin-inline-start',
};

const CHILDREN = Symbol('mx.dock-panel');

function length(value: unknown): string {
  if (typeof value === 'number') return `${value}px`;
  return typeof value === 'string' ? value : '';
}

/**
 * Children stuck to its edges in the order they come — `top`, `bottom`, `start`, `end` — with
 * a `fill` child taking what is left, and `float` children placed over the rest by their own
 * anchors. Each child says where in its own `dock` prop, whatever kind of component it is. Laid
 * out with CSS grid: nothing runs when the size changes.
 *
 * @example
 * <DockPanel style="block-size: 100vh">
 *   <Toolbar dock="top" />
 *   <Panel dock="start" scrollable>…</Panel>
 *   <Panel dock="bottom">Ready</Panel>
 *   <Panel scrollable>…</Panel>
 * </DockPanel>
 *
 * const shell = new DockPanel();
 * shell.controls.add(new Panel({ dock: 'top', text: 'Header' }));
 * shell.setDock(sidebar, 'end');
 */
export class DockPanel extends Control<HTMLDivElement, DockPanelProps> {
  constructor(props?: IBaseProp<DockPanelProps>) {
    super('div', props);
    const own = (this.props ?? {}) as DockPanelProps;
    this.element.classList.add('mx-dock-panel');
    this.observeProperty('gap', () => this.arrange());
    this.observeProperty<LayoutSpace>('padding', (padding) => setPadding(this.element, padding));
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    void this.settings;
    if (this.childs?.length) this.controls.add(...this.childs);
  }

  get gap(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('gap');
  }
  set gap(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('gap', value);
  }
  get padding(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('padding');
  }
  set padding(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('padding', value);
  }

  /** Where a child is docked, as its props say or as set with {@link setDock}. */
  dockOf(child: ComponentBase): Dock {
    const dock = this.settings.get(child, 'dock') as Dock | undefined;
    return dock && DOCKS.has(dock) ? dock : 'fill';
  }

  /** Docks a child from code: a value, or a function that is followed. */
  setDock(child: ComponentBase, dock: Bind<Dock>): void {
    this.settings.set(child, 'dock', dock);
  }

  /** Sets the anchors of a `float` child from code; each is a value or a function. Fields left out stay. */
  setAnchors(child: ComponentBase, anchors: Omit<DockChildProps, 'dock'>): void {
    for (const [name] of ANCHORS) if (anchors[name] !== undefined) this.settings.set(child, name, anchors[name]);
  }

  private get settings(): ChildSettings {
    const self = this as unknown as { [CHILDREN]?: ChildSettings };
    return (self[CHILDREN] ??= new ChildSettings(this, SETTINGS, {
      changed: () => this.arrange(),
      left: (_child, el) => {
        this.clear(el);
        this.arrange();
      },
    }));
  }

  /** Gives every child its grid area: each docked one takes an edge of what the ones before it left. */
  private arrange(): void {
    const children = this.settings.children;
    const docks = children.map((child) => this.dockOf(child));
    const count = (dock: Dock) => docks.filter((d) => d === dock).length;
    const [tops, bottoms, starts, ends] = [count('top'), count('bottom'), count('start'), count('end')];
    const tracks = (before: number, after: number) => [...Array<string>(before).fill('auto'), 'minmax(0, 1fr)', ...Array<string>(after).fill('auto')].join(' ');
    this.element.style.setProperty('grid-template-rows', tracks(tops, bottoms));
    this.element.style.setProperty('grid-template-columns', tracks(starts, ends));

    const gap = spaceValue(this.peekProperty<LayoutSpace>('gap'));
    let [t, b, s, e] = [0, 0, 0, 0];
    children.forEach((child, i) => {
      const el = child.element as HTMLElement;
      const dock = docks[i];
      const across = (from: number, to: number) => `${from + 1} / ${-(to + 1)}`;
      let row = '';
      let column = '';
      if (dock === 'top') [row, column] = [`${t + 1} / ${++t + 1}`, across(s, e)];
      else if (dock === 'bottom') [row, column] = [`${-(b + 2)} / ${-(++b)}`, across(s, e)];
      else if (dock === 'start') [row, column] = [across(t, b), `${s + 1} / ${++s + 1}`];
      else if (dock === 'end') [row, column] = [across(t, b), `${-(e + 2)} / ${-(++e)}`];
      else if (dock === 'fill') [row, column] = [across(tops, bottoms), across(starts, ends)];
      el.dataset.mxDock = dock;
      this.write(el, 'grid-row', row);
      this.write(el, 'grid-column', column);
      for (const [side, margin] of Object.entries(FACING)) this.write(el, margin, side === dock ? gap : '');
      for (const [name, css] of ANCHORS) this.write(el, css, dock === 'float' ? length(this.settings.get(child, name)) : '');
    });
  }

  private clear(el: HTMLElement): void {
    delete el.dataset.mxDock;
    for (const name of ['grid-row', 'grid-column', ...Object.values(FACING), ...ANCHORS.map(([, css]) => css)]) el.style.removeProperty(name);
  }

  private write(el: HTMLElement, name: string, value: string): void {
    if (value) el.style.setProperty(name, value);
    else el.style.removeProperty(name);
  }
}
