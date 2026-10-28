import { effect, type Bind, type ComponentBase, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { deepActiveElement, focusInitial, isFocusable } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import type { ProgressTone } from './progress-tone';
import type { SpinnerLabelPosition } from './spinner-label-position';
import type { SpinnerProps } from './spinner-props';

const OWN = ['labelPosition', 'size', 'tone', 'contained', 'delay'] as const;

const LOOK = ['labelPosition', 'size', 'tone', 'contained'] as const;

const PARTS = Symbol('mx.spinner');

interface Parts {
  label: HTMLSpanElement;
  timer: ReturnType<typeof setTimeout> | null;
  stopName: (() => void) | null;
}

/**
 * A turning ring, or a shape that turns into the next one, as the design language draws it, that says "busy,
 * wait": alone, with a label, after a delay so quick work does
 * not flash it, or over a container while it loads (`Spinner.cover`). Screen readers meet it as
 * a progress bar without a value, named by its label or `uiLocale.strings.loading`.
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
   * Covers a container with a spinner until the returned function is called: what is under it
   * cannot be pressed or focused (it is `inert`), the container is `aria-busy`, and focus that
   * was inside waits on the spinner and comes back afterwards. A static container becomes
   * `position: relative` meanwhile.
   */
  static cover(target: ComponentBase | HTMLElement, props: SpinnerProps = {}): () => void {
    const host = target instanceof HTMLElement ? target : (target.element as HTMLElement);
    const spinner = new Spinner({ size: 'lg', labelPosition: 'bottom', ...props });
    spinner.element.setAttribute('data-cover', '');
    const covered = Array.from(host.children).filter((child) => !child.hasAttribute('inert'));
    const active = deepActiveElement();
    const hadFocus = !!active && host.contains(active);
    const busy = host.getAttribute('aria-busy');
    host.setAttribute('aria-busy', 'true');
    host.setAttribute('data-mx-covered', '');
    if (target instanceof HTMLElement) {
      spinner.build();
      host.append(spinner.element);
    } else {
      target.controls.add(spinner);
    }
    // Focus moves to the spinner before what held it turns inert, so it is never dropped.
    if (hadFocus) {
      spinner.element.tabIndex = -1;
      spinner.element.focus({ preventScroll: true });
    }
    for (const child of covered) child.setAttribute('inert', '');

    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      for (const child of covered) child.removeAttribute('inert');
      if (busy === null) host.removeAttribute('aria-busy');
      else host.setAttribute('aria-busy', busy);
      host.removeAttribute('data-mx-covered');
      if (spinner.focused) {
        if (active?.isConnected && isFocusable(active)) active.focus({ preventScroll: true });
        else focusInitial(host);
      }
      spinner.element.remove();
      void spinner.dispose();
    };
  }

  constructor(props?: IBaseProp<SpinnerProps>) {
    super(props);
    const own = (this.props ?? {}) as SpinnerProps;
    this.element.classList.add('mx-spinner');
    // An indeterminate progress bar rather than a live region: it is named and found like any
    // widget, and it does not interrupt the reader each time one appears.
    this.element.setAttribute('role', 'progressbar');
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

  /** Still inside its delay, not seen yet. Not reactive. */
  get waiting(): boolean {
    return this.element.hasAttribute('data-waiting');
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
    const box = document.createElement('span');
    box.className = 'mx-spinner__box';
    box.setAttribute('aria-hidden', 'true');
    const ring = document.createElement('span');
    ring.className = 'mx-spinner__ring';
    const shape = document.createElement('span');
    shape.className = 'mx-spinner__shape';
    box.append(ring, shape);
    const label = document.createElement('span');
    label.className = 'mx-spinner__label';
    label.id = nextId('spinner');
    this.element.append(box, label);
    return { label, timer: null, stopName: null };
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
  }

  private renderLook(): void {
    const data = this.element.dataset;
    data.labelPosition = this.peekProperty<SpinnerLabelPosition>('labelPosition') ?? 'side';
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    data.tone = this.peekProperty<ProgressTone>('tone') ?? 'accent';
    this.element.toggleAttribute('data-contained', !!this.peekProperty('contained'));
  }

  /** Stays unseen for `delay` milliseconds from now. */
  private wait(): void {
    const parts = this.parts;
    if (parts.timer) clearTimeout(parts.timer);
    parts.timer = null;
    const delay = Math.max(0, Number(this.peekProperty('delay')) || 0);
    this.element.toggleAttribute('data-waiting', delay > 0);
    if (delay > 0) {
      parts.timer = setTimeout(() => {
        parts.timer = null;
        this.element.removeAttribute('data-waiting');
      }, delay);
    }
  }
}
