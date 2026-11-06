import { Component, type Bind, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { css, mark, part, put } from '../../core/draw-parts';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import type { SkeletonAnimation } from './skeleton-animation';
import type { SkeletonProps } from './skeleton-props';
import type { SkeletonShape } from './skeleton-shape';

const OWN = ['shape', 'lines', 'width', 'height', 'animation', 'loading', 'label'] as const;

/** A length as given: pixels for a number, a CSS length for a string; `''` for none. */
const length = (value: string | number | null | undefined): string =>
  typeof value === 'number' && Number.isFinite(value) ? `${value}px` : typeof value === 'string' ? value : '';

/**
 * The shape of the content being loaded (lines of text, a block, a circle), animated as the design language
 * defines until `loading` turns `false`, when the JSX children replace it. Screen readers announce that it
 * is loading.
 *
 * @example
 * <Skeleton lines={3} loading={() => this.posts.loading}>
 *   <PostList posts={this.posts} />
 * </Skeleton>
 * <Skeleton shape="circle" width={40} />
 */
export class Skeleton extends Control<HTMLDivElement, SkeletonProps> {
  /** An animation not given is the design language's. */
  private readonly look = new LanguageLook(this.element, { animation: '--_skeleton-animation' }, () => this.renderLook());
  private readonly bones: Component<HTMLSpanElement>[] = [];
  private readonly contentPart: Component<HTMLDivElement>;

  constructor(props?: IBaseProp<SkeletonProps>) {
    super('div', props);
    const own = (this.props ?? {}) as SkeletonProps;
    this.element.classList.add('mx-skeleton');
    this.contentPart = part(this, 'div', 'mx-skeleton__content');
    if (this.childs?.length) this.contentPart.controls.add(...this.childs);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    for (const name of ['shape', 'lines'] as const) this.observeProperty(name, () => this.renderBones());
    this.observeProperty<string | number | null>('width', (width) => css(this.element, '--_width', length(width)));
    this.observeProperty<string | number | null>('height', (height) => css(this.element, '--_height', length(height)));
    for (const name of ['animation', 'shape'] as const) this.observeProperty(name, () => this.renderLook());
    for (const name of ['loading', 'label'] as const) this.observeProperty(name, () => this.renderLoading());
    // "Loading…" is a kit text.
    onLanguage(this, () => this.renderLoading());
    this.motif.setDisposable(this.look.watch());
  }

  // Properties (see SkeletonProps).

  get shape(): SkeletonShape {
    return this.getProperty<SkeletonShape | undefined>('shape') ?? 'text';
  }
  set shape(value: Bind<SkeletonShape>) {
    this.assignProperty('shape', value);
  }
  get lines(): number {
    return this.countOf(this.getProperty('lines'));
  }
  set lines(value: Bind<number>) {
    this.assignProperty('lines', value);
  }
  get width(): string | number | null {
    return this.getProperty<string | number | null | undefined>('width') ?? null;
  }
  set width(value: Bind<string | number | null>) {
    this.assignProperty('width', value);
  }
  get height(): string | number | null {
    return this.getProperty<string | number | null | undefined>('height') ?? null;
  }
  set height(value: Bind<string | number | null>) {
    this.assignProperty('height', value);
  }
  get animation(): SkeletonAnimation {
    return this.getProperty<SkeletonAnimation | undefined>('animation') ?? (this.look.get('animation') as SkeletonAnimation | null) ?? 'wave';
  }
  set animation(value: Bind<SkeletonAnimation>) {
    this.assignProperty('animation', value);
  }
  get loading(): boolean {
    return this.getProperty<boolean | undefined>('loading') !== false;
  }
  set loading(value: Bind<boolean>) {
    this.assignProperty('loading', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** The part that holds the loaded content, for adding to it programmatically. */
  get content(): Component<HTMLDivElement> {
    return this.contentPart;
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
  }

  private countOf(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }

  /** One bone per line of text, else one. */
  private renderBones(): void {
    const shape = this.peekProperty<SkeletonShape>('shape') ?? 'text';
    const count = shape === 'text' ? this.countOf(this.peekProperty('lines')) : 1;
    while (this.bones.length > count) this.bones.pop()!.dispose();
    while (this.bones.length < count) {
      // Before the content: the bones come first, wherever they are added.
      const bone = new Component<HTMLSpanElement>('span');
      bone.element.className = 'mx-skeleton__bone';
      bone.element.setAttribute('aria-hidden', 'true');
      this.controls.insert(this.bones.length, bone);
      this.bones.push(bone);
    }
  }

  private renderLoading(): void {
    const el = this.element;
    const loading = this.peekProperty<boolean | undefined>('loading') !== false;
    mark(el, 'data-loading', loading);
    put(el, 'role', loading ? 'progressbar' : null);
    put(el, 'aria-busy', loading ? 'true' : null);
    put(el, 'aria-label', loading ? this.peekProperty<string>('label') || uiLocale.strings.loading : null);
  }

  private renderLook(): void {
    const el = this.element;
    put(el, 'data-shape', this.peekProperty<SkeletonShape>('shape') ?? 'text');
    put(el, 'data-animation', this.peekProperty<SkeletonAnimation>('animation') ?? (this.look.get('animation') as SkeletonAnimation | null) ?? 'wave');
  }
}
