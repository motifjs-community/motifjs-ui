import { LanguageLook } from '../../core/language-look';
import { Component, ComponentBase, createSignal, Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp, type Signal } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { afterPress } from '../../core/after-press';
import { Control } from '../../core/control';
import { holdsFocus } from '../../core/focus';
import { follow } from '../../core/follow';
import type { ControlSize } from '../../core/control-size';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { clearParts, glyphPart, loose, part, partBefore, removePart, textPart } from '../../core/draw-parts';
import { flag, mark, put, shown, text as writeText } from '../../core/part-writes';
import { showsPresses } from '../../core/press-origin';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { onDocument } from '../../core/window-events';
import { checkRules } from '../validation/check-rules';
import type { ValidationGroup } from '../validation/ValidationGroup';
import type { ValidationMessage } from '../validation/validation-message';
import type { ValidationRule } from '../validation/validation-rule';
import type { ValidationTarget } from '../validation/validation-target';
import type { BoxArea } from './box-area';
import type { FieldButton } from './field-button';
import type { FieldLabelMode } from './field-label-mode';
import type { FieldProps } from './field-props';
import type { FieldVariant } from './field-variant';
import { pressedFocusable } from './pressed-focusable';
import { sameAsWritten } from './same-as-written';
import type { ValidateOn } from './validate-on';
import type { ValidatedEventArgs } from './validated-event-args';
import type { ValueChangedEventArgs } from './value-changed-event-args';
import { onLanguage } from '../../core/on-language';

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
  /** The control's id; the label, the message, the prefix and the suffix take theirs from it. */
  id: string;
  /** The tag of the control's element (see `labelable`). */
  tag: string;
  labelPart: Component<HTMLLabelElement>;
  labelText: Component<HTMLSpanElement>;
  /** The label shows a text, and so names the control. */
  labelShown: boolean;
  requiredMark: Component<HTMLSpanElement> | null;
  boxPart: Component<HTMLDivElement>;
  footPart: Component<HTMLDivElement>;
  /** The notch of the frame, where a language cuts one for the label: it carries the label's text for CSS to draw. */
  notch: Component<HTMLSpanElement>;
  controlPart: ComponentBase;
  /** The design language's defaults for a variant and a label mode not given (`--mx-field-variant`, `--mx-field-label-mode`). */
  look: LanguageLook<'variant' | 'labelMode' | 'notch' | 'size'>;
  areas: Map<BoxArea, Component<HTMLSpanElement>>;
  message: Component<HTMLSpanElement>;
  /** The text written into the message. */
  messageText: string;
  counter: Component<HTMLSpanElement> | null;
  /** The text written into the counter. */
  counterText: string;
  clear: Component<HTMLButtonElement> | null;
  stopClearLabel: (() => void) | null;
  releaseIcon: () => void;
  /** The buttons given, as they are now (see `renderButtons`). */
  buttons: Signal<readonly FieldButton[]>;
  /** The parts of the buttons given, while they are shown. */
  buttonParts: Map<FieldButton, Component<HTMLButtonElement>>;
  /** The places (`start`, `end`) that list the buttons given. */
  buttonAreas: WeakSet<ComponentBase>;
  stopMessage: (() => void) | null;
  leaveGroup: (() => void) | null;
  /** Stops waiting to see where focus that left the field lands (see `focusLeft`). */
  stopLanding: (() => void) | null;
  lastValue: unknown;
  userChange: boolean;
  /** The value just written to `x-model`, which hands it back once, as the model holds it. */
  echo: { value: unknown } | null;
  /** The user changed the value since the last reset. */
  dirty: boolean;
  /** A check ran and its outcome shows: later changes are checked at once. */
  shown: boolean;
  run: number;
  valueChanged: Emitter<ValueChangedEventArgs<unknown>>;
  validated: Emitter<ValidatedEventArgs>;
}

/** A `<label for>` names a control of this tag and hands it its clicks. */
function labelable(tag: string): boolean {
  return ['input', 'textarea', 'select', 'button'].includes(tag);
}

function emptyLike(value: unknown): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * The base of every editor: a label, a box with the editor and its buttons, a line for help or
 * an error, the value (`x-model` provides two-way binding) and validation. A subclass provides the
 * element that holds the value (`createControl`) and draws the value into it (`renderValue`).
 */
