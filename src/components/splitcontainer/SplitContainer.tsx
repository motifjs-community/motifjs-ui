import { ComponentBase, type Bind, type Component, type IBaseProp } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { type ControlProps } from '../../core/control';
import { nextId } from '../../core/id';
import { toLength, type Length } from '../../core/space';
import { Panel } from '../panel/Panel';

/** How the two panels sit, as in {@link Stack}: `horizontal` (default) side by side, `vertical` one above the other. */
export type SplitOrientation = 'horizontal' | 'vertical';
/** One of the two panels. */
export type SplitSide = 'first' | 'second';

/** Argument of `onSplitterMoved`. */
export interface SplitterMovedEventArgs {
  readonly container: SplitContainer;
  /** The new size of the first panel, in pixels. */
  readonly position: number;
}

/** Props of {@link SplitContainer}. */
export interface SplitContainerProps extends ControlProps {
  /** See {@link SplitOrientation}. Default `horizontal`. */
  orientation?: Bind<SplitOrientation>;
  /** Size of the first panel: pixels or a CSS length/percentage. Default `'50%'`. */
  position?: Bind<Length | undefined>;
  /** The panel that keeps its size when the container is resized; `none` (default) keeps the proportion. */
  fixedPanel?: Bind<SplitSide | 'none'>;
  /** Smallest size of the first / second panel (pixels or CSS length). Default 25 each. */
  firstMinSize?: Bind<Length | undefined>;
  secondMinSize?: Bind<Length | undefined>;
  /** Thickness of the splitter's hit area. Default from the `split.splitter.size` token. */
  splitterSize?: Bind<Length | undefined>;
  /** `false`: the user cannot move the splitter. Default `true`. */
  resizable?: Bind<boolean>;
  /** Pixels per arrow key press on the splitter. Default 10. */
  step?: Bind<number | undefined>;
  /** A collapsed panel is hidden and the other one takes the whole area. Default `none`. */
  collapsed?: Bind<SplitSide | 'none'>;
  /** Content of the first / second panel: JSX, a component or a factory. Without them, the first and second JSX children. */
  first?: unknown;
  second?: unknown;
  /** After the user moved the splitter (pointer or keyboard). */
  onSplitterMoved?: (e: SplitterMovedEventArgs) => void;
}

const OWN = ['orientation', 'position', 'fixedPanel', 'firstMinSize', 'secondMinSize', 'splitterSize', 'resizable', 'step', 'collapsed'] as const;
const MIN_SIZE = 25;

/** One side of a {@link SplitContainer}: a {@link Panel} (padding, scrolling, docking). */
export class SplitPanel extends Panel {
  protected override get panelClass(): string {
    return 'mx-split__panel';
  }
}

const PARTS = Symbol('mx.split');

interface Parts {
  first: SplitPanel;
  second: SplitPanel;
  splitter: HTMLElement | null;
  /** Size of the second panel in pixels while `fixedPanel` is `second`. */
  secondSize: number | null;
  drag: { pos: number; size: number; total: number; gutter: number; sign: number } | null;
}

/**
 * Two panels divided by a splitter the user can move: drag it, or Tab to it
 * and use the arrow keys (it is a focusable `separator` that announces its
 * value). Each side is a {@link SplitPanel}, reached as `first` / `second`:
 * fill it with the `first` / `second` props, with the first and second JSX
 * children, or with `split.second.controls.add(…)`. Laid out by CSS grid:
 * resizing the window runs no script.
 *
 * @example
 * <SplitContainer position={240} fixedPanel="first" height="100%">
 *   <FolderTree />
 *   <FileList />
 * </SplitContainer>
 *
 * const split = new SplitContainer({ orientation: 'vertical', position: '70%' });
 * split.first.controls.add(editor);
 * split.second.controls.add(output);
 */
export class SplitContainer<TProps extends SplitContainerProps = SplitContainerProps> extends FocusContainer<
  HTMLDivElement,
  TProps
