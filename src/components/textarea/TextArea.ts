import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp, type ComponentBase } from '@motifx/core';

import { boxOf, isInPage, measure, onLayout, onLookChange, readAgain, styleOf } from '../../core/measure';
import { uiLocale } from '../../core/ui-locale';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import { Field } from '../../parts/field/Field';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { TextAreaProps } from './text-area-props';
import type { TextAreaResize } from './text-area-resize';
import { loose } from '../../core/draw-parts';
import { css, mark, put } from '../../core/part-writes';

const OWN = [
  'placeholder',
  'rows',
  'autoGrow',
  'minRows',
  'maxRows',
  'resize',
  'maxLength',
  'minLength',
  'showCounter',
  'clearButton',
  'updateOn',
  'selectOnFocus',
  'spellcheck',
  'wrap',
  'name',
  'autocomplete',
] as const;

const SIZING = ['rows', 'autoGrow', 'minRows', 'maxRows', 'resize'] as const;

const FIT_STYLE = ['line-height', 'font-size', 'padding-block-start', 'padding-block-end'] as const;

const PARTS = Symbol('mx.textarea');

interface Parts {
  /** Follows the width while `autoGrow` is on: a narrower box wraps into more lines. */
  stopWatch: (() => void) | null;
  width: number;
  readFit: () => Record<string, string> | null;
  writeFit: (style: Record<string, string> | null) => void;
  /** The text was selected on focus: the mouseup of the same click must not undo it. */
  keepSelection: boolean;
  enter: Emitter<EnterKeyEventArgs<string>>;
}

function count(value: number | null | undefined, fallback: number): number {
  const n = Math.floor(Number(value));
  return n > 0 ? n : fallback;
}

/**
 * A multi-line text field with a placeholder, a box that grows with the text or that the user
 * can resize, a character counter, a clear button and validation. `x-model` provides two-way binding.
 * Ctrl+Enter (Cmd+Enter) raises `onEnter`, and Enter alone starts a new line.
 *
 * @example
 * <TextArea label="&Comment" autoGrow maxRows={8} maxLength={500} showCounter x-model={() => this.form.comment} />
 *
 * const notes = new TextArea({ label: 'Notes', rows: 5 });
 * this.panel.controls.add(notes);
 * notes.value = 'First line\nSecond line';
 */
export class TextArea extends Field<string, TextAreaProps> {
  constructor(props?: IBaseProp<TextAreaProps>) {
    super(props);
    const own = (this.props ?? {}) as TextAreaProps;
    this.class.add('mx-text-area');

    this.observeProperty<string>('placeholder', (text) => this.renderPlaceholder(text));
    for (const name of SIZING) this.observeProperty(name, () => this.renderSizing());
    this.observeProperty('maxLength', () => this.renderMaxLength());
    this.observeProperty('showCounter', () => this.renderCounter());
    this.observeProperty('clearButton', () => this.renderClear());
    this.observeProperty<boolean>('spellcheck', (on) => this.setAttribute('spellcheck', on === undefined ? undefined : String(on)));
    this.observeProperty<string>('wrap', (wrap) => this.setAttribute('wrap', wrap));
    this.observeProperty<string>('name', (name) => this.setAttribute('name', name));
    this.observeProperty<string>('autocomplete', (value) => this.setAttribute('autocomplete', value));

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onEnter) this.onEnter(own.onEnter);

