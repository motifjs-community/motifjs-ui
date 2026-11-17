import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { glyphPart, loose, part } from '../../core/draw-parts';
import { holdsFocus } from '../../core/focus';
import { glyph } from '../../core/glyphs';
import { boxOf, measure, whenMeasured, type Box } from '../../core/measure';
import { nextId } from '../../core/next-id';
import { onLanguage } from '../../core/on-language';
import { kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { WindowList } from '../../parts/window-list/WindowList';
import { Button } from '../button/Button';
import type { CodeHighlighter } from '../markdown/code-highlighter';
import { ScrollView } from '../scrollview/ScrollView';
import { ChatComposer } from './ChatComposer';
import { ChatReply, type ChatReplyHost } from './ChatReply';
import { ChatAskForm } from './chat-ask-form';
import type { ChatContextItem } from './chat-context-item';
import type { ChatFlowView } from './chat-flow-view';
import type { ChatForkEventArgs, ChatRetryEventArgs, ChatRewindEventArgs } from './chat-history-event-args';
import type { ChatLoadOlderEventArgs } from './chat-load-older-event-args';
import type { ChatLook } from './chat-look';
import type { ChatMessage } from './chat-message';
import type { ChatPart } from './chat-part';
import type { ChatProps } from './chat-props';
import type { ChatAnswer, ChatQuestionsPart, ChatRequestPart, ChatWaiting } from './chat-request';
import type { ChatSendEventArgs } from './chat-send-event-args';
import type { ChatTurn } from './chat-turn';
import { ChatTurnView } from './chat-turn-view';

const OWN = ['hasOlder', 'placeholder', 'highlighter', 'linkTarget', 'label'] as const;

/** How near the top, in pixels, asks for older messages. */
const OLDER_OFFSET = 200;
/** A turn not drawn yet is estimated at this many characters a line, this tall, plus a frame for each part. */
const ESTIMATE_LINE = 90;
const ESTIMATE_LINE_HEIGHT = 22;
const ESTIMATE_FRAME = 32;

type ChatSent = ChatSendEventArgs & { message: ChatMessage };

/** A message written while a reply was: it is sent when the replies end. */
interface Queued {
  text: string;
  files: File[];
  context: ChatContextItem[];
  row: Component<HTMLDivElement>;
  remove: Button;
}

/**
 * A conversation with a model, drawn by turn: the user's question, then what the model did, in order (its thinking,
 * text, tool calls, to-do list), each with a dot at its start. Only the turns in and near the view are on the page: a
 * turn far from it is its messages alone, drawn again when it comes back. The chat opens at its end, in one frame. The
 * view stays at the end while it is there; scrolled up, it stays where it is and a button says how many messages came.
 * Near the top, older messages are asked for (`hasOlder`, `onLoadOlder`) and the view keeps its place. While a reply is
 * written a line under the conversation says what the model does and for how long, and what the user sends meanwhile
 * waits above the box until the reply ends. A reply can wait for the user: a tool call asks before it runs and a plan
 * asks to go on, their choices in the flow; questions take the composer's place until they are answered. The chat
 * draws; the app talks to its model and writes through `reply()`.
 *
 * @example
 * <Chat onSend={async e => {
 *   const reply = chat.reply();
 *   for await (const delta of this.model.ask(e.text, reply.signal)) reply.text(delta);
 *   reply.done();
 * }} />
 */
export class Chat extends Control<HTMLDivElement, ChatProps> {
  /** The box the user writes in. */
  readonly composer: ChatComposer;
  private readonly scroller: ScrollView;
  private readonly older: Component<HTMLDivElement>;
  private readonly olderButton: Button;
  /** The turns: only those in and near the view are on the page. */
  private readonly window: WindowList<ChatTurn>;
  /** The line under the conversation while a reply is written. */
  private readonly status: Component<HTMLDivElement>;
  private readonly statusText: Component<HTMLSpanElement>;
  private readonly statusDetail: Component<HTMLSpanElement>;
  private readonly jump: Button;
  private readonly queue: Component<HTMLDivElement>;
  private readonly queued: Queued[] = [];
  /** The questions waiting for the user, in the composer's place. */
  private readonly form: ChatAskForm;
  /** The requests of open replies waiting for the user. */
  private readonly waiting = new Map<ChatRequestPart, { reply: ChatReply; item: ChatWaiting }>();
  /** The turns on the page and their parts; a turn off the page has none. */
  private readonly views = new Map<ChatTurn, ChatTurnView>();
  private items: ChatMessage[] = [];
  private turns: ChatTurn[] = [];
  private readonly turnOf = new Map<ChatMessage, ChatTurn>();
  private readonly replies = new Map<ChatReply, AbortController>();
  /** Messages that came while the view was away from the end. */
  private unseen = 0;
  private loading = false;
  private failed = false;
  /** Until the turns at the end are placed and the view stands at the end, the conversation is not shown. */
  private opening = true;
  /** Where the view stood at the last scroll: older messages are asked for on the way up. */
  private lastTop = 0;
  private said = '';
  private busySince = 0;
  private statusTimer: ReturnType<typeof setInterval> | undefined;
  private timeFormat: Intl.DateTimeFormat | null = null;
  private timeLocale = '';
  private readonly sent = new Emitter<ChatSent>();
  private readonly stopped = new Emitter<{ source: Chat }>();
  private readonly olderWanted = new Emitter<ChatLoadOlderEventArgs>();
  private readonly rewound = new Emitter<ChatRewindEventArgs>();
  private readonly forked = new Emitter<ChatForkEventArgs>();
  private readonly retried = new Emitter<ChatRetryEventArgs>();
  /** The app takes forks and retries: their buttons show. */
  private forks = false;
  private retries = false;
  private readonly replyHost: ChatReplyHost = {
    flowOf: (message) => this.flowOf(message),
    changed: (message) => this.messageChanged(message),
    status: (_, said) => {
      this.said = said;
      this.drawStatus();
    },
    wait: (reply, item) => this.wait(reply, item),
    ended: (reply) => this.replyEnded(reply)
  };

  constructor(props?: IBaseProp<ChatProps>) {
    super('div', props);
    const own = (this.props ?? {}) as ChatProps;
    this.class.add('mx-chat');
    mark(this, 'data-opening', true);
    const view = part<HTMLDivElement>(this, 'div', 'mx-chat__view');
    this.scroller = new ScrollView({ stickToEnd: true });
    this.scroller.class.add('mx-chat__scroller');
    view.controls.add(this.scroller);
    this.older = loose<HTMLDivElement>('div', 'mx-chat__older');
    // Its variant and size come from its place.
    this.olderButton = new Button();
    this.olderButton.class.add('mx-chat__older-button');
    this.olderButton.motif.on('click', () => this.loadOlder());
    this.older.controls.add(this.olderButton);
    this.window = new WindowList<ChatTurn>(
      this.scroller,
      { make: (turn) => this.makeTurn(turn).row, estimate: (turn) => this.estimate(turn), settled: () => this.opened() },
      'mx-chat__list'
    );
    this.status = loose<HTMLDivElement>('div', 'mx-chat__status');
    glyphPart(this.status, 'star', 'mx-chat__status-glyph');
    this.statusText = part<HTMLSpanElement>(this.status, 'span', 'mx-chat__status-text');
    this.statusDetail = part<HTMLSpanElement>(this.status, 'span', 'mx-chat__status-detail');
    kept(this.status, false);
    const content = this.scroller.content;
    content.controls.insert(content.controls.items.indexOf(this.scroller.bottomPanel), this.older, this.window.host, this.status);
    this.jump = new Button({ icon: glyph('chevron-down') });
    this.jump.class.add('mx-chat__jump');
    this.jump.motif.on('click', () => this.scrollToEnd(true));
    view.controls.add(this.jump);
    kept(this.jump, false);
    this.queue = part<HTMLDivElement>(this, 'div', 'mx-chat__queue');
    kept(this.queue, false);
    this.form = new ChatAskForm((asked, answer) => this.answer(asked, answer), () => this.stop());
    this.controls.add(this.form.row);
    this.composer = new ChatComposer({ ...own.composer, onSend: (e) => this.sendFromBox(e), onStop: () => this.stop() });
    this.composer.class.add('mx-chat__composer');
    this.controls.add(this.composer);

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.messages !== undefined) this.bindProperty('messages', own.messages);
    if (own.onSend) this.sent.event(own.onSend);
    if (own.onStop) this.stopped.event(own.onStop);
    if (own.onLoadOlder) this.olderWanted.event(own.onLoadOlder);
    if (own.onRewind) this.rewound.event(own.onRewind);
    if (own.onFork) this.forked.event(own.onFork);
    if (own.onRetry) this.retried.event(own.onRetry);
    this.forks = !!own.onFork;
    this.retries = !!own.onRetry;

    this.observeProperty<ChatMessage[] | undefined>('messages', (messages) => this.reconcile(messages ?? []));
    // Older messages come when the user goes up, not when the chat opens.
    this.observeProperty('hasOlder', () => this.drawOlder());
    this.observeProperty<string | undefined>('placeholder', (said) => (this.composer.placeholder = said ?? ''));
    this.observeProperty('label', () => this.drawLabel());
    this.scroller.onAtEndChanged((e) => {
      if (e.atEnd) this.unseen = 0;
      this.drawJump();
    });
    this.scroller.onScrolled((e) => {
      const up = e.top < this.lastTop;
      this.lastTop = e.top;
      if (up && !this.opening && e.top <= OLDER_OFFSET) this.askOlder(true);
    });
    onLanguage(this, () => this.drawTexts());
    this.motif.setDisposable(() => {
      // The requests of open replies end with the chat, and what waited for the user goes unanswered.
      for (const controller of this.replies.values()) controller.abort();
      this.replies.clear();
      for (const held of this.waiting.values()) held.item.answer(null);
      this.waiting.clear();
      this.stopStatus();
      this.sent.dispose();
      this.stopped.dispose();
      this.olderWanted.dispose();
      this.rewound.dispose();
      this.forked.dispose();
      this.retried.dispose();
    });
  }

  // Properties (see ChatProps).

  get messages(): ChatMessage[] {
    return this.items;
  }
  set messages(value: Bind<ChatMessage[]>) {
    this.assignProperty('messages', value);
  }
  get hasOlder(): boolean {
    return this.getProperty<boolean | undefined>('hasOlder') === true;
  }
  set hasOlder(value: Bind<boolean>) {
    this.assignProperty('hasOlder', value, Boolean);
  }
  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }
  get highlighter(): CodeHighlighter | null {
    return this.getProperty<CodeHighlighter | null | undefined>('highlighter') ?? null;
  }
  set highlighter(value: Bind<CodeHighlighter | null>) {
    this.assignProperty('highlighter', value);
  }
  get linkTarget(): string {
    return this.getProperty<string | undefined>('linkTarget') ?? '_blank';
  }
  set linkTarget(value: Bind<string>) {
    this.assignProperty('linkTarget', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** A reply is being written. */
  get isBusy(): boolean {
    return this.replies.size > 0;
  }

  /** The messages sent while a reply was written, in order: they go when the replies end. */
  get queuedTexts(): string[] {
    return this.queued.map((q) => q.text);
  }

  /** A reply waits for the user: a tool call asking before it runs, a plan, questions. */
  get isWaiting(): boolean {
    return this.waiting.size > 0;
  }

  /** Occurs when a message of the user is sent. Set `e.cancel` to take it back; start the reply with `reply()`. */
  get onSend(): MotifEvent<ChatSent> {
    return this.sent.event;
  }
  /** Occurs when the user stops the reply. */
  get onStop(): MotifEvent<{ source: Chat }> {
    return this.stopped.event;
  }
  /** Occurs when older messages are wanted. */
  get onLoadOlder(): MotifEvent<ChatLoadOlderEventArgs> {
    return this.olderWanted.event;
  }
  /** Occurs before the conversation goes back to before a message of the user. Set `e.cancel` to keep it. */
  get onRewind(): MotifEvent<ChatRewindEventArgs> {
    return this.rewound.event;
  }
  /** Occurs when the user starts another conversation from a message: open it with `e.messages`. */
  get onFork(): MotifEvent<ChatForkEventArgs> {
    return this.forked.event;
  }
  /** Occurs when the user tries a failed or stopped reply again: it is gone, write the new one with `reply()`. */
  get onRetry(): MotifEvent<ChatRetryEventArgs> {
    return this.retried.event;
  }

  /** Adds a message at the end. A message of the user takes the view to the end; another one there keeps it there. */
  add(message: ChatMessage): void {
    if (this.turnOf.has(message)) return;
    this.items.push(message);
    const last = this.turns[this.turns.length - 1];
    if (message.role === 'user' || !last) {
      const turn: ChatTurn = { messages: [message] };
      this.turns.push(turn);
      this.turnOf.set(message, turn);
      this.window.append(turn);
      // The turn before is not the latest any more: its reply cannot be tried again.
      if (last) this.views.get(last)?.drawActions();
    } else {
      last.messages.push(message);
      this.turnOf.set(message, last);
      const view = this.views.get(last);
      if (view) view.add(message);
      else this.window.stale(last);
    }
    if (message.role === 'user') {
      this.scrollToEnd();
    } else if (this.scroller.isAtEnd) {
      this.scroller.stick();
    } else {
      this.unseen++;
      this.drawJump();
    }
  }

  /** Adds older messages before the first, oldest first; what is on screen stays where it is. */
  prepend(messages: readonly ChatMessage[]): void {
    const fresh = messages.filter((m) => !this.turnOf.has(m));
    if (!fresh.length) return;
    this.items.unshift(...fresh);
    const older = this.group(fresh);
    const first = this.turns[0];
    if (first && first.messages[0].role !== 'user') {
      // The first turn had no question: it was the end of the last older turn.
      const tail = older.pop()!;
      first.messages.unshift(...tail.messages);
      for (const m of tail.messages) this.turnOf.set(m, first);
      this.window.refresh(first);
    }
    if (!older.length) return;
    this.turns.unshift(...older);
    this.window.insert(0, older);
  }

  /** Removes a message; its turn is drawn again from what is left. */
  remove(message: ChatMessage): void {
    const turn = this.turnOf.get(message);
    if (!turn) return;
    this.items.splice(this.items.indexOf(message), 1);
    this.turnOf.delete(message);
    const at = this.turns.indexOf(turn);
    turn.messages.splice(turn.messages.indexOf(message), 1);
    const before = this.turns[at - 1];
    if (turn.messages.length && (turn.messages[0].role === 'user' || !before)) {
      this.window.refresh(turn);
      return;
    }
    // A turn left with no question is the end of the one before it.
    this.turns.splice(at, 1);
    this.window.remove(turn);
    if (!turn.messages.length) return;
    before.messages.push(...turn.messages);
    for (const m of turn.messages) this.turnOf.set(m, before);
    this.window.refresh(before);
  }

  /**
   * Goes back to before `message`, a message of the user: it and everything after it go (`onRewind` can keep them),
   * open replies among them stop, the queue empties, and its text is put back in the box. Returns whether it went back.
   */
  rewind(message: ChatMessage): boolean {
    if (!this.cut(message)) return false;
    this.composer.value = message.parts.map((p) => (p.kind === 'text' ? p.text : '')).join('');
    this.composer.focus();
    return true;
  }

  /** Sends `text` in place of `message`, with its files: back to before it, as `rewind()` goes, then sent. */
  resend(message: ChatMessage, text: string): boolean {
    const files: File[] = [];
    for (const p of message.parts) if (p.kind === 'attachment' && p.file) files.push(p.file);
    if (!this.cut(message)) return false;
    const sent = this.send(text, files);
    this.composer.focus();
    return sent;
  }

  /** Removes every message; open replies stop and the queue empties. */
  clear(): void {
    for (const reply of [...this.replies.keys()]) reply.stop();
    for (const q of this.queued.splice(0)) this.queue.controls.remove(q.row);
    kept(this.queue, false);
    this.items.length = 0;
    this.turns = [];
    this.turnOf.clear();
    this.window.set([]);
  }

  /** Sends `text`, and the files and context items given, as the user, as the box does when no reply is written. Returns whether it was added. */
  send(text: string, attachments: File[] = [], context: ChatContextItem[] = []): boolean {
    const parts: ChatPart[] = text ? [{ kind: 'text', text }] : [];
    for (const item of context) parts.push({ kind: 'attachment', name: item.label });
    for (const file of attachments) parts.push({ kind: 'attachment', name: file.name, type: file.type, size: file.size, file });
    const message: ChatMessage = { id: nextId('chat-message'), role: 'user', parts, time: new Date(), status: 'done' };
    this.add(message);
    const args: ChatSent = { text, attachments, contextItems: context, message, cancel: false, source: this };
    this.sent.fire(args);
    if (!args.cancel) return true;
    this.remove(message);
    return false;
  }

  /** Starts a reply of the model at the end of the conversation; write it through what it returns, end it with `done()`. */
  reply(init: Partial<ChatMessage> = {}): ChatReply {
    const message: ChatMessage = { id: nextId('chat-message'), role: 'assistant', parts: [], time: new Date(), ...init, status: 'streaming' };
    this.add(message);
    const controller = new AbortController();
    const reply = new ChatReply(message, this.replyHost, controller);
    this.replies.set(reply, controller);
    this.composer.busy = true;
    if (this.replies.size === 1) this.startStatus();
    return reply;
  }

  /** Stops every open reply, as the stop button does. */
  stop(): void {
    if (!this.replies.size) return;
    for (const reply of [...this.replies.keys()]) reply.stop();
    this.stopped.fire({ source: this });
  }

  /** Asks for older messages now, as the button above the first message does. */
  loadOlder(): boolean {
    return this.askOlder(false);
  }

  /**
   * Goes to the end; while there, new messages keep the view at the end. Farther than two views away it jumps even when
   * `smooth`: a smooth scroll would draw every turn on the way and stop where their estimates said the end was.
   */
  scrollToEnd(smooth = false): void {
    this.unseen = 0;
    let far = false;
    if (smooth) {
      const box = boxOf(this.scroller);
      far = box.scrollHeight - box.clientHeight - box.scrollTop > box.clientHeight * 2;
    }
    this.scroller.scrollToEnd(smooth && !far);
    this.drawJump();
  }

  override focus(): boolean {
    return this.composer.focus();
  }

  /** The part of a turn coming near the view, drawn from its messages; it forgets itself when the list disposes it. */
  private makeTurn(turn: ChatTurn): ChatTurnView {
    const look: ChatLook = {
      highlighter: this.highlighter,
      linkTarget: this.linkTarget,
      time: this.formatTime,
      answer: (asked, answer) => this.answer(asked, answer),
      ask: (asked) => {
        if (this.form.part === asked) this.form.focus();
      },
      rewind: (message) => void this.rewind(message),
      resend: (message, said) => void this.resend(message, said),
      fork: this.forks ? (message) => this.fork(message) : null,
      retry: this.retries ? (message) => this.retry(message) : null,
      isLatest: (turn) => this.turns[this.turns.length - 1] === turn
    };
    const view = new ChatTurnView(turn, look);
    this.views.set(turn, view);
    view.row.motif.setDisposable(() => {
      if (this.views.get(turn) === view) this.views.delete(turn);
    });
    return view;
  }

  private flowOf(message: ChatMessage): ChatFlowView | null {
    const turn = this.turnOf.get(message);
    return (turn && this.views.get(turn)?.flow) ?? null;
  }

  /** A reply wrote its message: on the page the view stays at the end; off it, its turn's height is estimated again. */
  private messageChanged(message: ChatMessage): void {
    const turn = this.turnOf.get(message);
    if (!turn) return;
    if (this.views.has(turn)) this.scroller.stick();
    else this.window.stale(turn);
  }

  /** The turns at the end are placed and the view stands at the end: the conversation shows, in that frame. */
  private opened(): void {
    if (!this.opening) return;
    this.opening = false;
    this.scroller.stickNow();
    mark(this, 'data-opening', false);
  }

  /** Splits messages into turns: each message of the user starts one. */
  private group(messages: readonly ChatMessage[]): ChatTurn[] {
    const turns: ChatTurn[] = [];
    let turn: ChatTurn | null = null;
    for (const m of messages) {
      if (!turn || m.role === 'user') turns.push((turn = { messages: [] }));
      turn.messages.push(m);
      this.turnOf.set(m, turn);
    }
    return turns;
  }

  /** Another array, another conversation: it opens at its end. */
  private reconcile(next: ChatMessage[]): void {
    this.items = next;
    this.turnOf.clear();
    this.turns = this.group(next);
    this.opening = true;
    mark(this, 'data-opening', true);
    this.window.set(this.turns);
  }

  /** A height for a turn not drawn yet: its texts in lines at a usual width, two lines a question, a frame each part. */
  private estimate(turn: ChatTurn): number {
    let height = 0;
    for (const message of turn.messages) {
      for (const p of message.parts) {
        height += ESTIMATE_FRAME;
        if (p.kind === 'text' || p.kind === 'plan') height += this.lines(p.text) * ESTIMATE_LINE_HEIGHT;
        else if (p.kind === 'questions') height += p.questions.length * 2 * ESTIMATE_LINE_HEIGHT;
      }
    }
    return Math.max(ESTIMATE_FRAME, height);
  }

  private lines(said: string): number {
    let lines = 0;
    let run = 0;
    for (let i = 0; i < said.length; i++) {
      if (said.charCodeAt(i) === 10) {
        lines += Math.max(1, Math.ceil(run / ESTIMATE_LINE));
        run = 0;
      } else {
        run++;
      }
    }
    return lines + Math.max(1, Math.ceil(run / ESTIMATE_LINE));
  }

  private readonly formatTime = (date: Date): string => {
    const locale = uiLocale.locale;
    if (!this.timeFormat || this.timeLocale !== locale) {
      this.timeFormat = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' });
      this.timeLocale = locale;
    }
    return this.timeFormat.format(date);
  };

  /** The box sent: while a reply is written the text and its files wait in the queue, otherwise they go. */
  private sendFromBox(e: ChatSendEventArgs): void {
    if (this.isBusy) this.enqueue(e.text, e.attachments, e.contextItems);
    else if (!this.send(e.text, e.attachments, e.contextItems)) e.cancel = true;
  }

  private enqueue(said: string, files: File[], context: ChatContextItem[]): void {
    const row = part<HTMLDivElement>(this.queue, 'div', 'mx-chat__queued');
    const count = files.length ? uiLocale.text('chatAttachments', { count: files.length }) : '';
    text(part<HTMLSpanElement>(row, 'span', 'mx-chat__queued-text'), said && count ? `${said} · ${count}` : said || count);
    const remove = new Button({ icon: glyph('dismiss') });
    remove.class.add('mx-chat__queued-remove');
    remove.text = uiLocale.strings.chatRemove;
    const item: Queued = { text: said, files, context, row, remove };
    remove.motif.on('click', () => {
      this.queued.splice(this.queued.indexOf(item), 1);
      this.queue.controls.remove(row);
      kept(this.queue, this.queued.length > 0);
    });
    row.controls.add(remove);
    this.queued.push(item);
    kept(this.queue, true);
  }

  /**
   * A request waits: questions take the composer's place (one form at a time, the next when it is answered); the choices
   * of a tool call or a plan take the focus when it was in the chat and nothing is being written.
   */
  private wait(reply: ChatReply, item: ChatWaiting): boolean {
    this.waiting.set(item.part, { reply, item });
    this.drawStatus();
    const inside = holdsFocus(this);
    if (item.part.kind !== 'questions') return inside && !this.composer.value.trim();
    if (!this.form.part) this.openForm(item.part, inside);
    return false;
  }

  /** The user answered: the reply goes on, and the focus goes back to the composer when it was on the request. */
  private answer(asked: ChatRequestPart, answer: ChatAnswer): void {
    const held = this.waiting.get(asked);
    if (!held) return;
    const focus = holdsFocus(this);
    this.waiting.delete(asked);
    held.item.answer(answer);
    if (asked === this.form.part) this.closeForm(focus);
    else if (focus) this.composer.focus();
    this.drawStatus();
  }

  private openForm(asked: ChatQuestionsPart, focus: boolean): void {
    this.form.open(asked);
    kept(this.composer, false);
    if (focus) this.form.focus();
  }

  /** The form is done with: other questions waiting take it, or the composer comes back. */
  private closeForm(focus: boolean): void {
    this.form.close();
    for (const held of this.waiting.values()) {
      if (held.item.part.kind !== 'questions') continue;
      this.openForm(held.item.part, focus);
      return;
    }
    kept(this.composer, true);
    if (focus) this.composer.focus();
  }

  /** `message` and what came after it go, once `onRewind` lets them; open replies among them stop. */
  private cut(message: ChatMessage): boolean {
    const at = this.items.indexOf(message);
    if (at < 0) return false;
    const args: ChatRewindEventArgs = { message, removed: this.items.slice(at), cancel: false, source: this };
    this.rewound.fire(args);
    if (args.cancel) return false;
    // What was queued belongs to the conversation that goes; it is not sent when the replies stop.
    for (const q of this.queued.splice(0)) this.queue.controls.remove(q.row);
    kept(this.queue, false);
    for (const reply of [...this.replies.keys()]) if (args.removed.includes(reply.message)) reply.stop();
    this.drop(at);
    return true;
  }

  /** Takes the messages from `at` on off the conversation, and their turns off the page. */
  private drop(at: number): void {
    const removed = this.items.splice(at);
    const first = removed[0];
    const turn = first && this.turnOf.get(first);
    for (const m of removed) this.turnOf.delete(m);
    if (!turn) return;
    const t = this.turns.indexOf(turn);
    const whole = turn.messages[0] === first;
    for (const gone of this.turns.splice(whole ? t : t + 1).reverse()) this.window.remove(gone);
    if (whole) return;
    turn.messages.splice(turn.messages.indexOf(first));
    this.window.refresh(turn);
  }

  private fork(message: ChatMessage): void {
    const at = this.items.indexOf(message);
    if (at >= 0) this.forked.fire({ message, messages: this.items.slice(0, at), source: this });
  }

  /** The turn's reply goes, from its first message of the model on; the app writes it again. */
  private retry(message: ChatMessage): void {
    const turn = this.turnOf.get(message);
    if (!turn || this.isBusy) return;
    const question = turn.messages[0].role === 'user' ? turn.messages[0] : null;
    const first = turn.messages.find((m) => m !== question);
    if (first) this.drop(this.items.indexOf(first));
    this.retried.fire({ message, question, source: this });
  }

  private replyEnded(reply: ChatReply): void {
    // What still waited for the user goes unanswered.
    for (const [asked, held] of [...this.waiting]) {
      if (held.reply !== reply) continue;
      this.waiting.delete(asked);
      held.item.answer(null);
      if (asked === this.form.part) this.closeForm(holdsFocus(this));
    }
    this.replies.delete(reply);
    const turn = this.turnOf.get(reply.message);
    if (turn) this.views.get(turn)?.drawActions();
    if (this.replies.size) {
      this.drawStatus();
      return;
    }
    this.composer.busy = false;
    this.stopStatus();
    const next = this.queued.shift();
    if (!next) return;
    this.queue.controls.remove(next.row);
    kept(this.queue, this.queued.length > 0);
    this.send(next.text, next.files, next.context);
  }

  private startStatus(): void {
    this.said = '';
    this.busySince = Date.now();
    kept(this.status, true);
    this.drawStatus();
    this.statusTimer = setInterval(() => this.drawStatus(), 1000);
    this.scroller.stick();
  }

  private stopStatus(): void {
    if (this.statusTimer) clearInterval(this.statusTimer);
    this.statusTimer = undefined;
    kept(this.status, false);
  }

  private drawStatus(): void {
    if (!this.statusTimer && !this.replies.size) return;
    const strings = uiLocale.strings;
    const waiting = this.waiting.size > 0;
    mark(this.status, 'data-waiting', waiting);
    text(this.statusText, waiting ? strings.chatWaitingYou : `${this.said || strings.chatWorking}…`);
    const seconds = Math.floor((Date.now() - this.busySince) / 1000);
    text(this.statusDetail, `${uiLocale.text('chatSeconds', { seconds })} · ${strings.chatStopHint}`);
  }

  private askOlder(auto: boolean): boolean {
    if (this.loading || !this.peekProperty('hasOlder') || (auto && this.failed)) return false;
    this.loading = true;
    this.failed = false;
    this.drawOlder();
    let open = true;
    const end = (failed: boolean, done = false) => {
      if (!open || this.isDisposed) return;
      open = false;
      this.loading = false;
      this.failed = failed;
      if (done) {
        this.changeProperty('hasOlder', false);
        return;
      }
      this.drawOlder();
      if (!failed) this.checkTop();
    };
    const args: ChatLoadOlderEventArgs = { before: this.items[0] ?? null, release: (done = false) => end(false, done), fail: () => end(true), source: this };
    this.olderWanted.fire(args);
    if (args.promise) void args.promise.then(() => end(false), () => end(true));
    return true;
  }

  /** Older messages came while the view was near the top: the next ones are asked for, after the layer's run. */
  private checkTop(): void {
    if (this.peekProperty('hasOlder') && !this.loading && !this.failed) measure(this, this.readTop, this.nearTop);
  }

  private readonly readTop = (): Box => boxOf(this.scroller);

  private readonly nearTop = (box: Box): void => {
    if (box.scrollTop <= OLDER_OFFSET && box.clientHeight > 0) void whenMeasured(this).then(() => this.askOlder(true));
  };

  private drawTexts(): void {
    // Turns drawn later take the language then.
    for (const view of this.views.values()) view.drawTexts();
    for (const q of this.queued) q.remove.text = uiLocale.strings.chatRemove;
    this.form.drawTexts();
    this.drawOlder();
    this.drawJump();
    this.drawLabel();
    this.drawStatus();
  }

  private drawOlder(): void {
    const strings = uiLocale.strings;
    const busy = this.loading;
    const said = this.failed ? strings.chatLoadFailed : strings.chatLoadEarlier;
    const shown = !!this.peekProperty('hasOlder') || this.failed;
    if (this.olderButton.busy === busy && this.olderButton.text === said && this.older.isVisible === shown) return;
    // The button stands above the messages: as it changes size, the messages on screen stay where they are.
    this.window.hold(() => {
      this.olderButton.busy = busy;
      this.olderButton.text = said;
      kept(this.older, shown);
    });
  }

  private drawJump(): void {
    const away = !this.scroller.isAtEnd;
    kept(this.jump, away);
    if (!away) return;
    const said = this.unseen ? uiLocale.text('chatNewMessages', { count: this.unseen }) : uiLocale.strings.chatJumpToLatest;
    this.jump.text = said;
  }

  private drawLabel(): void {
    put(this.scroller, 'role', 'region');
    put(this.scroller, 'aria-label', this.label || uiLocale.strings.chatLabel);
  }
}
