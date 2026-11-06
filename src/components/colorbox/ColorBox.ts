import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { css } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import { formatColor, parseColor } from '../../parts/color/colors';
import { Field } from '../../parts/field/Field';
import { Popup } from '../../parts/popup/Popup';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import { Button } from '../button/Button';
import { ColorPicker } from '../colorpicker/ColorPicker';
import type { ColorBoxApply } from './color-box-apply';
import type { ColorBoxProps } from './color-box-props';

const OWN = ['alpha', 'palette', 'apply', 'clearButton', 'placeholder'] as const;

const PARTS = Symbol('mx.colorbox');

/** Made with the field, before the subclass's fields exist. */
interface Parts {
  swatch: HTMLSpanElement;
  toggle: HTMLButtonElement;
  popup: Popup | null;
  picker: ColorPicker | null;
  /** The text typed is not a color. */
  unfinished: boolean;
  opened: Emitter<void>;
  closed: Emitter<PopupCloseReason>;
}

/**
 * A color field: the hex value in the box, a swatch at the start, and a picker in a popup (the area, the
 * strips, the inputs and the presets of `ColorPicker`). With `apply: 'useButtons'`, the popup has OK and Cancel buttons.
 * Alt+Down opens it.
 *
 * @example
 * <ColorBox label="&Accent" x-model={() => this.theme.accent} palette={['#3b5bdb', '#2b8a3e', '#e03131']} />
 * <ColorBox label="Overlay" alpha apply="useButtons" value="#00000080" />
 */