    this.listen();
    this.motif.setDisposable(() => {
      const parts = this.areaParts;
      parts.stopWatch?.();
      parts.enter.dispose();
    });
  }

  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }
  get rows(): number {
    return count(this.getProperty<number | undefined>('rows'), 3);
  }
  set rows(value: Bind<number>) {
    this.assignProperty('rows', value);
  }
  get autoGrow(): boolean {
    return !!this.getProperty<boolean>('autoGrow');
  }
  set autoGrow(value: Bind<boolean>) {
    this.assignProperty('autoGrow', value, Boolean);
  }
  get minRows(): number {
    return count(this.getProperty<number | undefined>('minRows'), this.rows);
  }
  set minRows(value: Bind<number>) {
    this.assignProperty('minRows', value);
  }
  get maxRows(): number | null {
    return this.getProperty<number | null | undefined>('maxRows') ?? null;
  }
  set maxRows(value: Bind<number | null>) {
    this.assignProperty('maxRows', value);
  }
  get resize(): TextAreaResize {
    return this.getProperty<TextAreaResize | undefined>('resize') ?? 'vertical';
  }
  set resize(value: Bind<TextAreaResize>) {
    this.assignProperty('resize', value);
  }
  get maxLength(): number | null {
    return this.getProperty<number | undefined>('maxLength') ?? null;
  }
  set maxLength(value: Bind<number | null>) {
    this.assignProperty('maxLength', value);
  }
  get minLength(): number | null {
    return this.getProperty<number | undefined>('minLength') ?? null;
  }
  set minLength(value: Bind<number | null>) {
    this.assignProperty('minLength', value);
  }
  get showCounter(): boolean {
    return !!this.getProperty<boolean>('showCounter');
  }
  set showCounter(value: Bind<boolean>) {
    this.assignProperty('showCounter', value, Boolean);
  }
  get clearButton(): boolean {
    return !!this.getProperty<boolean>('clearButton');
  }
  set clearButton(value: Bind<boolean>) {
    this.assignProperty('clearButton', value, Boolean);
  }
  get updateOn(): 'input' | 'change' {
    return this.getProperty<'input' | 'change' | undefined>('updateOn') ?? 'input';
  }
  set updateOn(value: Bind<'input' | 'change'>) {
    this.assignProperty('updateOn', value);
  }
  get selectOnFocus(): boolean {
    return !!this.getProperty<boolean>('selectOnFocus');
  }
  set selectOnFocus(value: Bind<boolean>) {
    this.assignProperty('selectOnFocus', value, Boolean);
  }
  get spellcheck(): boolean | null {
    return this.getProperty<boolean | undefined>('spellcheck') ?? null;
  }
  set spellcheck(value: Bind<boolean>) {
    this.assignProperty('spellcheck', value, Boolean);
  }
  get wrap(): 'soft' | 'hard' | 'off' {
    return this.getProperty<'soft' | 'hard' | 'off' | undefined>('wrap') ?? 'soft';
  }
  set wrap(value: Bind<'soft' | 'hard' | 'off'>) {
    this.assignProperty('wrap', value);
  }
  get name(): string {
    return this.getProperty<string | undefined>('name') ?? '';
  }
  set name(value: Bind<string>) {
    this.assignProperty('name', value);
  }
  get autocomplete(): string {
    return this.getProperty<string | undefined>('autocomplete') ?? '';
  }
  set autocomplete(value: Bind<string>) {
    this.assignProperty('autocomplete', value);
  }

  /** The `<textarea>` as a component: write its attributes with `put` and call its methods through `attr`. */
  get textAreaPart(): ComponentBase<HTMLTextAreaElement> {
    return this.controlPart as ComponentBase<HTMLTextAreaElement>;
  }

  get onEnter(): MotifEvent<EnterKeyEventArgs<string>> {
    return this.areaParts.enter.event;
  }

  /** Selects all text. The selection is made a moment later, not before the call returns. */
  select(): void {
    this.controlPart.attr.add({ select: true });
  }

  /** Clears the field, as the clear button does. */
  clear(): void {
    this.commit('');
  }

  protected override get controlTag(): string {
    return 'textarea';
  }

  protected createControl(): ComponentBase {
    const area = loose<HTMLTextAreaElement>('textarea', 'mx-field__input mx-text-area__input');
    area.attr.add({ rows: '3' });
    return area;
  }

  protected emptyValue(): string {
    return '';
  }

  protected override normalizeValue(value: string): string {
    return value == null ? '' : String(value);
  }

  protected renderValue(value: string): void {
    const area = this.textAreaPart.element;
    if (area.value !== value) this.controlPart.attr.add({ value });
    this.renderCounter();
    this.fit();
  }

  protected override builtInRules(): ValidationRule<string>[] {
    const rules = super.builtInRules();
    const min = this.peekProperty<number>('minLength');
    const max = this.peekProperty<number>('maxLength');
    if (min || max) rules.push({ type: 'length', min: min || undefined, max: max || undefined });
    return rules;
  }

  private get areaParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= {
      stopWatch: null,
      width: 0,
      readFit: () => (isInPage(this.controlPart) ? styleOf(this.controlPart, FIT_STYLE) : null),
      writeFit: (style) => this.drawFit(style),
      keepSelection: false,
      enter: new Emitter(),
    });
  }

  private listen(): void {
    const area = this.textAreaPart.element;
    // Another design language, theme or density: the lines have another height.
    this.motif.setDisposable(onLookChange(this, () => this.fit()));
    this.controlPart.motif.on('input', (_, e) => {
      this.renderCounter();
      this.fit();
      if (this.peekProperty('updateOn') !== 'change') this.commit(area.value, e);
    });
    this.controlPart.motif.on('change', (_, e) => this.commit(area.value, e));
    this.controlPart.motif.on('keydown', (_, e) => this.keyDown(e));
    this.controlPart.motif.on('focus', () => this.gotFocus());
    this.controlPart.motif.on('blur', () => (this.areaParts.keepSelection = false));
    this.controlPart.motif.on('mouseup', (_, e) => {
      if (!this.areaParts.keepSelection) return;
      this.areaParts.keepSelection = false;
      e.preventDefault();
    });
  }

  private keyDown(e: KeyboardEvent): void {
    this.areaParts.keepSelection = false;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      this.commit(this.textAreaPart.element.value, e);
      this.areaParts.enter.fire({ value: this.peekValue(), source: this, event: e });
    } else if (e.key === 'Escape' && this.peekProperty('clearButton') && !this.peekProperty('readOnly') && !this.isEmptyValue(this.peekValue())) {
      e.preventDefault();
      e.stopPropagation();
      this.commit('', e);
    }
  }

  private gotFocus(): void {
    if (!this.peekProperty('selectOnFocus')) return;
    this.controlPart.attr.add({ select: true });
    this.areaParts.keepSelection = true;
  }

  private setAttribute(name: string, value: string | undefined): void {
    put(this.controlPart, name, value);
  }

  private renderPlaceholder(text: string | undefined): void {
    this.setAttribute('placeholder', text);
    mark(this, 'data-placeholder', !!text);
  }

  private renderMaxLength(): void {
    const max = this.peekProperty<number>('maxLength');
    this.setAttribute('maxlength', max ? String(max) : undefined);
    this.renderCounter();
  }

  private renderCounter(): void {
    if (!this.peekProperty('showCounter')) {
      this.setCounter('');
      return;
    }
    const length = this.textAreaPart.element.value.length;
    const max = this.peekProperty<number>('maxLength');
    this.setCounter(max ? `${length}/${max}` : String(length));
  }

  private renderSizing(): void {
    const parts = this.areaParts;
    const grow = !!this.peekProperty('autoGrow');
    const rows = count(this.peekProperty('rows'), 3);
    put(this.controlPart, 'rows', String(grow ? count(this.peekProperty('minRows'), rows) : rows));
    put(this, 'data-resize', grow ? 'none' : (this.peekProperty<TextAreaResize>('resize') ?? 'vertical'));
    mark(this, 'data-auto-grow', grow);
    if (grow && !parts.stopWatch) {
      parts.stopWatch = onLayout(
        this.controlPart,
        'size',
        ({ width }) => {
          if (width === parts.width) return;
          parts.width = width;
          this.fit();
        },
        { owner: this, box: 'content' },
      );
    } else if (!grow && parts.stopWatch) {
      parts.stopWatch();
      parts.stopWatch = null;
      parts.width = 0;
    }
    this.fit();
  }

  /** With `autoGrow`, sizes the box to the text, between `minRows` and `maxRows` lines, in the window's next frame. */
  private fit(): void {
    if (!this.peekProperty('autoGrow')) {
      css(this.controlPart, 'block-size', '');
      css(this.controlPart, 'overflow-y', '');
      return;
    }
    const parts = this.areaParts;
    measure(this, parts.readFit, parts.writeFit);
  }

  /** Tries the box at its own height and measures what the text needs. */
  private drawFit(style: Record<string, string> | null): void {
    if (!style || !this.peekProperty('autoGrow')) return;
    const line = parseFloat(style['line-height']) || parseFloat(style['font-size']) * 1.2 || 0;
    const padding = (parseFloat(style['padding-block-start']) || 0) + (parseFloat(style['padding-block-end']) || 0);
    const rows = count(this.peekProperty('rows'), 3);
    const min = count(this.peekProperty('minRows'), rows) * line + padding;
    const maxRows = this.peekProperty<number | null>('maxRows');
    const max = maxRows && maxRows > 0 ? Math.max(maxRows * line + padding, min) : Infinity;
    css(this.controlPart, 'block-size', 'auto');
    const needed = readAgain(() => boxOf(this.controlPart).scrollHeight);
    css(this.controlPart, 'block-size', `${Math.min(Math.max(needed, min), max)}px`);
    css(this.controlPart, 'overflow-y', needed > max + 1 ? 'auto' : 'hidden');
  }

  private renderClear(): void {
    this.showClearButton(!!this.peekProperty('clearButton'), (e) => this.commit('', e), 'mx-text-area__clear');
  }
}
