import type { Bind, IBaseProp } from '@motifx/core';
import { controlOf } from '../../core/control-map';
import { Control, focusElementOf, type ControlProps } from '../../core/control';
import { isFocusable, tabbableIn } from '../../core/focus';
import { nextId } from '../../core/id';
import { parseAccessKey, renderAccessKey, type ParsedAccessKey } from '../../core/access-key';

/** A step of the design system's type ramp, from caption to display. */
export type LabelTextStyle = 'caption' | 'body' | 'bodyStrong' | 'bodyLarge' | 'subtitle' | 'title' | 'titleLarge' | 'display';
/** Text color from the theme; every tone passes WCAG AA on the theme backgrounds. */
export type LabelTone = 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'caution';
/** Horizontal alignment of the text, in reading direction (`start` is the right edge in RTL). */
export type LabelTextAlign = 'start' | 'center' | 'end' | 'justify';
/** Vertical alignment of the text when the label is taller than it (a set `height`, a grid cell, a dock). */
export type LabelVerticalAlign = 'top' | 'center' | 'bottom';
/** What a label names: a control, an element, or an element id (looked up when needed). */
export type LabelTarget = Control | HTMLElement | string | null | undefined;

/** Props of {@link Label}. */
export interface LabelProps extends ControlProps {
  /**
   * The control the label names, like HTML `for` but also taking a control
   * or an element: the label becomes its accessible name, a click on the
   * label focuses it, and the access key moves focus to it. Without a target,
   * a field inside the label is named instead (as HTML does).
   */
  target?: Bind<LabelTarget>;
  /** `&` in `text` marks the access key. `false` shows `&` as written (data that may contain `&`). Default `true`. */
  accessKeys?: Bind<boolean>;
  /** A step of the type ramp. Unset, the label inherits the font of where it sits. */
  textStyle?: Bind<LabelTextStyle | undefined>;
  /** Text color. Unset, it inherits the color of where it sits. */
  tone?: Bind<LabelTone | undefined>;
  /** Horizontal alignment of the text. */
  textAlign?: Bind<LabelTextAlign | undefined>;
  /** Vertical alignment of the text inside a taller label. */
  verticalAlign?: Bind<LabelVerticalAlign | undefined>;
  /** One line, cut with "…" when it does not fit; the full text shows as a tooltip on hover. */
  ellipsis?: Bind<boolean>;
  /** At most this many lines, the last one cut with "…"; the full text shows as a tooltip on hover. Wins over `ellipsis`. */
  maxLines?: Bind<number | undefined>;
}

const OWN = ['target', 'accessKeys', 'textStyle', 'tone', 'textAlign', 'verticalAlign', 'ellipsis', 'maxLines'] as const;
const DATA: Record<string, string> = {
  textStyle: 'data-text-style',
  tone: 'data-tone',
  textAlign: 'data-text-align',
  verticalAlign: 'data-vertical-align',
};

/** See `Label.parts`. */
interface LabelParts {
  /** The `text` caption, before any JSX children: a bare text node, or a span when it has an access key. */
  caption: Text | HTMLSpanElement | null;
  /** `text` is being rendered (set once the constructor has bound every prop). */
  configured: boolean;
  /** The target value and the element the label is wired to, and how. */
  linkedTarget: LabelTarget;
  linked: HTMLElement | null;
  linkedByFor: boolean;
  clickBound: boolean;
  unlinkOnDispose: boolean;
}

const PARTS = Symbol('mx.label');

/**
 * Text that names a control. It is a `<label>`: with a `target` (or a field
 * inside it) it is that control's accessible name, a click on it focuses the
 * control, and `&` in `text` gives it an access key (`&Name` → Alt+N) that
 * moves focus there. A label never takes focus itself.
 *
 * Font and color are inherited from where it sits unless `textStyle` /
 * `tone` pick from the theme.
 *
 * @example
 * <Label text="&Name" target="name" />
 * <input id="name" />
 *
 * <Label text="Saved" textStyle="caption" tone="success" />
 *
 * const title = new Label({ text: 'Orders', textStyle: 'subtitle' });
 * panel.controls.add(title);
 * title.text = `Orders (${count})`;
 */
export class Label<TProps extends LabelProps = LabelProps> extends Control<HTMLLabelElement, TProps> {
  static override elementTag = 'label';

  /** Not class fields: properties can render from the constructor and from `ref`, before fields exist. */
  private get parts(): LabelParts {
    const self = this as unknown as { [PARTS]?: LabelParts };
    return (self[PARTS] ??= {
      caption: null,
      configured: false,
      linkedTarget: null,
      linked: null,
      linkedByFor: false,
      clickBound: false,
      unlinkOnDispose: false,
    });
  }

