import type { Bind, IBaseProp } from '@motifx/core';
import { css, put } from '../../core/draw-parts';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import { Field } from '../../parts/field/Field';
import type { RatingProps } from './rating-props';
import type { RatingTone } from './rating-tone';

const OWN = ['max', 'step', 'allowClear', 'preview', 'tone', 'emptyIcon', 'filledIcon'] as const;

/** One star: its box, the empty shape and the filled one over it. */
interface Star {
  item: HTMLSpanElement;
  fill: HTMLSpanElement;
}

/** A shape as the mask of a star: a name of the kit's icon set, or an image address. */
const maskOf = (icon: string | null | undefined): string =>
  !icon ? '' : /[:/.]/.test(icon) ? `url("${icon.replace(/"/g, '%22')}")` : `var(--mx-icon-${icon})`;

/**
 * A row of stars to give a score, or to show one (`readOnly`): whole stars or halves (`step`), any number of them
 * (`max`). Under the pointer the stars show what a click would give; a click on the value chosen clears it. A field:
 * label, help text, rules and `x-model` work as in every field. Keyboard: the arrow keys change it by a step,
 * Home and End go to the ends, a digit gives that many stars, Delete clears.
 *
 * @example
 * <Rating label="Your rating" x-model={() => this.review.stars} step={0.5} />
 * <Rating value={() => this.product.score} readOnly size="sm" />
 */
export class Rating extends Field<number | null, RatingProps> {
  /** A tone not given is the design language's. */
  private readonly look = new LanguageLook(this.element, { tone: '--_rating-tone' }, () => this.renderTone());
  private readonly stars: Star[] = [];
  /** The value the pointer points at, shown until it leaves. */
  private pointed: number | null = null;

  constructor(props?: IBaseProp<RatingProps>) {
    super(props);
    const own = (this.props ?? {}) as RatingProps;
    const row = this.focusElement;
    this.element.classList.add('mx-rating');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    // The field took the value before the step and the count were known: it is given again to fit them.
    if (own.value !== undefined) this.value = own.value;

    this.observeProperty('max', () => this.renderStars());
    this.observeProperty('step', () => this.renderValue(this.peekValue()));
    this.observeProperty('tone', () => this.renderTone());
    this.observeProperty<string | null>('emptyIcon', (icon) => css(this.element, '--_rating-star-icon', maskOf(icon)));
    this.observeProperty<string | null>('filledIcon', (icon) => css(this.element, '--_rating-fill-icon', maskOf(icon)));
    // The value is said in the kit's language.
    onLanguage(this, () => this.renderValue(this.peekValue()));
    row.addEventListener('pointermove', (e) => this.point(e));
    row.addEventListener('pointerleave', () => this.point(null));
    row.addEventListener('click', (e) => this.pressed(e));
    row.addEventListener('keydown', (e) => this.keyDown(e));
    this.motif.setDisposable(this.look.watch());
  }

  // Properties (see RatingProps).

  get max(): number {
    return this.countOf(this.getProperty('max'));
  }
  set max(value: Bind<number>) {
    this.assignProperty('max', value);
  }
  get step(): 1 | 0.5 {
    return this.getProperty('step') === 0.5 ? 0.5 : 1;
  }
  set step(value: Bind<1 | 0.5>) {
    this.assignProperty('step', value);
  }
  get allowClear(): boolean {
    return this.getProperty<boolean | undefined>('allowClear') !== false;
  }
  set allowClear(value: Bind<boolean>) {
    this.assignProperty('allowClear', value);
  }
  get preview(): boolean {
    return this.getProperty<boolean | undefined>('preview') !== false;
  }
  set preview(value: Bind<boolean>) {
    this.assignProperty('preview', value);
  }
  get tone(): RatingTone {
    return this.getProperty<RatingTone | undefined>('tone') ?? (this.look.get('tone') as RatingTone | null) ?? 'accent';
  }
  set tone(value: Bind<RatingTone>) {
    this.assignProperty('tone', value);
  }
  get emptyIcon(): string | null {
    return this.getProperty<string | null | undefined>('emptyIcon') ?? null;
  }
  set emptyIcon(value: Bind<string | null>) {
    this.assignProperty('emptyIcon', value);
  }
  get filledIcon(): string | null {
    return this.getProperty<string | null | undefined>('filledIcon') ?? null;
  }
  set filledIcon(value: Bind<string | null>) {
    this.assignProperty('filledIcon', value);
  }