export abstract class Field<T, TProps extends FieldProps<T> = FieldProps<T>> extends Control<HTMLDivElement, TProps> implements ValidationTarget {
  constructor(props?: IBaseProp<TProps>) {
    super('div', props);
    const own = (this.props ?? {}) as FieldProps<T>;

    this.observeProperty<string>('text', (text) => this.renderLabel(text));
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    // A variant or a label mode not given is the design language's: read again when the language changes.
    this.motif.setDisposable(this.parts.look.watch());
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
    this.motif.on('focusout', (_, e) => this.focusLeft(e));
    parts.labelPart.motif.on('click', () => {
      if (!labelable(parts.tag)) this.focus();
    });
    // A click anywhere in the box, outside the editor and its buttons, puts focus in the editor.
    parts.boxPart.motif.on('mousedown', (_, e) => {
      if (e.button !== 0 || parts.controlPart.motif.isEventFrom(e) || pressedFocusable(parts.boxPart, e)) return;
      e.preventDefault();
      this.focus();
    });
    // Follows the help text, the error and a rule's message given as a function; in the kit's language again when it changes.
    const message = () => this.validationMessage || (this.getProperty<string | undefined>('helpText') ?? '');
    parts.stopMessage = follow(this, 'message', message, (text) => this.renderMessage(text));
    onLanguage(this, () => this.renderMessage(message()));
    this.motif.setDisposable(() => {
      parts.stopMessage?.();
      parts.stopClearLabel?.();
      parts.leaveGroup?.();
      parts.stopLanding?.();
      parts.releaseIcon();
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
    const before = this.peekValue();
    untracked(() => this.assignProperty<T>('value', value, (v) => this.takeEcho(v) ?? this.normalizeValue(v)));
    // A value set programmatically shows in `x-model` too, so the model and the field never differ.
    if (typeof value !== 'function' && !this.sameValue(this.peekValue(), before)) this.writeBack(this.peekValue());
  }
  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  /** The value as set, otherwise the design language's default. */
  get labelMode(): FieldLabelMode {
    return this.getProperty<FieldLabelMode | undefined>('labelMode') ?? (this.parts.look.get('labelMode') as FieldLabelMode | null) ?? 'top';
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
    return this.getProperty<ControlSize | undefined>('size') ?? (this.parts.look.get('size') as ControlSize | null) ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  /** The value as set, otherwise the design language's default. */
  get variant(): FieldVariant {
    return this.getProperty<FieldVariant | undefined>('variant') ?? (this.parts.look.get('variant') as FieldVariant | null) ?? 'outline';
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

  /** The field itself, as a `ValidationTarget`'s part: what a `ValidationSummary` and a group's order go by. */
  get part(): ComponentBase {
    return this;
  }

  /** `false` while a failed validation or an `error` is shown. */
  get isValid(): boolean {
    return !this.getProperty<boolean>('invalid');
  }

  /** The error shown, or `''` if there is none. */
  get validationMessage(): string {
    const error = this.getProperty<string | null | undefined>('error');
    if (error) return error;
    const failure = this.getProperty<ValidationMessage | null | undefined>('failure');
    return failure ? failure() : '';
  }

  /** Indicates that an asynchronous rule is running. */
  get validating(): boolean {
    return !!this.getProperty<boolean>('validating');
  }

  /** Validates the value and shows the result. */
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

  /** Clears the results of earlier validation, and drops a running one. */
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

  /** The component whose element holds the value and takes focus, a child of the box. Called once, before the subclass's fields exist. */
  protected abstract createControl(): ComponentBase;

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
    this.writeBack(next);
    parts.valueChanged.fire({ value: next, previousValue: previous, byUser: true, source: this, event });
    if (parts.shown || this.peekProperty('validateOn') === 'input') void this.validate();
  }

  /** Writes the value to `x-model`, if there is one. */
  protected writeBack(value: T): void {
    const parts = this.parts;
    if (!this.bindings.writeModel(value)) return;
    // `x-model` hands the value back on the next update; a reactive model gives its own copy of an object then,
    // and the value stays the one chosen.
    const echo = (parts.echo = { value });
    queueMicrotask(() => {
      if (parts.echo === echo) parts.echo = null;
    });
  }

  /**
   * Re-reads your data after it has been changed in place (the field's buttons here, and a list's items in a list).
   * Your data can be plain or reactive, and the field reads it as it is.
   */
  refresh(): void {
    this.renderButtons();
  }

  /** The id of the control; the label, the message, the prefix and the suffix take theirs from it. */
  protected get controlId(): string {
    return this.parts.id;
  }

  /** The id of the message under the box (help text or error): what describes the control. */
  protected get messageId(): string {
    return `${this.parts.id}-message`;
  }

  /** The component of the control (see `createControl`): its events are listened to through it (`motif.on`). */
  protected get controlPart(): ComponentBase {
    return this.parts.controlPart;
  }

  /** The id of the label above the box while it shows a text, else `''`: what names the control. */
  protected get labelId(): string {
    const parts = this.parts;
    return parts.labelShown ? `${parts.id}-label` : '';
  }

  /** The box as a component: a subclass's own components shown in the box are added to it. */
  protected get boxPart(): ComponentBase {
    return this.parts.boxPart;
  }

  /** The buttons the field draws in the box: the clear button while it shows, then the buttons given. */
  protected get boxButtons(): readonly ComponentBase[] {
    const parts = this.parts;
    const shown = [...parts.buttonParts.values()];
    return parts.clear ? [parts.clear, ...shown] : shown;
  }

  /** A place in the box for the subclass's own parts (a clear button, a drop-down arrow): a component they are added to. */
  protected area(name: BoxArea): Component<HTMLSpanElement> {
    const parts = this.parts;
    const known = parts.areas.get(name);
    if (known) return known;
    // In the box's order: before the next place there is, or before the control for the places at its start.
    const later = ORDER.slice(ORDER.indexOf(name) + 1)
      .map((n) => parts.areas.get(n))
      .find(Boolean);
    const before = later ?? (ORDER.indexOf(name) <= ORDER.indexOf('start') ? parts.controlPart : null);
    const area = partBefore<HTMLSpanElement>(parts.boxPart, before, 'span', `mx-field__${name}`);
    parts.areas.set(name, area);
    return area;
  }

  /** Takes a place out of the box; `area` makes a new one when it is wanted again. */
  protected removeArea(name: BoxArea): void {
    const parts = this.parts;
    removePart(parts.areas.get(name));
    parts.areas.delete(name);
  }

  /** A short text at the end of the line under the box, e.g. `12/50`; `''` removes it. */
  protected setCounter(text: string): void {
    const parts = this.parts;
    if (!text && !parts.counter) return;
    // After the message.
    parts.counter ??= part<HTMLSpanElement>(parts.footPart, 'span', 'mx-field__counter');
    writeText(parts.counter, text);
    parts.counterText = text;
    this.markMessage();
  }

  /**
   * Shows or removes the button that empties the field (named from `uiLocale`, not a Tab stop);
   * `clear` runs on a click, then the field gets focus. `className` is the subclass's own hook.
   */
  protected showClearButton(on: boolean, clear: (event: MouseEvent) => void, className: string): void {
    const parts = this.parts;
    if (!on) {
      parts.stopClearLabel?.();
      removePart(parts.clear);
      parts.clear = parts.stopClearLabel = null;
      return;
    }
    if (parts.clear) return;
    // First among the tools.
    const tools = this.area('tools');
    const clearPart = partBefore<HTMLButtonElement>(tools, tools.controls.items[0] ?? null, 'button', `mx-field__button mx-field__clear ${className}`);
    clearPart.attr.add({ type: 'button' });
    put(clearPart, 'tabindex', '-1');
    glyphPart(clearPart, 'dismiss');
    clearPart.motif.on('mousedown', (_, e) => e.preventDefault());
    clearPart.motif.on('click', (_, e) => {
      e.stopPropagation();
      clear(e);
      this.focus();
    });
    parts.stopClearLabel = onLanguage(this, () => put(clearPart, 'aria-label', uiLocale.strings.clear));
    parts.clear = clearPart;
  }

  protected renderReadOnly(on: boolean): void {
    const tag = this.parts.tag;
    mark(this, 'data-readonly', on);
    if (tag === 'input' || tag === 'textarea') mark(this.controlPart, 'readonly', on);
    else flag(this.controlPart, 'aria-readonly', on && this.formRole);
  }

  override get focusPart(): ComponentBase {
    return this.parts.controlPart;
  }

  /** Whether the role of the control carries `aria-required` and `aria-readonly`. A control with another role says no. */
  protected get formRole(): boolean {
    return true;
  }

  /**
   * The tag of the element `createControl` makes (`'input'`, `'textarea'`, `'button'`, `'div'`): a native field takes the
   * label's `for` and its own `readonly`. Read once, before the subclass's fields exist, so it returns a constant.
   * `null`: not a native field.
   */
  protected get controlTag(): string | null {
    return null;
  }

  // Drawing.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const id = nextId('field');
    this.class.add('mx-field');
    // Every part is a component of the field, in order: the label, the box, the line under it.
    const labelPart = new Component<HTMLLabelElement>('label');
    labelPart.class.add('mx-field__label');
    labelPart.attr.add({ id: `${id}-label`, hidden: true });
    const labelText = part<HTMLSpanElement>(labelPart, 'span', '');
    // The box and the foot are components of the field after the label, so a control that is a component is the box's child.
    const boxPart = new Component<HTMLDivElement>('div');
    boxPart.class.add('mx-field__box');
    showsPresses(boxPart);
    // The frame and the line under the box are parts of their own, so a design language can shape them: a frame
    // with a notch for the label (its start, the notch with the label's text, its end), an indicator that grows.
    const frame = part<HTMLSpanElement>(boxPart, 'span', 'mx-field__frame');
    frame.attr.add({ 'aria-hidden': 'true' });
    const pieces = ['start', 'notch', 'end'].map((name) => part<HTMLSpanElement>(frame, 'span', `mx-field__frame-${name}`));
    part(frame, 'span', 'mx-field__indicator');
    const controlPart = this.createControl();
    // What the subclass made, known once here: a native field takes the label's `for` and its own `readonly`.
    const tag = this.controlTag ?? '';
    controlPart.attr.add({ id });
    controlPart.class.add('mx-field__control');
    if (labelable(tag)) labelPart.attr.add({ for: id });
    boxPart.controls.add(controlPart);
    const footPart = new Component<HTMLDivElement>('div');
    footPart.class.add('mx-field__foot');
    const message = part<HTMLSpanElement>(footPart, 'span', 'mx-field__message');
    message.attr.add({ id: `${id}-message`, 'aria-live': 'polite' });
    this.controls.add(labelPart, boxPart, footPart);
    return {
      id,
      tag,
      labelPart,
      labelText,
      labelShown: false,
      requiredMark: null,
      boxPart,
      footPart,
      notch: pieces[1],
      controlPart,
      look: new LanguageLook(this, { variant: '--_field-variant', labelMode: '--_field-label-mode', notch: '--_field-notch', size: '--_field-size' }, () => this.renderLook()),
      areas: new Map(),
      message,
      messageText: '',
      counter: null,
      counterText: '',
      clear: null,
      stopClearLabel: null,
      releaseIcon: () => {},
      buttons: createSignal<readonly FieldButton[]>([]),
      buttonParts: new Map(),
      buttonAreas: new WeakSet(),
      stopMessage: null,
      leaveGroup: null,
      stopLanding: null,
      lastValue: NONE,
      userChange: false,
      echo: null,
      dirty: false,
      shown: false,
      run: 0,
      valueChanged: new Emitter(),
      validated: new Emitter(),
    };
  }

  /** `x-model` handing back the value the field just wrote: the written value, not the model's copy. */
  private takeEcho(value: T): T | undefined {
    const parts = this.parts;
    const echo = parts.echo;
    if (!echo) return undefined;
    parts.echo = null;
    const written = echo.value as T;
    return sameAsWritten(value, written) ? written : undefined;
  }

  private valueStored(value: T | undefined): void {
    const parts = this.parts;
    const current = (value === undefined ? this.emptyValue() : value) as T;
    const previous = parts.lastValue;
    parts.lastValue = current;
    this.renderValue(current);
    mark(this, 'data-filled', !this.isEmptyValue(current));
    if (parts.userChange || previous === NONE || this.sameValue(current, previous as T)) return;
    parts.valueChanged.fire({ value: current, previousValue: previous, byUser: false, source: this });
    if (parts.shown) void this.validate();
  }

  private focusLeft(e: FocusEvent): void {
    const parts = this.parts;
    parts.stopLanding?.();
    parts.stopLanding = null;
    if (this.peekProperty('validateOn') === 'manual' || this.peekProperty('validateOn') === 'input' || !(parts.dirty || parts.shown)) return;
    if (!e.relatedTarget) {
      this.validateWhenLeft();
      return;
    }
    // Focus going somewhere: where it went is known once it is there, and that may be inside the field again.
    const land = () => {
      parts.stopLanding?.();
      parts.stopLanding = null;
      if (!holdsFocus(this)) this.validateWhenLeft();
    };
    parts.stopLanding = onDocument(this, 'focusin', land, true);
  }

  /** Checks the field once the press in progress has ended, if focus is out of it then. */
  private validateWhenLeft(): void {
    afterPress(() => {
      if (!this.isDisposed && !holdsFocus(this)) void this.validate();
    });
  }

  private refreshValidity(): void {
    const invalid = !!this.peekProperty('failure') || !!this.peekProperty('error');
    this.setProperty('invalid', invalid);
    mark(this, 'data-invalid', invalid);
    flag(this.parts.controlPart, 'aria-invalid', invalid);
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
    put(parts.notch, 'data-label', parsed.text);
    mark(parts.labelPart, 'hidden', !parsed.text);
    parts.labelShown = !!parsed.text;
    this.setAccessKey(parsed.key);
    if (labelable(parts.tag)) return;
    put(parts.controlPart, 'aria-labelledby', this.labelId);
  }

  private renderLook(): void {
    const look = this.parts.look;
    put(this, 'data-label-mode', this.peekProperty<FieldLabelMode>('labelMode') ?? look.get('labelMode') ?? 'top');
    put(this, 'data-size', this.peekProperty<ControlSize>('size') ?? look.get('size') ?? 'md');
    put(this, 'data-variant', this.peekProperty<FieldVariant>('variant') ?? look.get('variant') ?? 'outline');
    mark(this, 'data-stretch', !!this.peekProperty('stretch'));
    mark(this, 'data-notch', look.get('notch') === 'cut');
  }

  /** Re-reads what the design language sets for the field (variant, label mode, size), with the next reads of its
   *  window. The field does this once it is in the page, and a field placed outside the component tree receives this
   *  call when it is placed. */
  readLook(): void {
    this.parts.look.read();
  }

  override onMounted(): void {
    this.readLook();
  }

  private renderHint(hint: string | undefined): void {
    put(this.parts.controlPart, 'title', hint);
  }

  private renderRequired(on: boolean): void {
    const parts = this.parts;
    mark(this, 'data-required', on);
    flag(parts.controlPart, 'aria-required', on && this.formRole);
    if (on && !parts.requiredMark) {
      parts.requiredMark = part<HTMLSpanElement>(parts.labelPart, 'span', 'mx-field__required');
      parts.requiredMark.attr.add({ 'aria-hidden': 'true' });
      parts.requiredMark.setText('*');
    } else if (!on && parts.requiredMark) {
      removePart(parts.requiredMark);
      parts.requiredMark = null;
    }
  }

  private renderAffix(name: 'prefix' | 'suffix', text: string | undefined): void {
    const parts = this.parts;
    mark(this, `data-${name}`, !!text);
    if (text) {
      const area = this.area(name);
      put(area, 'id', `${parts.id}-${name}`);
      writeText(area, text);
    } else this.removeArea(name);
    this.renderDescribedBy();
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    mark(this, 'data-icon', !!icon);
    if (!icon) {
      this.removeArea('icon');
      return;
    }
    const area = this.area('icon');
    put(area, 'aria-hidden', 'true');
    clearParts(area);
    parts.releaseIcon = showIcon(icon, area);
  }

  /**
   * Gives the places the buttons now. Each place lists its buttons once (`start`, `end`): a field of a button changes
   * only what shows it, and the list keeps the buttons it keeps. A place goes when no button is given for it.
   */
  private renderButtons(): void {
    const parts = this.parts;
    const list = givenList(this.peekProperty<readonly FieldButton[]>('buttons'));
    parts.buttons.value = list;
    for (const name of ['start', 'end'] as const) {
      const wanted = list.some((button) => (givenField(button, 'position') === 'start') === (name === 'start'));
      const known = parts.areas.get(name);
      if (!wanted) {
        // A place that holds the subclass's own parts as well stays.
        if (known && parts.buttonAreas.has(known) && known.controls.items.length <= 1) this.removeArea(name);
        continue;
      }
      const area = this.area(name);
      if (parts.buttonAreas.has(area)) {
        // Read again now: a plain list changed in place, and plain fields under functions.
        area.reState();
        continue;
      }
      parts.buttonAreas.add(area);
      const shownHere = () => parts.buttons.value.filter((button) => (givenField(button, 'position') === 'start') === (name === 'start') && givenField(button, 'visible') !== false);
      area.bindings.list(shownHere, (button: FieldButton) => this.makeButton(button));
      area.bindings.watch(() => {
        const any = shownHere().length > 0;
        untracked(() => shown(area, any || area.controls.items.length > 1));
      });
    }
  }

  /** A given button's part, built once: each field changes only what shows it. */
  private makeButton(button: FieldButton): Component<HTMLButtonElement> {
    const parts = this.parts;
    const buttonPart = loose<HTMLButtonElement>('button', 'mx-field__button');
    buttonPart.attr.add({ type: 'button' });
    parts.buttonParts.set(button, buttonPart);
    const icon = part<HTMLSpanElement>(buttonPart, 'span', 'mx-field__button-icon');
    icon.attr.add({ 'aria-hidden': 'true' });
    // A text node takes its text when it is built: a new text is a new node.
    let caption: ComponentBase | null = null;
    let captionText = '';
    let source: IconSource | undefined;
    let release: (() => void) | null = null;
    const bind = <T>(read: () => T, write: (value: T) => void) =>
      buttonPart.bindings.watch(() => {
        const value = read();
        untracked(() => write(value));
      });
    bind(() => givenField(button, 'tabStop') !== false, (tabStop) => put(buttonPart, 'tabindex', tabStop ? null : '-1'));
    bind(() => givenField(button, 'enabled') !== false, (enabled) => mark(buttonPart, 'disabled', !enabled));
    bind(
      () => ({ text: givenField<string | undefined>(button, 'text') ?? '', hint: givenField<string | undefined>(button, 'hint') ?? '' }),
      ({ text, hint }) => {
        put(buttonPart, 'title', hint);
        put(buttonPart, 'aria-label', text ? null : hint);
        if (text === captionText) return;
        captionText = text;
        removePart(caption);
        caption = text ? textPart(buttonPart, text) : null;
      },
    );
    bind(() => givenField<IconSource | undefined>(button, 'icon'), (next) => {
      shown(icon, next !== undefined);
      if (Object.is(next, source) && (release || next === undefined)) return;
      source = next;
      release?.();
      release = next !== undefined ? showIcon(next, icon) : null;
    });
    buttonPart.motif.on('click', (_, event) => givenValue<FieldButton['click']>(button, 'click')?.({ button, source: this, event }));
    buttonPart.motif.setDisposable(() => {
      release?.();
      if (parts.buttonParts.get(button) === buttonPart) parts.buttonParts.delete(button);
    });
    return buttonPart;
  }

  private renderMessage(text: string): void {
    const parts = this.parts;
    writeText(parts.message, text);
    parts.messageText = text;
    this.markMessage();
    this.renderDescribedBy();
  }

  private markMessage(): void {
    const parts = this.parts;
    mark(this, 'data-message', !!parts.messageText || !!parts.counterText);
  }

  private renderDescribedBy(): void {
    const parts = this.parts;
    // The prefix and the suffix while they show a text (see renderAffix), then the message while it has one.
    const ids = (['prefix', 'suffix'] as const).filter((name) => this.peekProperty(name)).map((name) => `${parts.id}-${name}`);
    if (parts.messageText) ids.push(this.messageId);
    put(parts.controlPart, 'aria-describedby', ids.length ? ids.join(' ') : null);
  }
}
