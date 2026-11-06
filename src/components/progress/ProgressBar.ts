import type { Bind, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { LanguageLook } from '../../core/language-look';
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

const SVG = 'http://www.w3.org/2000/svg';

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
  head: HTMLDivElement;
  label: HTMLSpanElement;
  value: HTMLSpanElement;
  /** Carries `--_value`, for the bar and for the rest of the track after it. */
  track: HTMLDivElement;
  bar: HTMLDivElement;
  /** The ring and the arc, once the bar is a circle. */
  circle: SVGSVGElement | null;
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
  private readonly waveLook = new LanguageLook(this.element, WAVE, () => this.renderWave());

  constructor(props?: IBaseProp<ProgressBarProps>) {
    super(props);
    this.motif.setDisposable(this.waveLook.watch());
    const own = (this.props ?? {}) as ProgressBarProps;
    this.element.classList.add('mx-progress');
    this.element.setAttribute('role', 'progressbar');
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
    const head = document.createElement('div');
    head.className = 'mx-progress__head';
    const label = head.appendChild(document.createElement('span'));
    label.className = 'mx-progress__label';
    label.id = nextId('progress');
    const value = head.appendChild(document.createElement('span'));
    value.className = 'mx-progress__value';
    const track = document.createElement('div');
    track.className = 'mx-progress__track';
    const bar = track.appendChild(document.createElement('div'));
    bar.className = 'mx-progress__bar';
    this.element.append(head, track);
    return { head, label, value, track, bar, circle: null, wave: null, percent: null, stopName: null };
  }

  private buildCircle(): SVGSVGElement {
    const circle = document.createElementNS(SVG, 'svg');
    circle.classList.add('mx-progress__circle');
    circle.setAttribute('aria-hidden', 'true');
    for (const name of ['mx-progress__ring', 'mx-progress__arc']) {
      const part = circle.appendChild(document.createElementNS(SVG, 'circle'));
      part.classList.add(name);
    }
    this.parts.track.after(circle);
    return circle;
  }

  private renderLabel(text: string): void {
    const parts = this.parts;
    parts.label.textContent = text ?? '';
    parts.label.hidden = !text;
    if (text) {
      parts.stopName?.();
      parts.stopName = null;
      this.element.removeAttribute('aria-label');
      this.element.setAttribute('aria-labelledby', parts.label.id);
    } else {
      this.element.removeAttribute('aria-labelledby');
      parts.stopName ??= onLanguage(this, () => this.element.setAttribute('aria-label', uiLocale.strings.loading));
    }
    this.renderHead();
  }

  private renderValue(): void {
    const parts = this.parts;
    const el = this.element;
    const raw = this.peekProperty<number | null>('value');
    const known = raw !== null && raw !== undefined && Number.isFinite(Number(raw));
    el.dataset.state = known ? 'determinate' : 'indeterminate';
    if (!known) {
      for (const name of ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext']) el.removeAttribute(name);
      el.style.removeProperty('--_fraction');
      el.removeAttribute('data-complete');
      parts.value.textContent = '';
      this.renderHead();
      this.renderWave();
      return;
    }
    const min = toNumber(this.peekProperty('min'), 0);
    const max = Math.max(min, toNumber(this.peekProperty('max'), 100));
    const value = Math.min(max, Math.max(min, Number(raw)));
    const fraction = max > min ? (value - min) / (max - min) : 1;
    el.style.setProperty('--_fraction', String(fraction));
    el.toggleAttribute('data-complete', fraction >= 1);
    const describe = this.peekProperty<((value: number, fraction: number) => string) | null>('valueText');
    const text = describe ? describe(value, fraction) : this.formatPercent(fraction);
    el.setAttribute('aria-valuenow', String(value));
    el.setAttribute('aria-valuemin', String(min));
    el.setAttribute('aria-valuemax', String(max));
    el.setAttribute('aria-valuetext', text);
    parts.value.textContent = this.peekProperty('showValue') ? text : '';
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
    parts.value.hidden = !parts.value.textContent;
    parts.head.hidden = parts.label.hidden && parts.value.hidden;
  }

  private renderLook(): void {
    const data = this.element.dataset;
    const shape = this.peekProperty<ProgressShape>('shape') ?? 'line';
    if (shape === 'circle') this.parts.circle ??= this.buildCircle();
    data.shape = shape;
    data.labelPosition = this.peekProperty<ProgressLabelPosition>('labelPosition') ?? (shape === 'circle' ? 'bottom' : 'top');
    data.tone = this.peekProperty<ProgressTone>('tone') ?? 'accent';
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    this.element.toggleAttribute('data-stretch', !!this.peekProperty('stretch'));
    this.renderWave();
  }

  /** A wave while the value is known and the language gives the shape one; nothing is drawn by script otherwise. */
  private renderWave(): void {
    const parts = this.parts;
    const shape = this.peekProperty<ProgressShape>('shape') ?? 'line';
    const look = this.readWave(shape);
    const raw = this.peekProperty<number | null>('value');
    const known = raw !== null && raw !== undefined && Number.isFinite(Number(raw));
    if (!known || look.amplitude <= 0 || !this.element.isConnected) {
      parts.wave?.dispose();
      parts.wave = null;
      this.element.removeAttribute('data-wave');
      return;
    }
    if (parts.wave?.shape !== shape) {
      parts.wave?.dispose();
      const holder = shape === 'circle' ? (parts.circle ??= this.buildCircle()) : parts.track;
      parts.wave = new ProgressWave(this.element, holder, shape, look);
    }
    this.element.setAttribute('data-wave', '');
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
