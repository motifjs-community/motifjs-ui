import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { registerControl } from '../../core/control-map';
import { deepActiveElement } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import type { LayoutOrientation } from './layout-orientation';
import { Panel } from './Panel';
import type { SplitContainerProps } from './split-container-props';
import type { SplitPanel } from './split-panel';
import type { SplitPosition } from './split-position';
import type { SplitterMovedEventArgs } from './splitter-moved-event-args';
import { onLanguage } from '../../core/on-language';

const OWN = ['orientation', 'position', 'fixedPanel', 'firstMinSize', 'secondMinSize', 'collapsed', 'resizable', 'collapsible', 'step', 'splitterLabel'] as const;

const LAYOUT = ['orientation', 'position', 'fixedPanel', 'firstMinSize', 'secondMinSize', 'collapsed'] as const;

const SPLITTER = 'var(--_layout-splitter-size)';

interface Drag {
  pointer: number;
  from: number;
  first: number;
}

interface Parts {
  splitter: Component<HTMLDivElement>;
  first: Panel | null;
  second: Panel | null;
  drag: Drag | null;
  moved: Emitter<SplitterMovedEventArgs>;
}

const PARTS = Symbol('mx.split-container');

function isShare(position: SplitPosition | undefined): position is string {
  return typeof position === 'string' && position.trim().endsWith('%');
}

/** The CSS size of a position: pixels, a share of the room left by the splitter, or a length as written. */
function sizeOf(position: SplitPosition): string {
  if (typeof position === 'number') return `${position}px`;
  const text = position.trim();
  if (isShare(text)) return `calc((100% - ${SPLITTER}) * ${parseFloat(text) / 100})`;
  return /^\d*\.?\d+$/.test(text) ? `${text}px` : text;
}

/**
 * Two panes, `first` and `second`, side by side or stacked, with a splitter between them that
 * the pointer drags and the keyboard moves (the ARIA window splitter pattern). The pane named by
 * `fixedPanel` keeps its size when the container is resized, and `collapsed` hides one. The first
 * JSX child goes into the first pane and the second into the second pane. Programmatically, add
 * to `split.first.controls` and `split.second.controls`.
 *
 * @example
 * <SplitContainer position={240} fixedPanel="first" firstMinSize={160} x-model={() => this.state.width}>
 *   <FolderTree />
 *   <MessageList />
 * </SplitContainer>
 *
 * const split = new SplitContainer({ orientation: 'vertical', position: '70%' });
 * split.first.controls.add(new Editor());
 * split.second.controls.add(new Output());
 * split.onSplitterMoved((e) => this.settings.save(e.position));
 */
export class SplitContainer extends FocusContainer<HTMLDivElement, SplitContainerProps> {
  constructor(props?: IBaseProp<SplitContainerProps>) {
    super('div', props);
    const own = (this.props ?? {}) as SplitContainerProps;
    const parts = this.parts;
    this.element.classList.add('mx-split-container');
    const [first, second] = [new Panel(), new Panel()];
    first.element.classList.add('mx-split-container__pane');
    second.element.classList.add('mx-split-container__pane');
    first.element.dataset.pane = 'first';
    second.element.dataset.pane = 'second';
    first.element.id = nextId('split-pane');
    this.controls.add(first, parts.splitter, second);
    [parts.first, parts.second] = [first, second];
    parts.splitter.element.setAttribute('aria-controls', first.element.id);

    for (const name of LAYOUT) this.observeProperty(name, () => this.renderLayout());
    this.observeProperty('resizable', () => this.renderSplitter());
    this.observeProperty('collapsible', () => this.renderSplitter());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onSplitterMoved) this.onSplitterMoved(own.onSplitterMoved);

    const [one, two, ...rest] = this.childs ?? [];
    if (one) first.controls.add(one);
    if (two) second.controls.add(two, ...rest);
    // Added to the container itself programmatically: into the first empty pane.
    void this.motif.on('controladded', (_sender, e: { control: ComponentBase }) => this.route(e.control), false);

