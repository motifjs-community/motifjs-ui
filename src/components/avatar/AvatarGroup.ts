import type { Bind, ComponentBase, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { mark, put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Avatar } from './Avatar';
import type { AvatarGroupLayout } from './avatar-group-layout';
import type { AvatarGroupProps } from './avatar-group-props';
import type { AvatarSize } from './avatar-size';

const OWN = ['size', 'layout', 'max', 'total', 'label'] as const;

/**
 * Avatars side by side, or stacked with each one over the previous one (the design language's layout), all
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
  private readonly look = new LanguageLook(this, { layout: '--_avatar-group-layout' }, () => this.renderLook());
  /** The `+N` for those not shown. */
  private readonly more = new Avatar({ tone: 'standard' });
  /** What the group hears: its avatars, and what holds avatars in its place (a JSX list, a condition, a fragment). */
  private readonly heard = new WeakSet<ComponentBase>();
  /** The avatars are counted again at the end of this turn. */
  private countDue = false;
  private disposing = false;

  constructor(props?: IBaseProp<AvatarGroupProps>) {
    super('div', props);
    const own = (this.props ?? {}) as AvatarGroupProps;
    this.class.add('mx-avatar-group');
    this.attr.add({ role: 'group' });
    this.more.class.add('mx-avatar-group__more');
    if (this.childs?.length) this.controls.add(...this.childs);
    this.controls.add(this.more);
    void this.motif.on(
      'controladded',
      (_sender, e: { control: ComponentBase }) => {
        // The `+N` stays after the avatars, whenever they are added.
        if (this.controls.items.at(-1) !== this.more) this.controls.move(this.more);
        this.listen(e.control);
        this.countLater();
      },
      false,
    );
    void this.motif.on('controlremoved', () => this.countLater(), false);
    // Avatars of a JSX list or a condition come and go inside what holds them: the group hears that too.
    for (const child of this.controls.items) this.listen(child);
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

  /** The avatars in the group, in order, those of JSX lists and conditions included. Hidden ones and the `+N` are not. */
  get members(): Avatar[] {
    return this.collect(this, []);
  }

  /** The number of people counted in the `+N`, or 0 when it is not shown. */
  get hiddenCount(): number {
    const given = this.members.length;
    const max = countOf(this.peekProperty('max'));
    const total = Math.max(countOf(this.peekProperty('total')) ?? given, given);
    const shown = max === null ? given : Math.min(given, max);
    return total - shown;
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
  }

  override onDisposing(): void {
    // Its avatars go with it: nothing is counted again.
    this.disposing = true;
  }

  /**
   * Hears, once, an avatar or what holds avatars in the group's place: an avatar added, built, shown, hidden or gone
   * has them counted again. Any other component keeps what is inside it.
   */
  private listen(component: ComponentBase): void {
    if (component === this.more || this.heard.has(component)) return;
    const avatar = component instanceof Avatar;
    if (!avatar && !holdsInPlace(component)) return;
    this.heard.add(component);
    const count = () => this.countLater();
    void component.motif.on('x:built', count);
    void component.motif.on('x:visibilityChanged', count);
    // A hide with a leave animation is over only then.
    void component.motif.on('x:deactivated', count);
    if (avatar) {
      void component.motif.on('x:disposed', count);
      return;
    }
    void component.motif.on(
      'controladded',
      (_sender, e: { control: ComponentBase }) => {
        this.listen(e.control);
        count();
      },
      false,
    );
    void component.motif.on('controlremoved', count, false);
    for (const child of component.controls.items) this.listen(child);
  }

  /** The avatars in `component` that are in the page, in order: what holds avatars is looked into, any other component is not. */
  private collect(component: ComponentBase, found: Avatar[]): Avatar[] {
    for (const child of component.controls.items) {
      if (child === this.more || child.isDisposed || child.isWait || !child.isVisible) continue;
      if (child instanceof Avatar) found.push(child);
      else if (holdsInPlace(child)) this.collect(child, found);
    }
    return found;
  }

  /** Counts the avatars again once the changes of this turn are in. */
  private countLater(): void {
    if (this.countDue) return;
    this.countDue = true;
    queueMicrotask(() => {
      this.countDue = false;
      // Disposal clears the group's own fields, `disposing` too; its disposed flag stays.
      if (!this.disposing && !this.isDisposed) this.renderShown();
    });
  }

  private renderShown(): void {
    const max = countOf(this.peekProperty('max'));
    this.members.forEach((avatar, i) => mark(avatar, 'data-beyond', max !== null && i >= max));
    const hidden = this.hiddenCount;
    this.more.initials = uiLocale.text('moreItems', { count: hidden });
    this.more.label = uiLocale.text('avatarGroupMore', { count: hidden });
    mark(this.more, 'data-beyond', hidden <= 0);
    put(this, 'aria-label', this.peekProperty<string>('label') || null);
  }

  private renderLook(): void {
    put(this, 'data-size', this.peekProperty<AvatarSize>('size') ?? 'md');
    put(this, 'data-layout', this.peekProperty<AvatarGroupLayout>('layout') ?? (this.look.get('layout') as AvatarGroupLayout | null) ?? 'stack');
  }
}

/** A JSX list, condition or fragment: its node is a comment, not an element, so what it holds stands in the group's place. */
function holdsInPlace(component: ComponentBase): boolean {
  return component.element?.nodeType === Node.COMMENT_NODE;
}

/** A whole count of 0 or more, else none. */
function countOf(value: unknown): number | null {
  const n = typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}
