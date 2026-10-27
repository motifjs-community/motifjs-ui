import { onLookChanged } from '../../core/look-watch';
import { effect, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';

import { ResizeWatch } from '../../core/resize-watch';
import { uiLocale } from '../../core/ui-locale';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import { Field } from '../../parts/field/Field';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { TextAreaProps } from './text-area-props';
import type { TextAreaResize } from './text-area-resize';

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

const PARTS = Symbol('mx.textarea');

interface Parts {
  /** Follows the width while `autoGrow` is on: a narrower box wraps into more lines. */
  watcher: ResizeWatch | null;
  width: number;
  /** The text was selected on focus: the mouseup of the same click must not undo it. */
  keepSelection: boolean;
  enter: Emitter<EnterKeyEventArgs<string>>;
}

function count(value: number | null | undefined, fallback: number): number {
  const n = Math.floor(Number(value));
  return n > 0 ? n : fallback;
}

/**
 * A text field of several lines: a placeholder, a box that grows with the text or that the user
 * can drag bigger, a character counter, a clear button and validation. `x-model` binds the value;
 * Ctrl+Enter (Cmd+Enter) reports `onEnter`, Enter alone starts a new line.
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
    this.element.classList.add('mx-text-area');

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
      parts.watcher?.disconnect();
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

  get textAreaElement(): HTMLTextAreaElement {
    return this.focusElement as HTMLTextAreaElement;
  }

  get onEnter(): MotifEvent<EnterKeyEventArgs<string>> {
    return this.areaParts.enter.event;
  }

  /** Selects the whole text. */
  select(): void {
    this.textAreaElement.select();
  }

  /** Empties the field as its clear button does. */
  clear(): void {
    this.commit('');
  }

  protected createControl(): HTMLElement {
    const area = document.createElement('textarea');
    area.className = 'mx-field__input mx-text-area__input';
    area.rows = 3;
    return area;
  }

  protected emptyValue(): string {
    return '';
  }

  protected override normalizeValue(value: string): string {
    return value == null ? '' : String(value);
  }

  protected renderValue(value: string): void {
    const area = this.textAreaElement;
    if (area.value !== value) area.value = value;
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
      watcher: null,
      width: 0,
      keepSelection: false,
      enter: new Emitter(),
    });
  }

  private listen(): void {
    const area = this.textAreaElement;
    // Another design language, theme or density: the lines have another height.
    this.motif.setDisposable(onLookChanged(() => this.fit()));
    area.addEventListener('input', (e) => {
      this.renderCounter();
      this.fit();
      if (this.peekProperty('updateOn') !== 'change') this.commit(area.value, e);
    });
    area.addEventListener('change', (e) => this.commit(area.value, e));
    area.addEventListener('keydown', (e) => this.keyDown(e));
    area.addEventListener('focus', () => this.gotFocus());
    area.addEventListener('blur', () => (this.areaParts.keepSelection = false));
    area.addEventListener('mouseup', (e) => {
      if (!this.areaParts.keepSelection) return;
      this.areaParts.keepSelection = false;
      e.preventDefault();
    });
  }

  private keyDown(e: KeyboardEvent): void {
    this.areaParts.keepSelection = false;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      this.commit(this.textAreaElement.value, e);
      this.areaParts.enter.fire({ value: this.peekValue(), source: this, event: e });
    } else if (e.key === 'Escape' && this.peekProperty('clearButton') && !this.peekProperty('readOnly') && !this.isEmptyValue(this.peekValue())) {
      e.preventDefault();
      e.stopPropagation();
      this.commit('', e);
    }
  }

  private gotFocus(): void {
    if (!this.peekProperty('selectOnFocus')) return;
    this.textAreaElement.select();
    this.areaParts.keepSelection = true;
  }

  private setAttribute(name: string, value: string | undefined): void {
    if (value === undefined || value === null || value === '') this.textAreaElement.removeAttribute(name);
    else this.textAreaElement.setAttribute(name, value);
  }

  private renderPlaceholder(text: string | undefined): void {
    this.setAttribute('placeholder', text);
    this.element.toggleAttribute('data-placeholder', !!text);
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
    const length = this.textAreaElement.value.length;
    const max = this.peekProperty<number>('maxLength');
    this.setCounter(max ? `${length}/${max}` : String(length));
  }

  private renderSizing(): void {
    const parts = this.areaParts;
    const grow = !!this.peekProperty('autoGrow');
    const rows = count(this.peekProperty('rows'), 3);
    this.textAreaElement.rows = grow ? count(this.peekProperty('minRows'), rows) : rows;
    this.element.dataset.resize = grow ? 'none' : (this.peekProperty<TextAreaResize>('resize') ?? 'vertical');
    this.element.toggleAttribute('data-auto-grow', grow);
    if (grow && !parts.watcher && typeof ResizeObserver !== 'undefined') {
      parts.watcher = new ResizeWatch((entries) => {
        const width = entries[entries.length - 1].contentRect.width;
        if (width === parts.width) return;
        parts.width = width;
        this.fit();
      });
      parts.watcher.observe(this.textAreaElement);
    } else if (!grow && parts.watcher) {
      parts.watcher.disconnect();
      parts.watcher = null;
      parts.width = 0;
    }
    this.fit();
  }

  /** With `autoGrow`, sizes the box to the text, between `minRows` and `maxRows` lines. */
  private fit(): void {
    const area = this.textAreaElement;
    if (!this.peekProperty('autoGrow')) {
      area.style.removeProperty('block-size');
      area.style.removeProperty('overflow-y');
      return;
    }
    if (!area.isConnected) return;
    const style = getComputedStyle(area);
    const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 0;
    const padding = (parseFloat(style.paddingBlockStart) || 0) + (parseFloat(style.paddingBlockEnd) || 0);
    const rows = count(this.peekProperty('rows'), 3);
    const min = count(this.peekProperty('minRows'), rows) * line + padding;
    const maxRows = this.peekProperty<number | null>('maxRows');
    const max = maxRows && maxRows > 0 ? Math.max(maxRows * line + padding, min) : Infinity;
    area.style.blockSize = 'auto';
    const needed = area.scrollHeight;
    area.style.blockSize = `${Math.min(Math.max(needed, min), max)}px`;
    area.style.overflowY = needed > max + 1 ? 'auto' : 'hidden';
  }

  private renderClear(): void {
    this.showClearButton(!!this.peekProperty('clearButton'), (e) => this.commit('', e), 'mx-text-area__clear');
  }
}
