import type { Component } from '@motifx/core';
import { clearParts, part, removePart } from '../../core/draw-parts';
import { kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { ChatChoices, type ChatChoice } from './chat-choices';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatFlowView } from './chat-flow-view';
import type { ChatLook } from './chat-look';
import type { ChatToolPart } from './chat-part';
import type { ChatPermissionAnswer } from './chat-request';

/** The most characters of an output drawn: the rest is the app's to show elsewhere. */
const MOST_DRAWN = 20000;

/**
 * A tool call, one row from the first sign of it to its end. While its arguments arrive it is a line that says which
 * tool, the file it names, how much came and for how long; then its name, what it does, and what went in (`IN`) and
 * came out (`OUT`). How much is open is the tool's `density`; a failed call and one waiting for approval open. The
 * labels `IN` and `OUT` are markers and stay as they are in every language. A call that asks before it runs has its
 * choices under it while it waits, then what the user said. A sub-agent's text and calls are drawn inside it.
 */
export class ChatToolEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly main: Component<HTMLDivElement>;
  private readonly head: Component<HTMLButtonElement>;
  private readonly name: Component<HTMLSpanElement>;
  private readonly title: Component<HTMLSpanElement>;
  private readonly wait: Component<HTMLSpanElement>;
  private readonly box: Component<HTMLDivElement>;
  private readonly inRow: Component<HTMLDivElement>;
  private readonly inCode: Component<HTMLPreElement>;
  private readonly outRow: Component<HTMLDivElement>;
  private readonly outCode: Component<HTMLPreElement>;
  /** The permission: its choices while the call waits, what the user said after. */
  private readonly request: Component<HTMLDivElement>;
  private readonly answer: Component<HTMLDivElement>;
  private choices: ChatChoices | null = null;
  private inner: ChatFlowView | null = null;
  private expanded = false;
  /** What the sides show; `null` until first drawn, so a side with nothing is hidden from the start. */
  private drawnInput: string | undefined | null = null;
  private drawnOutput: string | undefined | null = null;
  private added = 0;
  private removed = 0;
  private timer: ReturnType<typeof setInterval> | undefined;

  /** `live`: its message is being written; its last sub-agent text stays open, its request can be answered. */
  constructor(
    private readonly call: ChatToolPart,
    private readonly look: ChatLook,
    private readonly makeFlow: () => ChatFlowView,
    private readonly live: () => boolean
  ) {
    const { row, main } = entryFrame('tool');
    this.row = row;
    this.main = main;
    this.head = part<HTMLButtonElement>(main, 'button', 'mx-chat__tool-head');
    put(this.head, 'type', 'button');
    this.name = part<HTMLSpanElement>(this.head, 'span', 'mx-chat__tool-name');
    this.title = part<HTMLSpanElement>(this.head, 'span', 'mx-chat__tool-title');
    this.wait = part<HTMLSpanElement>(this.head, 'span', 'mx-chat__tool-wait');
    this.box = part<HTMLDivElement>(main, 'div', 'mx-chat__tool-box');
    [this.inRow, this.inCode] = this.side('in', 'IN');
    [this.outRow, this.outCode] = this.side('out', 'OUT');
    this.request = part<HTMLDivElement>(main, 'div', 'mx-chat__request');
    this.answer = part<HTMLDivElement>(this.request, 'div', 'mx-chat__answer');
    this.head.motif.on('click', () => {
      this.expanded = !this.expanded;
      this.drawOpen();
    });
    const parts = call.parts ?? [];
    if (parts.length) {
      const flow = this.flow();
      const open = live();
      parts.forEach((p, i) => flow.add(p, open && i === parts.length - 1));
    }
    row.motif.setDisposable(() => this.stopTimer());
    this.update();
  }

  /** The output grew. */
  append(): void {
    this.drawCode();
  }

  update(): void {
    const c = this.call;
    put(this.row, 'data-status', c.status);
    put(this.row, 'data-look', c.look ?? 'text');
    text(this.name, c.label || c.name);
    text(this.title, c.title ?? '');
    kept(this.title, !!c.title);
    this.drawCode();
    if (this.isRunning && !this.timer) this.timer = setInterval(() => this.drawWait(), 1000);
    else if (!this.isRunning) this.stopTimer();
    this.drawWait();
    this.drawOpen();
    this.drawRequest();
  }

  drawTexts(): void {
    this.drawWait();
    this.choices?.drawTexts(this.question(), this.choiceList());
    this.drawAnswer();
    this.inner?.drawTexts();
  }

  focus(): boolean {
    return this.choices?.focus() ?? false;
  }

  /** The flow of the sub-agent the call runs, made the first time it writes. */
  flow(): ChatFlowView {
    if (!this.inner) {
      this.inner = this.makeFlow();
      this.main.controls.add(this.inner.row);
    }
    return this.inner;
  }

  /** The sub-agent's flow, when it wrote. */
  get innerFlow(): ChatFlowView | null {
    return this.inner;
  }

  /** While the call waits for the user its choices stand under it; then what they said, or that nobody answered. */
  private drawRequest(): void {
    const asked = this.call.permission;
    kept(this.request, !!asked);
    if (!asked) return;
    const waiting = !asked.answer && this.call.status === 'waiting' && this.live();
    if (waiting && !this.choices) {
      this.choices = new ChatChoices(this.question(), this.choiceList(), (value, said) =>
        this.look.answer(this.call, { choice: value as ChatPermissionAnswer['choice'], text: said })
      );
      this.request.controls.add(this.choices.row);
    } else if (!waiting && this.choices) {
      removePart(this.choices.row);
      this.choices = null;
    }
    kept(this.answer, !waiting);
    this.drawAnswer();
  }

  private drawAnswer(): void {
    const answer = this.call.permission?.answer;
    if (!this.call.permission || this.choices) return;
    const strings = uiLocale.strings;
    put(this.answer, 'data-answer', answer?.choice ?? 'none');
    if (!answer) text(this.answer, strings.chatUnanswered);
    else if (answer.choice === 'no') text(this.answer, answer.text ? `${strings.chatDenied}: ${answer.text}` : strings.chatDenied);
    else text(this.answer, answer.choice === 'always' ? strings.chatAllowedAlways : strings.chatAllowed);
  }

  private question(): string {
    return uiLocale.text('chatAllowTool', { tool: this.call.label || this.call.name });
  }

  private choiceList(): ChatChoice[] {
    const strings = uiLocale.strings;
    const always = this.call.permission?.always;
    const list: ChatChoice[] = [{ value: 'yes', label: strings.chatAllow }];
    if (always) list.push({ value: 'always', label: always });
    list.push({ value: 'no', label: strings.chatDeny, asks: strings.chatDenyHint });
    return list;
  }

  private get isRunning(): boolean {
    const status = this.call.status;
    return status === 'assembling' || status === 'running' || status === 'waiting';
  }

  private side(name: string, label: string): [Component<HTMLDivElement>, Component<HTMLPreElement>] {
    const row = part<HTMLDivElement>(this.box, 'div', 'mx-chat__tool-side');
    put(row, 'data-side', name);
    text(part<HTMLSpanElement>(row, 'span', 'mx-chat__tool-label'), label);
    return [row, part<HTMLPreElement>(row, 'pre', 'mx-chat__tool-code')];
  }

  private drawCode(): void {
    const c = this.call;
    if (c.input !== this.drawnInput) {
      this.drawnInput = c.input;
      text(this.inCode, c.input ?? '');
      kept(this.inRow, !!c.input);
    }
    if (c.output !== this.drawnOutput) {
      this.drawnOutput = c.output;
      const out = c.output ?? '';
      const shown = out.length > MOST_DRAWN ? `${out.slice(0, MOST_DRAWN)}\n…` : out;
      if (c.look === 'diff') this.drawDiff(shown);
      else text(this.outCode, shown);
      kept(this.outRow, !!out);
    }
  }

  /** A diff, line by line: added, removed or the same, as its first character says. */
  private drawDiff(out: string): void {
    clearParts(this.outCode);
    this.added = this.removed = 0;
    if (!out) return;
    for (const line of out.split('\n')) {
      const kind = line.startsWith('+') ? 'added' : line.startsWith('-') ? 'removed' : 'same';
      if (kind === 'added') this.added++;
      else if (kind === 'removed') this.removed++;
      const row = part<HTMLSpanElement>(this.outCode, 'span', 'mx-chat__diff-line');
      put(row, 'data-line', kind);
      text(row, line);
    }
  }

  /** What the call waits on: the file and the kilobytes while it assembles, the seconds while it runs, a diff's count. */
  private drawWait(): void {
    const c = this.call;
    const said: string[] = [];
    if (c.look === 'diff' && this.added + this.removed) said.push(`+${this.added} −${this.removed}`);
    if (c.status === 'assembling') {
      if (c.file) said.push(c.file);
      if (c.bytes) said.push(uiLocale.text('chatKilobytes', { count: Math.max(1, Math.round(c.bytes / 1024)) }));
    }
    let wait = said.join(' › ');
    const seconds = this.isRunning && c.started ? Math.floor((Date.now() - c.started) / 1000) : 0;
    if (seconds > 0) wait = wait ? `${wait} · ${uiLocale.text('chatSeconds', { seconds })}` : uiLocale.text('chatSeconds', { seconds });
    text(this.wait, wait);
    kept(this.wait, !!wait);
  }

  /** `line` opens on a click; `summary` shows a few lines of each side and a click shows them all; `full` shows all. */
  private drawOpen(): void {
    const c = this.call;
    const density = c.status === 'waiting' ? 'full' : c.status === 'error' && c.density === 'line' ? 'summary' : (c.density ?? 'summary');
    const has = !!c.input || !!c.output;
    const open = has && (density !== 'line' || this.expanded);
    const full = density === 'full' || (open && this.expanded) || (density === 'line' && open);
    put(this.row, 'data-density', density);
    mark(this.row, 'data-full', full);
    kept(this.box, open);
    put(this.head, 'aria-expanded', !has || density === 'full' ? null : String(density === 'line' ? open : full));
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}
