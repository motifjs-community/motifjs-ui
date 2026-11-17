import type { Component } from '@motifx/core';
import { loose, part, removePart } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import type { IconSource } from '../../core/icon-source';
import { kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { TextArea } from '../textarea/TextArea';
import { attachmentChip } from './chat-attachment-entry';
import { ChatCopyButton } from './chat-copy-button';
import type { ChatLook } from './chat-look';
import type { ChatMessage } from './chat-message';

/** A message longer than this many lines, or characters, shows its first lines and a button for the rest. */
const LONG_LINES = 4;
const LONG_LENGTH = 400;

/**
 * The user's message at the top of a turn: its time and its actions, the text in its box exactly as it was written (it
 * is not markdown: what was typed is what shows), and the files it carries as chips under it. A long one shows its
 * first lines, and a button opens the rest. Its actions copy it, edit it in place and send it again, go back to before
 * it (its text back in the box), and start another conversation from it when the app takes forks.
 */
export class ChatQuestionView {
  readonly row: Component<HTMLDivElement>;
  private readonly time: Component<HTMLDivElement>;
  private readonly bubble: Component<HTMLDivElement>;
  private readonly files: Component<HTMLDivElement> | null = null;
  private readonly more: Button | null = null;
  private readonly copy: ChatCopyButton;
  private readonly editButton: Button;
  private readonly rewindButton: Button;
  private readonly forkButton: Button | null = null;
  /** While the message is edited: the box and its buttons, in place of the bubble. */
  private editor: { row: Component<HTMLDivElement>; box: TextArea; cancel: Button; send: Button } | null = null;
  private expanded = false;

  constructor(private readonly message: ChatMessage, private readonly look: ChatLook) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__question');
    const head = part<HTMLDivElement>(this.row, 'div', 'mx-chat__question-head');
    const actions = part<HTMLDivElement>(head, 'div', 'mx-chat__question-actions');
    this.copy = new ChatCopyButton(() => this.said);
    // Their variants and sizes come from their place.
    this.editButton = this.action(glyph('pencil'), () => this.edit());
    this.rewindButton = this.action(glyph('undo'), () => look.rewind(message));
    actions.controls.add(this.copy.button, this.editButton, this.rewindButton);
    if (look.fork) {
      const fork = look.fork;
      this.forkButton = this.action(glyph('split'), () => fork(message));
      actions.controls.add(this.forkButton);
    }
    this.time = part<HTMLDivElement>(head, 'div', 'mx-chat__time');
    const said = this.said;
    this.bubble = part<HTMLDivElement>(this.row, 'div', 'mx-chat__bubble');
    text(this.bubble, said);
    kept(this.bubble, !!said);
    const files = message.parts.filter((p) => p.kind === 'attachment');
    if (files.length) {
      this.files = part<HTMLDivElement>(this.row, 'div', 'mx-chat__files');
      for (const file of files) this.files.controls.add(attachmentChip(file));
    }
    let lines = 1;
    for (let i = 0; i < said.length && lines <= LONG_LINES; i++) if (said.charCodeAt(i) === 10) lines++;
    if (lines > LONG_LINES || said.length > LONG_LENGTH) {
      mark(this.row, 'data-long', true);
      // Its variant and size come from its place.
      this.more = new Button();
      this.more.class.add('mx-chat__more');
      this.more.motif.on('click', () => {
        this.expanded = !this.expanded;
        this.drawTexts();
      });
      this.row.controls.add(this.more);
    }
    this.drawTexts();
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    const time = this.message.time;
    text(this.time, time ? this.look.time(time) : '');
    kept(this.time, !!time);
    this.copy.drawTexts();
    this.name(this.editButton, strings.chatEdit);
    this.name(this.rewindButton, strings.chatRewind);
    if (this.forkButton) this.name(this.forkButton, strings.chatFork);
    if (this.editor) {
      this.editor.cancel.text = strings.chatCancel;
      this.editor.send.text = strings.chatSend;
    }
    if (!this.more) return;
    mark(this.row, 'data-expanded', this.expanded);
    put(this.more, 'aria-expanded', String(this.expanded));
    this.more.text = this.expanded ? strings.chatShowLess : strings.chatShowMore;
  }

  /** The text as it was written. */
  private get said(): string {
    return this.message.parts.map((p) => (p.kind === 'text' ? p.text : '')).join('');
  }

  private action(icon: IconSource, run: () => void): Button {
    const button = new Button({ icon });
    button.class.add('mx-chat__action');
    button.motif.on('click', run);
    return button;
  }

  /** A button that shows its icon alone: its name, and its tooltip. */
  private name(button: Button, said: string): void {
    put(button, 'aria-label', said);
    button.hint = said;
  }

  /** The message in a box in place of its bubble: Enter sends it in its place, Escape or Cancel goes back. */
  private edit(): void {
    if (this.editor) return;
    const row = part<HTMLDivElement>(this.row, 'div', 'mx-chat__edit');
    const box = new TextArea({ rows: 1, autoGrow: true, maxRows: 12, submitOnEnter: true, onEnter: () => this.sendEdit() });
    box.class.add('mx-chat__edit-box');
    box.value = this.said;
    box.motif.on('keydown', (_, e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      this.endEdit(true);
    });
    const actions = part<HTMLDivElement>(row, 'div', 'mx-chat__edit-actions');
    // Their variants and sizes come from their places.
    const cancel = new Button();
    cancel.class.add('mx-chat__edit-cancel');
    cancel.motif.on('click', () => this.endEdit(true));
    const send = new Button({ icon: glyph('send') });
    send.class.add('mx-chat__edit-send');
    send.motif.on('click', () => this.sendEdit());
    row.controls.insert(0, box);
    actions.controls.add(cancel, send);
    this.editor = { row, box, cancel, send };
    mark(this.row, 'data-editing', true);
    kept(this.bubble, false);
    kept(this.files, false);
    kept(this.more, false);
    this.drawTexts();
    box.focus();
    box.setSelectionRange(box.value.length);
  }

  private sendEdit(): void {
    const said = this.editor?.box.value ?? '';
    if (!said.trim()) return;
    this.look.resend(this.message, said);
  }

  /** Back to the bubble; `focus`: the edit button takes the focus. */
  private endEdit(focus: boolean): void {
    if (!this.editor) return;
    removePart(this.editor.row);
    this.editor = null;
    mark(this.row, 'data-editing', false);
    kept(this.bubble, !!this.said);
    kept(this.files, true);
    kept(this.more, true);
    if (focus) this.editButton.focus();
  }
}
