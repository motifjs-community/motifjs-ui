import { read, untracked, type Bind, type Component, type ComponentBase, type IBaseProp } from '@motifx/core';
import { loose, part, removePart } from '../../core/draw-parts';
import { focusOn } from '../../core/focus';
import { css, flag, kept, mark, put, text as writeText } from '../../core/part-writes';
import { LanguageLook } from '../../core/language-look';
import { isRtl, rectOf, type Rect } from '../../core/measure';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { Field } from '../../parts/field/Field';
import type { SliderOrientation } from './slider-orientation';
import type { SliderProps } from './slider-props';
import type { SliderShowValue } from './slider-show-value';
import type { SliderValue } from './slider-value';
import { onLanguage } from '../../core/on-language';

const OWN = [
  'min',
  'max',
  'step',
  'largeStep',
  'range',
  'minDistance',
  'origin',
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

/** The label of a tick, made the first time labels show. */
const TICK_LABELS = new WeakMap<ComponentBase, Component<HTMLSpanElement>>();

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

/** The track as read at the start of a pointer event: where it is and which way it grows. */
interface TrackRead {
  rect: Rect;
  vertical: boolean;
  rtl: boolean;
}

interface Parts {
  /** The control as a component, the field's control: the track and the ticks are its parts. */
  controlPart: Component<HTMLDivElement>;
  trackPart: Component<HTMLDivElement>;
  /** Carries `--_from` / `--_to` and what lies at each end of the active segment. */
  rail: Component<HTMLDivElement>;
  ticksPart: Component<HTMLDivElement>;
  /** The values of the marks drawn, in their order. */
  tickValues: number[];
  /** The marks drawn, in the same order. */
  tickParts: Component<HTMLSpanElement>[];
  thumbParts: Component<HTMLDivElement>[];
  /** The ids of the thumbs, `[start, end]`: a range names each thumb by the label and its own name. */
  thumbIds: string[];
  bubbles: Component<HTMLSpanElement>[];
  inputParts: Component<HTMLInputElement>[];
  /** The value drawn while a thumb moves with `updateOn: 'change'`. */
  shown: SliderValue | null;
  drag: Drag | null;
  formatter: Intl.NumberFormat | null;
  stopNames: (() => void) | null;
  /** The props are bound; until then the renderers wait. */
  ready: boolean;
}

/** A thumb as a part of the track, with the value's bubble. */
function createThumb(track: ComponentBase, name: 'start' | 'end', id: string): { thumb: Component<HTMLDivElement>; bubble: Component<HTMLSpanElement> } {
  const thumb = part<HTMLDivElement>(track, 'div', 'mx-slider__thumb');
  thumb.attr.add({ id, 'data-thumb': name, role: 'slider' });
  put(thumb, 'tabindex', '0');
  // The thumb is the pressable area; what shows is drawn inside it: a halo, the knob with its core, the value.
  part(thumb, 'span', 'mx-slider__halo');
  part(part(thumb, 'span', 'mx-slider__knob'), 'span', 'mx-slider__core');
  const bubble = part<HTMLSpanElement>(thumb, 'span', 'mx-slider__bubble');
  bubble.attr.add({ 'aria-hidden': 'true' });
  return { thumb, bubble };
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
 * A value selected on a track by dragging a thumb or with the keyboard: one number, or a range with two
 * thumbs that cannot cross. It supports steps, marks with labels, a value tooltip, a vertical orientation and number
 * formatting, and `Field` provides the label, help line and validation. `x-model` provides two-way binding.
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
  /** What the design language decides: a track split around the thumbs (a gap there). */
  private readonly trackLook = new LanguageLook(this, { gap: '--_slider-track-gap', originGap: '--_slider-origin-gap' }, () => this.renderTrack());

  constructor(props?: IBaseProp<SliderProps>) {
    super(props);
    this.motif.setDisposable(this.trackLook.watch());
    const own = (this.props ?? {}) as SliderProps;
    this.class.add('mx-slider');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.valueText) this.setProperty('valueText', own.valueText);

    for (const name of ['min', 'max', 'step', 'range', 'minDistance'] as const) this.observeProperty(name, () => this.conform());
    this.observeProperty('origin', () => this.draw());
    this.observeProperty('orientation', () => this.renderOrientation());
    this.observeProperty('ticks', () => this.renderTicks());
    this.observeProperty('tickLabels', () => this.renderTicks());
    this.observeProperty('format', () => this.renderFormat());
    this.observeProperty('locale', () => this.renderFormat());
    onLanguage(this, () => this.renderFormat());
    this.observeProperty('valueText', () => this.draw());
    this.observeProperty<SliderShowValue>('showValue', (show) => put(this, 'data-show-value', show ?? 'never'));
    this.observeProperty('name', () => this.renderInputs());
    this.observeProperty('text', () => this.renderNames());
    // A slider always has a value, and ARIA has no aria-required for it.
    this.observeProperty('required', () => put(this.sliderParts.controlPart, 'aria-required', null));
    this.observeProperty<boolean>('invalid', (on) => {
      for (const thumb of this.sliderParts.thumbParts) flag(thumb, 'aria-invalid', on);
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
  /** The start of the active part of the track on a one-thumb slider. `undefined` means the start of the track. */
  get origin(): number | undefined {
    const origin = this.getProperty<number | null | undefined>('origin');
    return origin === null || origin === undefined ? undefined : toNumber(origin, 0);
  }
  set origin(value: Bind<number | undefined>) {
    this.assignProperty('origin', value);
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
  /** Because it is a function, it is stored as is and not bound. */
  get valueText(): ((value: number) => string) | null {
    return this.getProperty<((value: number) => string) | null | undefined>('valueText') ?? null;
  }
  set valueText(value: ((value: number) => string) | null) {
    this.setProperty('valueText', value);
  }

  /** The thumbs as components, `[start, end]`. The end thumb is hidden without a range. */
  get thumbParts(): readonly ComponentBase<HTMLDivElement>[] {
    return [...this.sliderParts.thumbParts];
  }

  /** Formats a value the same way as the tooltip and the tick labels. */
  formatValue(value: number): string {
    const parts = this.sliderParts;
    if (!parts.formatter) {
      const options = this.peekProperty<Intl.NumberFormatOptions | null>('format') ?? undefined;
      const locale = this.peekProperty<string>('locale') || uiLocale.locale;
      try {
        parts.formatter = new Intl.NumberFormat(locale, options);
      } catch {
        parts.formatter = new Intl.NumberFormat();
      }
    }
    return parts.formatter.format(value);
  }

  // For Field.

  protected createControl(): ComponentBase {
    return this.sliderParts.controlPart;
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
    // The array given comes back as it is; the one held stays when the same pair comes in another form.
    if (Array.isArray(value) && value[0] === start && value[1] === end) return value;
    const current = this.peekProperty<SliderValue>('value');
    if (Array.isArray(current) && current[0] === start && current[1] === end) return current;
    return [start, end];
  }

  protected renderValue(): void {
    this.draw();
  }

  protected override renderReadOnly(on: boolean): void {
    mark(this, 'data-readonly', on);
    for (const thumb of this.sliderParts.thumbParts) flag(thumb, 'aria-readonly', on);
  }

  override onMounted(): void {
    super.onMounted();
    this.trackLook.read();
  }

  override get focusPart(): ComponentBase {
    return this.sliderParts.thumbParts[0];
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'tabStop') put(this.sliderParts.thumbParts[1], 'tabindex', value === false ? '-1' : '0');
    // The label sits outside the thumbs: this marks it as the text of a disabled control too.
    else if (name === 'enabled') {
      if (value === false) put(this, 'aria-disabled', 'true');
      else put(this, 'aria-disabled', null);
      // A disabled field sends nothing with its form, as a native one.
      for (const input of this.sliderParts.inputParts) mark(input, 'disabled', value === false);
    }
  }

  // Values.

  private get sliderParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.buildParts());
  }

  private buildParts(): Parts {
    const controlPart = loose<HTMLDivElement>('div', 'mx-slider__control');
    const trackPart = part<HTMLDivElement>(controlPart, 'div', 'mx-slider__track');
    const rail = part<HTMLDivElement>(trackPart, 'div', 'mx-slider__rail');
    // The inactive segments before and after the active one (the fill); they draw only on a split track.
    for (const side of ['before', 'after']) part<HTMLDivElement>(rail, 'div', 'mx-slider__segment').attr.add({ 'data-side': side });
    part(rail, 'div', 'mx-slider__fill');
    const id = nextId('slider');
    const thumbIds = [`${id}-start`, `${id}-end`];
    const made = [createThumb(trackPart, 'start', thumbIds[0]), createThumb(trackPart, 'end', thumbIds[1])];
    const ticksPart = part<HTMLDivElement>(controlPart, 'div', 'mx-slider__ticks');
    ticksPart.attr.add({ 'aria-hidden': 'true' });
    mark(ticksPart, 'hidden', true);
    return {
      controlPart,
      trackPart,
      rail,
      ticksPart,
      tickValues: [],
      tickParts: [],
      thumbParts: made.map((m) => m.thumb),
      thumbIds,
      bubbles: made.map((m) => m.bubble),
      inputParts: [],
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
      this.drawThumb(0, start, min, end - gap, at);
      this.drawThumb(1, end, start + gap, max, at);
    } else {
      this.drawThumb(0, value, min, max, at);
    }
    // The active segment and what lies at its ends: the start, a thumb or the origin.
    const [from, to] = this.activeSpan(value);
    const origin = this.originValue();
    const rail = parts.rail;
    css(rail, '--_from', Array.isArray(value) || origin !== null ? at(from) : '0%');
    css(rail, '--_to', at(to));
    // An origin at an end of the track is that end; a thumb on the origin has the thumb on both sides.
    const { min: low, max: high } = this.bounds;
    const fromKind = Array.isArray(value) || (origin !== null && value <= origin) ? 'thumb' : origin === null || origin <= low ? 'start' : 'origin';
    const toKind = Array.isArray(value) || origin === null || value >= origin ? 'thumb' : origin >= high ? 'end' : 'origin';
    put(rail, 'data-from', fromKind);
    put(rail, 'data-to', toKind);
    mark(rail, 'data-start-active', from <= min);
    mark(rail, 'data-end-active', to >= max);
    this.markTicks(from, to);
    const committed = this.peekValue();
    const values = Array.isArray(committed) ? committed : [committed];
    parts.inputParts.forEach((input, i) => input.attr.add({ value: String(values[i] ?? '') }));
  }

  /** The values the active segment spans: from the start, the origin or the first thumb to the value or the second thumb. */
  private activeSpan(value: SliderValue): [number, number] {
    const { min } = this.bounds;
    if (Array.isArray(value)) return [value[0], value[1]];
    const origin = this.originValue();
    if (origin === null) return [min, value];
    return value < origin ? [value, origin] : [origin, value];
  }

  /** The origin inside the bounds; `null` without one, and with a range. */
  private originValue(): number | null {
    const origin = this.peekProperty<number | null>('origin');
    if (origin === null || origin === undefined || this.peekProperty('range')) return null;
    const { min, max } = this.bounds;
    return Math.min(max, Math.max(min, toNumber(origin, min)));
  }

  /** Marks inside the active segment are drawn in its color. */
  private markTicks(from: number, to: number): void {
    const parts = this.sliderParts;
    parts.tickParts.forEach((tick, i) => mark(tick, 'data-active', parts.tickValues[i] >= from && parts.tickValues[i] <= to));
  }

  private renderTrack(): void {
    const look = this.trackLook;
    const zero = (v: string | null) => v === null || parseFloat(v) === 0;
    mark(this, 'data-split', !zero(look.get('gap')) || !zero(look.get('originGap')));
  }

  private drawThumb(index: number, value: number, low: number, high: number, at: (v: number) => string): void {
    const parts = this.sliderParts;
    const thumb = parts.thumbParts[index];
    css(thumb, '--_at', at(value));
    put(thumb, 'aria-valuenow', String(value));
    put(thumb, 'aria-valuemin', String(low));
    put(thumb, 'aria-valuemax', String(high));
    const describe = this.peekProperty<((value: number) => string) | null>('valueText');
    const text = describe ? describe(value) : this.peekProperty('format') ? this.formatValue(value) : '';
    if (text) put(thumb, 'aria-valuetext', text);
    else put(thumb, 'aria-valuetext', null);
    writeText(parts.bubbles[index], this.formatValue(value));
  }

  private renderRange(): void {
    const parts = this.sliderParts;
    const range = !!this.peekProperty('range');
    mark(this, 'data-range', range);
    mark(parts.thumbParts[1], 'hidden', !range);
    if (range && !parts.stopNames) {
      // The thumb names come from uiLocale.
      parts.stopNames = onLanguage(this, () => this.renderNames());
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
    const control = parts.controlPart;
    const labelId = this.labelId;
    const range = !!this.peekProperty('range');
    // One thumb carries the name itself; two are a group named by the label, each thumb by its end.
    if (range) {
      put(control, 'role', 'group');
      if (labelId) put(control, 'aria-labelledby', labelId);
    } else {
      put(control, 'role', null);
      put(control, 'aria-labelledby', null);
    }
    const names = [uiLocale.strings.minimum, uiLocale.strings.maximum];
    parts.thumbParts.forEach((thumb, i) => {
      if (range) put(thumb, 'aria-label', names[i]);
      else put(thumb, 'aria-label', null);
      const ids = labelId && range ? `${labelId} ${parts.thumbIds[i]}` : labelId;
      if (ids) put(thumb, 'aria-labelledby', ids);
      else put(thumb, 'aria-labelledby', null);
      put(thumb, 'aria-describedby', this.messageId);
    });
  }

  private renderOrientation(): void {
    const vertical = this.peekProperty('orientation') === 'vertical';
    put(this, 'data-orientation', vertical ? 'vertical' : 'horizontal');
    for (const thumb of this.sliderParts.thumbParts) put(thumb, 'aria-orientation', vertical ? 'vertical' : 'horizontal');
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
    // A tick stays in its place and is moved and written there; only the ticks no longer needed go.
    while (parts.tickParts.length > values.length) removePart(parts.tickParts.pop());
    values.forEach((v, i) => {
      const tick = parts.tickParts[i] ?? part<HTMLSpanElement>(parts.ticksPart, 'span', 'mx-slider__tick');
      parts.tickParts[i] = tick;
      css(tick, '--_at', `${((v - min) / span) * 100}%`);
      mark(tick, 'data-mark', marks);
      let label = TICK_LABELS.get(tick);
      if (labels && !label) TICK_LABELS.set(tick, (label = part<HTMLSpanElement>(tick, 'span', 'mx-slider__tick-label')));
      if (!label) return;
      if (labels) writeText(label, this.formatValue(v));
      kept(label, labels);
    });
    parts.tickValues = values;
    mark(parts.ticksPart, 'hidden', !values.length);
    mark(this, 'data-ticks', marks);
    mark(this, 'data-tick-labels', labels && values.length > 0);
    this.markTicks(...this.activeSpan(parts.shown ?? this.peekValue()));
  }

  /** Hidden inputs that send the value with a form. */
  private renderInputs(): void {
    const parts = this.sliderParts;
    if (!parts.ready) return;
    const name = this.peekProperty<string>('name');
    const count = name ? (this.peekProperty('range') ? 2 : 1) : 0;
    while (parts.inputParts.length > count) removePart(parts.inputParts.pop());
    while (parts.inputParts.length < count) {
      const input = part<HTMLInputElement>(this, 'input', 'mx-slider__input');
      input.attr.add({ type: 'hidden' });
      parts.inputParts.push(input);
    }
    for (const input of parts.inputParts) {
      put(input, 'name', name ?? '');
      mark(input, 'disabled', !this.enabled);
    }
    this.draw();
  }

  // Pointer and keys.

  private get vertical(): boolean {
    return this.peekProperty('orientation') === 'vertical';
  }

  /** Read first in a pointer event, before anything is written. */
  private readTrack(): TrackRead {
    const track = this.sliderParts.trackPart;
    return { rect: rectOf(track), vertical: this.vertical, rtl: isRtl(track) };
  }

  private listen(): void {
    const parts = this.sliderParts;
    const control = parts.controlPart;
    control.motif.on('pointerdown', (_, e) => this.pointerDown(e));
    control.motif.on('pointermove', (_, e) => this.pointerMove(e));
    control.motif.on('pointerup', (_, e) => this.pointerUp(e));
    control.motif.on('pointercancel', (_, e) => this.pointerUp(e));
    control.motif.on('lostpointercapture', (_, e) => this.pointerUp(e));
    parts.thumbParts.forEach((thumb, i) => thumb.motif.on('keydown', (_, e) => this.keyDown(e, i)));
  }

  /** How far a point is from the `min` end of the track, in pixels; `null` while the track has no size. */
  private positionOf(track: TrackRead, point: { clientX: number; clientY: number }): number | null {
    const { rect } = track;
    if (track.vertical) return rect.height > 0 ? rect.bottom - point.clientY : null;
    if (rect.width <= 0) return null;
    return track.rtl ? rect.right - point.clientX : point.clientX - rect.left;
  }

  private valueAt(track: TrackRead, position: number): number {
    const length = track.vertical ? track.rect.height : track.rect.width;
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
    const hit = parts.thumbParts.findIndex((t) => t.motif.isEventFrom(e));
    const track = this.readTrack();
    const box = hit >= 0 ? rectOf(parts.thumbParts[hit]) : null;
    const position = this.positionOf(track, e);
    const value = position === null ? null : this.valueAt(track, position);
    const thumb = hit >= 0 ? hit : value === null ? 0 : this.nearestThumb(value);
    const moving = !this.peekProperty('readOnly') && position !== null;
    let offset = 0;
    if (box && position !== null) {
      offset = position - (this.positionOf(track, { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 }) ?? position);
    }
    // A click on a thumb focuses it the browser's way; a click beside it focuses it on release,
    // after the browser's own focus handling, so the keyboard focus ring stays away in both cases.
    parts.drag = { thumb, offset, pointer: e.pointerId, moving, focus: hit < 0 };
    try {
      parts.controlPart.attr.add({ setPointerCapture: e.pointerId });
    } catch {
      // Not a real pointer (a synthetic event): moves are still followed on the control.
    }
    if (!moving) return;
    mark(parts.thumbParts[thumb], 'data-dragging', true);
    mark(this, 'data-dragging', true);
    if (hit < 0 && value !== null) this.moveTo(thumb, value, e);
  }

  private pointerMove(e: PointerEvent): void {
    const drag = this.sliderParts.drag;
    if (!drag?.moving || e.pointerId !== drag.pointer) return;
    const track = this.readTrack();
    const position = this.positionOf(track, e);
    if (position !== null) this.moveTo(drag.thumb, this.valueAt(track, position - drag.offset), e);
  }

  private pointerUp(e: PointerEvent): void {
    const parts = this.sliderParts;
    const drag = parts.drag;
    if (!drag || e.pointerId !== drag.pointer) return;
    parts.drag = null;
    if (drag.focus) focusOn(parts.thumbParts[drag.thumb], { preventScroll: true });
    mark(parts.thumbParts[drag.thumb], 'data-dragging', false);
    mark(this, 'data-dragging', false);
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
    // In a right-to-left page a horizontal slider grows to the left.
    const back = !this.vertical && isRtl(this.sliderParts.trackPart);
    const { min, max } = this.bounds;
    const unit = this.unit;
    const large = toNumber(this.peekProperty('largeStep'), unit * 10);
    const current = this.peekValue();
    const value = Array.isArray(current) ? current[thumb] : current;
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
