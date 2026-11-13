import type { Bind, Component, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { part } from '../../core/draw-parts';
import { css, mark, put, text as writeText } from '../../core/part-writes';
import { svgComponent } from '../../parts/chart/svg-parts';
import type { ControlSize } from '../../core/control-size';
import { LanguageLook } from '../../core/language-look';
import { isInPage } from '../../core/measure';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import type { ProgressBarProps } from './progress-bar-props';
import type { ProgressLabelPosition } from './progress-label-position';
import type { ProgressShape } from './progress-shape';
import type { ProgressTone } from './progress-tone';
import { ProgressWave, type WaveLook } from './ProgressWave';
import { easing } from './wave-geometry';
import { onLanguage } from '../../core/on-language';

const OWN = ['value', 'min', 'max', 'shape', 'labelPosition', 'showValue', 'locale', 'tone', 'size', 'stretch'] as const;

const LOOK = ['shape', 'labelPosition', 'tone', 'size', 'stretch'] as const;

const WAVE_NAMES = ['amplitude', 'length', 'speed', 'direction', 'start', 'end', 'grow-duration'] as const;

type WaveName = `${'line' | 'circle'}-${(typeof WAVE_NAMES)[number]}`;

/** The wave the design language gives the line (`wave-*`) and the circle (`ring-wave-*`). */
const WAVE = {
  easing: '--mx-motion-easing-standard',
  ...Object.fromEntries(WAVE_NAMES.map((name) => [`line-${name}`, `--_progress-wave-${name}`])),
  ...Object.fromEntries(WAVE_NAMES.map((name) => [`circle-${name}`, `--_progress-ring-wave-${name}`])),
} as Record<WaveName | 'easing', string>;

const PARTS = Symbol('mx.progress');

interface Parts {
  head: Component<HTMLDivElement>;
  label: Component<HTMLSpanElement>;
  labelId: string;
  value: Component<HTMLSpanElement>;
  /** What the label and the value show now, as written. */
  hasLabel: boolean;
  hasValue: boolean;
  /** Carries `--_value`, for the bar and for the rest of the track after it. */
  track: Component<HTMLDivElement>;
  bar: Component<HTMLDivElement>;
  /** The ring and the arc, once the bar is a circle. */
  circle: Component<SVGSVGElement> | null;
  wave: ProgressWave | null;
  percent: Intl.NumberFormat | null;
  stopName: (() => void) | null;
}

function toNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Shows the progress of an operation: a bar that fills from `min` to `max`, or an arc around a circle
 * (`shape="circle"`). While `value` is `null`, the bar shows continuous motion and the arc rotates. A label and
 * the percentage can appear above, below or beside it. Where the design language includes a wave, the line
 * or the arc moves as it grows.
 *
 * @example
 * <ProgressBar label="Uploading" value={() => this.upload.sent} max={() => this.upload.size} showValue />
 * <ProgressBar label="Preparing" value={null} />
 *
 * const bar = new ProgressBar({ label: 'Import', showValue: true, tone: 'success' });
 * this.panel.controls.add(bar);
 * bar.value = 40;
 */
export class ProgressBar extends Control<HTMLDivElement, ProgressBarProps> {
  /** What the design language decides: a wave, and how it swings. */
  private readonly waveLook = new LanguageLook(this, WAVE, () => this.renderWave());

  constructor(props?: IBaseProp<ProgressBarProps>) {
    super(props);
    this.motif.setDisposable(this.waveLook.watch());
    const own = (this.props ?? {}) as ProgressBarProps;
    this.class.add('mx-progress');
    this.attr.add({ role: 'progressbar' });
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.valueText) this.setProperty('valueText', own.valueText);

    this.observeProperty<string>('text', (text) => this.renderLabel(text));
    for (const name of ['value', 'min', 'max', 'showValue', 'valueText'] as const) this.observeProperty(name, () => this.renderValue());
    // Its own locale or the kit's language: how the percentage is written.
    const drawLocale = () => {
      this.parts.percent = null;
      this.renderValue();
    };
    this.observeProperty('locale', drawLocale);
    onLanguage(this, drawLocale);
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.motif.setDisposable(() => {
      this.parts.stopName?.();
      this.parts.wave?.dispose();
    });
  }

  // Properties (see ProgressBarProps).

  /** `null` while the progress is unknown. */
  get value(): number | null {
    const value = this.getProperty<number | null | undefined>('value');
    return value === null || value === undefined ? null : toNumber(value, 0);
  }
  set value(value: Bind<number | null>) {
    this.assignProperty('value', value);
  }
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
  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get shape(): ProgressShape {
    return this.getProperty<ProgressShape | undefined>('shape') ?? 'line';
  }
  set shape(value: Bind<ProgressShape>) {
    this.assignProperty('shape', value);
  }
  get labelPosition(): ProgressLabelPosition {
    return this.getProperty<ProgressLabelPosition | undefined>('labelPosition') ?? (this.shape === 'circle' ? 'bottom' : 'top');
  }
  set labelPosition(value: Bind<ProgressLabelPosition>) {
    this.assignProperty('labelPosition', value);
  }
  get showValue(): boolean {
    return !!this.getProperty<boolean>('showValue');
  }
  set showValue(value: Bind<boolean>) {
    this.assignProperty('showValue', value, Boolean);
  }
  get locale(): string {
    return this.getProperty<string | undefined>('locale') ?? '';
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get tone(): ProgressTone {
    return this.getProperty<ProgressTone | undefined>('tone') ?? 'accent';
  }
  set tone(value: Bind<ProgressTone>) {
    this.assignProperty('tone', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get stretch(): boolean {
    return !!this.getProperty<boolean>('stretch');
  }
  set stretch(value: Bind<boolean>) {
    this.assignProperty('stretch', value, Boolean);
  }
  /** Because it is a function, it is stored as is and not bound. */
  get valueText(): ((value: number, fraction: number) => string) | null {
    return this.getProperty<((value: number, fraction: number) => string) | null | undefined>('valueText') ?? null;
  }
  set valueText(value: ((value: number, fraction: number) => string) | null) {
    this.setProperty('valueText', value);
  }

  /** The completed share from 0 to 1, or `null` while the progress is unknown. Reactive. */
  get fraction(): number | null {
    const value = this.value;
    if (value === null) return null;
    const min = this.min;
    const max = Math.max(min, this.max);
    return max > min ? (Math.min(max, Math.max(min, value)) - min) / (max - min) : 1;
  }

  override onMounted(): void {
    this.waveLook.read();
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.buildParts());
  }

  private buildParts(): Parts {
    const headPart = part<HTMLDivElement>(this, 'div', 'mx-progress__head');
    const label = part<HTMLSpanElement>(headPart, 'span', 'mx-progress__label');
    const labelId = nextId('progress');
    label.attr.add({ id: labelId });
    const value = part<HTMLSpanElement>(headPart, 'span', 'mx-progress__value');
    const trackPart = part<HTMLDivElement>(this, 'div', 'mx-progress__track');
    const bar = part<HTMLDivElement>(trackPart, 'div', 'mx-progress__bar');
    return {
      head: headPart,
      label,
      labelId,
      value,
      hasLabel: false,
      hasValue: false,
      track: trackPart,
      bar,
      circle: null,
      wave: null,
      percent: null,
      stopName: null,
    };
  }

  /** The ring, right after the track; made the first time it is needed. */
  private buildCircle(): Component<SVGSVGElement> {
    const track = this.parts.track;
    const circle = svgComponent(this, 'svg', 'mx-progress__circle');
    // After the track, before what follows it.
    const items = this.controls.items;
    const next = items[items.indexOf(track) + 1];
    if (next && next !== circle) this.controls.move(circle, next);
    circle.attr.add({ 'aria-hidden': 'true' });
    for (const name of ['mx-progress__ring', 'mx-progress__arc']) svgComponent(circle, 'circle', name);
    return circle;
  }

  private renderLabel(text: string): void {
    const parts = this.parts;
    writeText(parts.label, text ?? '');
    parts.hasLabel = !!text;
    mark(parts.label, 'hidden', !text);
    if (text) {
      parts.stopName?.();
      parts.stopName = null;
      put(this, 'aria-label', null);
      put(this, 'aria-labelledby', parts.labelId);
    } else {
      put(this, 'aria-labelledby', null);
      parts.stopName ??= onLanguage(this, () => put(this, 'aria-label', uiLocale.strings.loading));
    }
    this.renderHead();
  }

  private renderValue(): void {
    const parts = this.parts;
    const raw = this.peekProperty<number | null>('value');
    const known = raw !== null && raw !== undefined && Number.isFinite(Number(raw));
    put(this, 'data-state', known ? 'determinate' : 'indeterminate');
    if (!known) {
      for (const name of ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext']) put(this, name, null);
      css(this, '--_fraction', '');
      mark(this, 'data-complete', false);
      writeText(parts.value, '');
      parts.hasValue = false;
      this.renderHead();
      this.renderWave();
      return;
    }
    const min = toNumber(this.peekProperty('min'), 0);
    const max = Math.max(min, toNumber(this.peekProperty('max'), 100));
    const value = Math.min(max, Math.max(min, Number(raw)));
    const fraction = max > min ? (value - min) / (max - min) : 1;
    css(this, '--_fraction', String(fraction));
    mark(this, 'data-complete', fraction >= 1);
    const describe = this.peekProperty<((value: number, fraction: number) => string) | null>('valueText');
    const text = describe ? describe(value, fraction) : this.formatPercent(fraction);
    put(this, 'aria-valuenow', String(value));
    put(this, 'aria-valuemin', String(min));
    put(this, 'aria-valuemax', String(max));
    put(this, 'aria-valuetext', text);
    const shown = this.peekProperty('showValue') ? text : '';
    writeText(parts.value, shown);
    parts.hasValue = !!shown;
    this.renderHead();
    this.renderWave();
  }

  /** Whole percents, rounded down: 99.6 % of the work is not 100 %. */
  private formatPercent(fraction: number): string {
    const parts = this.parts;
    if (!parts.percent) {
      const locale = this.peekProperty<string>('locale') || uiLocale.locale;
      try {
        parts.percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 });
      } catch {
        parts.percent = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });
      }
    }
    return parts.percent.format(Math.floor(fraction * 100) / 100);
  }

  private renderHead(): void {
    const parts = this.parts;
    mark(parts.value, 'hidden', !parts.hasValue);
    mark(parts.head, 'hidden', !parts.hasLabel && !parts.hasValue);
  }

  private renderLook(): void {
    const shape = this.peekProperty<ProgressShape>('shape') ?? 'line';
    if (shape === 'circle') this.parts.circle ??= this.buildCircle();
    put(this, 'data-shape', shape);
    put(this, 'data-label-position', this.peekProperty<ProgressLabelPosition>('labelPosition') ?? (shape === 'circle' ? 'bottom' : 'top'));
    put(this, 'data-tone', this.peekProperty<ProgressTone>('tone') ?? 'accent');
    put(this, 'data-size', this.peekProperty<ControlSize>('size') ?? 'md');
    mark(this, 'data-stretch', !!this.peekProperty('stretch'));
    this.renderWave();
  }

  /** A wave while the value is known and the language gives the shape one; nothing is drawn by script otherwise. */
  private renderWave(): void {
    const parts = this.parts;
    const shape = this.peekProperty<ProgressShape>('shape') ?? 'line';
    const look = this.readWave(shape);
    const raw = this.peekProperty<number | null>('value');
    const known = raw !== null && raw !== undefined && Number.isFinite(Number(raw));
    if (!known || look.amplitude <= 0 || !isInPage(this)) {
      parts.wave?.dispose();
      parts.wave = null;
      mark(this, 'data-wave', false);
      return;
    }
    if (parts.wave?.shape !== shape) {
      parts.wave?.dispose();
      const holder = shape === 'circle' ? (parts.circle ??= this.buildCircle()) : parts.track;
      parts.wave = new ProgressWave(this, holder, shape, look);
    }
    mark(this, 'data-wave', true);
    parts.wave.update(look, this.fraction ?? 0);
  }

  private readWave(shape: ProgressShape): WaveLook {
    const look = this.waveLook;
    const get = (name: (typeof WAVE_NAMES)[number]) => look.get(`${shape}-${name}`);
    const ms = (value: string | null) => {
      const m = /^([\d.]+)(ms|s)$/.exec(value ?? '');
      return m ? Number(m[1]) * (m[2] === 's' ? 1000 : 1) : 0;
    };
    return {
      amplitude: parseFloat(get('amplitude') ?? '') || 0,
      length: parseFloat(get('length') ?? '') || 0,
      speed: ms(get('speed')),
      backward: get('direction') === 'backward',
      start: Number(get('start') ?? 0),
      end: Number(get('end') ?? 1),
      grow: ms(get('grow-duration')),
      easing: easing(look.get('easing')),
    };
  }
}