export class ColorBox extends Field<string | null, ColorBoxProps> {
  constructor(props?: IBaseProp<ColorBoxProps>) {
    super(props);
    const own = (this.props ?? {}) as ColorBoxProps;
    const parts = this.colorParts;
    const input = this.inputElement;
    this.element.classList.add('mx-color-box');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    // The field took the value before `alpha` was known: it is given again to fit it.
    if (own.value !== undefined) this.value = own.value;

    this.area('start').append(parts.swatch);
    this.area('actions').append(parts.toggle);
    parts.toggle.addEventListener('click', () => (parts.popup?.isOpen ? this.close() : this.open()));
    this.observeProperty<string>('placeholder', (text) => {
      if (text) input.placeholder = text;
      else input.removeAttribute('placeholder');
    });
    this.observeProperty('clearButton', () => this.showClearButton(!!this.peekProperty('clearButton'), (e) => this.cleared(e), 'mx-color-box__clear'));
    for (const name of ['alpha', 'palette'] as const) this.observeProperty(name, () => this.syncPicker());
    input.addEventListener('change', (e) => this.typed(e));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Enter') {
        this.typed(e);
      }
    });
    // The button and the popup are named in the kit's language.
    onLanguage(this, () => {
      parts.toggle.setAttribute('aria-label', uiLocale.strings.chooseColor);
      parts.popup?.element.setAttribute('aria-label', uiLocale.strings.chooseColor);
    });
    this.motif.setDisposable(() => {
      parts.opened.dispose();
      parts.closed.dispose();
    });
  }

  get alpha(): boolean {
    return !!this.getProperty<boolean>('alpha');
  }
  set alpha(value: Bind<boolean>) {
    this.assignProperty('alpha', value, Boolean);
  }
  get palette(): readonly string[] | null {
    return this.getProperty<readonly string[] | null | undefined>('palette') ?? null;
  }
  set palette(value: Bind<readonly string[] | null>) {
    this.assignProperty('palette', value);
  }
  get apply(): ColorBoxApply {
    return this.getProperty<ColorBoxApply | undefined>('apply') ?? 'instantly';
  }
  set apply(value: Bind<ColorBoxApply>) {
    this.assignProperty('apply', value);
  }
  get clearButton(): boolean {
    return !!this.getProperty<boolean>('clearButton');
  }
  set clearButton(value: Bind<boolean>) {
    this.assignProperty('clearButton', value, Boolean);
  }
  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }

  get inputElement(): HTMLInputElement {
    return this.focusElement as HTMLInputElement;
  }

  /** The picker in the popup, after it has been opened. */
  get picker(): ColorPicker | null {
    return this.colorParts.picker;
  }

  get opened(): boolean {
    return !!this.colorParts.popup?.isOpen;
  }

  get onOpened(): MotifEvent<void> {
    return this.colorParts.opened.event;
  }

  get onClosed(): MotifEvent<PopupCloseReason> {
    return this.colorParts.closed.event;
  }

  /** Opens the picker. Returns `false` when it cannot be used. */
  open(): boolean {
    if (!this.isEnabled || this.peekProperty('readOnly')) return false;
    const parts = this.colorParts;
    const popup = (parts.popup ??= this.createPopup());
    if (popup.isOpen) return true;
    this.syncPicker();
    const anchor = this.inputElement.parentElement!;
    popup.open(anchor, { toggle: anchor, returnFocus: this.inputElement });
    parts.toggle.setAttribute('aria-expanded', 'true');
    parts.picker?.focus();
    parts.opened.fire();
    return true;
  }

  close(): void {
    this.colorParts.popup?.close('code');
  }

  clear(): void {
    this.colorParts.unfinished = false;
    this.commit(null);
  }

  protected createControl(): HTMLElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mx-field__input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    return input;
  }

  protected emptyValue(): string | null {
    return null;
  }

  /** Any color form it reads is kept as `#rrggbb` (or `#rrggbbaa` with `alpha`). */
  protected override normalizeValue(value: string | null): string | null {
    const rgba = parseColor(value);
    if (!rgba) return null;
    if (!this.peekProperty('alpha')) rgba.a = 1;
    return formatColor(rgba);
  }

  protected renderValue(value: string | null): void {
    const parts = this.colorParts;
    parts.unfinished = false;
    this.inputElement.value = value ?? '';
    css(parts.swatch, '--_color', value ?? 'transparent');
    parts.swatch.toggleAttribute('data-empty', !value);
    this.syncPicker();
  }

  protected override builtInRules(): ValidationRule<string | null>[] {
    const rules = super.builtInRules();
    rules.push({ type: 'custom', check: () => !this.colorParts.unfinished, ignoreEmpty: false, message: () => uiLocale.strings.invalidFormat });
    return rules;
  }

  protected override isEmptyValue(value: string | null): boolean {
    return value === null && !this.colorParts.unfinished;
  }

  private get colorParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    if (!self[PARTS]) {
      const swatch = document.createElement('span');
      swatch.className = 'mx-color-box__swatch';
      swatch.setAttribute('aria-hidden', 'true');
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.tabIndex = -1;
      toggle.className = 'mx-field__button mx-color-box__toggle';
      toggle.setAttribute('aria-haspopup', 'dialog');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.append(glyph('chevron-down'));
      self[PARTS] = { swatch, toggle, popup: null, picker: null, unfinished: false, opened: new Emitter(), closed: new Emitter() };
    }
    return self[PARTS]!;
  }

  /** What is typed becomes the value when it is a color; empty text empties it. */
  private typed(e: Event): void {
    const parts = this.colorParts;
    const text = this.inputElement.value.trim();
    if (!text) {
      parts.unfinished = false;
      this.commit(null, e);
      return;
    }
    const color = this.normalizeValue(text);
    parts.unfinished = !color;
    if (color) {
      this.commit(color, e);
      this.inputElement.value = color;
    } else if (this.isValid === false) void this.validate();
  }

  private cleared(e: Event): void {
    this.colorParts.unfinished = false;
    this.commit(null, e);
    this.inputElement.value = '';
  }

  private createPopup(): Popup {
    const parts = this.colorParts;
    const popup = new Popup();
    popup.matchWidth = false;
    popup.element.classList.add('mx-color-box__popup');
    popup.element.setAttribute('role', 'dialog');
    popup.element.setAttribute('aria-label', uiLocale.strings.chooseColor);
    this.controls.add(popup);
    const picker = new ColorPicker({
      onValueChanged: (e) => {
        if (e.byUser && this.peekProperty('apply') !== 'useButtons') this.commit(e.value);
      },
    });
    popup.controls.add(picker);
    parts.picker = picker;
    const buttons = new Button({ text: uiLocale.strings.ok, onclick: () => this.applyChosen() });
    const cancel = new Button({ text: uiLocale.strings.cancel, variant: 'ghost', onclick: () => this.close() });
    buttons.element.classList.add('mx-color-box__ok');
    cancel.element.classList.add('mx-color-box__cancel');
    popup.controls.add(cancel, buttons);
    onLanguage(this, () => {
      buttons.text = uiLocale.strings.ok;
      cancel.text = uiLocale.strings.cancel;
    });
    popup.onClosed((reason) => {
      parts.toggle.setAttribute('aria-expanded', 'false');
      parts.closed.fire(reason);
    });
    return popup;
  }

  /** OK: the color in the picker becomes the value. */
  private applyChosen(): void {
    const chosen = this.colorParts.picker?.value ?? null;
    this.commit(chosen);
    this.close();
  }

  /** The picker shows the value, the opacity strip and the presets. */
  private syncPicker(): void {
    const parts = this.colorParts;
    const picker = parts.picker;
    const buttons = this.peekProperty('apply') === 'useButtons';
    parts.popup?.element.toggleAttribute('data-buttons', buttons);
    if (!picker) return;
    picker.alpha = !!this.peekProperty('alpha');
    picker.palette = this.peekProperty<readonly string[] | null>('palette') ?? null;
    picker.value = this.peekValue();
  }
}