    const drawLabel = () => parts.splitter.element.setAttribute('aria-label', this.peekProperty<string | undefined>('splitterLabel') || uiLocale.strings.resize);
    const stopLabel = onLanguage(this, drawLabel);
    this.observeProperty('splitterLabel', drawLabel);
    this.listen();
    this.motif.setDisposable(() => {
      stopLabel();
      parts.moved.dispose();
    });
  }

  /** The first pane (start or top), as a `Panel`. */
  get first(): Panel {
    return this.parts.first!;
  }
  /** The second pane (end or bottom), as a `Panel`. */
  get second(): Panel {
    return this.parts.second!;
  }
  /** The splitter element (`role="separator"`). */
  get splitterElement(): HTMLDivElement {
    return this.parts.splitter.element;
  }

  get orientation(): LayoutOrientation {
    return this.getProperty<LayoutOrientation | undefined>('orientation') ?? 'horizontal';
  }
  set orientation(value: Bind<LayoutOrientation>) {
    this.assignProperty('orientation', value);
  }
  get position(): SplitPosition {
    return this.getProperty<SplitPosition | undefined>('position') ?? '50%';
  }
  set position(value: Bind<SplitPosition>) {
    const before = this.peekProperty<SplitPosition>('position');
    this.assignProperty('position', value);
    // A position set programmatically shows in `x-model` too, so the model and the splitter never differ.
    const now = this.peekProperty<SplitPosition>('position');
    if (typeof value !== 'function' && now !== before) this.bindings.writeModel(now);
  }
  /** Maps to `position` for `x-model`. */
  get value(): SplitPosition {
    return this.position;
  }
  set value(value: SplitPosition) {
    this.position = value;
  }
  get fixedPanel(): SplitPanel {
    return this.getProperty<SplitPanel | undefined>('fixedPanel') ?? 'none';
  }
  set fixedPanel(value: Bind<SplitPanel>) {
    this.assignProperty('fixedPanel', value);
  }
  get firstMinSize(): number {
    return this.getProperty<number | undefined>('firstMinSize') ?? 0;
  }
  set firstMinSize(value: Bind<number>) {
    this.assignProperty('firstMinSize', value, (v) => Math.max(0, Number(v) || 0));
  }
  get secondMinSize(): number {
    return this.getProperty<number | undefined>('secondMinSize') ?? 0;
  }
  set secondMinSize(value: Bind<number>) {
    this.assignProperty('secondMinSize', value, (v) => Math.max(0, Number(v) || 0));
  }
  get collapsed(): SplitPanel {
    return this.getProperty<SplitPanel | undefined>('collapsed') ?? 'none';
  }
  set collapsed(value: Bind<SplitPanel>) {
    this.assignProperty('collapsed', value);
  }
  get resizable(): boolean {
    return this.getProperty<boolean | undefined>('resizable') ?? true;
  }
  set resizable(value: Bind<boolean>) {
    this.assignProperty('resizable', value, Boolean);
  }
  get collapsible(): boolean {
    return this.getProperty<boolean | undefined>('collapsible') ?? true;
  }
  set collapsible(value: Bind<boolean>) {
    this.assignProperty('collapsible', value, Boolean);
  }
  get step(): number {
    return this.getProperty<number | undefined>('step') ?? 10;
  }
  set step(value: Bind<number>) {
    this.assignProperty('step', value, (v) => Math.max(1, Number(v) || 1));
  }
  get splitterLabel(): string {
    return this.getProperty<string | undefined>('splitterLabel') ?? '';
  }
  set splitterLabel(value: Bind<string>) {
    this.assignProperty('splitterLabel', value);
  }

  /** Occurs when the splitter moves, or when a pane is hidden or restored, by the user or by code (`e.byUser`). */
  get onSplitterMoved(): MotifEvent<SplitterMovedEventArgs> {
    return this.parts.moved.event;
  }

  /** Hides a pane, and the other pane takes all the space. */
  collapse(pane: 'first' | 'second' = 'first'): void {
    this.collapsed = pane;
  }

  /** Shows both panes again, with the splitter at its previous position. */
  restore(): void {
    this.collapsed = 'none';
  }

  protected override get focusElement(): HTMLElement {
    return this.parts.splitter.element;
  }

  protected override applyProperty(name: string, value: unknown): void {
    // The splitter is the Tab stop; renderSplitter decides its tabindex.
    if (name === 'tabStop') {
      this.renderSplitter();
      return;
    }
    super.applyProperty(name, value);
    if ((name === 'position' || name === 'collapsed') && this.parts.first && !this.parts.drag) {
      this.parts.moved.fire({ position: this.position, collapsed: this.collapsed, byUser: false, source: this });
    }
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const splitter = new Component<HTMLDivElement>('div');
    const el = splitter.element;
    el.className = 'mx-split-container__splitter';
    el.setAttribute('role', 'separator');
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '100');
    registerControl(el, this);
    return { splitter, first: null, second: null, drag: null, moved: new Emitter() };
  }

  private get horizontal(): boolean {
    return this.peekProperty('orientation') !== 'vertical';
  }

  private route(control: ComponentBase): void {
    const parts = this.parts;
    if (!parts.first || control === parts.first || control === parts.second || control === parts.splitter) return;
    (parts.first.controls.length ? parts.second! : parts.first).controls.add(control);
  }

  // Rendering.

  private renderLayout(): void {
    const parts = this.parts;
    if (!parts.first) return;
    const el = this.element;
    const horizontal = this.horizontal;
    const collapsed = this.peekProperty<SplitPanel>('collapsed') ?? 'none';
    el.dataset.orientation = horizontal ? 'horizontal' : 'vertical';
    el.dataset.collapsed = collapsed;
    el.style.setProperty(horizontal ? 'grid-template-columns' : 'grid-template-rows', this.tracks(collapsed));
    el.style.removeProperty(horizontal ? 'grid-template-rows' : 'grid-template-columns');
    const splitter = parts.splitter.element;
    splitter.setAttribute('aria-orientation', horizontal ? 'vertical' : 'horizontal');
    const hidden = collapsed === 'first' ? parts.first : collapsed === 'second' ? parts.second : null;
    for (const pane of [parts.first, parts.second]) pane!.element.inert = pane === hidden;
    const active = deepActiveElement();
    if (hidden && active && hidden.element.contains(active)) splitter.focus();
    this.renderValue();
  }

  private tracks(collapsed: SplitPanel): string {
    const min1 = `${this.peekProperty<number>('firstMinSize') ?? 0}px`;
    const min2 = `${this.peekProperty<number>('secondMinSize') ?? 0}px`;
    if (collapsed === 'first') return `0px ${SPLITTER} minmax(0, 1fr)`;
    if (collapsed === 'second') return `minmax(0, 1fr) ${SPLITTER} 0px`;
    const size = sizeOf(this.peekProperty<SplitPosition>('position') ?? '50%');
    if (this.peekProperty('fixedPanel') === 'second') {
      return `minmax(0, 1fr) ${SPLITTER} clamp(${min2}, ${size}, calc(100% - ${min1} - ${SPLITTER}))`;
    }
    return `clamp(${min1}, ${size}, calc(100% - ${min2} - ${SPLITTER})) ${SPLITTER} minmax(0, 1fr)`;
  }

  /** `aria-valuenow`: the first pane's share of the room, 0 to 100. */
  private renderValue(): void {
    const collapsed = this.peekProperty<SplitPanel>('collapsed') ?? 'none';
    let now = 50;
    if (collapsed === 'first') now = 0;
    else if (collapsed === 'second') now = 100;
    else {
      const { first, room } = this.measure();
      const position = this.peekProperty<SplitPosition>('position') ?? '50%';
      if (room > 0) now = (first / room) * 100;
      else if (isShare(position)) now = this.peekProperty('fixedPanel') === 'second' ? 100 - parseFloat(position) : parseFloat(position);
    }
    this.parts.splitter.element.setAttribute('aria-valuenow', String(Math.round(Math.min(100, Math.max(0, now)))));
  }

  private renderSplitter(): void {
    const splitter = this.parts.splitter.element;
    const resizable = this.peekProperty('resizable') !== false;
    const usable = resizable || this.peekProperty('collapsible') !== false;
    this.element.toggleAttribute('data-resizable', resizable);
    if (usable) splitter.tabIndex = this.peekProperty('tabStop') === false ? -1 : 0;
    else splitter.removeAttribute('tabindex');
  }

  // Moving.

  /** The first pane's size and the room both panes share, in pixels; 0 when not laid out. */
  private measure(): { first: number; room: number } {
    const parts = this.parts;
    if (!parts.first || !this.element.isConnected) return { first: 0, room: 0 };
    const a = parts.first.element.getBoundingClientRect();
    const b = parts.second!.element.getBoundingClientRect();
    const first = this.horizontal ? a.width : a.height;
    return { first, room: first + (this.horizontal ? b.width : b.height) };
  }

  /** Puts the splitter so the first pane is `size` pixels, within the minimum sizes. */
  private moveTo(size: number, fire: boolean): void {
    const { room } = this.measure();
    if (!room) return;
    const min1 = this.peekProperty<number>('firstMinSize') ?? 0;
    const min2 = this.peekProperty<number>('secondMinSize') ?? 0;
    const first = Math.min(Math.max(size, min1), Math.max(min1, room - min2));
    const fixed = this.peekProperty<SplitPanel>('fixedPanel') ?? 'none';
    const position: SplitPosition =
      fixed === 'none' ? `${Math.round((first / room) * 10000) / 100}%` : Math.round(fixed === 'second' ? room - first : first);
    this.userChange(position, 'none', fire);
  }

  private userChange(position: SplitPosition, collapsed: SplitPanel, fire: boolean): void {
    const parts = this.parts;
    const drag = parts.drag;
    // A drag in progress keeps the event for its end; this marks the change as the user's.
    parts.drag ??= { pointer: -1, from: 0, first: 0 };
    try {
      this.changeProperty('collapsed', collapsed);
      this.changeProperty('position', position);
    } finally {
      parts.drag = drag;
    }
    this.bindings.writeModel(position);
    if (fire) parts.moved.fire({ position, collapsed, byUser: true, source: this });
  }

  private toggleCollapsed(): void {
    if (this.peekProperty('collapsible') === false) return;
    const collapsed = this.peekProperty<SplitPanel>('collapsed') ?? 'none';
    this.userChange(this.position, collapsed === 'none' ? 'first' : 'none', true);
  }

  // Input.

  private listen(): void {
    const splitter = this.parts.splitter.element;
    splitter.addEventListener('keydown', (e) => this.onKey(e));
    splitter.addEventListener('focus', () => this.renderValue());
    splitter.addEventListener('dblclick', () => this.isEnabled && this.toggleCollapsed());
    splitter.addEventListener('pointerdown', (e) => this.dragStart(e));
    splitter.addEventListener('pointermove', (e) => this.dragMove(e));
    splitter.addEventListener('pointerup', (e) => this.dragEnd(e));
    splitter.addEventListener('pointercancel', (e) => this.dragEnd(e));
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.isEnabled || e.altKey || e.ctrlKey || e.metaKey) return;
    const resizable = this.peekProperty('resizable') !== false;
    const horizontal = this.horizontal;
    const step = this.peekProperty<number>('step') ?? 10;
    let size: number | null = null;
    if (e.key === 'Enter') {
      if (this.peekProperty('collapsible') === false) return;
      this.toggleCollapsed();
    } else if (!resizable) {
      return;
    } else if (e.key === (horizontal ? 'ArrowLeft' : 'ArrowUp') || e.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) {
      const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
      const rtl = horizontal && getComputedStyle(this.element).direction === 'rtl';
      size = this.measure().first + (forward !== rtl ? step : -step);
    } else if (e.key === 'Home') {
      size = 0;
    } else if (e.key === 'End') {
      size = Number.POSITIVE_INFINITY;
    } else {
      return;
    }
    e.preventDefault();
    if (size !== null) this.moveTo(size, true);
  }

  private dragStart(e: PointerEvent): void {
    if (e.button !== 0 || !this.isEnabled || this.peekProperty('resizable') === false) return;
    const splitter = this.parts.splitter.element;
    e.preventDefault();
    splitter.focus({ preventScroll: true });
    splitter.setPointerCapture?.(e.pointerId);
    this.parts.drag = { pointer: e.pointerId, from: this.horizontal ? e.clientX : e.clientY, first: this.measure().first };
    this.element.toggleAttribute('data-dragging', true);
  }

  private dragMove(e: PointerEvent): void {
    const drag = this.parts.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    const rtl = this.horizontal && getComputedStyle(this.element).direction === 'rtl';
    const moved = (this.horizontal ? e.clientX : e.clientY) - drag.from;
    this.moveTo(drag.first + (rtl ? -moved : moved), false);
  }

  private dragEnd(e: PointerEvent): void {
    const parts = this.parts;
    const drag = parts.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    parts.drag = null;
    parts.splitter.element.releasePointerCapture?.(e.pointerId);
    this.element.removeAttribute('data-dragging');
    if (e.type === 'pointerup') parts.moved.fire({ position: this.position, collapsed: this.collapsed, byUser: true, source: this });
  }
}
