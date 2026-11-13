import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { focusOn, holdsFocus } from '../../core/focus';
import { isInPage, isRtl, measure, rectOf } from '../../core/measure';
import { nextId } from '../../core/next-id';
import { css, mark, put } from '../../core/part-writes';
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

/** The first pane's size and the room both panes share, in pixels; 0 when not laid out. */
interface Sizes {
  first: number;
  room: number;
}

/** A drag reads the panes once, when it starts. */
interface Drag extends Sizes {
  pointer: number;
  from: number;
  rtl: boolean;
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
    this.class.add('mx-split-container');
    const [first, second] = [new Panel(), new Panel()];
    first.class.add('mx-split-container__pane');
    second.class.add('mx-split-container__pane');
    first.attr.add({ 'data-pane': 'first' });
    second.attr.add({ 'data-pane': 'second' });
    const firstId = nextId('split-pane');
    first.attr.add({ id: firstId });
    this.controls.add(first, parts.splitter, second);
    [parts.first, parts.second] = [first, second];
    parts.splitter.attr.add({ 'aria-controls': firstId });

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

    const drawLabel = () => put(parts.splitter, 'aria-label', this.peekProperty<string | undefined>('splitterLabel') || uiLocale.strings.resize);
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
  /** The splitter part (`role="separator"`). */
  get splitterPart(): Component<HTMLDivElement> {
    return this.parts.splitter;
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

  override get focusPart(): ComponentBase {
    return this.parts.splitter;
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
    splitter.class.add('mx-split-container__splitter');
    splitter.attr.add({ role: 'separator', 'aria-valuemin': '0', 'aria-valuemax': '100' });
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
    const horizontal = this.horizontal;
    const collapsed = this.peekProperty<SplitPanel>('collapsed') ?? 'none';
    put(this, 'data-orientation', horizontal ? 'horizontal' : 'vertical');
    put(this, 'data-collapsed', collapsed);
    css(this, horizontal ? 'grid-template-columns' : 'grid-template-rows', this.tracks(collapsed));
    css(this, horizontal ? 'grid-template-rows' : 'grid-template-columns', '');
    put(parts.splitter, 'aria-orientation', horizontal ? 'vertical' : 'horizontal');
    const hidden = collapsed === 'first' ? parts.first : collapsed === 'second' ? parts.second : null;
    for (const pane of [parts.first, parts.second]) mark(pane!, 'inert', pane === hidden);
    if (hidden && holdsFocus(hidden)) focusOn(parts.splitter);
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

  /** `aria-valuenow`: the first pane's share of the room, 0 to 100; with both panes shown, from their sizes at the next frame. */
  private renderValue(): void {
    const collapsed = this.peekProperty<SplitPanel>('collapsed') ?? 'none';
    if (collapsed === 'none') measure(this, this.readSizes, this.drawValue);
    else put(this.parts.splitter, 'aria-valuenow', collapsed === 'first' ? '0' : '100');
  }

  private readonly drawValue = ({ first, room }: Sizes): void => {
    // A pane hidden since the read keeps the value written for it.
    if ((this.peekProperty<SplitPanel>('collapsed') ?? 'none') !== 'none') return;
    const position = this.peekProperty<SplitPosition>('position') ?? '50%';
    let now = 50;
    if (room > 0) now = (first / room) * 100;
    else if (isShare(position)) now = this.peekProperty('fixedPanel') === 'second' ? 100 - parseFloat(position) : parseFloat(position);
    put(this.parts.splitter, 'aria-valuenow', String(Math.round(Math.min(100, Math.max(0, now)))));
  };

  private renderSplitter(): void {
    const splitter = this.parts.splitter;
    const resizable = this.peekProperty('resizable') !== false;
    const usable = resizable || this.peekProperty('collapsible') !== false;
    mark(this, 'data-resizable', resizable);
    if (usable) put(splitter, 'tabindex', String(this.peekProperty('tabStop') === false ? -1 : 0));
    else put(splitter, 'tabindex', null);
  }

  // Moving.

  private readonly readSizes = (): Sizes => {
    const parts = this.parts;
    if (!parts.first || !isInPage(this)) return { first: 0, room: 0 };
    const a = rectOf(parts.first);
    const b = rectOf(parts.second!);
    const first = this.horizontal ? a.width : a.height;
    return { first, room: first + (this.horizontal ? b.width : b.height) };
  };

  /** Puts the splitter so the first pane is `size` pixels of `room`, within the minimum sizes. */
  private moveTo(size: number, room: number, fire: boolean): void {
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
    parts.drag ??= { pointer: -1, from: 0, first: 0, room: 0, rtl: false };
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
    const splitter = this.parts.splitter;
    splitter.motif.on('keydown', (_, e) => this.onKey(e));
    splitter.motif.on('focus', () => this.renderValue());
    splitter.motif.on('dblclick', () => this.isEnabled && this.toggleCollapsed());
    splitter.motif.on('pointerdown', (_, e) => this.dragStart(e));
    splitter.motif.on('pointermove', (_, e) => this.dragMove(e));
    splitter.motif.on('pointerup', (_, e) => this.dragEnd(e));
    splitter.motif.on('pointercancel', (_, e) => this.dragEnd(e));
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.isEnabled || e.altKey || e.ctrlKey || e.metaKey) return;
    const resizable = this.peekProperty('resizable') !== false;
    const horizontal = this.horizontal;
    const step = this.peekProperty<number>('step') ?? 10;
    if (e.key === 'Enter') {
      if (this.peekProperty('collapsible') === false) return;
      e.preventDefault();
      this.toggleCollapsed();
      return;
    }
    const back = e.key === (horizontal ? 'ArrowLeft' : 'ArrowUp');
    const forward = e.key === (horizontal ? 'ArrowRight' : 'ArrowDown');
    if (!resizable || !(back || forward || e.key === 'Home' || e.key === 'End')) return;
    e.preventDefault();
    // The panes are read before anything is written.
    const { first, room } = this.readSizes();
    let size = e.key === 'Home' ? 0 : Number.POSITIVE_INFINITY;
    if (back || forward) size = first + (forward !== (horizontal && isRtl(this)) ? step : -step);
    this.moveTo(size, room, true);
  }

  private dragStart(e: PointerEvent): void {
    if (e.button !== 0 || !this.isEnabled || this.peekProperty('resizable') === false) return;
    const { first, room } = this.readSizes();
    const rtl = this.horizontal && isRtl(this);
    e.preventDefault();
    focusOn(this.parts.splitter, { preventScroll: true });
    this.parts.splitter.attr.add({ setPointerCapture: e.pointerId });
    this.parts.drag = { pointer: e.pointerId, from: this.horizontal ? e.clientX : e.clientY, first, room, rtl };
    mark(this, 'data-dragging', true);
  }

  private dragMove(e: PointerEvent): void {
    const drag = this.parts.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    const moved = (this.horizontal ? e.clientX : e.clientY) - drag.from;
    this.moveTo(drag.first + (drag.rtl ? -moved : moved), drag.room, false);
  }

  private dragEnd(e: PointerEvent): void {
    const parts = this.parts;
    const drag = parts.drag;
    if (!drag || drag.pointer !== e.pointerId) return;
    parts.drag = null;
    parts.splitter.attr.add({ releasePointerCapture: e.pointerId });
    mark(this, 'data-dragging', false);
    if (e.type === 'pointerup') parts.moved.fire({ position: this.position, collapsed: this.collapsed, byUser: true, source: this });
  }
}
