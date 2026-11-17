import type { Component, ComponentBase } from '@motifx/core';
import { loose, part, removePart } from '../../core/draw-parts';
import { kept, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import { Button } from '../button/Button';
import { FormLayout } from '../formlayout/FormLayout';
import type { FormItem } from '../formlayout/form-item';
import type { ChatFormAnswer, ChatFormField, ChatFormPart, ChatFormText, ChatFormValue } from './chat-request';

/** How many choices a field shows as round buttons; more go in a drop-down. */
const MOST_RADIOS = 4;

/** A choice of a field: its value and the name shown. */
interface Choice {
  value: string;
  text: string;
}

/**
 * A form a reply asks the user to fill in, in the composer's place until they send it, decline it or dismiss it: who
 * asks, what for, then a field for each of its schema's (a box for a text, a number or a date, round buttons or a
 * drop-down for a choice of one, tags for several, a check box for a yes or no), checked as the schema says. Enter in
 * a box sends it, Escape dismisses it.
 */
export class ChatFormView {
  readonly row: Component<HTMLDivElement>;
  private readonly from: Component<HTMLSpanElement>;
  private readonly said: Component<HTMLDivElement>;
  private readonly body: Component<HTMLDivElement>;
  private readonly cancel: Button;
  private readonly decline: Button;
  private readonly submit: Button;
  private fields: FormLayout | null = null;
  private data: Record<string, unknown> = {};
  private asked: ChatFormPart | null = null;

  constructor(private readonly answered: (part: ChatFormPart, answer: ChatFormAnswer) => void) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__ask');
    put(this.row, 'role', 'group');
    put(this.row, 'data-kind', 'form');
    const header = part<HTMLDivElement>(this.row, 'div', 'mx-chat__ask-header');
    this.from = part<HTMLSpanElement>(header, 'span', 'mx-chat__form-source');
    this.body = part<HTMLDivElement>(this.row, 'div', 'mx-chat__ask-body');
    this.said = part<HTMLDivElement>(this.body, 'div', 'mx-chat__ask-text');
    const actions = part<HTMLDivElement>(this.row, 'div', 'mx-chat__ask-actions');
    // Their variants and sizes come from their places.
    this.cancel = this.button(actions, 'mx-chat__form-cancel', () => this.leave('cancel'));
    this.decline = this.button(actions, 'mx-chat__ask-decline', () => this.leave('decline'));
    this.submit = this.button(actions, 'mx-chat__ask-submit', () => void this.send());
    this.row.motif.on('keydown', (_, e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      this.leave('cancel');
    });
    kept(this.row, false);
    this.drawTexts();
  }

  /** The form shown; `null` while it is closed. */
  get part(): ChatFormPart | null {
    return this.asked;
  }

  open(asked: ChatFormPart): void {
    this.close();
    this.asked = asked;
    text(this.said, asked.message);
    kept(this.from, !!asked.source);
    this.data = {};
    const items: FormItem[] = [];
    const required = new Set(asked.schema.required ?? []);
    for (const [key, field] of Object.entries(asked.schema.properties ?? {})) {
      this.data[key] = this.start(field);
      items.push(this.item(key, field, required.has(key)));
    }
    this.fields = new FormLayout({ data: this.data, items });
    this.fields.class.add('mx-chat__form-fields');
    this.body.controls.add(this.fields);
    kept(this.row, true);
    this.drawTexts();
  }

  close(): void {
    this.asked = null;
    kept(this.row, false);
    removePart(this.fields);
    this.fields = null;
  }

  /** The first field takes the focus; a form with none, its send button. */
  focus(): boolean {
    const first = Object.keys(this.asked?.schema.properties ?? {})[0];
    const editor = first ? (this.fields?.editorOf(first) as unknown as { focus?: () => boolean } | undefined) : undefined;
    return editor?.focus?.() ?? this.submit.focus();
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    put(this.row, 'aria-label', strings.chatForm);
    text(this.from, this.asked?.source ? uiLocale.text('chatFormFrom', { source: this.asked.source }) : '');
    this.cancel.text = strings.chatFormCancel;
    this.decline.text = strings.chatFormDecline;
    this.submit.text = strings.chatFormSubmit;
  }

  private button(parent: Component<HTMLDivElement>, className: string, run: () => void): Button {
    const button = new Button();
    button.class.add(className);
    button.motif.on('click', run);
    parent.controls.add(button);
    return button;
  }

  /** What a field holds before the user writes: its default, as its editor takes it. */
  private start(field: ChatFormField): unknown {
    switch (field.type) {
      case 'boolean':
        return field.default ?? false;
      case 'number':
      case 'integer':
        return field.default ?? null;
      case 'array':
        return [...(field.default ?? [])];
      default:
        // A text, and a type the chat does not know, read as one.
        if (field.format === 'date' || field.format === 'date-time') return field.default ? this.dateOf(field.default) : null;
        return field.default ?? (this.choices(field) ? null : '');
    }
  }

  /** The form's item for a field: its editor, its label and help, and its checks. */
  private item(key: string, field: ChatFormField, required: boolean): FormItem {
    const item: FormItem = { field: key, label: field.title || key, helpText: field.description, required };
    const enter = { onEnter: () => void this.send() };
    switch (field.type) {
      case 'boolean':
        // A yes or no always has its answer: a check box left empty says no.
        return { ...item, editor: 'checkbox', required: false };
      case 'number':
      case 'integer': {
        const rules: ValidationRule[] = field.minimum !== undefined || field.maximum !== undefined ? [{ type: 'range', min: field.minimum, max: field.maximum }] : [];
        return { ...item, editor: 'number', rules, editorProps: { ...enter, decimals: field.type === 'integer' ? 0 : null } };
      }
      case 'array': {
        const choices = this.choiceList(field.items.enum, undefined, field.items.anyOf);
        const least = field.minItems ?? 0;
        const rules: ValidationRule[] = least > 1 ? [{ type: 'custom', check: (value: unknown) => (Array.isArray(value) ? value.length : 0) >= least }] : [];
        return { ...item, editor: 'tagbox', rules, editorProps: { items: choices, textField: 'text', valueField: 'value', maxSelected: field.maxItems } };
      }
      default: {
        const choices = this.choices(field);
        if (choices) return { ...item, editor: choices.length <= MOST_RADIOS ? 'radio' : 'dropdown', editorProps: { items: choices, textField: 'text', valueField: 'value' } };
        if (field.format === 'date') return { ...item, editor: 'date' };
        if (field.format === 'date-time') return { ...item, editor: 'datetime' };
        const rules: ValidationRule[] = [];
        if (field.minLength !== undefined || field.maxLength !== undefined) rules.push({ type: 'length', min: field.minLength, max: field.maxLength });
        if (field.format === 'uri') rules.push({ type: 'url' });
        return { ...item, editor: field.format === 'email' ? 'email' : 'text', rules, editorProps: enter };
      }
    }
  }

  /** The choices of a text field, when it is a choice of one. */
  private choices(field: ChatFormText): Choice[] | null {
    return this.choiceList(field.enum, field.enumNames, field.oneOf);
  }

  private choiceList(values?: string[], names?: string[], titled?: { const: string; title?: string }[]): Choice[] | null {
    if (titled?.length) return titled.map((c) => ({ value: c.const, text: c.title || c.const }));
    if (values?.length) return values.map((value, i) => ({ value, text: names?.[i] || value }));
    return null;
  }

  /** The fields are checked; what the user gave goes, a field left empty not with it. */
  private async send(): Promise<void> {
    const asked = this.asked;
    const fields = this.fields;
    if (!asked || !fields) return;
    const result = await fields.validate();
    if (!result.valid || this.asked !== asked) return;
    const content: Record<string, ChatFormValue> = {};
    for (const [key, field] of Object.entries(asked.schema.properties ?? {})) {
      const value = this.valueOf(field, this.data[key]);
      if (value !== null) content[key] = value;
    }
    this.answered(asked, { action: 'accept', content });
  }

  /** A field's value as the schema writes it: a date as text, a whole number whole; `null` when it is empty. */
  private valueOf(field: ChatFormField, value: unknown): ChatFormValue | null {
    if (value === null || value === undefined) return null;
    switch (field.type) {
      case 'boolean':
        return value === true;
      case 'number':
      case 'integer':
        return typeof value === 'number' && !Number.isNaN(value) ? (field.type === 'integer' ? Math.round(value) : value) : null;
      case 'array':
        return Array.isArray(value) && value.length ? value.map(String) : null;
      default:
        if (value instanceof Date) return field.format === 'date' ? this.dayOf(value) : value.toISOString();
        return value === '' ? null : String(value);
    }
  }

  /** A date written as text: `YYYY-MM-DD` is that day where the user is, not at midnight in Greenwich. */
  private dateOf(said: string): Date | null {
    const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(said);
    const date = day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(said);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  /** A date as `YYYY-MM-DD`, the day it is where the user is. */
  private dayOf(date: Date): string {
    const two = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
  }

  private leave(action: 'decline' | 'cancel'): void {
    if (this.asked) this.answered(this.asked, { action });
  }

  /** The editor of a field, for tests and for the chat's focus. */
  editorOf(key: string): ComponentBase | undefined {
    return this.fields?.editorOf(key);
  }
}
