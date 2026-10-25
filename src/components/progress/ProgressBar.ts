import { effect, type Bind, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import type { ProgressBarProps } from './progress-bar-props';
import type { ProgressLabelPosition } from './progress-label-position';
import type { ProgressTone } from './progress-tone';

const OWN = ['value', 'min', 'max', 'labelPosition', 'showValue', 'locale', 'tone', 'size', 'stretch'] as const;

const LOOK = ['labelPosition', 'tone', 'size', 'stretch'] as const;

const PARTS = Symbol('mx.progress');

interface Parts {
  head: HTMLDivElement;
  label: HTMLSpanElement;
  value: HTMLSpanElement;
  bar: HTMLDivElement;
  percent: Intl.NumberFormat | null;
  stopName: (() => void) | null;
}

function toNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Shows how far some work is: a bar that fills from `min` to `max`, or, while `value` is `null`,
 * one that runs to and fro. A label and the percent can go above it or beside it.
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
  constructor(props?: IBaseProp<ProgressBarProps>) {
    super(props);
    const own = (this.props ?? {}) as ProgressBarProps;
    this.element.classList.add('mx-progress');
    this.element.setAttribute('role', 'progressbar');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.valueText) this.setProperty('valueText', own.valueText);

    this.observeProperty<string>('text', (text) => this.renderLabel(text));
    for (const name of ['value', 'min', 'max', 'showValue', 'valueText'] as const) this.observeProperty(name, () => this.renderValue());
    this.observeProperty('locale', () => {
      this.parts.percent = null;
      this.renderValue();
    });
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.motif.setDisposable(() => this.parts.stopName?.());
  }

  // Properties (see ProgressBarProps).

  /** `null` while the progress is not known. */
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
  get labelPosition(): ProgressLabelPosition {
    return this.getProperty<ProgressLabelPosition | undefined>('labelPosition') ?? 'top';
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
  /** A function, so it is stored as it is, never bound. */
  get valueText(): ((value: number, fraction: number) => string) | null {
    return this.getProperty<((value: number, fraction: number) => string) | null | undefined>('valueText') ?? null;
  }
  set valueText(value: ((value: number, fraction: number) => string) | null) {
    this.setProperty('valueText', value);
  }

  /** How much is done, from 0 to 1; `null` while it is not known. Reactive. */
  get fraction(): number | null {
    const value = this.value;
    if (value === null) return null;
    const min = this.min;
    const max = Math.max(min, this.max);
    return max > min ? (Math.min(max, Math.max(min, value)) - min) / (max - min) : 1;
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
    return { head, label, value, bar, percent: null, stopName: null };
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
      parts.stopName ??= effect(() => this.element.setAttribute('aria-label', uiLocale.strings.loading));
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
      parts.bar.style.removeProperty('--_value');
      parts.value.textContent = '';
      this.renderHead();
      return;
    }
    const min = toNumber(this.peekProperty('min'), 0);
    const max = Math.max(min, toNumber(this.peekProperty('max'), 100));
    const value = Math.min(max, Math.max(min, Number(raw)));
    const fraction = max > min ? (value - min) / (max - min) : 1;
    parts.bar.style.setProperty('--_value', `${fraction * 100}%`);
    const describe = this.peekProperty<((value: number, fraction: number) => string) | null>('valueText');
    const text = describe ? describe(value, fraction) : this.formatPercent(fraction);
    el.setAttribute('aria-valuenow', String(value));
    el.setAttribute('aria-valuemin', String(min));
    el.setAttribute('aria-valuemax', String(max));
    el.setAttribute('aria-valuetext', text);
    parts.value.textContent = this.peekProperty('showValue') ? text : '';
    this.renderHead();
  }

  /** Whole percents, rounded down: 99.6 % of the work is not 100 %. */
  private formatPercent(fraction: number): string {
    const parts = this.parts;
    if (!parts.percent) {
      const locale = this.peekProperty<string>('locale') || document.documentElement.lang || undefined;
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
    data.labelPosition = this.peekProperty<ProgressLabelPosition>('labelPosition') ?? 'top';
    data.tone = this.peekProperty<ProgressTone>('tone') ?? 'accent';
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    this.element.toggleAttribute('data-stretch', !!this.peekProperty('stretch'));
  }
}