  override onMounted(): void {
    super.onMounted();
    this.look.read();
    this.renderTone();
  }

  protected createControl(): HTMLElement {
    const row = document.createElement('div');
    row.className = 'mx-rating__stars';
    row.setAttribute('role', 'slider');
    row.setAttribute('aria-valuemin', '0');
    row.tabIndex = 0;
    return row;
  }

  protected emptyValue(): number | null {
    return null;
  }

  protected override normalizeValue(value: number | null): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    const step = this.peekProperty('step') === 0.5 ? 0.5 : 1;
    const max = this.countOf(this.peekProperty('max'));
    const stepped = Math.round(value / step) * step;
    return stepped <= 0 ? null : Math.min(stepped, max);
  }

  /** Draws the value, or what the pointer points at, and says it. */
  protected renderValue(value: number | null): void {
    // The field may draw its value before the stars are there; they draw it once made.
    if (!this.stars) return;
    const shown = this.pointed ?? value ?? 0;
    this.stars.forEach((star, i) => css(star.fill, '--_fill', `${Math.round(Math.min(Math.max(shown - i, 0), 1) * 100)}%`));
    const row = this.focusElement;
    const max = this.countOf(this.peekProperty('max'));
    put(row, 'aria-valuemax', String(max));
    put(row, 'aria-valuenow', String(value ?? 0));
    put(row, 'aria-valuetext', value === null ? uiLocale.strings.ratingNone : uiLocale.text('ratingValue', { value, max }));
  }

  private countOf(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 5;
  }

  /** Whether the user may change it now. */
  private get changeable(): boolean {
    return this.isEnabled && !this.peekProperty('readOnly');
  }

  private renderStars(): void {
    const row = this.focusElement;
    const max = this.countOf(this.peekProperty('max'));
    while (this.stars.length > max) this.stars.pop()!.item.remove();
    while (this.stars.length < max) {
      const item = document.createElement('span');
      item.className = 'mx-rating__item';
      item.setAttribute('aria-hidden', 'true');
      const star = document.createElement('span');
      star.className = 'mx-rating__star';
      const fill = document.createElement('span');
      fill.className = 'mx-rating__fill';
      item.append(star, fill);
      row.append(item);
      this.stars.push({ item, fill });
    }
    this.renderValue(this.peekValue());
  }

  /** The value a pointer at `e` would give: the star under it, or half of it. */
  private valueAt(e: MouseEvent): number | null {
    const at = this.stars.findIndex((star) => star.item.contains(e.target as Node));
    if (at < 0) return null;
    if (this.peekProperty('step') !== 0.5) return at + 1;
    const box = this.stars[at].item.getBoundingClientRect();
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const along = rtl ? box.right - e.clientX : e.clientX - box.left;
    return along < box.width / 2 ? at + 0.5 : at + 1;
  }

  private point(e: PointerEvent | null): void {
    const next = e && this.changeable && this.peekProperty('preview') !== false ? this.valueAt(e) : null;
    if (next === this.pointed) return;
    this.pointed = next;
    this.renderValue(this.peekValue());
  }

  private pressed(e: MouseEvent): void {
    if (!this.changeable) return;
    const next = this.valueAt(e);
    if (next === null) return;
    const clear = this.peekProperty('allowClear') !== false && next === this.peekValue();
    this.pointed = null;
    this.commit(clear ? null : next, e);
    this.renderValue(this.peekValue());
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey || !this.changeable) return;
    const step = this.peekProperty('step') === 0.5 ? 0.5 : 1;
    const max = this.countOf(this.peekProperty('max'));
    const now = this.peekValue() ?? 0;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const floor = this.peekProperty('allowClear') !== false ? 0 : step;
    let next: number | null;
    if (e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = Math.min(now + step, max);
    else if (e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = Math.max(now - step, floor);
    else if (e.key === 'Home') next = floor;
    else if (e.key === 'End') next = max;
    else if ((e.key === 'Delete' || e.key === 'Backspace') && floor === 0) next = 0;
    else if (/^[0-9]$/.test(e.key) && Number(e.key) <= max) next = Number(e.key) === 0 ? floor : Number(e.key);
    else return;
    e.preventDefault();
    this.commit(next <= 0 ? null : next, e);
    this.renderValue(this.peekValue());
  }

  private renderTone(): void {
    put(this.element, 'data-tone', this.peekProperty<RatingTone>('tone') ?? (this.look.get('tone') as RatingTone | null) ?? 'accent');
  }
}