  constructor(element: HTMLLabelElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<TProps>?]));
    this.element.classList.add('mx-label');
    const props = (this.props ?? {}) as LabelProps;
    for (const name of OWN) if (props[name] !== undefined) this.bindProperty(name, props[name]);
    // Rendered here, not in onConfigured: each core lifecycle hook a class
    // defines has a per-instance cost, and a form can have hundreds of labels.
    // JSX children are appended after, so the caption (prepended) stays first.
    this.parts.configured = true;
    this.observeProperty<string>('text', (text) => this.renderText(text));
    // An id or a ref read by a getter may only exist once the tree around the
    // label is built: look once more right after. (Not onMounted: core gives
    // every component with that hook its own document-wide observer.)
    if (typeof props.target === 'string' || typeof props.target === 'function') queueMicrotask(() => this.linkLate());
  }


  // ---- properties ------------------------------------------------------------

  /** See the prop. Reactive. */
  get target(): LabelTarget {
    return this.getProperty<LabelTarget>('target');
  }
  set target(value: LabelTarget) {
    this.setProperty('target', value);
  }
  get accessKeys(): boolean {
    return this.getProperty<boolean | undefined>('accessKeys') !== false;
  }
  set accessKeys(value: boolean) {
    this.setProperty('accessKeys', !!value);
  }
  get textStyle(): LabelTextStyle | undefined {
    return this.getProperty<LabelTextStyle | undefined>('textStyle');
  }
  set textStyle(value: LabelTextStyle | undefined) {
    this.setProperty('textStyle', value);
  }
  get tone(): LabelTone | undefined {
    return this.getProperty<LabelTone | undefined>('tone');
  }
  set tone(value: LabelTone | undefined) {
    this.setProperty('tone', value);
  }
  get textAlign(): LabelTextAlign | undefined {
    return this.getProperty<LabelTextAlign | undefined>('textAlign');
  }
  set textAlign(value: LabelTextAlign | undefined) {
    this.setProperty('textAlign', value);
  }
  get verticalAlign(): LabelVerticalAlign | undefined {
    return this.getProperty<LabelVerticalAlign | undefined>('verticalAlign');
  }
  set verticalAlign(value: LabelVerticalAlign | undefined) {
    this.setProperty('verticalAlign', value);
  }
  get ellipsis(): boolean {
    return !!this.getProperty<boolean>('ellipsis');
  }
  set ellipsis(value: boolean) {
    this.setProperty('ellipsis', !!value);
  }
  get maxLines(): number | undefined {
    return this.getProperty<number | undefined>('maxLines');
  }
  set maxLines(value: number | undefined) {
    this.setProperty('maxLines', value);
  }

  /** Whether the text is cut off now (`ellipsis` / `maxLines`). Not reactive (a measurement). */
  get isTruncated(): boolean {
    const el = this.element;
    return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
  }

  // ---- keyboard ----------------------------------------------------------------

  /**
   * The access key moves focus to the target, or to the field the label
   * wraps; it never clicks it. A label that names nothing does nothing: it
   * would move focus to a control screen readers do not connect to it.
   */
  override onAccessKey(): boolean {
    if (!this.isEnabled) return false;
    if (this.peekProperty('target')) {
      this.link();
      return this.focusTarget();
    }
    const wrapped = this.element.control;
    if (wrapped && isFocusable(wrapped)) {
      wrapped.focus();
      return true;
    }
    return false;
  }

  // ---- rendering -------------------------------------------------------------

  protected override applyProperty(name: string, value: unknown): void {
    const el = this.element;
    switch (name) {
      case 'target':
        this.link();
        break;
      case 'accessKeys':
        if (this.parts.configured) this.renderText(this.peekProperty<string>('text') ?? '');
        break;
      case 'textStyle':
      case 'tone':
      case 'textAlign':
      case 'verticalAlign':
        if (value) el.setAttribute(DATA[name], String(value));
        else el.removeAttribute(DATA[name]);
        break;
      case 'ellipsis':
        el.toggleAttribute('data-ellipsis', !!value);
        if (value) installTruncationTips();
        break;
      case 'maxLines': {
        const lines = Math.floor(Number(value));
        if (lines > 0) {
          el.setAttribute('data-max-lines', String(lines));
          el.style.setProperty('--_mx-lines', String(lines));
          installTruncationTips();
        } else {
          el.removeAttribute('data-max-lines');
          el.style.removeProperty('--_mx-lines');
        }
        break;
      }
      default:
        super.applyProperty(name, value);
    }
  }

  private renderText(text: string): void {
    const parsed: ParsedAccessKey =
      this.peekProperty('accessKeys') === false ? { text: text ?? '', key: null, index: -1 } : parseAccessKey(text ?? '');
    this.setAccessKey(parsed.key);
    const parts = this.parts;
    if (parsed.index >= 0) {
      const span = parts.caption instanceof HTMLSpanElement ? parts.caption : this.placeCaption(document.createElement('span'));
      renderAccessKey(span, parsed);
    } else if (parts.caption instanceof Text) {
      parts.caption.data = parsed.text;
    } else if (parsed.text || parts.caption) {
      this.placeCaption(document.createTextNode(parsed.text));
    }
  }

  private placeCaption<T extends Text | HTMLSpanElement>(node: T): T {
    const parts = this.parts;
    if (parts.caption) parts.caption.replaceWith(node);
    else this.element.prepend(node);
    parts.caption = node;
    return node;
  }

  // ---- target ------------------------------------------------------------------

  /** The element the target names now (an id is looked up in the label's tree). */
  private targetElement(): HTMLElement | null {
    const target = this.peekProperty<LabelTarget>('target');
    if (!target) return null;
    if (target instanceof Control) return focusElementOf(target);
    if (typeof target !== 'string') return target;
    const root = this.element.getRootNode() as Document | ShadowRoot;
    return (typeof root.getElementById === 'function' ? root.getElementById(target) : null) ?? document.getElementById(target);
  }

  private linkLate(): void {
    if (this.isDisposed) return;
    const target = (this.props as LabelProps | undefined)?.target;
    // A getter that read a `ref` not yet set while the label was built: read it again.
    if (typeof target === 'function' && this.peekProperty('target') == null) this.bindProperty('target', target);
    else this.link();
  }

  /**
   * Wires the label to its target: `for` when the target is labelable (the
   * browser then focuses or toggles it on click; an id is written as it is
   * and the browser finds the element), else `aria-labelledby` on the target
   * and a click handler that focuses it.
   */
  private link(): void {
    const target = this.peekProperty<LabelTarget>('target');
    const el = this.targetElement();
    const parts = this.parts;
    if (target === parts.linkedTarget && el === parts.linked) return;
    this.unlink();
    parts.linkedTarget = target;
    parts.linked = el;
    if (typeof target === 'string' && (!el || isLabelable(el))) {
      this.element.htmlFor = target;
      parts.linkedByFor = true;
      return;
    }
    if (!el) return;
    if (isLabelable(el)) {
      if (!el.id) el.id = nextId('field');
      this.element.htmlFor = el.id;
      parts.linkedByFor = true;
      return;
    }
    if (!this.element.id) this.element.id = nextId('label');
    setToken(el, 'aria-labelledby', this.element.id, true);
    if (!parts.unlinkOnDispose) {
      // The target outlives its label: take the label's name off it again.
      parts.unlinkOnDispose = true;
      this.motif.setDisposable(() => this.unlink());
    }
    if (!parts.clickBound) {
      parts.clickBound = true;
      this.element.addEventListener('click', (e) => {
        if (!e.defaultPrevented && this.parts.linked && !this.parts.linkedByFor && this.isEnabled) this.focusTarget();
      });
    }
  }

  private unlink(): void {
    const parts = this.parts;
    if (parts.linkedByFor) this.element.removeAttribute('for');
    else if (parts.linked) setToken(parts.linked, 'aria-labelledby', this.element.id, false);
    parts.linkedTarget = null;
    parts.linked = null;
    parts.linkedByFor = false;
  }

  /** Focuses the target; a target that cannot take focus itself (a Panel, a GroupBox) passes it to its first control. */
  private focusTarget(): boolean {
    const target = this.peekProperty<LabelTarget>('target');
    const el = this.parts.linked;
    const control = target instanceof Control ? target : el ? controlOf(el) : undefined;
    if (control) {
      if (!control.isEnabled) return false;
      if (control.focus()) return true;
      const first = tabbableIn(control.element)[0];
      first?.focus();
      return !!first;
    }
    if (!el || !isFocusable(el)) return false;
    el.focus();
    return true;
  }
}

