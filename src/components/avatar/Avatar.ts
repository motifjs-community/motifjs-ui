import type { Bind, Component, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { glyphPart, mark, part, put, shown, text } from '../../core/draw-parts';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import type { UiStrings } from '../../core/ui-strings';
import type { AvatarProps } from './avatar-props';
import type { AvatarShape } from './avatar-shape';
import type { AvatarSize } from './avatar-size';
import type { AvatarStatus } from './avatar-status';
import type { AvatarTone } from './avatar-tone';
import { initialsOf } from './initials-of';
import { toneOfName } from './tone-of-name';

const OWN = ['src', 'name', 'initials', 'label', 'size', 'shape', 'tone', 'status'] as const;

const SHOWN = ['src', 'name', 'initials', 'label', 'status'] as const;

// The name too: `tone: 'auto'` takes its colour from it.
const LOOK = ['size', 'shape', 'tone', 'name'] as const;

const PRESENCE: Record<AvatarStatus, keyof UiStrings> = {
  online: 'presenceOnline',
  away: 'presenceAway',
  busy: 'presenceBusy',
  offline: 'presenceOffline',
};

/**
 * Someone's picture; until it loads, or when there is none, their initials (made from `name` in the
 * kit's language), else a person icon. A presence dot sits on its lower end corner. Its shape and tone
 * default to the design language's.
 *
 * @example
 * <Avatar name="Ada Lovelace" src={() => this.user.photo} status="online" />
 * <Avatar name={() => this.user.name} size="lg" shape="square" tone="accent" />
 */
export class Avatar extends Control<HTMLSpanElement, AvatarProps> {
  /** A shape or tone not given is the design language's. */
  private readonly look = new LanguageLook(this.element, { tone: '--_avatar-tone', shape: '--_avatar-shape' }, () => this.renderLook());
  private readonly initialsPart: Component<HTMLSpanElement>;
  private readonly iconPart: Component<HTMLSpanElement>;
  private readonly image: Component<HTMLImageElement>;
  private readonly statusPart: Component<HTMLSpanElement>;
  /** The picture that loaded, and the one that could not. */
  private loaded: string | null = null;
  private failed: string | null = null;

  constructor(props?: IBaseProp<AvatarProps>) {
    super(props);
    const own = (this.props ?? {}) as AvatarProps;
    this.element.classList.add('mx-avatar');
    this.iconPart = glyphPart(this, 'person', 'mx-avatar__icon');
    this.initialsPart = part(this, 'span', 'mx-avatar__initials');
    this.initialsPart.element.setAttribute('aria-hidden', 'true');
    this.image = part<HTMLImageElement>(this, 'img', 'mx-avatar__image');
    this.image.element.alt = '';
    void this.image.motif.on('load', () => this.pictureDone(true));
    void this.image.motif.on('error', () => this.pictureDone(false));
    this.statusPart = part(this, 'span', 'mx-avatar__status');
    this.statusPart.element.setAttribute('aria-hidden', 'true');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    for (const name of SHOWN) this.observeProperty(name, () => this.renderShown());
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    // The initials are written in the kit's language's capitals, the presence in its words.
    onLanguage(this, () => this.renderShown());
    this.motif.setDisposable(this.look.watch());
  }

  // Properties (see AvatarProps).

  get src(): string | null {
    return this.getProperty<string | null | undefined>('src') || null;
  }
  set src(value: Bind<string | null>) {
    this.assignProperty('src', value);
  }
  get name(): string {
    return this.getProperty<string | undefined>('name') ?? '';
  }
  set name(value: Bind<string>) {
    this.assignProperty('name', value);
  }
  get initials(): string {
    return this.getProperty<string | undefined>('initials') ?? '';
  }
  set initials(value: Bind<string>) {
    this.assignProperty('initials', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }
  get size(): AvatarSize {
    return this.getProperty<AvatarSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<AvatarSize>) {
    this.assignProperty('size', value);
  }
  get shape(): AvatarShape {
    return this.getProperty<AvatarShape | undefined>('shape') ?? (this.look.get('shape') as AvatarShape | null) ?? 'circle';
  }
  set shape(value: Bind<AvatarShape>) {
    this.assignProperty('shape', value);
  }
  get tone(): AvatarTone {
    return this.getProperty<AvatarTone | undefined>('tone') ?? (this.look.get('tone') as AvatarTone | null) ?? 'standard';
  }
  set tone(value: Bind<AvatarTone>) {
    this.assignProperty('tone', value);
  }
  get status(): AvatarStatus | null {
    return this.getProperty<AvatarStatus | null | undefined>('status') ?? null;
  }
  set status(value: Bind<AvatarStatus | null>) {
    this.assignProperty('status', value);
  }

  /** The initials it shows: the ones given, else the ones made from the name. */
  get shownInitials(): string {
    const given = this.peekProperty<string>('initials');
    return given || initialsOf(this.peekProperty<string>('name') ?? '', uiLocale.locale);
  }

  /** Whether the picture is what shows now (it loaded). */
  get showsPicture(): boolean {
    const src = this.peekProperty<string | null>('src') || null;
    return !!src && src === this.loaded;
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
  }

  private pictureDone(ok: boolean): void {
    const src = this.image.element.getAttribute('src');
    if (ok) this.loaded = src;
    else this.failed = src;
    this.renderShown();
  }

  private renderShown(): void {
    const src = this.peekProperty<string | null>('src') || null;
    const img = this.image.element;
    const trying = !!src && src !== this.failed;
    put(img, 'src', trying ? src : null);
    const picture = !!src && src === this.loaded;
    mark(img, 'data-pending', trying && !picture);
    shown(img, trying);

    const initials = this.shownInitials;
    text(this.initialsPart.element, initials);
    shown(this.initialsPart.element, !picture && !!initials);
    shown(this.iconPart.element, !picture && !initials);

    const status = this.peekProperty<AvatarStatus | null>('status') ?? null;
    put(this.statusPart.element, 'data-status', status);
    shown(this.statusPart.element, !!status);
    this.renderName(status);
  }

  /** What screen readers say: the label or the name, and the presence. */
  private renderName(status: AvatarStatus | null): void {
    const el = this.element;
    const name = this.peekProperty<string>('label') || this.peekProperty<string>('name') || '';
    const presence = status ? uiLocale.text(PRESENCE[status]) : '';
    const said = name && presence ? uiLocale.text('avatarPresence', { name, presence }) : name || presence;
    put(el, 'role', said ? 'img' : null);
    put(el, 'aria-label', said);
    // Without a name it says nothing to a screen reader.
    put(el, 'aria-hidden', said ? null : 'true');
  }

  private renderLook(): void {
    const el = this.element;
    put(el, 'data-size', this.peekProperty<AvatarSize>('size') ?? 'md');
    put(el, 'data-shape', this.peekProperty<AvatarShape>('shape') ?? (this.look.get('shape') as AvatarShape | null) ?? 'circle');
    const tone = this.peekProperty<AvatarTone>('tone') ?? (this.look.get('tone') as AvatarTone | null) ?? 'standard';
    put(el, 'data-tone', tone === 'auto' ? toneOfName(this.peekProperty<string>('name') ?? '') : tone);
  }
}
