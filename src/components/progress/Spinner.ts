import { Component, type Bind, type ComponentBase, type IBaseProp } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { focusFirstIn, focusOn, rememberFocus } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { isElement } from '../../core/node-kind';
import { mark, put, text as writeText } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { ProgressTone } from './progress-tone';
import type { SpinnerLabelPosition } from './spinner-label-position';
import type { SpinnerProps } from './spinner-props';
import { onLanguage } from '../../core/on-language';

const OWN = ['labelPosition', 'size', 'tone', 'contained', 'delay'] as const;

const LOOK = ['labelPosition', 'size', 'tone', 'contained'] as const;

const PARTS = Symbol('mx.spinner');

interface Parts {
  label: Component<HTMLSpanElement>;
  labelId: string;
  timer: ReturnType<typeof setTimeout> | null;
  /** Still within its delay (`data-waiting`). */
  waiting: boolean;
  stopName: (() => void) | null;
}

/** What a cover makes inert: the components in `host` that are elements. */
function coveredIn(host: ComponentBase): ComponentBase[] {
  const found: ComponentBase[] = [];
  for (const child of host.controls.items) {
    if (isElement(child.element)) found.push(child);
    // A list or a branch has no element of its own: what it holds stands in the container.
    else if (child.element?.nodeType !== Node.TEXT_NODE) found.push(...coveredIn(child));
  }
  return found;
}

/**
 * A rotating ring, or a shape that changes into the next one, as drawn by the design language, that indicates a
 * wait: alone, with a label, after a delay so that quick operations show nothing, or over a container
 * while it loads (`Spinner.cover`). Screen readers announce it as a progress bar without a value, named by
 * its label or `uiLocale.strings.loading`.
 *
 * @example
 * <Spinner label="Loading orders" visible={() => this.orders.loading} delay={300} />
 *
 * const done = Spinner.cover(this.ordersPanel, { label: 'Loading orders' });
 * await this.orders.load();
 * done();
 */
export class Spinner extends Control<HTMLDivElement, SpinnerProps> {
  /**
   * Covers a container with a spinner until the returned function is called. The components the
   * container holds cannot be clicked or focused (they are `inert`), the container is `aria-busy`, and
   * focus that was inside moves to the spinner and returns afterward. A static container becomes
   * `position: relative` in the meantime.
   */
  static cover(host: ComponentBase, props: SpinnerProps = {}): () => void {
    const spinner = new Spinner({ size: 'lg', labelPosition: 'bottom', ...props });
    spinner.attr.add({ 'data-cover': '' });
    const covered = coveredIn(host);
    const focus = rememberFocus();
    const hadFocus = !!focus?.isIn(host);
    // Held, not written: each attribute gets its own value back when the cover goes.
    const holds = [host.attr.hold({ 'aria-busy': 'true', 'data-mx-covered': '' })];
    host.controls.add(spinner);
    // Focus moves to the spinner before what held it turns inert, so it is never dropped.
    if (hadFocus) {
      put(spinner, 'tabindex', '-1');
      focusOn(spinner, { preventScroll: true });
    }
    for (const child of covered) holds.push(child.attr.hold({ inert: '' }));

    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      for (const hold of holds.reverse()) hold.dispose();
      if (spinner.focused && !focus?.restore({ preventScroll: true })) focusFirstIn(host);
      if (spinner.parent) spinner.parent.controls.remove(spinner);
      else void spinner.dispose();
    };
  }

  constructor(props?: IBaseProp<SpinnerProps>) {
    super(props);
    const own = (this.props ?? {}) as SpinnerProps;
    this.class.add('mx-spinner');
    // An indeterminate progress bar rather than a live region: it is named and found like any
    // widget, and it does not interrupt the reader each time one appears.
    this.attr.add({ role: 'progressbar' });
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);

    this.observeProperty<string>('text', (text) => this.renderLabel(text));
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.observeProperty('delay', () => this.wait());
    this.motif.setDisposable(() => {
      const parts = this.parts;
      if (parts.timer) clearTimeout(parts.timer);
      parts.stopName?.();
    });
  }

  // Properties (see SpinnerProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get labelPosition(): SpinnerLabelPosition {
    return this.getProperty<SpinnerLabelPosition | undefined>('labelPosition') ?? 'side';
  }
  set labelPosition(value: Bind<SpinnerLabelPosition>) {
    this.assignProperty('labelPosition', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get tone(): ProgressTone {
    return this.getProperty<ProgressTone | undefined>('tone') ?? 'accent';
  }
  set tone(value: Bind<ProgressTone>) {
    this.assignProperty('tone', value);
  }
  get contained(): boolean {
    return !!this.getProperty<boolean>('contained');
  }
  set contained(value: Bind<boolean>) {
    this.assignProperty('contained', value, Boolean);
  }
  get delay(): number {
    return Math.max(0, Number(this.getProperty('delay')) || 0);
  }
  set delay(value: Bind<number>) {
    this.assignProperty('delay', value);
  }

  /** Indicates that it is still within its delay and not yet visible. Not reactive. */
  get waiting(): boolean {
    return this.parts.waiting;
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    // Each time it shows again the delay starts again.
    if (name === 'visible' && value) this.wait();
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.buildParts());
  }

  private buildParts(): Parts {
    // A box holding what turns: a ring and a shape; the language shows one of them, the box is the container.
    const box = part<HTMLSpanElement>(this, 'span', 'mx-spinner__box');
    box.attr.add({ 'aria-hidden': 'true' });
    part(box, 'span', 'mx-spinner__ring');
    part(box, 'span', 'mx-spinner__shape');
    const label = part<HTMLSpanElement>(this, 'span', 'mx-spinner__label');
    const labelId = nextId('spinner');
    label.attr.add({ id: labelId });
    return { label, labelId, timer: null, waiting: false, stopName: null };
  }

  private renderLabel(text: string): void {
    const parts = this.parts;
    writeText(parts.label, text ?? '');
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
  }

  private renderLook(): void {
    put(this, 'data-label-position', this.peekProperty<SpinnerLabelPosition>('labelPosition') ?? 'side');
    put(this, 'data-size', this.peekProperty<ControlSize>('size') ?? 'md');
    put(this, 'data-tone', this.peekProperty<ProgressTone>('tone') ?? 'accent');
    mark(this, 'data-contained', !!this.peekProperty('contained'));
  }

  /** Stays unseen for `delay` milliseconds from now. */
  private wait(): void {
    const parts = this.parts;
    if (parts.timer) clearTimeout(parts.timer);
    parts.timer = null;
    const delay = Math.max(0, Number(this.peekProperty('delay')) || 0);
    parts.waiting = delay > 0;
    mark(this, 'data-waiting', parts.waiting);
    if (delay > 0) {
      parts.timer = setTimeout(() => {
        parts.timer = null;
        parts.waiting = false;
        mark(this, 'data-waiting', false);
      }, delay);
    }
  }
}