> {
  constructor(element: HTMLDivElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<TProps>?]));
    this.element.classList.add('mx-split');
    this.element.setAttribute('data-orientation', 'horizontal');
    const props = (this.props ?? {}) as SplitContainerProps;
    for (const name of OWN) if (props[name] !== undefined) this.bindProperty(name, props[name]);
    this.layout();
  }

  // Kept off class fields: core may call a ref (which may reach `first`) before they exist.
  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    if (!self[PARTS]) {
      const first = new SplitPanel();
      const second = new SplitPanel();
      first.element.setAttribute('data-part', 'first');
      second.element.setAttribute('data-part', 'second');
      self[PARTS] = { first, second, splitter: null, secondSize: null, drag: null };
    }
    return self[PARTS];
  }

  /** The first panel: at the start (left in LTR), or on top when vertical. */
  get first(): SplitPanel {
    return this.parts.first;
  }

  /** The second panel: at the end, or below when vertical. */
  get second(): SplitPanel {
    return this.parts.second;
  }

  /** See the props. Reactive. */
  get orientation(): SplitOrientation {
    return this.getProperty<SplitOrientation | undefined>('orientation') ?? 'horizontal';
  }
  set orientation(value: SplitOrientation) {
    this.setProperty('orientation', value);
  }
  /** Size of the first panel as given or as last moved (pixels, or a percentage with `fixedPanel` none). Reactive. */
  get position(): Length {
    return this.getProperty<Length | undefined>('position') ?? '50%';
  }
  set position(value: Length) {
    this.parts.secondSize = null;
    this.setProperty('position', value);
  }
  get fixedPanel(): SplitSide | 'none' {
    return this.getProperty<SplitSide | 'none' | undefined>('fixedPanel') ?? 'none';
  }
  set fixedPanel(value: SplitSide | 'none') {
    this.setProperty('fixedPanel', value);
  }
  get firstMinSize(): Length {
    return this.getProperty<Length | undefined>('firstMinSize') ?? MIN_SIZE;
  }
  set firstMinSize(value: Length) {
    this.setProperty('firstMinSize', value);
  }
  get secondMinSize(): Length {
    return this.getProperty<Length | undefined>('secondMinSize') ?? MIN_SIZE;
  }
  set secondMinSize(value: Length) {
    this.setProperty('secondMinSize', value);
  }
  get splitterSize(): Length | undefined {
    return this.getProperty<Length | undefined>('splitterSize');
  }
  set splitterSize(value: Length | undefined) {
    this.setProperty('splitterSize', value);
  }
  get resizable(): boolean {
    return this.getProperty<boolean | undefined>('resizable') !== false;
  }
  set resizable(value: boolean) {
    this.setProperty('resizable', !!value);
  }
  get step(): number {
    return this.getProperty<number | undefined>('step') ?? 10;
  }
  set step(value: number) {
    this.setProperty('step', value);
  }
  get collapsed(): SplitSide | 'none' {
    return this.getProperty<SplitSide | 'none' | undefined>('collapsed') ?? 'none';
  }
  set collapsed(value: SplitSide | 'none') {
    this.setProperty('collapsed', value ?? 'none');
  }

  override view() {
    const { first, second } = this.parts;
    const [c1, c2] = [content(this.props.first) ?? this.childs?.[0], content(this.props.second) ?? this.childs?.[1]];
    if (c1) first.controls.add(c1 as ComponentBase);
    if (c2) second.controls.add(c2 as ComponentBase);
    first.element.id ||= nextId('split-panel');
    return (
      <>
        {this.part(first)}
        <div
          class="mx-split__splitter"
          role="separator"
          aria-controls={first.element.id}
          aria-label={() => this.strings.splitter}
          aria-valuemin="0"
          aria-valuemax="100"
          ref={(c: Component<HTMLDivElement>) => (this.parts.splitter = c.element)}
          onpointerdown={(e: PointerEvent) => this.beginDrag(e)}
          onpointermove={(e: PointerEvent) => this.drag(e)}
          onpointerup={(e: PointerEvent) => this.endDrag(e)}
          onpointercancel={(e: PointerEvent) => this.endDrag(e)}
          onkeydown={(e: KeyboardEvent) => this.onSplitterKey(e)}
        ></div>
        {this.part(second)}
      </>
    );
  }

  override onMounted(): void {
    this.layout();
    // The announced value needs real sizes.
    requestAnimationFrame(() => this.updateValue());
  }

  /** One-shot JSX slot for a panel. */
  private part(panel: SplitPanel): SplitPanel {
    return panel;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if ((OWN as readonly string[]).includes(name)) {
      if (name === 'orientation') this.element.setAttribute('data-orientation', value === 'vertical' ? 'vertical' : 'horizontal');
      if (name === 'fixedPanel' && value !== 'second') this.parts.secondSize = null;
      this.layout();
    } else super.applyProperty(name, value);
  }

  // ---- layout ----------------------------------------------------------------

  /** Panels side by side: sizes run along the inline axis. */
  private get sideBySide(): boolean {
    return this.peekProperty('orientation') !== 'vertical';
  }

  /** Writes the grid template, the splitter state and the collapsed panels. */
  private layout(): void {
    const parts = this.parts;
    const el = this.element;
    const collapsed = this.peekProperty<SplitSide | 'none'>('collapsed');
    const c1 = collapsed === 'first';
    const c2 = collapsed === 'second';
    const fixed = this.peekProperty<SplitSide | 'none'>('fixedPanel') ?? 'none';
    const position = toLength(this.peekProperty<Length>('position') ?? '50%');
    const min1 = toLength(this.peekProperty<Length>('firstMinSize') ?? MIN_SIZE);
    const min2 = toLength(this.peekProperty<Length>('secondMinSize') ?? MIN_SIZE);
    const splitterSize = toLength(this.peekProperty<Length>('splitterSize'));
    if (splitterSize) el.style.setProperty('--_mx-splitter', splitterSize);
    else el.style.removeProperty('--_mx-splitter');

    let template: string;
    if (c1) template = '0px 0px minmax(0, 1fr)';
    else if (c2) template = 'minmax(0, 1fr) 0px 0px';
    else if (fixed === 'second' && parts.secondSize !== null)
      template = `minmax(${min1}, 1fr) var(--_mx-splitter-size) minmax(${min2}, ${parts.secondSize}px)`;
    else template = `minmax(${min1}, ${position}) var(--_mx-splitter-size) minmax(${min2}, 1fr)`;

    const across = this.sideBySide;
    el.style.gridTemplateColumns = across ? template : '';
    el.style.gridTemplateRows = across ? '' : template;
    parts.first.element.hidden = c1;
    parts.second.element.hidden = c2;
    const splitter = parts.splitter;
    if (splitter) {
      splitter.hidden = c1 || c2;
      // ARIA describes the separator line itself: between side-by-side panels it is vertical.
      splitter.setAttribute('aria-orientation', across ? 'vertical' : 'horizontal');
      const movable = this.peekProperty('resizable') !== false;
      splitter.tabIndex = movable ? 0 : -1;
      splitter.toggleAttribute('data-fixed', !movable);
      if (!movable) splitter.setAttribute('aria-disabled', 'true');
      else splitter.removeAttribute('aria-disabled');
    }
  }

  /** The first panel's size, the room both panels share, the splitter's own size and the reading-direction sign. */
  private measure(): { size: number; total: number; gutter: number; sign: number } {
    const box = this.element.getBoundingClientRect();
    const p1 = this.parts.first.element.getBoundingClientRect();
    const s = this.parts.splitter?.getBoundingClientRect();
    const across = this.sideBySide;
    const rtl = across && getComputedStyle(this.element).direction === 'rtl';
    const gutter = s ? (across ? s.width : s.height) : 0;
    return { size: across ? p1.width : p1.height, total: (across ? box.width : box.height) - gutter, gutter, sign: rtl ? -1 : 1 };
  }

  /** Puts the first panel at `size` pixels (clamped), stored the way `fixedPanel` keeps it. */
  private moveTo(size: number, total: number, gutter: number): number {
    const min1 = numberOr(this.peekProperty<Length>('firstMinSize'), MIN_SIZE);
    const min2 = numberOr(this.peekProperty<Length>('secondMinSize'), MIN_SIZE);
    const clamped = Math.round(Math.max(min1, Math.min(size, total - min2)));
    const fixed = this.peekProperty<SplitSide | 'none'>('fixedPanel') ?? 'none';
    if (fixed === 'second') this.parts.secondSize = Math.max(0, total - clamped);
    // A grid track percentage is of the whole container, splitter included.
    const value: Length = fixed === 'none' && total > 0 ? `${((clamped / (total + gutter)) * 100).toFixed(3)}%` : clamped;
    this.setProperty('position', value);
    this.updateValue(clamped, total);
    return clamped;
  }

  private updateValue(size?: number, total?: number): void {
    const splitter = this.parts.splitter;
    // Also runs from a frame callback, which may come after a dispose.
    if (this.isDisposed || !splitter || !this.element?.isConnected) return;
    if (size === undefined || total === undefined) ({ size, total } = this.measure());
    if (total > 0) splitter.setAttribute('aria-valuenow', String(Math.round((size / total) * 100)));
  }

  private moved(size: number): void {
    this.props.onSplitterMoved?.({ container: this as SplitContainer, position: size });
  }

  // ---- pointer and keyboard --------------------------------------------------

  private get movable(): boolean {
    return this.peekProperty('resizable') !== false && (this.peekProperty('collapsed') ?? 'none') === 'none';
  }

  private beginDrag(e: PointerEvent): void {
    if (e.button !== 0 || !this.movable) return;
    e.preventDefault();
    const splitter = this.parts.splitter!;
    splitter.setPointerCapture?.(e.pointerId);
    const m = this.measure();
    this.parts.drag = { pos: this.sideBySide ? e.clientX : e.clientY, ...m };
    this.element.setAttribute('data-dragging', '');
  }

  private drag(e: PointerEvent): void {
    const d = this.parts.drag;
    if (!d) return;
    const pos = this.sideBySide ? e.clientX : e.clientY;
    this.moveTo(d.size + (pos - d.pos) * d.sign, d.total, d.gutter);
  }

  private endDrag(e: PointerEvent): void {
    const d = this.parts.drag;
    if (!d) return;
    this.parts.drag = null;
    this.parts.splitter?.releasePointerCapture?.(e.pointerId);
    this.element.removeAttribute('data-dragging');
    this.moved(this.measure().size);
  }

  private onSplitterKey(e: KeyboardEvent): void {
    if (!this.movable || e.ctrlKey || e.altKey || e.metaKey) return;
    const across = this.sideBySide;
    const m = this.measure();
    const step = this.peekProperty<number>('step') ?? 10;
    let size: number;
    if (e.key === 'Home') size = 0;
    else if (e.key === 'End') size = m.total;
    else if ((across && e.key === 'ArrowLeft') || (!across && e.key === 'ArrowUp')) size = m.size - step * m.sign;
    else if ((across && e.key === 'ArrowRight') || (!across && e.key === 'ArrowDown')) size = m.size + step * m.sign;
    else return;
    e.preventDefault();
    this.moved(this.moveTo(size, m.total, m.gutter));
  }
}

/** Resolves panel content like MxForm's `content`: JSX, a component, or a factory returning either. */
function content(value: unknown): unknown {
  if (typeof value === 'function' && !(value.prototype instanceof ComponentBase)) return (value as () => unknown)();
  return value ?? undefined;
}

function numberOr(value: Length | undefined, fallback: number): number {
  if (typeof value === 'number') return value;
  const n = value !== undefined ? parseFloat(value) : NaN;
  return Number.isFinite(n) && /px$|^\d*\.?\d+$/.test(String(value)) ? n : fallback;
}
