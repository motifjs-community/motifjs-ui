import type { Component } from '@motifx/core';
import { clearParts, glyphPart, loose, part } from '../../core/draw-parts';
import { focusInTextField, focusOn, holdsFocus } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { Markdown } from '../markdown/Markdown';
import { TextArea } from '../textarea/TextArea';
import { TextBox } from '../textbox/TextBox';
import type { ChatQuestion, ChatQuestionsAnswer, ChatQuestionsPart } from './chat-request';

/** What the user gave a question so far: the labels taken, "Other" and its text, the text of a question without options. */
interface Draft {
  picked: string[];
  otherOn: boolean;
  other: string;
  text: string;
  /** Sending was tried while it was required and empty: it says so. */
  tried: boolean;
}

/**
 * The questions of a reply, in the composer's place until they are answered. One question stands at a time; with
 * several, a tab for each (marked when answered) and where it is, `2 / 3`. A question with options takes one (and goes
 * to the next) or several, and "Other" opens a box for the user's own words; options with a preview show it beside them
 * while focused. The number keys take an option, the arrow keys move between them, Escape stops the reply. "Decide for
 * me" leaves the decision to the model; sending with a required question empty goes to it.
 */
export class ChatAskForm {
  readonly row: Component<HTMLDivElement>;
  private readonly header: Component<HTMLDivElement>;
  private readonly tabs: Component<HTMLDivElement>;
  private readonly count: Component<HTMLSpanElement>;
  private readonly body: Component<HTMLDivElement>;
  private readonly bodyId = nextId('mx-chat-ask');
  private readonly previous: Button;
  private readonly next: Button;
  private readonly decline: Button;
  private readonly submit: Button;
  private tabParts: { tab: Component<HTMLButtonElement>; label: Component<HTMLSpanElement> }[] = [];
  /** The options of the question shown, "Other" last. */
  private options: Component<HTMLButtonElement>[] = [];
  private preview: Markdown | null = null;
  private otherBox: TextBox | null = null;
  private freeBox: TextArea | null = null;
  private missing: Component<HTMLDivElement> | null = null;
  private asked: ChatQuestionsPart | null = null;
  private drafts: Draft[] = [];
  private index = 0;

