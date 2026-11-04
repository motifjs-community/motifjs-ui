import type { Bind, ComponentBase, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import type { BadgePosition } from './badge-position';
import type { BadgeProps } from './badge-props';
import type { BadgeTone } from './badge-tone';
import type { BadgeVariant } from './badge-variant';

const OWN = ['count', 'max', 'showZero', 'dot', 'tone', 'variant', 'size', 'position', 'label'] as const;

const SHOWN = ['count', 'max', 'showZero', 'dot', 'label'] as const;

const LOOK = ['tone', 'variant', 'size', 'position'] as const;

/**
 * A short text, a count or a dot: in the flow of the text, or on a corner of what it is in
 * (`position`). A count over `max` shows `max+`, a count of 0 hides unless `showZero`; numbers are
 * written in the kit's language. Its tone and look default to the design language's.
 *
 * @example
 * <Badge text="New" tone="success" />
 * <Button text="Inbox"><Badge count={() => this.inbox.unread} position="top-end" label={() => `${this.inbox.unread} unread`} /></Button>
 *
 * const badge = Badge.attach(this.bell, { count: 3 });
 * badge.count = 0; // hides
 */
export class Badge extends Control<HTMLSpanElement, BadgeProps> {
  /** Puts a badge on a corner of `target` (`top-end` unless `props` says otherwise): one of its children, it goes with it. */
  static attach(target: ComponentBase, props: BadgeProps = {}): Badge {
    const badge = new Badge({ position: 'top-end', ...props });
    // What it is on a corner of is its anchor.
    (target.element as HTMLElement).classList.add('mx-badge-anchor');
    target.controls.add(badge);
    return badge;
  }

  /** A tone, look or size not given is the design language's. */
  private readonly look = new LanguageLook(this.element, { tone: '--_badge-tone', variant: '--_badge-variant' }, () => this.renderLook());

  constructor(props?: IBaseProp<BadgeProps>) {
    super(props);
    const own = (this.props ?? {}) as BadgeProps;
    this.element.classList.add('mx-badge');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    this.observeProperty('text', () => this.renderShown());
    for (const name of SHOWN) this.observeProperty(name, () => this.renderShown());
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    // The count is written in the kit's language.
    onLanguage(this, () => this.renderShown());
    this.motif.setDisposable(this.look.watch());
  }

  // Properties (see BadgeProps).

  get count(): number | null {
    const count = this.getProperty<number | null | undefined>('count');
    return typeof count === 'number' && Number.isFinite(count) ? count : null;
  }
  set count(value: Bind<number | null>) {
    this.assignProperty('count', value);
  }
  get max(): number {
    const max = Number(this.getProperty('max'));
    return Number.isFinite(max) && max > 0 ? Math.floor(max) : 99;
  }
  set max(value: Bind<number>) {
    this.assignProperty('max', value);
  }
  get showZero(): boolean {
    return !!this.getProperty<boolean>('showZero');
  }
  set showZero(value: Bind<boolean>) {
    this.assignProperty('showZero', value, Boolean);
  }
  get dot(): boolean {
    return !!this.getProperty<boolean>('dot');
  }
  set dot(value: Bind<boolean>) {
    this.assignProperty('dot', value, Boolean);
  }
  get tone(): BadgeTone {
    return this.getProperty<BadgeTone | undefined>('tone') ?? (this.look.get('tone') as BadgeTone | null) ?? 'accent';
  }
  set tone(value: Bind<BadgeTone>) {
    this.assignProperty('tone', value);
  }
  get variant(): BadgeVariant {
    return this.getProperty<BadgeVariant | undefined>('variant') ?? (this.look.get('variant') as BadgeVariant | null) ?? 'solid';
  }
  set variant(value: Bind<BadgeVariant>) {
    this.assignProperty('variant', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get position(): BadgePosition | null {
    return this.getProperty<BadgePosition | null | undefined>('position') ?? null;
  }
  set position(value: Bind<BadgePosition | null>) {
    this.assignProperty('position', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** What it shows now: the count as written (`99+`), else the text; `''` for a dot. */
  get shownText(): string {
    if (this.peekProperty('dot')) return '';
    const count = this.peekCount();
    if (count === null) return this.peekProperty<string>('text') ?? '';
    const max = this.peekMax();
    const format = new Intl.NumberFormat(uiLocale.locale);
    return count > max ? `${format.format(max)}+` : format.format(count);
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
  }

  private peekCount(): number | null {
    const count = this.peekProperty<number | null>('count');
    return typeof count === 'number' && Number.isFinite(count) ? count : null;
  }

  private peekMax(): number {
    const max = Number(this.peekProperty('max'));
    return Number.isFinite(max) && max > 0 ? Math.floor(max) : 99;
  }

  private renderShown(): void {
    const el = this.element;
    const dot = !!this.peekProperty('dot');
    const count = this.peekCount();
    const text = this.shownText;
    if (el.textContent !== text) el.textContent = text;
    el.toggleAttribute('data-dot', dot);
    // Nothing to say: a count of 0 (unless shown), or no count, no text and no dot.
    const empty = dot ? count === 0 && !this.peekProperty('showZero') : count === null ? !text : count === 0 && !this.peekProperty('showZero');
    el.toggleAttribute('data-empty', empty);
    const label = this.peekProperty<string>('label') ?? '';
    if (label) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', label);
      el.removeAttribute('aria-hidden');
    } else {
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
      // A dot without a name says nothing to a screen reader.
      el.toggleAttribute('aria-hidden', dot);
    }
  }

  private renderLook(): void {
    const data = this.element.dataset;
    data.tone = this.peekProperty<BadgeTone>('tone') ?? (this.look.get('tone') as BadgeTone | null) ?? 'accent';
    data.variant = this.peekProperty<BadgeVariant>('variant') ?? (this.look.get('variant') as BadgeVariant | null) ?? 'solid';
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    const position = this.peekProperty<BadgePosition | null>('position') ?? null;
    if (position) data.position = position;
    else delete data.position;
    // What it is on a corner of is its anchor.
    const parent = this.element.parentElement;
    if (parent && position) {
      parent.classList.add('mx-badge-anchor');
      this.measureAnchor(parent);
    }
  }

  /** The anchor's frame: the badge sits on its outer corner, not inside its border. */
  private measureAnchor(anchor: HTMLElement): void {
    if (typeof getComputedStyle !== 'function') return;
    const style = getComputedStyle(anchor);
    const rtl = style.direction === 'rtl';
    const edges: [string, string][] = [
      ['--_edge-top', style.borderTopWidth],
      ['--_edge-bottom', style.borderBottomWidth],
      ['--_edge-start', rtl ? style.borderRightWidth : style.borderLeftWidth],
      ['--_edge-end', rtl ? style.borderLeftWidth : style.borderRightWidth],
    ];
    for (const [name, width] of edges) {
      const value = width || '0px';
      if (this.element.style.getPropertyValue(name) !== value) this.element.style.setProperty(name, value);
    }
  }
}
