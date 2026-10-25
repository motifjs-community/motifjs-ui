import { effect, Emitter, read, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { afterPress } from '../../core/after-press';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { dismissMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { checkRules } from '../validation/check-rules';
import { VALIDATES } from '../validation/validate-fields';
import type { ValidationGroup } from '../validation/ValidationGroup';
import type { ValidationMessage } from '../validation/validation-message';
import type { ValidationRule } from '../validation/validation-rule';
import type { ValidationTarget } from '../validation/validation-target';
import type { BoxArea } from './box-area';
import type { FieldButton } from './field-button';
import type { FieldLabelMode } from './field-label-mode';
import type { FieldProps } from './field-props';
import type { FieldVariant } from './field-variant';
import type { ValidateOn } from './validate-on';
import type { ValidatedEventArgs } from './validated-event-args';
import type { ValueChangedEventArgs } from './value-changed-event-args';

const OWN = [
  'labelMode',
  'helpText',
  'hint',
  'prefix',
  'suffix',
  'icon',
  'buttons',
  'readOnly',
  'required',
  'size',
  'variant',
  'stretch',
  'rules',
  'error',
  'validateOn',
  'validationGroup',
] as const;

const LOOK = ['labelMode', 'size', 'variant', 'stretch'] as const;

const ORDER: BoxArea[] = ['icon', 'prefix', 'start', 'suffix', 'tools', 'end', 'actions'];

const NONE = Symbol('none');

const PARTS = Symbol('mx.field');

interface Parts {
  label: HTMLLabelElement;
  labelText: HTMLSpanElement;
  requiredMark: HTMLSpanElement | null;
  box: HTMLDivElement;
  control: HTMLElement;
  areas: Map<BoxArea, HTMLElement>;
  message: HTMLSpanElement;
  counter: HTMLSpanElement | null;
  clear: HTMLButtonElement | null;
  stopClearLabel: (() => void) | null;
  releaseIcon: () => void;
  releaseButtons: (() => void)[];
  stopButtons: (() => void) | null;
  stopMessage: (() => void) | null;
  leaveGroup: (() => void) | null;
  lastValue: unknown;
  userChange: boolean;
  /** The user changed the value since the last reset. */
  dirty: boolean;
  /** A check ran and its outcome shows: later changes are checked at once. */
  shown: boolean;
  run: number;
  valueChanged: Emitter<ValueChangedEventArgs<unknown>>;
  validated: Emitter<ValidatedEventArgs>;
}

function labelable(el: HTMLElement): boolean {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || el instanceof HTMLButtonElement;
}

function emptyLike(value: unknown): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * The base of every editor: a label, a box with the editor and its buttons, a line for help or
 * an error, the value (two-way with `x-model`) and validation. A subclass gives the element that
 * holds the value (`createControl`) and draws the value into it (`renderValue`).
 */
export abstract class Field<T, TProps extends FieldProps<T> = FieldProps<T>> extends Control<HTMLDivElement, TProps> implements ValidationTarget {
  constructor(props?: IBaseProp<TProps>) {
    super('div', props);
    const own = (this.props ?? {}) as FieldProps<T>;
    this.element.setAttribute(VALIDATES, '');

    this.observeProperty<string>('text', (text) => this.renderLabel(text));
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.observeProperty<string>('hint', (hint) => this.renderHint(hint));
    this.observeProperty<string>('prefix', (text) => this.renderAffix('prefix', text));
    this.observeProperty<string>('suffix', (text) => this.renderAffix('suffix', text));
    this.observeProperty('icon', () => this.renderIcon());
    this.observeProperty('buttons', () => this.renderButtons());
    this.observeProperty<boolean>('readOnly', (on) => this.renderReadOnly(!!on));
    this.observeProperty<boolean>('required', (on) => this.renderRequired(!!on));
    this.observeProperty('error', () => this.refreshValidity());
    this.observeProperty<ValidationGroup | null>('validationGroup', (group) => this.joinGroup(group));
    this.observeProperty<T | undefined>('value', (value) => this.valueStored(value));

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.value !== undefined) this.value = own.value;
    if (own.onValueChanged) this.onValueChanged(own.onValueChanged);
    if (own.onValidated) this.onValidated(own.onValidated);

    const parts = this.parts;
    this.element.addEventListener('focusout', (e) => this.focusLeft(e));
    parts.label.addEventListener('click', () => {
      if (!labelable(parts.control)) this.focus();
    });
    // Follows the help text, the error and `uiLocale`.
    parts.stopMessage = effect(() => {
      const text = this.validationMessage || (this.getProperty<string | undefined>('helpText') ?? '');
      untracked(() => this.renderMessage(text));
    });
    this.motif.setDisposable(() => {
      parts.stopMessage?.();
      parts.stopClearLabel?.();
      parts.stopButtons?.();
      parts.leaveGroup?.();
      parts.releaseIcon();
      for (const release of parts.releaseButtons) release();
      parts.valueChanged.dispose();
      parts.validated.dispose();
    });
  }

  // Properties (see FieldProps).

  get value(): T {
    const value = this.getProperty<T | undefined>('value');
    return (value === undefined ? this.emptyValue() : value) as T;
  }
  set value(value: Bind<T>) {
    untracked(() => this.assignProperty<T>('value', value, (v) => this.normalizeValue(v)));
  }
  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get labelMode(): FieldLabelMode {
    return this.getProperty<FieldLabelMode | undefined>('labelMode') ?? 'top';
  }
  set labelMode(value: Bind<FieldLabelMode>) {
    this.assignProperty('labelMode', value);
  }
  get helpText(): string {
    return this.getProperty<string | undefined>('helpText') ?? '';
  }
  set helpText(value: Bind<string>) {
    this.assignProperty('helpText', value);
  }
  get hint(): string {
    return this.getProperty<string | undefined>('hint') ?? '';
  }
  set hint(value: Bind<string>) {
    this.assignProperty('hint', value);
  }
  get prefix(): string {
    return this.getProperty<string | undefined>('prefix') ?? '';
  }
  set prefix(value: Bind<string>) {
    this.assignProperty('prefix', value);
  }
  get suffix(): string {
    return this.getProperty<string | undefined>('suffix') ?? '';
  }
  set suffix(value: Bind<string>) {
    this.assignProperty('suffix', value);
  }
  get icon(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null>) {
    this.assignProperty('icon', value);
  }
  get buttons(): readonly FieldButton[] {
    return this.getProperty<readonly FieldButton[] | undefined>('buttons') ?? [];
  }
  set buttons(value: Bind<readonly FieldButton[]>) {
    this.assignProperty('buttons', value);
  }
  get readOnly(): boolean {
    return !!this.getProperty<boolean>('readOnly');
  }
  set readOnly(value: Bind<boolean>) {
    this.assignProperty('readOnly', value, Boolean);
  }
  get required(): boolean {
    return !!this.getProperty<boolean>('required');
  }
  set required(value: Bind<boolean>) {
    this.assignProperty('required', value, Boolean);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get variant(): FieldVariant {
    return this.getProperty<FieldVariant | undefined>('variant') ?? 'outline';
  }
  set variant(value: Bind<FieldVariant>) {
    this.assignProperty('variant', value);
  }
  get stretch(): boolean {
    return !!this.getProperty<boolean>('stretch');
  }
  set stretch(value: Bind<boolean>) {
    this.assignProperty('stretch', value, Boolean);
  }
  get rules(): readonly ValidationRule<T>[] {
    return this.getProperty<readonly ValidationRule<T>[] | undefined>('rules') ?? [];
  }
  set rules(value: Bind<readonly ValidationRule<T>[]>) {
    this.assignProperty('rules', value);
  }
  get error(): string {
    return this.getProperty<string | null | undefined>('error') ?? '';
  }
  set error(value: Bind<string | null>) {
    this.assignProperty('error', value);
  }
  get validateOn(): ValidateOn {
    return this.getProperty<ValidateOn | undefined>('validateOn') ?? 'blur';
  }
  set validateOn(value: Bind<ValidateOn>) {
    this.assignProperty('validateOn', value);
  }
  get validationGroup(): ValidationGroup | null {
    return this.getProperty<ValidationGroup | null | undefined>('validationGroup') ?? null;
  }
  set validationGroup(value: Bind<ValidationGroup | null>) {
    this.assignProperty('validationGroup', value);
  }

  get onValueChanged(): MotifEvent<ValueChangedEventArgs<T>> {
    return this.parts.valueChanged.event as unknown as MotifEvent<ValueChangedEventArgs<T>>;
  }

  get onValidated(): MotifEvent<ValidatedEventArgs> {
    return this.parts.validated.event;
  }

  // Validation.

  /** `false` while a failed check or an `error` shows. */
  get isValid(): boolean {
    return !this.getProperty<boolean>('invalid');
  }

  /** The error shown, `''` when there is none. */
  get validationMessage(): string {
    const error = this.getProperty<string | null | undefined>('error');
    if (error) return error;
    const failure = this.getProperty<ValidationMessage | null | undefined>('failure');
    return failure ? failure() : '';
  }

  /** An asynchronous rule is running. */
  get validating(): boolean {
    return !!this.getProperty<boolean>('validating');
  }

  /** Checks the value and shows the outcome. */
  async validate(): Promise<boolean> {
    const parts = this.parts;
    parts.shown = true;
    const run = ++parts.run;
    this.setProperty('validating', true);
    const value = this.peekValue();
    const rules = [...this.builtInRules(), ...(this.peekProperty<readonly ValidationRule<T>[]>('rules') ?? [])];
    let failure: ValidationMessage | null;
    try {
      failure = await checkRules(value, rules, this.isEmptyValue(value));
    } catch {
      failure = () => uiLocale.strings.invalid;
    }
    if (run !== parts.run || this.isDisposed) return untracked(() => this.isValid);
    this.setProperty('validating', false);
    this.setProperty('failure', failure);
    this.refreshValidity();
    const valid = untracked(() => this.isValid);
    parts.validated.fire({ valid, message: valid ? '' : untracked(() => this.validationMessage), source: this });
    return valid;
  }

  /** Hides the outcome of earlier checks; a running one is dropped. */
  resetValidation(): void {
    const parts = this.parts;
    parts.run++;
    parts.shown = false;
    parts.dirty = false;
    this.setProperty('validating', false);
    this.setProperty('failure', null);
    this.refreshValidity();
  }

  // For subclasses.

  /** The element that holds the value and takes focus. Called once, before the subclass's fields exist. */
  protected abstract createControl(): HTMLElement;

  /** Draws the value into the control. */
  protected abstract renderValue(value: T): void;

  protected abstract emptyValue(): T;

  protected normalizeValue(value: T): T {
    return value ?? this.emptyValue();
  }

  protected isEmptyValue(value: T): boolean {
    return emptyLike(value);
  }

  protected sameValue(a: T, b: T): boolean {
    return Object.is(a, b);
  }

  /** The rules the field brings itself, checked before `rules`. */
  protected builtInRules(): ValidationRule<T>[] {
    return this.peekProperty('required') ? [{ type: 'required' }] : [];
  }

  /** The value without tracking it. */
  protected peekValue(): T {
    const value = this.peekProperty<T>('value');
    return (value === undefined ? this.emptyValue() : value) as T;
  }

  /** The user changed the value: stored, written back to `x-model`, reported and checked. */
  protected commit(value: T, event?: Event): void {
    const parts = this.parts;
    const next = this.normalizeValue(value);
    const previous = this.peekValue();
    if (this.sameValue(next, previous)) return;
    parts.userChange = true;
    try {
      this.changeProperty('value', next);
    } finally {
      parts.userChange = false;
    }
    parts.dirty = true;
    this.bindings.writeModel(next);
    parts.valueChanged.fire({ value: next, previousValue: previous, byUser: true, source: this, event });
    if (parts.shown || this.peekProperty('validateOn') === 'input') void this.validate();
  }

  /** A place in the box for the subclass's own parts (a clear button, a drop-down arrow). */
  protected area(name: BoxArea): HTMLElement {
    const parts = this.parts;
    let area = parts.areas.get(name);
    if (area) return area;
    area = document.createElement('span');
    area.className = `mx-field__${name}`;
    const later = ORDER.slice(ORDER.indexOf(name) + 1)
      .map((n) => parts.areas.get(n))
      .find(Boolean);
    if (later) parts.box.insertBefore(area, later);
    else if (ORDER.indexOf(name) <= ORDER.indexOf('start')) parts.box.insertBefore(area, parts.control);
    else parts.box.append(area);
    parts.areas.set(name, area);
    return area;
  }

  /** A short text at the end of the line under the box, e.g. `12/50`; `''` removes it. */
  protected setCounter(text: string): void {
    const parts = this.parts;
    if (!text && !parts.counter) return;
    if (!parts.counter) {
      parts.counter = document.createElement('span');
      parts.counter.className = 'mx-field__counter';
      parts.message.after(parts.counter);
    }
    parts.counter.textContent = text;
    this.markMessage();
  }

  /**
   * Shows or removes the button that empties the field (named from `uiLocale`, not a Tab stop);
   * `clear` runs on a press, then the field gets focus. `className` is the subclass's own hook.
   */
  protected showClearButton(on: boolean, clear: (event: MouseEvent) => void, className: string): void {
    const parts = this.parts;
    if (!on) {
      parts.stopClearLabel?.();
      parts.clear?.remove();
      parts.clear = parts.stopClearLabel = null;
      return;
    }
    if (parts.clear) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.className = `mx-field__button mx-field__clear ${className}`;
    button.append(dismissMark());
    button.addEventListener('mousedown', (e) => e.preventDefault());
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      clear(e);
      this.focus();
    });
    parts.stopClearLabel = effect(() => button.setAttribute('aria-label', uiLocale.strings.clear));
    this.area('tools').prepend(button);
    parts.clear = button;
  }

  protected renderReadOnly(on: boolean): void {
    const control = this.parts.control;
    this.element.toggleAttribute('data-readonly', on);
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) control.readOnly = on;
    else if (on) control.setAttribute('aria-readonly', 'true');
    else control.removeAttribute('aria-readonly');
  }

  protected override get focusElement(): HTMLElement {
    return this.parts.control;
  }

  // Drawing.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const id = nextId('field');
    this.element.classList.add('mx-field');
    const label = document.createElement('label');
    label.className = 'mx-field__label';
    label.id = `${id}-label`;
    label.hidden = true;
    const labelText = label.appendChild(document.createElement('span'));
    const box = document.createElement('div');
    box.className = 'mx-field__box';
    const control = this.createControl();
    control.id = id;
    control.classList.add('mx-field__control');
    if (labelable(control)) label.htmlFor = id;
    box.append(control);
    const foot = document.createElement('div');
    foot.className = 'mx-field__foot';
    const message = foot.appendChild(document.createElement('span'));
    message.className = 'mx-field__message';
    message.id = `${id}-message`;
    message.setAttribute('aria-live', 'polite');
    this.element.append(label, box, foot);
    return {
      label,
      labelText,
      requiredMark: null,
      box,
      control,
      areas: new Map(),
      message,
      counter: null,
      clear: null,
      stopClearLabel: null,
      releaseIcon: () => {},
      releaseButtons: [],
      stopButtons: null,
      stopMessage: null,
      leaveGroup: null,
      lastValue: NONE,
      userChange: false,
      dirty: false,
      shown: false,
      run: 0,
      valueChanged: new Emitter(),
      validated: new Emitter(),
    };
  }

  private valueStored(value: T | undefined): void {
    const parts = this.parts;
    const current = (value === undefined ? this.emptyValue() : value) as T;
    const previous = parts.lastValue;
    parts.lastValue = current;
    this.renderValue(current);
    this.element.toggleAttribute('data-filled', !this.isEmptyValue(current));
    if (parts.userChange || previous === NONE) return;
    parts.valueChanged.fire({ value: current, previousValue: previous, byUser: false, source: this });
    if (parts.shown) void this.validate();
  }

  private focusLeft(e: FocusEvent): void {
    const to = e.relatedTarget as Node | null;
    if (to && this.element.contains(to)) return;
    const parts = this.parts;
    if (this.peekProperty('validateOn') !== 'manual' && this.peekProperty('validateOn') !== 'input' && (parts.dirty || parts.shown)) {
      afterPress(() => {
        if (!this.isDisposed && !this.element.contains(document.activeElement)) void this.validate();
      });
    }
  }

  private refreshValidity(): void {
    const invalid = !!this.peekProperty('failure') || !!this.peekProperty('error');
    this.setProperty('invalid', invalid);
    this.element.toggleAttribute('data-invalid', invalid);
    if (invalid) this.parts.control.setAttribute('aria-invalid', 'true');
    else this.parts.control.removeAttribute('aria-invalid');
  }

  private joinGroup(group: ValidationGroup | null | undefined): void {
    const parts = this.parts;
    parts.leaveGroup?.();
    parts.leaveGroup = group ? group.add(this) : null;
  }

  private renderLabel(text: string): void {
    const parts = this.parts;
    const parsed = parseAccessKey(text ?? '');
    renderAccessKey(parts.labelText, parsed);
    parts.label.hidden = !parsed.text;
    this.setAccessKey(parsed.key);
    if (labelable(parts.control)) return;
    if (parsed.text) parts.control.setAttribute('aria-labelledby', parts.label.id);
    else parts.control.removeAttribute('aria-labelledby');
  }

  private renderLook(): void {
    const data = this.element.dataset;
    data.labelMode = this.peekProperty<FieldLabelMode>('labelMode') ?? 'top';
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    data.variant = this.peekProperty<FieldVariant>('variant') ?? 'outline';
    this.element.toggleAttribute('data-stretch', !!this.peekProperty('stretch'));
  }

  private renderHint(hint: string | undefined): void {
    const control = this.parts.control;
    if (hint) control.title = hint;
    else control.removeAttribute('title');
  }

  private renderRequired(on: boolean): void {
    const parts = this.parts;
    this.element.toggleAttribute('data-required', on);
    if (on) parts.control.setAttribute('aria-required', 'true');
    else parts.control.removeAttribute('aria-required');
    if (on && !parts.requiredMark) {
      parts.requiredMark = parts.label.appendChild(document.createElement('span'));
      parts.requiredMark.className = 'mx-field__required';
      parts.requiredMark.setAttribute('aria-hidden', 'true');
      parts.requiredMark.textContent = '*';
    } else if (!on && parts.requiredMark) {
      parts.requiredMark.remove();
      parts.requiredMark = null;
    }
  }

  private renderAffix(name: 'prefix' | 'suffix', text: string | undefined): void {
    const parts = this.parts;
    this.element.toggleAttribute(`data-${name}`, !!text);
    if (text) {
      const area = this.area(name);
      area.id = `${parts.control.id}-${name}`;
      area.textContent = text;
    } else {
      parts.areas.get(name)?.remove();
      parts.areas.delete(name);
    }
    this.renderDescribedBy();
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    this.element.toggleAttribute('data-icon', !!icon);
    if (!icon) {
      parts.areas.get('icon')?.remove();
      parts.areas.delete('icon');
      return;
    }
    const area = this.area('icon');
    area.setAttribute('aria-hidden', 'true');
    const shown = iconNode(icon);
    area.replaceChildren(shown.node);
    parts.releaseIcon = shown.release;
  }

  private renderButtons(): void {
    const parts = this.parts;
    parts.stopButtons?.();
    parts.stopButtons = null;
    const list = this.peekProperty<readonly FieldButton[]>('buttons') ?? [];
    if (!list.length) {
      this.drawButtons([]);
      return;
    }
    // Reading the buttons is followed; drawing them is not.
    parts.stopButtons = effect(() => {
      const looks = list.map((button) => ({
        button,
        visible: read(button.visible) !== false,
        enabled: read(button.enabled) !== false,
        tabStop: read(button.tabStop) !== false,
        start: read(button.position) === 'start',
        text: read(button.text) ?? '',
        hint: read(button.hint) ?? '',
        icon: button.icon === undefined ? undefined : read(button.icon),
      }));
      untracked(() => this.drawButtons(looks.filter((look) => look.visible)));
    });
  }

  private drawButtons(
    looks: { button: FieldButton; enabled: boolean; tabStop: boolean; start: boolean; text: string; hint: string; icon: IconSource | undefined }[],
  ): void {
    const parts = this.parts;
    for (const release of parts.releaseButtons.splice(0)) release();
    for (const name of ['start', 'end'] as const) {
      parts.areas.get(name)?.remove();
      parts.areas.delete(name);
    }
    for (const look of looks) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'mx-field__button';
      if (!look.tabStop) element.tabIndex = -1;
      if (!look.enabled) element.disabled = true;
      if (look.hint) {
        element.title = look.hint;
        if (!look.text) element.setAttribute('aria-label', look.hint);
      }
      if (look.icon !== undefined) {
        const shown = iconNode(look.icon);
        const icon = element.appendChild(document.createElement('span'));
        icon.className = 'mx-field__button-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.append(shown.node);
        parts.releaseButtons.push(shown.release);
      }
      if (look.text) element.append(look.text);
      element.addEventListener('click', (event) => look.button.click?.({ button: look.button, source: this, event }));
      this.area(look.start ? 'start' : 'end').append(element);
    }
  }

  private renderMessage(text: string): void {
    this.parts.message.textContent = text;
    this.markMessage();
    this.renderDescribedBy();
  }

  private markMessage(): void {
    const parts = this.parts;
    this.element.toggleAttribute('data-message', !!parts.message.textContent || !!parts.counter?.textContent);
  }

  private renderDescribedBy(): void {
    const parts = this.parts;
    const ids = [parts.areas.get('prefix')?.id, parts.areas.get('suffix')?.id, parts.message.textContent ? parts.message.id : undefined].filter(Boolean);
    if (ids.length) parts.control.setAttribute('aria-describedby', ids.join(' '));
    else parts.control.removeAttribute('aria-describedby');
  }
}
