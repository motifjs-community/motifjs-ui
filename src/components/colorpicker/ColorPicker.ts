import { Emitter, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { handOver, part, removePart } from '../../core/draw-parts';
import { focusOn, isFocused } from '../../core/focus';
import { glyph } from '../../core/glyphs';
import { rectOf } from '../../core/measure';
import { onLanguage } from '../../core/on-language';
import { css, mark, put, shown } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { ColorHsva } from '../../parts/color/color-hsva';
import { formatColor, hsvaToRgba, parseColor, rgbaToHsva } from '../../parts/color/colors';
import { Button } from '../button/Button';
import { NumberBox } from '../numberbox/NumberBox';
import { TextBox } from '../textbox/TextBox';
import type { ColorChangedEventArgs } from './color-changed-event-args';
import type { ColorPickerProps } from './color-picker-props';

const OWN = ['value', 'alpha', 'palette', 'showInputs', 'eyeDropper'] as const;

const HUES = 'linear-gradient(to right, rgb(255 0 0), rgb(255 255 0), rgb(0 255 0), rgb(0 255 255), rgb(0 0 255), rgb(255 0 255), rgb(255 0 0))';

/** The browser's screen color picker, where there is one. */
interface EyeDropperLike {
  open(): Promise<{ sRGBHex: string }>;
}

/** A strip or the area, its handle, and what a position on it sets. */
interface Track {
  box: Component<HTMLDivElement>;
  thumb: Component<HTMLDivElement>;
  set: (x: number, y: number) => void;
}

/**
 * Selects a color: an area of saturation and brightness, a hue strip and an opacity strip (`alpha`), the hex and
 * red, green and blue inputs, preset colors (`palette`) and, in browsers that support it, a color picked from the
 * screen. The value follows every change. On a handle, the arrow keys move it by 1 (by 10 with Shift), and Home and
 * End move it to the ends.
 *
 * @example
 * <ColorPicker x-model={() => this.theme.accent} palette={['#3b5bdb', '#2b8a3e', '#e03131']} />
 */
export class ColorPicker extends Control<HTMLDivElement, ColorPickerProps> {
  private readonly changed = new Emitter<ColorChangedEventArgs>();
  /** The color as the handles hold it: the hue stays when the color turns grey. */
  private hsva: ColorHsva = { h: 0, s: 0, v: 0, a: 1 };
  private readonly area: Track;
  private readonly hue: Track;
  private readonly alphaTrack: Track;
  private readonly preview: Component<HTMLDivElement>;
  private readonly inputs: Component<HTMLDivElement>;
  private readonly hex: TextBox;
  private readonly channels: NumberBox[];
  private readonly opacity: NumberBox;
  private readonly swatches: Component<HTMLDivElement>;
  /** The preset buttons drawn, each with its color as the value writes it (`null` for one that is not a color). */
  /** The swatches of the palette, in its order: `given` as the palette has it, `color` as the value would read. */
  private presets: { swatch: Component<HTMLButtonElement>; given: string; color: string | null }[] = [];
  private readonly picker: Button;
  private byUser = false;
  private ready = false;

  constructor(props?: IBaseProp<ColorPickerProps>) {
    super('div', props);
    const own = (this.props ?? {}) as ColorPickerProps;
    this.class.add('mx-color-picker');

    this.area = this.track('mx-color-picker__area', (x, y) => {
      this.hsva.s = x;
      this.hsva.v = 1 - y;
    });
    const row = part<HTMLDivElement>(this, 'div', 'mx-color-picker__row');
    this.preview = part(row, 'div', 'mx-color-picker__preview');
    const strips = part<HTMLDivElement>(row, 'div', 'mx-color-picker__strips');
    this.hue = this.track('mx-color-picker__strip mx-color-picker__hue', (x) => (this.hsva.h = x * 360), strips);
    this.alphaTrack = this.track('mx-color-picker__strip mx-color-picker__alpha', (x) => (this.hsva.a = Math.round(x * 100) / 100), strips);
    this.picker = new Button({ icon: glyph('eyedropper'), variant: 'ghost', onclick: () => void this.pickFromScreen() });
    this.picker.class.add('mx-color-picker__pick');
    row.controls.add(this.picker);

    this.inputs = part(this, 'div', 'mx-color-picker__inputs');
    this.hex = new TextBox({ size: 'sm', updateOn: 'change', autocomplete: 'off', onValueChanged: (e) => e.byUser && this.typedHex(String(e.value ?? '')) });
    this.hex.class.add('mx-color-picker__hex');
    this.channels = [0, 1, 2].map((i) => {
      const box = new NumberBox({ size: 'sm', min: 0, max: 255, step: 1, decimals: 0, showSpinButtons: false, onValueChanged: (e) => e.byUser && this.typedChannel(i, e.value) });
      box.class.add('mx-color-picker__channel');
      return box;
    });
    // In percent, from 0 to 100.
    this.opacity = new NumberBox({ size: 'sm', min: 0, max: 100, step: 1, decimals: 0, showSpinButtons: false, onValueChanged: (e) => e.byUser && this.typedAlpha(e.value) });
    this.opacity.class.add('mx-color-picker__channel');
    this.inputs.controls.add(this.hex, ...this.channels, this.opacity);
    this.swatches = part(this, 'div', 'mx-color-picker__swatches');
    this.swatches.attr.add({ role: 'group' });

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onValueChanged) this.onValueChanged(own.onValueChanged);
    this.observeProperty<string | null>('value', (value) => this.taken(value));
    this.observeProperty('value', (value) => {
      if (this.ready) this.changed.fire({ value: (value as string | null) ?? null, byUser: this.byUser, source: this });
    });
    for (const name of ['alpha', 'showInputs', 'eyeDropper'] as const) this.observeProperty(name, () => this.renderParts());
    this.observeProperty('palette', () => this.renderSwatches());
    // The handles and inputs are named in the kit's language.
    onLanguage(this, () => this.renderNames());
    this.motif.setDisposable(() => this.changed.dispose());
    this.ready = true;
  }

  // Properties (see ColorPickerProps).

  get value(): string | null {
    return this.getProperty<string | null | undefined>('value') ?? null;
  }
  set value(value: Bind<string | null>) {
    this.assignProperty('value', value);
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
  get showInputs(): boolean {
    return this.getProperty<boolean | undefined>('showInputs') !== false;
  }
  set showInputs(value: Bind<boolean>) {
    this.assignProperty('showInputs', value);
  }
  get eyeDropper(): boolean {
    return this.getProperty<boolean | undefined>('eyeDropper') !== false;
  }
  set eyeDropper(value: Bind<boolean>) {
    this.assignProperty('eyeDropper', value);
  }

  /** Occurs when the color changes, either through user input or programmatically (`e.byUser`). */
  get onValueChanged(): MotifEvent<ColorChangedEventArgs> {
    return this.changed.event;
  }

  /** Sets focus on the handle of the area. */
  override focus(): boolean {
    focusOn(this.area.thumb);
    return isFocused(this.area.thumb);
  }

  /** An area or a strip with its handle: pressed or dragged, the position sets the color; the handle takes the keys. */
  private track(className: string, set: (x: number, y: number) => void, parent: Control | Component = this): Track {
    const box = part<HTMLDivElement>(parent as Control, 'div', className);
    const thumb = part<HTMLDivElement>(box, 'div', 'mx-color-picker__thumb');
    put(thumb, 'tabindex', '0');
    thumb.attr.add({ role: 'slider' });
    const t: Track = { box, thumb, set };
    // The box is read first; the color and the handles are written after.
    const at = (e: PointerEvent) => {
      const r = rectOf(box);
      return {
        x: r.width ? Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) : 0,
        y: r.height ? Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1) : 0,
      };
    };
    const setAt = (e: PointerEvent) => {
      const { x, y } = at(e);
      set(x, y);
      this.moved();
    };
    box.motif.on('pointerdown', (_, e) => {
      if (e.button !== 0 || !this.isEnabled) return;
      e.preventDefault();
      const { x, y } = at(e);
      box.attr.add({ setPointerCapture: e.pointerId });
      focusOn(thumb);
      set(x, y);
      this.moved();
      // Each move reads the point itself, not how far it went.
      const move = (_: ComponentBase, m: PointerEvent) => setAt(m);
      const up = () => {
        void box.motif.off('pointermove', move);
        void box.motif.off('pointerup', up);
        void box.motif.off('pointercancel', up);
      };
      void box.motif.on('pointermove', move);
      void box.motif.on('pointerup', up);
      void box.motif.on('pointercancel', up);
    });
    thumb.motif.on('keydown', (_, e) => this.keyDown(t, e));
    return t;
  }

  private keyDown(t: Track, e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey || !this.isEnabled) return;
    const step = e.shiftKey ? 0.1 : 0.01;
    const h = this.hsva;
    // Where the handle is now, as shares of the track.
    let x = t === this.area ? h.s : t === this.hue ? h.h / 360 : h.a;
    let y = t === this.area ? 1 - h.v : 0;
    if (e.key === 'ArrowRight') x += step;
    else if (e.key === 'ArrowLeft') x -= step;
    else if (e.key === 'ArrowDown' && t === this.area) y += step;
    else if (e.key === 'ArrowUp' && t === this.area) y -= step;
    else if (e.key === 'ArrowUp') x += step;
    else if (e.key === 'ArrowDown') x -= step;
    else if (e.key === 'Home') x = 0;
    else if (e.key === 'End') x = 1;
    else return;
    e.preventDefault();
    t.set(Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1));
    this.moved();
  }

  private async pickFromScreen(): Promise<void> {
    const Picker = (globalThis as { EyeDropper?: new () => EyeDropperLike }).EyeDropper;
    if (!Picker) return;
    try {
      const { sRGBHex } = await new Picker().open();
      if (!this.isDisposed) this.typedHex(sRGBHex);
    } catch {
      // Closed without a color.
    }
  }

  private typedHex(text: string): void {
    const rgba = parseColor(text);
    if (!rgba) {
      this.renderInputs();
      return;
    }
    if (!this.peekProperty('alpha')) rgba.a = 1;
    this.hsva = this.keepHue(rgbaToHsva(rgba));
    this.moved();
  }

  private typedChannel(index: number, value: number | null): void {
    const rgba = hsvaToRgba(this.hsva);
    const n = Math.min(Math.max(Math.round(value ?? 0), 0), 255);
    if (index === 0) rgba.r = n;
    else if (index === 1) rgba.g = n;
    else rgba.b = n;
    this.hsva = this.keepHue(rgbaToHsva(rgba));
    this.moved();
  }

  private typedAlpha(value: number | null): void {
    this.hsva.a = Math.min(Math.max(Math.round(value ?? 100), 0), 100) / 100;
    this.moved();
  }

  /** A grey has no hue of its own: the one the handle had stays. */
  private keepHue(next: ColorHsva): ColorHsva {
    return next.s === 0 || next.v === 0 ? { ...next, h: this.hsva.h } : next;
  }

  /** The user moved a handle or typed: the value follows. */
  private moved(): void {
    const rgba = hsvaToRgba(this.hsva);
    if (!this.peekProperty('alpha')) rgba.a = 1;
    const next = formatColor(rgba);
    this.renderColor();
    if (next === this.peekProperty('value')) return;
    this.byUser = true;
    this.changeProperty('value', next);
    this.byUser = false;
    // `x-model` takes the user's color back.
    this.bindings.writeModel(next);
  }

  /** A value given from outside: the handles move to it, keeping the hue of a grey. */
  private taken(value: string | null | undefined): void {
    const rgba = parseColor(value);
    const now = hsvaToRgba(this.hsva);
    if (!this.peekProperty('alpha')) now.a = 1;
    if (rgba && formatColor(rgba) !== formatColor(now)) this.hsva = this.keepHue(rgbaToHsva(rgba));
    this.renderColor();
  }

  private renderColor(): void {
    const h = this.hsva;
    const rgba = hsvaToRgba(h);
    const solid = `rgb(${rgba.r} ${rgba.g} ${rgba.b})`;
    const seen = `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${this.peekProperty('alpha') ? rgba.a : 1})`;
    // The area: the hue at full strength, washed to white along and darkened to black down.
    css(this.area.box, 'background', `linear-gradient(to top, rgb(0 0 0), transparent), linear-gradient(to right, rgb(255 255 255), hsl(${Math.round(h.h)} 100% 50%))`);
    css(this.hue.box, 'background', HUES);
    css(this.alphaTrack.box, '--_shade', `linear-gradient(to right, transparent, ${solid})`);
    this.place(this.area, h.s, 1 - h.v, solid);
    this.place(this.hue, h.h / 360, 0.5, `hsl(${Math.round(h.h)} 100% 50%)`);
    this.place(this.alphaTrack, h.a, 0.5, seen);
    css(this.preview, '--_color', seen);
    this.renderInputs();
    this.renderSwatchState();
    this.renderNames();
  }

  private place(t: Track, x: number, y: number, color: string): void {
    css(t.thumb, 'left', `${x * 100}%`);
    css(t.thumb, 'top', `${y * 100}%`);
    css(t.thumb, 'background-color', color);
  }

  private renderInputs(): void {
    const rgba = hsvaToRgba(this.hsva);
    if (!this.peekProperty('alpha')) rgba.a = 1;
    handOver(this.hex, formatColor(rgba));
    [rgba.r, rgba.g, rgba.b].forEach((n, i) => handOver(this.channels[i], n));
    handOver(this.opacity, Math.round(this.hsva.a * 100));
  }

  /** Names the handles and inputs, and says where each handle stands. */
  private renderNames(): void {
    const s = uiLocale.strings;
    const h = this.hsva;
    const name = (t: Track, label: string, now: number, max: number, text?: string) => {
      put(t.thumb, 'aria-label', label);
      put(t.thumb, 'aria-valuemin', '0');
      put(t.thumb, 'aria-valuemax', String(max));
      put(t.thumb, 'aria-valuenow', String(Math.round(now)));
      put(t.thumb, 'aria-valuetext', text ?? null);
    };
    name(this.area, s.colorArea, h.s * 100, 100, uiLocale.text('colorAreaValue', { s: Math.round(h.s * 100), v: Math.round(h.v * 100) }));
    name(this.hue, s.colorHue, h.h, 360);
    name(this.alphaTrack, s.colorAlpha, h.a * 100, 100);
    if (this.hex.label !== s.colorHex) this.hex.label = s.colorHex;
    [s.colorRed, s.colorGreen, s.colorBlue].forEach((label, i) => {
      if (this.channels[i].label !== label) this.channels[i].label = label;
    });
    if (this.opacity.label !== s.colorAlpha) this.opacity.label = s.colorAlpha;
    put(this.swatches, 'aria-label', s.colorPresets);
    if (this.picker.hint !== s.colorPick) this.picker.hint = s.colorPick;
  }

  private renderParts(): void {
    const alpha = !!this.peekProperty('alpha');
    mark(this, 'data-alpha', alpha);
    shown(this.alphaTrack.box, alpha);
    if (this.opacity.visible !== alpha) this.opacity.visible = alpha;
    shown(this.inputs, this.peekProperty('showInputs') !== false);
    const canPick = typeof (globalThis as { EyeDropper?: unknown }).EyeDropper === 'function';
    if (this.picker.visible !== (canPick && this.peekProperty('eyeDropper') !== false)) this.picker.visible = canPick && this.peekProperty('eyeDropper') !== false;
    this.renderColor();
  }

  private renderSwatches(): void {
    const palette = this.peekProperty<readonly string[] | null>('palette') ?? [];
    // A swatch stays in its place and takes the palette's color there; swatches are added or taken away at the end.
    while (this.presets.length > palette.length) removePart(this.presets.pop()!.swatch);
    while (this.presets.length < palette.length) {
      const swatch = part<HTMLButtonElement>(this.swatches, 'button', 'mx-color-picker__swatch');
      swatch.attr.add({ type: 'button' });
      const preset = { swatch, given: '', color: null as string | null };
      swatch.motif.on('click', () => this.typedHex(preset.given));
      this.presets.push(preset);
    }
    palette.forEach((color, i) => {
      const preset = this.presets[i];
      const rgba = parseColor(color);
      preset.given = color;
      preset.color = rgba ? formatColor(rgba) : null;
      put(preset.swatch, 'data-color', color);
      put(preset.swatch, 'aria-label', color);
      css(preset.swatch, '--_color', color);
    });
    shown(this.swatches, palette.length > 0);
    this.renderSwatchState();
  }

  private renderSwatchState(): void {
    const now = this.peekProperty<string | null>('value');
    const rgba = now ? parseColor(now) : null;
    const current = rgba ? formatColor(rgba) : null;
    for (const preset of this.presets) put(preset.swatch, 'aria-pressed', String(!!current && preset.color === current));
  }
}
