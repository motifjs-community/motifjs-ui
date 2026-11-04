import type { Bind, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { mark, put } from '../../core/draw-parts';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import { Avatar } from './Avatar';
import type { AvatarGroupLayout } from './avatar-group-layout';
import type { AvatarGroupProps } from './avatar-group-props';
import type { AvatarSize } from './avatar-size';

const OWN = ['size', 'layout', 'max', 'total', 'label'] as const;

/**
 * Avatars side by side, or stacked each over the one before it (the design language's layout), all
 * of one size. Past `max`, and up to `total`, the rest are counted in a `+N` avatar after them.
 *
 * @example
 * <AvatarGroup max={3} label="Members">
 *   <Avatar name="Ada Lovelace" />
 *   <Avatar name="Alan Turing" />
 *   <Avatar name="Grace Hopper" />
 *   <Avatar name="Edsger Dijkstra" />
 * </AvatarGroup>
 */
export class AvatarGroup extends Control<HTMLDivElement, AvatarGroupProps> {
  /** A layout not given is the design language's. */
  private readonly look = new LanguageLook(this.element, { layout: '--_avatar-group-layout' }, () => this.renderLook());
  /** The `+N` for those not shown. */
  private readonly more = new Avatar({ tone: 'standard' });

  constructor(props?: IBaseProp<AvatarGroupProps>) {
    super('div', props);
    const own = (this.props ?? {}) as AvatarGroupProps;
    this.element.classList.add('mx-avatar-group');
    this.element.setAttribute('role', 'group');
    this.more.element.classList.add('mx-avatar-group__more');
    if (this.childs?.length) this.controls.add(...this.childs);
    this.controls.add(this.more);
    void this.motif.on(
      'controladded',
      () => {
        // The `+N` stays after the avatars, whenever they are added.
        if (this.controls.items.at(-1) !== this.more) this.controls.move(this.more);
        this.renderShown();
      },
      false,
    );
    void this.motif.on('controlremoved', () => this.renderShown(), false);
    // Avatars from a JSX list come and go inside the list, not as the group's own controls: only the
    // group's own children are watched, nothing below them.
    if (typeof MutationObserver === 'function') {
      const rows = new MutationObserver(() => this.renderShown());
      rows.observe(this.element, { childList: true });
      this.motif.setDisposable(() => rows.disconnect());
    }
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    for (const name of ['max', 'total', 'label'] as const) this.observeProperty(name, () => this.renderShown());
    for (const name of ['size', 'layout'] as const) this.observeProperty(name, () => this.renderLook());
    onLanguage(this, () => this.renderShown());
    this.motif.setDisposable(this.look.watch());
  }

  // Properties (see AvatarGroupProps).

  get size(): AvatarSize {
    return this.getProperty<AvatarSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<AvatarSize>) {
    this.assignProperty('size', value);
  }
  get layout(): AvatarGroupLayout {
    return this.getProperty<AvatarGroupLayout | undefined>('layout') ?? (this.look.get('layout') as AvatarGroupLayout | null) ?? 'stack';
  }
  set layout(value: Bind<AvatarGroupLayout>) {
    this.assignProperty('layout', value);
  }
  get max(): number | null {
    return countOf(this.getProperty('max'));
  }
  set max(value: Bind<number | null>) {
    this.assignProperty('max', value);
  }
  get total(): number | null {
    return countOf(this.getProperty('total'));
  }
  set total(value: Bind<number | null>) {
    this.assignProperty('total', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** The elements of the avatars given, in order, from JSX lists too (the `+N` is not one of them). */
  get avatars(): HTMLElement[] {
    return Array.from(this.element.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== this.more.element && el.classList.contains('mx-avatar'),
    );
  }

  /** How many are counted in the `+N`; 0 when it does not show. */
  get hiddenCount(): number {
    const given = this.avatars.length;
    const max = countOf(this.peekProperty('max'));
    const total = Math.max(countOf(this.peekProperty('total')) ?? given, given);
    const shown = max === null ? given : Math.min(given, max);
    return total - shown;
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
  }

  private renderShown(): void {
    const max = countOf(this.peekProperty('max'));
    this.avatars.forEach((el, i) => mark(el, 'data-beyond', max !== null && i >= max));
    const hidden = this.hiddenCount;
    this.more.initials = uiLocale.text('moreItems', { count: hidden });
    this.more.label = uiLocale.text('avatarGroupMore', { count: hidden });
    mark(this.more.element, 'data-beyond', hidden <= 0);
    put(this.element, 'aria-label', this.peekProperty<string>('label') || null);
  }

  private renderLook(): void {
    put(this.element, 'data-size', this.peekProperty<AvatarSize>('size') ?? 'md');
    put(this.element, 'data-layout', this.peekProperty<AvatarGroupLayout>('layout') ?? (this.look.get('layout') as AvatarGroupLayout | null) ?? 'stack');
  }
}

/** A whole count of 0 or more, else none. */
function countOf(value: unknown): number | null {
  const n = typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}
