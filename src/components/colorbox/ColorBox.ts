import { Emitter, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { glyphPart, loose } from '../../core/draw-parts';
import { onLanguage } from '../../core/on-language';
import { css, mark, put } from '../../core/part-writes';
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
  swatchPart: Component<HTMLSpanElement>;
  togglePart: Component<HTMLButtonElement>;
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
    this.class.add('mx-color-box');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    // The field took the value before `alpha` was known: it is given again to fit it.
    if (own.value !== undefined) this.value = own.value;

    this.area('start').controls.add(parts.swatchPart);
    this.area('actions').controls.add(parts.togglePart);
    parts.togglePart.motif.on('click', () => (parts.popup?.isOpen ? this.close() : this.open()));
    this.observeProperty<string>('placeholder', (text) => put(this.controlPart, 'placeholder', text));
    this.observeProperty('clearButton', () => this.showClearButton(!!this.peekProperty('clearButton'), (e) => this.cleared(e), 'mx-color-box__clear'));
    for (const name of ['alpha', 'palette'] as const) this.observeProperty(name, () => this.syncPicker());
    this.controlPart.motif.on('change', (_, e) => this.typed(e));
    this.controlPart.motif.on('keydown', (_, e) => {
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Enter') {
        this.typed(e);
      }
    });
    // The button and the popup are named in the kit's language.
    onLanguage(this, () => {
      put(parts.togglePart, 'aria-label', uiLocale.strings.chooseColor);
      if (parts.popup) put(parts.popup, 'aria-label', uiLocale.strings.chooseColor);
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

  /** The text input as a component: write its attributes with `put` and call its methods through `attr`. */
  get inputPart(): ComponentBase<HTMLInputElement> {
    return this.controlPart as ComponentBase<HTMLInputElement>;
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
    // Under the box: a press on the input or its buttons is not outside.
    popup.open(this.boxPart, { toggle: this.boxPart, returnFocus: this.controlPart });
    put(parts.togglePart, 'aria-expanded', 'true');
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

  protected override get controlTag(): string {
    return 'input';
  }

  protected createControl(): ComponentBase {
    const control = loose<HTMLInputElement>('input', 'mx-field__input');
    control.attr.add({ type: 'text', autocomplete: 'off', spellcheck: 'false' });
    return control;
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
    this.controlPart.attr.add({ value: value ?? '' });
    css(parts.swatchPart, '--_color', value ?? 'transparent');
    mark(parts.swatchPart, 'data-empty', !value);
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
      // Placed in their areas by the constructor.
      const swatchPart = loose<HTMLSpanElement>('span', 'mx-color-box__swatch');
      swatchPart.attr.add({ 'aria-hidden': 'true' });
      const togglePart = loose<HTMLButtonElement>('button', 'mx-field__button mx-color-box__toggle');
      togglePart.attr.add({ type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
      put(togglePart, 'tabindex', '-1');
      glyphPart(togglePart, 'chevron-down');
      self[PARTS] = { swatchPart, togglePart, popup: null, picker: null, unfinished: false, opened: new Emitter(), closed: new Emitter() };
    }
    return self[PARTS]!;
  }

  /** What is typed becomes the value when it is a color; empty text empties it. */
  private typed(e: Event): void {
    const parts = this.colorParts;
    const text = (e.target as HTMLInputElement).value.trim();
    if (!text) {
      parts.unfinished = false;
      this.commit(null, e);
      return;
    }
    const color = this.normalizeValue(text);
    parts.unfinished = !color;
    if (color) {
      this.commit(color, e);
      this.controlPart.attr.add({ value: color });
    } else if (this.isValid === false) void this.validate();
  }

  private cleared(e: Event): void {
    this.colorParts.unfinished = false;
    this.commit(null, e);
    this.controlPart.attr.add({ value: '' });
  }

  private createPopup(): Popup {
    const parts = this.colorParts;
    const popup = new Popup();
    popup.matchWidth = false;
    popup.class.add('mx-color-box__popup');
    popup.attr.add({ role: 'dialog', 'aria-label': uiLocale.strings.chooseColor });
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
    buttons.class.add('mx-color-box__ok');
    cancel.class.add('mx-color-box__cancel');
    popup.controls.add(cancel, buttons);
    onLanguage(this, () => {
      buttons.text = uiLocale.strings.ok;
      cancel.text = uiLocale.strings.cancel;
    });
    popup.onClosed((reason) => {
      put(parts.togglePart, 'aria-expanded', 'false');
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
    if (parts.popup) mark(parts.popup, 'data-buttons', buttons);
    if (!picker) return;
    picker.alpha = !!this.peekProperty('alpha');
    picker.palette = this.peekProperty<readonly string[] | null>('palette') ?? null;
    picker.value = this.peekValue();
  }
}