  constructor(private readonly answered: (part: ChatQuestionsPart, answer: ChatQuestionsAnswer) => void, private readonly stop: () => void) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__ask');
    put(this.row, 'role', 'group');
    this.header = part<HTMLDivElement>(this.row, 'div', 'mx-chat__ask-header');
    this.tabs = part<HTMLDivElement>(this.header, 'div', 'mx-chat__ask-tabs');
    put(this.tabs, 'role', 'tablist');
    this.count = part<HTMLSpanElement>(this.header, 'span', 'mx-chat__ask-count');
    this.body = part<HTMLDivElement>(this.row, 'div', 'mx-chat__ask-body');
    put(this.body, 'id', this.bodyId);
    const actions = part<HTMLDivElement>(this.row, 'div', 'mx-chat__ask-actions');
    // Their variants and sizes come from their places.
    this.previous = this.button(actions, 'mx-chat__ask-previous', () => this.show(this.index - 1, true));
    this.next = this.button(actions, 'mx-chat__ask-next', () => this.show(this.index + 1, true));
    this.decline = this.button(actions, 'mx-chat__ask-decline', () => this.leave());
    this.submit = this.button(actions, 'mx-chat__ask-submit', () => this.send());
    this.row.motif.on('keydown', (_, e: KeyboardEvent) => this.key(e));
    kept(this.row, false);
    this.drawTexts();
  }

  /** The questions on the form; `null` while it is closed. */
  get part(): ChatQuestionsPart | null {
    return this.asked;
  }

  open(asked: ChatQuestionsPart): void {
    this.asked = asked;
    this.drafts = asked.questions.map(() => ({ picked: [], otherOn: false, other: '', text: '', tried: false }));
    clearParts(this.tabs);
    this.tabParts = [];
    const several = asked.questions.length > 1;
    if (several) {
      asked.questions.forEach((q, i) => {
        const tab = part<HTMLButtonElement>(this.tabs, 'button', 'mx-chat__ask-tab');
        put(tab, 'type', 'button');
        put(tab, 'role', 'tab');
        put(tab, 'aria-controls', this.bodyId);
        glyphPart(tab, 'check', 'mx-chat__ask-tab-check');
        const label = part<HTMLSpanElement>(tab, 'span', 'mx-chat__ask-tab-label');
        text(label, q.header || q.text);
        tab.motif.on('click', () => this.show(i, true));
        this.tabParts.push({ tab, label });
      });
    }
    kept(this.header, several);
    put(this.body, 'role', several ? 'tabpanel' : null);
    kept(this.previous, several);
    kept(this.next, several);
    kept(this.row, true);
    this.index = 0;
    this.show(0, false);
  }

  close(): void {
    this.asked = null;
    kept(this.row, false);
    this.clearBody();
    clearParts(this.tabs);
    this.tabParts = [];
  }

  /** The question shown takes the focus: its option taken, its first, or its box. */
  focus(): boolean {
    if (this.freeBox) return this.freeBox.focus();
    if (this.drafts[this.index]?.otherOn && this.otherBox) return this.otherBox.focus();
    const target = this.options[Math.max(0, this.options.findIndex((_, k) => this.isTaken(k)))];
    if (!target) return false;
    focusOn(target);
    return true;
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    put(this.row, 'aria-label', strings.chatQuestions);
    this.previous.text = strings.chatPrevious;
    this.next.text = strings.chatNext;
    this.decline.text = strings.chatDecide;
    this.submit.text = strings.chatSubmitAnswers;
    // "Other" and the boxes' hints are drawn with the question.
    if (this.asked) this.show(this.index, holdsFocus(this.row));
  }

  private get question(): ChatQuestion {
    return this.asked!.questions[this.index];
  }

  private button(parent: Component<HTMLDivElement>, className: string, run: () => void): Button {
    const button = new Button();
    button.class.add(className);
    button.motif.on('click', run);
    parent.controls.add(button);
    return button;
  }

  /** Draws question `i`; `focus`: it takes the focus. */
  private show(i: number, focus: boolean): void {
    const asked = this.asked;
    if (!asked || i < 0 || i >= asked.questions.length) return;
    this.sync();
    this.index = i;
    this.clearBody();
    const q = asked.questions[i];
    const draft = this.drafts[i];
    const strings = uiLocale.strings;
    const said = part<HTMLDivElement>(this.body, 'div', 'mx-chat__ask-text');
    const id = nextId('mx-chat-ask-text');
    put(said, 'id', id);
    text(said, q.text);
    if (q.options?.length) {
      const area = part<HTMLDivElement>(this.body, 'div', 'mx-chat__ask-choice');
      const list = part<HTMLDivElement>(area, 'div', 'mx-chat__ask-options');
      put(list, 'role', q.multiple ? 'group' : 'radiogroup');
      put(list, 'aria-labelledby', id);
      q.options.forEach((o, k) => this.option(list, k, o.label, o.description));
      if (q.other !== false) this.option(list, q.options.length, strings.chatOther);
      if (q.options.some((o) => o.preview)) {
        mark(area, 'data-preview', true);
        const box = part<HTMLDivElement>(area, 'div', 'mx-chat__ask-preview');
        this.preview = new Markdown();
        box.controls.add(this.preview);
        this.drawPreview(Math.max(0, this.options.findIndex((_, k) => this.isTaken(k))));
      }
      if (q.other !== false) {
        const box = new TextBox({ placeholder: strings.chatOtherHint, onEnter: () => this.otherEntered() });
        box.class.add('mx-chat__ask-other');
        box.value = draft.other;
        box.motif.on('input', () => {
          draft.other = box.value ?? '';
          this.drawState();
        });
        this.body.controls.add(box);
        kept(box, draft.otherOn);
        this.otherBox = box;
      }
    } else {
      const box = new TextArea({ rows: 2, autoGrow: true, placeholder: strings.chatOtherHint });
      box.class.add('mx-chat__ask-free');
      box.value = draft.text;
      box.motif.on('input', () => {
        draft.text = box.value ?? '';
        this.drawState();
      });
      this.body.controls.add(box);
      this.freeBox = box;
    }
    this.missing = part<HTMLDivElement>(this.body, 'div', 'mx-chat__ask-missing');
    text(this.missing, strings.chatRequired);
    this.drawState();
    if (focus) this.focus();
  }

  private option(list: Component<HTMLDivElement>, k: number, label: string, description?: string): void {
    const button = part<HTMLButtonElement>(list, 'button', 'mx-chat__ask-option');
    put(button, 'type', 'button');
    put(button, 'role', this.question.multiple ? 'checkbox' : 'radio');
    text(part<HTMLSpanElement>(button, 'span', 'mx-chat__ask-key'), String(k + 1));
    const main = part<HTMLSpanElement>(button, 'span', 'mx-chat__ask-option-main');
    text(part<HTMLSpanElement>(main, 'span', 'mx-chat__ask-label'), label);
    if (description) text(part<HTMLSpanElement>(main, 'span', 'mx-chat__ask-description'), description);
    glyphPart(button, 'check', 'mx-chat__ask-check');
    button.motif.on('click', () => this.pick(k));
    button.motif.on('focus', () => this.drawPreview(k));
    this.options.push(button);
  }

  private clearBody(): void {
    clearParts(this.body);
    this.options = [];
    this.preview = null;
    this.otherBox = null;
    this.freeBox = null;
    this.missing = null;
  }

  /** What the boxes hold goes to the draft. */
  private sync(): void {
    const draft = this.drafts[this.index];
    if (!draft) return;
    if (this.otherBox) draft.other = this.otherBox.value ?? '';
    if (this.freeBox) draft.text = this.freeBox.value ?? '';
  }

  /** Option `k` was taken: "Other" opens its box; one taken of a single choice goes to the next question. */
  private pick(k: number): void {
    const q = this.question;
    const draft = this.drafts[this.index];
    const other = k === (q.options?.length ?? 0);
    if (q.multiple) {
      if (other) {
        draft.otherOn = !draft.otherOn;
      } else {
        const label = q.options![k].label;
        const at = draft.picked.indexOf(label);
        if (at < 0) draft.picked.push(label);
        else draft.picked.splice(at, 1);
      }
    } else if (other) {
      draft.otherOn = true;
      draft.picked = [];
    } else {
      draft.otherOn = false;
      draft.picked = [q.options![k].label];
    }
    kept(this.otherBox, draft.otherOn);
    this.drawState();
    if (other && draft.otherOn) this.otherBox?.focus();
    else if (!q.multiple) this.forward();
  }

  private otherEntered(): void {
    this.sync();
    if (this.drafts[this.index].other.trim() && !this.question.multiple) this.forward();
  }

  /** To the next question, or to sending after the last. */
  private forward(): void {
    if (this.index < this.asked!.questions.length - 1) this.show(this.index + 1, true);
    else this.submit.focus();
  }

  private isTaken(k: number): boolean {
    const q = this.question;
    const draft = this.drafts[this.index];
    if (k === (q.options?.length ?? 0)) return draft.otherOn;
    return draft.picked.includes(q.options?.[k]?.label ?? '');
  }

  /** The answer of question `i`: the labels taken, in the options' order, then "Other"'s text; or the text written. */
  private values(i: number): string[] {
    const q = this.asked!.questions[i];
    const draft = this.drafts[i];
    if (!q.options?.length) return draft.text.trim() ? [draft.text.trim()] : [];
    const values = q.options.filter((o) => draft.picked.includes(o.label)).map((o) => o.label);
    if (draft.otherOn && draft.other.trim()) values.push(draft.other.trim());
    return values;
  }

  /** The options taken, the tabs answered, where it is, the ends, and a required question still empty. */
  private drawState(): void {
    const asked = this.asked;
    if (!asked) return;
    this.options.forEach((button, k) => {
      const taken = this.isTaken(k);
      put(button, 'aria-checked', String(taken));
      mark(button, 'data-checked', taken);
    });
    this.tabParts.forEach(({ tab }, i) => {
      put(tab, 'aria-selected', String(i === this.index));
      mark(tab, 'data-selected', i === this.index);
      mark(tab, 'data-answered', this.values(i).length > 0);
    });
    const count = asked.questions.length;
    text(this.count, `${this.index + 1} / ${count}`);
    this.previous.enabled = this.index > 0;
    this.next.enabled = this.index < count - 1;
    const draft = this.drafts[this.index];
    kept(this.missing, draft.tried && !!this.question.required && !this.values(this.index).length);
  }

  private drawPreview(k: number): void {
    if (this.preview) this.preview.text = this.question.options?.[k]?.preview ?? '';
  }

  private send(): void {
    const asked = this.asked;
    if (!asked) return;
    this.sync();
    const missing = asked.questions.findIndex((q, i) => q.required && !this.values(i).length);
    if (missing >= 0) {
      this.drafts[missing].tried = true;
      this.show(missing, true);
      return;
    }
    const answers = asked.questions.map((q, i) => ({ id: q.id ?? String(i + 1), values: this.values(i) })).filter((a) => a.values.length);
    this.answered(asked, { declined: false, answers });
  }

  /** "Decide for me": the model goes on with what it thinks best. */
  private leave(): void {
    if (this.asked) this.answered(this.asked, { declined: true, answers: [] });
  }

  private key(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.stop();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || focusInTextField(e)) return;
    const count = this.options.length;
    const n = Number(e.key);
    if (e.key.length === 1 && n >= 1 && n <= count) {
      e.preventDefault();
      focusOn(this.options[n - 1]);
      this.pick(n - 1);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const at = this.options.findIndex((o) => o.motif.isEventFrom(e));
    if (at < 0) return;
    e.preventDefault();
    focusOn(this.options[(at + (e.key === 'ArrowDown' ? 1 : count - 1)) % count]);
  }
}
