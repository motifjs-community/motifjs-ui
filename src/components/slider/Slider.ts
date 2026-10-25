import { effect, read, untracked, type Bind, type IBaseProp } from '@motifx/core';
import { uiLocale } from '../../core/ui-locale';
import { Field } from '../../parts/field/Field';
import type { SliderOrientation } from './slider-orientation';
import type { SliderProps } from './slider-props';
import type { SliderShowValue } from './slider-show-value';
import type { SliderValue } from './slider-value';

const OWN = [
  'min',
  'max',
  'step',
  'largeStep',
  'range',
  'minDistance',
  'orientation',
  'ticks',
  'tickLabels',
  'showValue',
  'format',
  'locale',
  'updateOn',
  'name',
] as const;

type Own = (typeof OWN)[number];

/** More marks than this are not drawn: they would only make a gray bar. */
const MAX_TICKS = 1000;

const PARTS = Symbol('mx.slider');

interface Drag {
  thumb: number;
  /** Where on the thumb it was pressed, so the thumb does not jump under the pointer. */
  offset: number;
  pointer: number;
  /** `false` when it only focuses the thumb: read-only, or a track not drawn yet. */
  moving: boolean;
  /** Pressed beside the thumbs: the thumb takes focus when the press ends. */
  focus: boolean;
}

interface Parts {
  control: HTMLDivElement;
  track: HTMLDivElement;
  fill: HTMLDivElement;
  ticks: HTMLDivElement;
  thumbs: HTMLDivElement[];
  bubbles: HTMLSpanElement[];
  inputs: HTMLInputElement[];
  /** The value drawn while a thumb moves with `updateOn: 'change'`. */
  shown: SliderValue | null;
  drag: Drag | null;
  formatter: Intl.NumberFormat | null;
  stopNames: (() => void) | null;
  /** The props are bound; until then the renderers wait. */
  ready: boolean;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}

function createThumb(name: 'start' | 'end'): HTMLDivElement {
  const thumb = element('div', 'mx-slider__thumb');
  thumb.dataset.thumb = name;
  thumb.setAttribute('role', 'slider');
  thumb.tabIndex = 0;
  const bubble = thumb.appendChild(element('span', 'mx-slider__bubble'));
  bubble.setAttribute('aria-hidden', 'true');
  return thumb;
}

function toNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function decimals(n: number): number {
  const text = String(n);
  const exp = text.indexOf('e-');
  if (exp >= 0) return Number(text.slice(exp + 2));
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

/**
 * A value picked on a track by dragging a thumb or with the keys: one number, or a range with two
 * thumbs that cannot cross. Steps, marks with labels, a value bubble, a vertical form and number
 * formatting; the label, help line and validation come from `Field`. `x-model` binds the value.
 *
 * @example
 * <Slider label="&Volume" x-model={() => this.settings.volume} showValue="drag" />
 * <Slider label="Price" range min={0} max={500} step={10} x-model={() => this.filter.price} />
 *
 * const zoom = new Slider({ label: 'Zoom', min: 25, max: 400, step: 25, ticks: true });
 * this.panel.controls.add(zoom);
 * zoom.value = 100;
 */
export class Slider extends Field<SliderValue, SliderProps> {
  constructor(props?: IBaseProp<SliderProps>) {
    super(props);
    const own = (this.props ?? {}) as SliderProps;
    this.element.classList.add('mx-slider');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.valueText) this.setProperty('valueText', own.valueText);

    for (const name of ['min', 'max', 'step', 'range', 'minDistance'] as const) this.observeProperty(name, () => this.conform());
    this.observeProperty('orientation', () => this.renderOrientation());
    this.observeProperty('ticks', () => this.renderTicks());
    this.observeProperty('tickLabels', () => this.renderTicks());
    this.observeProperty('format', () => this.renderFormat());
    this.observeProperty('locale', () => this.renderFormat());
    this.observeProperty('valueText', () => this.draw());
    this.observeProperty<SliderShowValue>('showValue', (show) => (this.element.dataset.showValue = show ?? 'never'));
    this.observeProperty('name', () => this.renderInputs());
    this.observeProperty('text', () => this.renderNames());
    // A slider always has a value, and ARIA has no aria-required for it.
    this.observeProperty('required', () => this.sliderParts.control.removeAttribute('aria-required'));
    this.observeProperty<boolean>('invalid', (on) => {
      for (const thumb of this.sliderParts.thumbs) {
        if (on) thumb.setAttribute('aria-invalid', 'true');
        else thumb.removeAttribute('aria-invalid');
      }
    });

    const parts = this.sliderParts;
    parts.ready = true;
    this.renderOrientation();
    this.conform();
    this.listen();
    this.motif.setDisposable(() => parts.stopNames?.());
  }

  // Properties (see SliderProps).

  get min(): number {
    return toNumber(this.getProperty('min'), 0);
  }
  set min(value: Bind<number>) {
    this.assignProperty('min', value);
  }
  get max(): number {
    return toNumber(this.getProperty('max'), 100);
  }
  set max(value: Bind<number>) {
    this.assignProperty('max', value);
  }
  get step(): number {
    return toNumber(this.getProperty('step'), 1);
  }
  set step(value: Bind<number>) {
    this.assignProperty('step', value);
  }
  get largeStep(): number {
    return toNumber(this.getProperty('largeStep'), this.unit * 10);
  }
  set largeStep(value: Bind<number>) {
    this.assignProperty('largeStep', value);
  }
  get range(): boolean {
    return !!this.getProperty<boolean>('range');
  }
  set range(value: Bind<boolean>) {
    this.assignProperty('range', value, Boolean);
  }
  get minDistance(): number {
    return toNumber(this.getProperty('minDistance'), 0);
  }
  set minDistance(value: Bind<number>) {
    this.assignProperty('minDistance', value);
  }
  get orientation(): SliderOrientation {
    return this.getProperty<SliderOrientation | undefined>('orientation') ?? 'horizontal';
  }
  set orientation(value: Bind<SliderOrientation>) {
    this.assignProperty('orientation', value);
  }
  get ticks(): boolean | number {
    return this.getProperty<boolean | number | undefined>('ticks') ?? false;
  }
  set ticks(value: Bind<boolean | number>) {
    this.assignProperty('ticks', value);
  }
  get tickLabels(): boolean {
    return !!this.getProperty<boolean>('tickLabels');
  }
  set tickLabels(value: Bind<boolean>) {
    this.assignProperty('tickLabels', value, Boolean);
  }
  get showValue(): SliderShowValue {
    return this.getProperty<SliderShowValue | undefined>('showValue') ?? 'never';
  }
  set showValue(value: Bind<SliderShowValue>) {
    this.assignProperty('showValue', value);
  }
  get format(): Intl.NumberFormatOptions | null {
    return this.getProperty<Intl.NumberFormatOptions | null | undefined>('format') ?? null;
  }
  set format(value: Bind<Intl.NumberFormatOptions | null>) {
    this.assignProperty('format', value);
  }
  get locale(): string {
    return this.getProperty<string | undefined>('locale') ?? '';
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get updateOn(): 'input' | 'change' {
    return this.getProperty<'input' | 'change' | undefined>('updateOn') ?? 'input';
  }
  set updateOn(value: Bind<'input' | 'change'>) {
    this.assignProperty('updateOn', value);
  }
  get name(): string {
    return this.getProperty<string | undefined>('name') ?? '';
  }
  set name(value: Bind<string>) {
    this.assignProperty('name', value);
  }
  /** A function, so it is stored as it is, never bound. */
  get valueText(): ((value: number) => string) | null {
    return this.getProperty<((value: number) => string) | null | undefined>('valueText') ?? null;
  }
  set valueText(value: ((value: number) => string) | null) {
    this.setProperty('valueText', value);
  }

  /** The thumbs, `[start, end]` with a range (the end one is hidden without). */
  get thumbElements(): readonly HTMLElement[] {
    return this.sliderParts.thumbs;
  }

  /** The value as text, the way the bubble and the tick labels write it. */
  formatValue(value: number): string {
    const parts = this.sliderParts;
    if (!parts.formatter) {
      const options = this.peekProperty<Intl.NumberFormatOptions | null>('format') ?? undefined;
      const locale = this.peekProperty<string>('locale') || document.documentElement.lang || undefined;
      try {
        parts.formatter = new Intl.NumberFormat(locale, options);
      } catch {
        parts.formatter = new Intl.NumberFormat();
      }
    }
    return parts.formatter.format(value);
  }

  // For Field.

  protected createControl(): HTMLElement {
    return this.sliderParts.control;
  }

  protected emptyValue(): SliderValue {
    const { min, max } = this.bounds;
    return this.option('range', false) ? [min, max] : min;
  }

  protected override isEmptyValue(): boolean {
    return false;
  }

  protected override sameValue(a: SliderValue, b: SliderValue): boolean {
    if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1];
    return Object.is(a, b);
  }

  /** Kept on the steps and inside the bounds; a range keeps its thumbs apart. The same array comes back when nothing changes. */
  protected override normalizeValue(value: SliderValue): SliderValue {
    const { min, max } = this.bounds;
    if (!this.option('range', false)) return this.snap(toNumber(Array.isArray(value) ? value[1] : value, min));
    const pair = Array.isArray(value) ? value : [min, value ?? max];
    let start = this.snap(toNumber(pair[0], min));
    let end = this.snap(toNumber(pair[1], max));
    if (start > end) [start, end] = [end, start];
    const gap = this.gap;
    if (end - start < gap) {
      end = Math.min(max, start + gap);
      start = Math.max(min, Math.min(start, end - gap));
    }
    const current = this.peekProperty<SliderValue>('value');
    if (Array.isArray(current) && current[0] === start && current[1] === end) return current;
    if (Array.isArray(value) && value[0] === start && value[1] === end) return value;
    return [start, end];
  }

  protected renderValue(): void {
    this.draw();
  }

  protected override renderReadOnly(on: boolean): void {
    this.element.toggleAttribute('data-readonly', on);
    for (const thumb of this.sliderParts.thumbs) {
      if (on) thumb.setAttribute('aria-readonly', 'true');
      else thumb.removeAttribute('aria-readonly');
    }
  }

  protected override get focusElement(): HTMLElement {
    return this.sliderParts.thumbs[0];
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'tabStop') this.sliderParts.thumbs[1].tabIndex = value === false ? -1 : 0;
    // The label sits outside the thumbs: this marks it as the text of a disabled control too.
    else if (name === 'enabled') {
      if (value === false) this.element.setAttribute('aria-disabled', 'true');
      else this.element.removeAttribute('aria-disabled');
    }
  }

  // Values.

  private get sliderParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.buildParts());
  }

  private buildParts(): Parts {
    const control = element('div', 'mx-slider__control');
    const track = control.appendChild(element('div', 'mx-slider__track'));
    const rail = track.appendChild(element('div', 'mx-slider__rail'));
    const fill = rail.appendChild(element('div', 'mx-slider__fill'));
    const thumbs = [createThumb('start'), createThumb('end')];
    track.append(...thumbs);
    const ticks = control.appendChild(element('div', 'mx-slider__ticks'));
    ticks.setAttribute('aria-hidden', 'true');
    ticks.hidden = true;
    return {
      control,
      track,
      fill,
      ticks,
      thumbs,
      bubbles: thumbs.map((thumb) => thumb.firstElementChild as HTMLSpanElement),
      inputs: [],
      shown: null,
      drag: null,
      formatter: null,
      stopNames: null,
      ready: false,
    };
  }

  /** A property; while the constructor is still binding the props it is read from them. */
  private option<T>(name: Own, fallback: T): T {
    const stored = this.peekProperty<T | null>(name);
    if (stored !== undefined && stored !== null) return stored;
    const prop = this.sliderParts.ready ? undefined : ((this.props ?? {}) as SliderProps)[name];
    return prop === undefined ? fallback : ((untracked(() => read(prop as Bind<T>)) ?? fallback) as T);
  }

  private get bounds(): { min: number; max: number; step: number } {
    const min = toNumber(this.option('min', 0), 0);
    const max = Math.max(min, toNumber(this.option('max', 100), 100));
    const step = Math.max(0, toNumber(this.option('step', 1), 1));
    return { min, max, step };
  }

  private get gap(): number {
    return Math.max(0, toNumber(this.option('minDistance', 0), 0));
  }

  /** What an arrow key moves by: a step, or a hundredth of the track without steps. */
  private get unit(): number {
    const { min, max, step } = this.bounds;
    return step > 0 ? step : (max - min) / 100;
  }

  private snap(value: number): number {
    const { min, max, step } = this.bounds;
    let v = Math.min(max, Math.max(min, value));
    if (step > 0) {
      const places = Math.min(20, Math.max(decimals(step), decimals(min)));
      v = Number((min + Math.round((v - min) / step) * step).toFixed(places));
      if (v > max) v = Number((v - step).toFixed(places));
    }
    return v;
  }

  /** `current` with one thumb moved to `raw`, on a step and away from the other thumb. */
  private place(current: SliderValue, thumb: number, raw: number): SliderValue {
    const v = this.snap(raw);
    if (!Array.isArray(current)) return v;
    const { min, max } = this.bounds;
    const gap = this.gap;
    return thumb === 0 ? [Math.max(min, Math.min(v, current[1] - gap)), current[1]] : [current[0], Math.min(max, Math.max(v, current[0] + gap))];
  }

  /** The bounds, the steps or the mode changed: the value follows and is written back. */
  private conform(): void {
    const parts = this.sliderParts;
    if (!parts.ready) return;
    this.renderRange();
    const stored = this.peekProperty<SliderValue>('value');
    if (stored !== undefined) {
      const next = this.normalizeValue(stored);
      if (!this.sameValue(next, stored) || Array.isArray(next) !== Array.isArray(stored)) {
        this.changeProperty('value', next);
        this.bindings.writeModel(next);
      }
    }
    this.draw();
    this.renderTicks();
  }

  // Drawing.

  private draw(): void {
    const parts = this.sliderParts;
    if (!parts.ready) return;
    const value = parts.shown ?? this.peekValue();
    const { min, max } = this.bounds;
    const span = max - min || 1;
    const at = (v: number) => `${((v - min) / span) * 100}%`;
    const gap = this.gap;
    if (Array.isArray(value)) {
      const [start, end] = value;
      parts.fill.style.setProperty('--_from', at(start));
      parts.fill.style.setProperty('--_to', at(end));
      this.drawThumb(0, start, min, end - gap, at);
      this.drawThumb(1, end, start + gap, max, at);
    } else {
      parts.fill.style.setProperty('--_from', '0%');
      parts.fill.style.setProperty('--_to', at(value));
      this.drawThumb(0, value, min, max, at);
    }
    const committed = this.peekValue();
    const values = Array.isArray(committed) ? committed : [committed];
    parts.inputs.forEach((input, i) => (input.value = String(values[i] ?? '')));
  }

  private drawThumb(index: number, value: number, low: number, high: number, at: (v: number) => string): void {
    const parts = this.sliderParts;
    const thumb = parts.thumbs[index];
    thumb.style.setProperty('--_at', at(value));
    thumb.setAttribute('aria-valuenow', String(value));
    thumb.setAttribute('aria-valuemin', String(low));
    thumb.setAttribute('aria-valuemax', String(high));
    const describe = this.peekProperty<((value: number) => string) | null>('valueText');
    const text = describe ? describe(value) : this.peekProperty('format') ? this.formatValue(value) : '';
    if (text) thumb.setAttribute('aria-valuetext', text);
    else thumb.removeAttribute('aria-valuetext');
    parts.bubbles[index].textContent = this.formatValue(value);
  }

  private renderRange(): void {
    const parts = this.sliderParts;
    const range = !!this.peekProperty('range');
    this.element.toggleAttribute('data-range', range);
    parts.thumbs[1].hidden = !range;
    if (range && !parts.stopNames) {
      // The thumb names come from uiLocale.
      parts.stopNames = effect(() => {
        void uiLocale.strings;
        untracked(() => this.renderNames());
      });
    } else if (!range && parts.stopNames) {
      parts.stopNames();
      parts.stopNames = null;
    }
    this.renderNames();
    this.renderInputs();
  }

  private renderNames(): void {
    const parts = this.sliderParts;
    if (!parts.ready) return;
    const control = parts.control;
    const label = this.element.querySelector<HTMLElement>('.mx-field__label');
    const message = this.element.querySelector<HTMLElement>('.mx-field__message');
    const labelId = label && !label.hidden ? label.id : '';
    const range = !!this.peekProperty('range');
    // One thumb carries the name itself; two are a group named by the label, each thumb by its end.
    if (range) {
      control.setAttribute('role', 'group');
      if (labelId) control.setAttribute('aria-labelledby', labelId);
    } else {
      control.removeAttribute('role');
      control.removeAttribute('aria-labelledby');
    }
    const names = [uiLocale.strings.minimum, uiLocale.strings.maximum];
    parts.thumbs.forEach((thumb, i) => {
      thumb.id ||= `${control.id}-${i ? 'end' : 'start'}`;
      if (range) thumb.setAttribute('aria-label', names[i]);
      else thumb.removeAttribute('aria-label');
      const ids = labelId && range ? `${labelId} ${thumb.id}` : labelId;
      if (ids) thumb.setAttribute('aria-labelledby', ids);
      else thumb.removeAttribute('aria-labelledby');
      if (message) thumb.setAttribute('aria-describedby', message.id);
    });
  }

  private renderOrientation(): void {
    const vertical = this.peekProperty('orientation') === 'vertical';
    this.element.dataset.orientation = vertical ? 'vertical' : 'horizontal';
    for (const thumb of this.sliderParts.thumbs) thumb.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
  }

  private renderFormat(): void {
    this.sliderParts.formatter = null;
    this.draw();
    this.renderTicks();
  }

  private renderTicks(): void {
    const parts = this.sliderParts;
    if (!parts.ready) return;
    const { min, max, step } = this.bounds;
    const ticks = this.peekProperty<boolean | number>('ticks');
    const labels = !!this.peekProperty('tickLabels');
    const values: number[] = [];
    if (ticks === true && step > 0) {
      const count = Math.floor((max - min) / step + 1e-9);
      const places = Math.min(20, Math.max(decimals(step), decimals(min)));
      if (count <= MAX_TICKS) for (let i = 0; i <= count; i++) values.push(Number((min + i * step).toFixed(places)));
    } else if (typeof ticks === 'number' && ticks > 0) {
      const count = Math.min(MAX_TICKS, Math.floor(ticks));
      for (let i = 0; i <= count; i++) values.push(min + ((max - min) * i) / count);
    }
    const marks = values.length > 0;
    if (!marks && labels && max > min) values.push(min, max);
    const span = max - min || 1;
    parts.ticks.replaceChildren(
      ...values.map((v) => {
        const tick = element('span', 'mx-slider__tick');
        tick.style.setProperty('--_at', `${((v - min) / span) * 100}%`);
        if (marks) tick.dataset.mark = '';
        if (labels) tick.appendChild(element('span', 'mx-slider__tick-label')).textContent = this.formatValue(v);
        return tick;
      }),
    );
    parts.ticks.hidden = !values.length;
    this.element.toggleAttribute('data-ticks', marks);
    this.element.toggleAttribute('data-tick-labels', labels && values.length > 0);
  }

  /** Hidden inputs that send the value with a form. */
  private renderInputs(): void {
    const parts = this.sliderParts;
    if (!parts.ready) return;
    const name = this.peekProperty<string>('name');
    const count = name ? (this.peekProperty('range') ? 2 : 1) : 0;
    while (parts.inputs.length > count) parts.inputs.pop()!.remove();
    while (parts.inputs.length < count) {
      const input = element('input', 'mx-slider__input');
      input.type = 'hidden';
      parts.inputs.push(input);
      this.element.append(input);
    }
    for (const input of parts.inputs) input.name = name ?? '';
    this.draw();
  }

  // Pointer and keys.

  private get vertical(): boolean {
    return this.peekProperty('orientation') === 'vertical';
  }

  private get rtl(): boolean {
    return getComputedStyle(this.sliderParts.track).direction === 'rtl';
  }

  private listen(): void {
    const parts = this.sliderParts;
    parts.control.addEventListener('pointerdown', (e) => this.pointerDown(e));
    parts.control.addEventListener('pointermove', (e) => this.pointerMove(e));
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
      parts.control.addEventListener(type, (e) => this.pointerUp(e));
    }
    parts.thumbs.forEach((thumb, i) => thumb.addEventListener('keydown', (e) => this.keyDown(e, i)));
  }

  /** How far a point is from the `min` end of the track, in pixels; `null` while the track has no size. */
  private positionOf(point: { clientX: number; clientY: number }): number | null {
    const rect = this.sliderParts.track.getBoundingClientRect();
    if (this.vertical) return rect.height > 0 ? rect.bottom - point.clientY : null;
    if (rect.width <= 0) return null;
    return this.rtl ? rect.right - point.clientX : point.clientX - rect.left;
  }

  private valueAt(position: number): number {
    const rect = this.sliderParts.track.getBoundingClientRect();
    const length = this.vertical ? rect.height : rect.width;
    const { min, max } = this.bounds;
    return min + Math.min(1, Math.max(0, position / length)) * (max - min);
  }

  private nearestThumb(target: number): number {
    const value = this.sliderParts.shown ?? this.peekValue();
    if (!Array.isArray(value)) return 0;
    const [start, end] = value;
    const toStart = Math.abs(target - start);
    const toEnd = Math.abs(target - end);
    if (toStart !== toEnd) return toStart < toEnd ? 0 : 1;
    return target < start ? 0 : 1;
  }

  private pointerDown(e: PointerEvent): void {
    const parts = this.sliderParts;
    if (e.button !== 0 || parts.drag || !this.isEnabled) return;
    const hit = (e.target as Element).closest('.mx-slider__thumb');
    const position = this.positionOf(e);
    let thumb = hit ? parts.thumbs.indexOf(hit as HTMLDivElement) : -1;
    if (thumb < 0) thumb = position === null ? 0 : this.nearestThumb(this.valueAt(position));
    const moving = !this.peekProperty('readOnly') && position !== null;
    let offset = 0;
    if (hit && position !== null) {
      const box = hit.getBoundingClientRect();
      offset = position - (this.positionOf({ clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 }) ?? position);
    }
    // A press on a thumb focuses it the browser's way; a press beside it focuses it on release,
    // after the browser's own focus handling, so the keyboard focus ring stays away in both cases.
    parts.drag = { thumb, offset, pointer: e.pointerId, moving, focus: !hit };
    try {
      parts.control.setPointerCapture(e.pointerId);
    } catch {
      // Not a real pointer (a synthetic event): moves are still followed on the control.
    }
    if (!moving) return;
    parts.thumbs[thumb].toggleAttribute('data-dragging', true);
    this.element.toggleAttribute('data-dragging', true);
    if (!hit && position !== null) this.moveTo(thumb, this.valueAt(position), e);
  }

  private pointerMove(e: PointerEvent): void {
    const drag = this.sliderParts.drag;
    if (!drag?.moving || e.pointerId !== drag.pointer) return;
    const position = this.positionOf(e);
    if (position !== null) this.moveTo(drag.thumb, this.valueAt(position - drag.offset), e);
  }

  private pointerUp(e: PointerEvent): void {
    const parts = this.sliderParts;
    const drag = parts.drag;
    if (!drag || e.pointerId !== drag.pointer) return;
    parts.drag = null;
    if (drag.focus) parts.thumbs[drag.thumb].focus({ preventScroll: true });
    parts.thumbs[drag.thumb].removeAttribute('data-dragging');
    this.element.removeAttribute('data-dragging');
    const shown = parts.shown;
    parts.shown = null;
    if (shown !== null) this.commit(shown, e);
    this.draw();
  }

  private moveTo(thumb: number, raw: number, event: Event): void {
    const parts = this.sliderParts;
    const next = this.place(parts.shown ?? this.peekValue(), thumb, raw);
    if (this.peekProperty('updateOn') === 'change') {
      parts.shown = next;
      this.draw();
    } else {
      this.commit(next, event);
    }
  }

  private keyDown(e: KeyboardEvent, thumb: number): void {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const { min, max } = this.bounds;
    const unit = this.unit;
    const large = toNumber(this.peekProperty('largeStep'), unit * 10);
    const current = this.peekValue();
    const value = Array.isArray(current) ? current[thumb] : current;
    // In a right-to-left page a horizontal slider grows to the left.
    const back = !this.vertical && this.rtl;
    let next: number;
    switch (e.key) {
      case 'ArrowUp':
        next = value + unit;
        break;
      case 'ArrowDown':
        next = value - unit;
        break;
      case 'ArrowRight':
        next = back ? value - unit : value + unit;
        break;
      case 'ArrowLeft':
        next = back ? value + unit : value - unit;
        break;
      case 'PageUp':
        next = value + large;
        break;
      case 'PageDown':
        next = value - large;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (this.peekProperty('readOnly') || !this.isEnabled) return;
    this.commit(this.place(current, thumb, next), e);
  }
}