/** Elements a `<label for>` names natively (HTML "labelable elements"). */
function isLabelable(el: HTMLElement): boolean {
  if (el instanceof HTMLInputElement) return el.type !== 'hidden';
  return (
    el instanceof HTMLButtonElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLMeterElement ||
    el instanceof HTMLOutputElement ||
    el instanceof HTMLProgressElement ||
    !!(el.constructor as { formAssociated?: boolean }).formAssociated
  );
}

/** Adds or removes one id in a space-separated id list attribute, keeping the others. */
function setToken(el: Element, attr: string, id: string, on: boolean): void {
  const ids = (el.getAttribute(attr) ?? '').split(/\s+/).filter((t) => t && t !== id);
  if (on) ids.push(id);
  if (ids.length) el.setAttribute(attr, ids.join(' '));
  else el.removeAttribute(attr);
}

// ---- tooltips for cut text: one document listener, installed by the first label that can be cut

let tipsInstalled = false;
const TIP = 'data-mx-tip';

function installTruncationTips(): void {
  if (tipsInstalled || typeof document === 'undefined') return;
  tipsInstalled = true;
  document.addEventListener('pointerover', showTruncatedText, { capture: true, passive: true });
}

/** On hover, a cut label gets its full text as `title`; an app-set `title` is left alone. */
function showTruncatedText(e: Event): void {
  const label = (e.target as Element | null)?.closest?.('.mx-label:is([data-ellipsis], [data-max-lines])');
  if (!(label instanceof HTMLElement)) return;
  const ours = label.hasAttribute(TIP);
  if (label.hasAttribute('title') && !ours) return;
  if (label.scrollWidth > label.clientWidth || label.scrollHeight > label.clientHeight) {
    label.title = label.textContent?.trim() ?? '';
    label.setAttribute(TIP, '');
  } else if (ours) {
    label.removeAttribute('title');
    label.removeAttribute(TIP);
  }
}
