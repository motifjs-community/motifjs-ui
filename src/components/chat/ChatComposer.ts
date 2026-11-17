import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { clearParts, loose, part, removePart } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import type { IconSource } from '../../core/icon-source';
import { onLanguage } from '../../core/on-language';
import { css, kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { OptionList } from '../../parts/list/OptionList';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Popup } from '../../parts/popup/Popup';
import { Button } from '../button/Button';
import { Chip } from '../chip/Chip';
import { TextArea } from '../textarea/TextArea';
import { attachmentChip } from './chat-attachment-entry';
import type { ChatCommand } from './chat-command';
import type { ChatComposerProps } from './chat-composer-props';
import type { ChatContextChangedEventArgs } from './chat-context-changed-event-args';
import type { ChatContextItem } from './chat-context-item';
import type { ChatMention, ChatMentionEventArgs } from './chat-mention';
import type { ChatOption } from './chat-option';
import type { ChatSendEventArgs } from './chat-send-event-args';
import type { ChatValueChangedEventArgs } from './chat-value-changed-event-args';

const OWN = ['placeholder', 'busy', 'maxRows', 'attachments', 'accept', 'contextItems', 'commands', 'modes', 'mode', 'models', 'model', 'thinking', 'usage', 'history'] as const;

/** A line of the menu under the box: what it shows, and what it puts in the text. */
interface Suggestion {
  label: string;
  insert: string;
  description?: string;
  icon?: IconSource;
}

/** From this much of the context used, the meter says the context is nearly full. */
const USAGE_HIGH = 0.8;

/**
 * The box a message is written in, in one frame with its tools under it: files to attach (`attachments`: the button,
 * pasting and dropping; each a chip above the box), what the app adds by itself (`contextItems`: chips the user turns off or
 * takes off), commands (`commands`: `/` at the start of the box, or its button, lists them) and what the app suggests
 * after `@` (`onMention`), in a menu the arrow keys move in and Enter or Tab takes from, the way the model works (`modes`; Shift+Tab in the box goes to the
 * next), the model and its thinking (`models`, `thinking`), how full the context is (`usage`), and the send button.
 * Enter sends, Shift+Enter starts a new line, and an input method's Enter only ends its
 * composition. Arrow Up at the start of the box brings back what was sent before, and Arrow Down goes forward again.
 * While a reply is written (`busy`), the button stops it, as Escape does, and Enter still sends: the chat queues what
 * is sent then.
 *
 * @example
 * <ChatComposer busy={() => this.replying} onSend={e => this.ask(e.text)} onStop={() => this.cancel()} />
 */
export class ChatComposer extends Control<HTMLDivElement, ChatComposerProps> {
  /** The text box, for its value and focus. */
  readonly box: TextArea;
  /** The box and its tools: it shows where files can be dropped. */
  private readonly field: Component<HTMLDivElement>;
  /** The files attached, as chips above the box. */
  private readonly filesRow: Component<HTMLDivElement>;
  private readonly attached: { file: File; chip: Chip }[] = [];
  private readonly attachButton: Button;
  /** The browser's file input, hidden: the button opens its picker. */
  private readonly fileInput: Component<HTMLInputElement>;
  private dragDepth = 0;
  /** The context items, a chip each. */
  private readonly contextRow: Component<HTMLDivElement>;
  private readonly commandButton: Button;
  /** The menu of commands or mentions under the box, made the first time it opens, and what it would replace. */
  private popup: Popup | null = null;
  private list: OptionList<Suggestion> | null = null;
  private suggesting: { from: number; to: number } | null = null;
  /** Counts the mention queries: only the latest one's answer is shown. */
  private asking = 0;
  /** The app suggests after `@` (`onMention` was given). */
  private mentions = false;
  private readonly modeButton: Button;
  private readonly modelButton: Button;
  /** How full the context is: a ring and the percent. */
  private readonly meter: Component<HTMLSpanElement>;
  private readonly meterRing: Component<HTMLSpanElement>;
  private readonly meterText: Component<HTMLSpanElement>;
  private readonly button: Button;
  private readonly sent = new Emitter<ChatSendEventArgs>();
  private readonly contextChanged = new Emitter<ChatContextChangedEventArgs>();
  private readonly mentioned = new Emitter<ChatMentionEventArgs>();
  private readonly stopped = new Emitter<{ source: ChatComposer }>();
  private readonly modeChanged = new Emitter<ChatValueChangedEventArgs<string>>();
  private readonly modelChanged = new Emitter<ChatValueChangedEventArgs<string>>();
  private readonly thinkingChanged = new Emitter<ChatValueChangedEventArgs<boolean>>();
  /** What was sent, oldest first; where Arrow Up stands in it (its length: the text being written), and that text. */
  private past: string[] = [];
  private pastAt = 0;
  private draft = '';

  constructor(props?: IBaseProp<ChatComposerProps>) {
    super('div', props);
    const own = (this.props ?? {}) as ChatComposerProps;
    this.class.add('mx-chat-composer');
    this.field = part<HTMLDivElement>(this, 'div', 'mx-chat-composer__field');
    this.filesRow = part<HTMLDivElement>(this.field, 'div', 'mx-chat-composer__files');
    kept(this.filesRow, false);
    this.box = new TextArea({ rows: 1, autoGrow: true, submitOnEnter: true, onEnter: () => this.send() });
    this.box.class.add('mx-chat-composer__box');
    this.field.controls.add(this.box);
    const tools = part<HTMLDivElement>(this.field, 'div', 'mx-chat-composer__tools');
    this.fileInput = loose<HTMLInputElement>('input', 'mx-chat-composer__input');
    // Hidden with the attribute, not core's hide: the browser's file input stays in the page, where its click opens the picker.
    this.fileInput.attr.add({ type: 'file', multiple: true, hidden: true });
    this.controls.add(this.fileInput);
    // Their variants and sizes come from their places; a button with a menu has it from the start.
    this.attachButton = new Button({ icon: glyph('plus') });
    this.attachButton.class.add('mx-chat-composer__attach');
    this.attachButton.motif.on('click', () => this.pick());
    this.commandButton = new Button({ icon: glyph('slash') });
    this.commandButton.class.add('mx-chat-composer__commands');
    this.commandButton.motif.on('click', () => this.startCommand());
    tools.controls.add(this.attachButton, this.commandButton);
    this.contextRow = part<HTMLDivElement>(tools, 'div', 'mx-chat-composer__context');
    this.modeButton = new Button({ menu: [] });
    this.modeButton.class.add('mx-chat-composer__mode');
    this.modelButton = new Button({ menu: [] });
    this.modelButton.class.add('mx-chat-composer__model');
    tools.controls.add(this.modeButton, this.modelButton);
    part<HTMLSpanElement>(tools, 'span', 'mx-chat-composer__space');
    this.meter = part<HTMLSpanElement>(tools, 'span', 'mx-chat-composer__usage');
    put(this.meter, 'role', 'meter');
    put(this.meter, 'aria-valuemin', '0');
    put(this.meter, 'aria-valuemax', '100');
    this.meterRing = part<HTMLSpanElement>(this.meter, 'span', 'mx-chat-composer__usage-ring');
    this.meterText = part<HTMLSpanElement>(this.meter, 'span', 'mx-chat-composer__usage-text');
    put(this.meterText, 'aria-hidden', 'true');
    this.button = new Button();
    this.button.class.add('mx-chat-composer__button');
    this.button.motif.on('click', () => (this.busy ? this.stop() : this.send()));
    tools.controls.add(this.button);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onSend) this.sent.event(own.onSend);
    if (own.onStop) this.stopped.event(own.onStop);
    if (own.onContextChanged) this.contextChanged.event(own.onContextChanged);
    if (own.onMention) this.mentioned.event(own.onMention);
    this.mentions = !!own.onMention;
    if (own.onModeChanged) this.modeChanged.event(own.onModeChanged);
    if (own.onModelChanged) this.modelChanged.event(own.onModelChanged);
    if (own.onThinkingChanged) this.thinkingChanged.event(own.onThinkingChanged);
    this.observeProperty<number | undefined>('maxRows', (rows) => (this.box.maxRows = rows ?? 8));
    this.observeProperty('busy', () => {
      this.drawButton();
      this.drawPlaceholder();
    });
    this.observeProperty('placeholder', () => this.drawPlaceholder());
    this.observeProperty('attachments', () => this.drawAttach());
    this.observeProperty<string | undefined>('accept', (accept) => put(this.fileInput, 'accept', accept || null));
    this.observeProperty('contextItems', () => this.drawContext());
    this.observeProperty('commands', () => this.drawCommands());
    this.observeProperty('modes', () => this.drawMode());
    this.observeProperty('mode', () => this.drawMode());
    this.observeProperty('models', () => this.drawModel());
    this.observeProperty('model', () => this.drawModel());
    this.observeProperty('thinking', () => this.drawModel());
    this.observeProperty('usage', () => this.drawUsage());
    this.observeProperty<readonly string[] | undefined>('history', (list) => {
      this.past = [...(list ?? [])];
      this.pastAt = this.past.length;
    });
    onLanguage(this, () => {
      this.drawButton();
      this.drawPlaceholder();
      this.drawMode();
      this.drawModel();
      this.drawUsage();
      this.drawAttach();
      this.drawCommands();
    });
    // The menu's keys come first: Enter there takes a line instead of sending.
    this.motif.on('keydown:capture', (_, e: KeyboardEvent) => this.menuKey(e));
    this.motif.on('keydown', (_, e: KeyboardEvent) => this.key(e));
    this.box.motif.on('input', () => this.suggest());
    this.listenForFiles();
    this.motif.setDisposable(() => {
      this.sent.dispose();
      this.contextChanged.dispose();
      this.mentioned.dispose();
      this.stopped.dispose();
      this.modeChanged.dispose();
      this.modelChanged.dispose();
      this.thinkingChanged.dispose();
    });
  }

  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }
  get busy(): boolean {
    return this.getProperty<boolean | undefined>('busy') === true;
  }
  set busy(value: Bind<boolean>) {
    this.assignProperty('busy', value, Boolean);
  }
  get attachments(): boolean {
    return this.getProperty<boolean | undefined>('attachments') === true;
  }
  set attachments(value: Bind<boolean>) {
    this.assignProperty('attachments', value, Boolean);
  }
  get accept(): string {
    return this.getProperty<string | undefined>('accept') ?? '';
  }
  set accept(value: Bind<string>) {
    this.assignProperty('accept', value);
  }
  get contextItems(): ChatContextItem[] {
    return this.getProperty<ChatContextItem[] | undefined>('contextItems') ?? [];
  }
  set contextItems(value: Bind<ChatContextItem[]>) {
    this.assignProperty('contextItems', value);
  }
  get commands(): readonly ChatCommand[] {
    return this.getProperty<readonly ChatCommand[] | undefined>('commands') ?? [];
  }
  set commands(value: Bind<readonly ChatCommand[]>) {
    this.assignProperty('commands', value);
  }
  /** The files attached, in order: they go with the next message. */
  get files(): File[] {
    return this.attached.map((a) => a.file);
  }
  get maxRows(): number {
    return this.getProperty<number | undefined>('maxRows') ?? 8;
  }
  set maxRows(value: Bind<number>) {
    this.assignProperty('maxRows', value);
  }
  get modes(): readonly ChatOption[] {
    return this.getProperty<readonly ChatOption[] | undefined>('modes') ?? [];
  }
  set modes(value: Bind<readonly ChatOption[]>) {
    this.assignProperty('modes', value);
  }
  /** The mode in use: the one set, or the first. */
  get mode(): string {
    return this.current(this.modes, this.getProperty<string | undefined>('mode'))?.value ?? '';
  }
  set mode(value: Bind<string>) {
    this.assignProperty('mode', value);
  }
  get models(): readonly ChatOption[] {
    return this.getProperty<readonly ChatOption[] | undefined>('models') ?? [];
  }
  set models(value: Bind<readonly ChatOption[]>) {
    this.assignProperty('models', value);
  }
  /** The model in use: the one set, or the first. */
  get model(): string {
    return this.current(this.models, this.getProperty<string | undefined>('model'))?.value ?? '';
  }
  set model(value: Bind<string>) {
    this.assignProperty('model', value);
  }
  get thinking(): boolean {
    return this.getProperty<boolean | undefined>('thinking') === true;
  }
  set thinking(value: Bind<boolean>) {
    this.assignProperty('thinking', value, Boolean);
  }
  get usage(): number | null {
    return this.getProperty<number | null | undefined>('usage') ?? null;
  }
  set usage(value: Bind<number | null>) {
    this.assignProperty('usage', value);
  }
  /** What was sent before, oldest first, with what was sent since. */
  get history(): readonly string[] {
    return this.past;
  }
  set history(value: Bind<readonly string[]>) {
    this.assignProperty('history', value);
  }

  /** Occurs when the user sends the text. Set `e.cancel` to keep it in the box. */
  get onSend(): MotifEvent<ChatSendEventArgs> {
    return this.sent.event;
  }
  /** Occurs when the user stops the reply. */
  get onStop(): MotifEvent<{ source: ChatComposer }> {
    return this.stopped.event;
  }
  /** Occurs when the user turns a context item on or off, or takes it off. */
  get onContextChanged(): MotifEvent<ChatContextChangedEventArgs> {
    return this.contextChanged.event;
  }
  /** Occurs when the user writes after `@`: give what fits `e.query` (`e.items`, or `e.promise`). */
  get onMention(): MotifEvent<ChatMentionEventArgs> {
    return this.mentioned.event;
  }
  /** Occurs when the user picks another mode. */
  get onModeChanged(): MotifEvent<ChatValueChangedEventArgs<string>> {
    return this.modeChanged.event;
  }
  /** Occurs when the user picks another model. */
  get onModelChanged(): MotifEvent<ChatValueChangedEventArgs<string>> {
    return this.modelChanged.event;
  }
  /** Occurs when the user turns thinking on or off. */
  get onThinkingChanged(): MotifEvent<ChatValueChangedEventArgs<boolean>> {
    return this.thinkingChanged.event;
  }

  /** The text in the box. */
  get value(): string {
    return this.box.value ?? '';
  }
  set value(value: string) {
    this.box.value = value;
  }

  override focus(): boolean {
    return this.box.focus();
  }

  /** Sends the text in the box and the files attached, as Enter does: nothing when both are empty. */
  send(): boolean {
    const text = this.value;
    const attachments = this.files;
    if (!text.trim() && !attachments.length) return false;
    const contextItems = this.contextItems.filter((item) => item.on !== false);
    const args: ChatSendEventArgs = { text, attachments, contextItems, cancel: false, source: this };
    this.sent.fire(args);
    if (args.cancel) return false;
    if (text.trim() && this.past[this.past.length - 1] !== text) this.past.push(text);
    this.pastAt = this.past.length;
    this.draft = '';
    this.value = '';
    for (const file of attachments) this.detach(file);
    return true;
  }

  /** Attaches files, as picking, pasting or dropping them does; those `accept` does not take are left out. */
  attach(files: Iterable<File>): void {
    for (const file of files) {
      if (!this.accepts(file)) continue;
      const chip = attachmentChip({ kind: 'attachment', name: file.name, type: file.type, size: file.size, file }, { removable: true });
      chip.class.add('mx-chat-composer__file');
      chip.onRemove(() => {
        this.detach(file);
        this.box.focus();
      });
      this.filesRow.controls.add(chip);
      this.attached.push({ file, chip });
    }
    kept(this.filesRow, this.attached.length > 0);
  }

  /** Takes a file off, as its chip's remove button does. */
  detach(file: File): void {
    const at = this.attached.findIndex((a) => a.file === file);
    if (at < 0) return;
    removePart(this.attached[at].chip);
    this.attached.splice(at, 1);
    kept(this.filesRow, this.attached.length > 0);
  }

  /** Opens the browser's file picker, as the attach button does. */
  pick(): void {
    if (this.attachments) this.fileInput.attr.add({ click: true });
  }

  /** Stops the reply, as the stop button does. */
  stop(): void {
    if (this.busy) this.stopped.fire({ source: this });
  }

  /** Goes to the next mode, as Shift+Tab in the box does. */
  nextMode(): void {
    const modes = this.modes;
    if (modes.length < 2) return;
    const at = modes.findIndex((m) => m.value === this.mode);
    this.pickMode(modes[(at + 1) % modes.length].value);
  }

  /** `/` at the start of the box, as the commands button does: the menu lists the commands. */
  private startCommand(): void {
    if (!this.value.startsWith('/')) this.value = `/${this.value}`;
    this.box.focus();
    this.box.setSelectionRange(1);
    this.suggest(1);
  }

  /** What is written before the caret: `/word` at the start of the box lists the commands, `@word` asks the app. */
  private suggest(caret = this.box.selectionEnd): void {
    const before = this.value.slice(0, caret);
    const command = /^\/(\S*)$/.exec(before);
    if (command && this.commands.length) {
      const query = command[1].toLowerCase();
      const fits = this.commands.filter((c) => c.name.toLowerCase().includes(query));
      // Those that start with what was written come first.
      fits.sort((a, b) => Number(!a.name.toLowerCase().startsWith(query)) - Number(!b.name.toLowerCase().startsWith(query)));
      this.offer(0, caret, fits.map((c) => ({ label: `/${c.name}`, insert: `/${c.name} `, description: c.description })));
      return;
    }
    const ask = ++this.asking;
    const mention = /(?:^|\s)@(\S*)$/.exec(before);
    if (!mention) {
      this.closeMenu();
      return;
    }
    const query = mention[1];
    const from = caret - query.length - 1;
    const take = (items: readonly ChatMention[]) => {
      if (ask === this.asking) this.offer(from, caret, items.map((m) => ({ label: m.label, insert: `@${m.value ?? m.label} `, description: m.description, icon: m.icon })));
    };
    const args: ChatMentionEventArgs = { query, source: this };
    this.mentioned.fire(args);
    if (args.items) take(args.items);
    else if (args.promise) this.using(args.promise, take);
    else this.closeMenu();
  }

  /** Shows `items` under the box, the first one active; they would replace the text from `from` to `to`. */
  private offer(from: number, to: number, items: Suggestion[]): void {
    if (!items.length) {
      this.closeMenu();
      return;
    }
    this.suggesting = { from, to };
    const list = this.menu();
    list.setItems(items);
    list.setActive(0);
    if (!this.popup!.isOpen) this.popup!.open(this.field, { toggle: this.box, returnFocus: this.box });
    put(this.box.textAreaPart, 'aria-controls', list.id);
    this.pointAt();
  }

  private menu(): OptionList<Suggestion> {
    if (this.list) return this.list;
    const popup = new Popup();
    popup.class.add('mx-chat-composer__popup');
    this.controls.add(popup);
    const list = new OptionList<Suggestion>();
    list.class.add('mx-chat-composer__menu');
    list.textOf = (s) => s.label;
    list.iconOf = (s) => s.icon;
    list.draw = (s, host) => {
      text(part<HTMLSpanElement>(host, 'span', 'mx-chat-composer__menu-label'), s.label);
      if (s.description) text(part<HTMLSpanElement>(host, 'span', 'mx-chat-composer__menu-description'), s.description);
    };
    list.onChosen((e) => this.choose(e.item));
    popup.controls.add(list);
    popup.onClosed(() => {
      this.suggesting = null;
      put(this.box.textAreaPart, 'aria-activedescendant', null);
      put(this.box.textAreaPart, 'aria-controls', null);
    });
    this.popup = popup;
    this.list = list;
    return list;
  }

  /** Puts the line in place of what it was offered for, and the caret after it. */
  private choose(s: Suggestion): void {
    const at = this.suggesting;
    if (!at) return;
    const said = this.value;
    this.closeMenu();
    this.value = said.slice(0, at.from) + s.insert + said.slice(at.to);
    this.box.focus();
    this.box.setSelectionRange(at.from + s.insert.length);
  }

  private closeMenu(): void {
    this.suggesting = null;
    if (this.popup?.isOpen) this.popup.close();
  }

  private pointAt(): void {
    const list = this.list;
    put(this.box.textAreaPart, 'aria-activedescendant', list && this.popup?.isOpen && list.activeIndex >= 0 ? list.idOf(list.activeIndex) : null);
  }

  /** While the menu is open: the arrows move in it, Enter or Tab takes the active line, Escape closes it. */
  private menuKey(e: KeyboardEvent): void {
    const list = this.list;
    if (!list || !this.popup?.isOpen || !this.box.motif.isEventFrom(e) || e.isComposing) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
    } else if ((e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const item = list.activeItem;
      if (!item) return;
      e.preventDefault();
      e.stopPropagation();
      this.choose(item);
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'PageDown' || e.key === 'PageUp') && list.handleKey(e)) {
      e.stopPropagation();
      this.pointAt();
    }
  }

  private drawCommands(): void {
    const has = this.commands.length > 0;
    kept(this.commandButton, has);
    this.name(this.commandButton, uiLocale.strings.chatCommands);
    put(this.box.textAreaPart, 'aria-autocomplete', has || this.mentions ? 'list' : null);
  }

  /** Picked, pasted or dropped files, while `attachments` is on. */
  private listenForFiles(): void {
    this.fileInput.motif.on('change', () => {
      // browser object read: allowed exception
      this.attach(this.fileInput.element.files ?? []);
      this.fileInput.attr.add({ value: '' });
    });
    this.box.motif.on('paste', (_, e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (!this.attachments || !files?.length) return;
      e.preventDefault();
      this.attach(files);
    });
    const dropping = (e: DragEvent) => this.attachments && !!e.dataTransfer?.types.includes('Files');
    this.motif.on('dragenter', (_, e: DragEvent) => {
      if (!dropping(e)) return;
      e.preventDefault();
      this.dragDepth++;
      mark(this.field, 'data-dragover', true);
    });
    this.motif.on('dragover', (_, e: DragEvent) => {
      if (!dropping(e)) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    });
    this.motif.on('dragleave', () => {
      if (this.dragDepth > 0) this.dragDepth--;
      if (this.dragDepth === 0) mark(this.field, 'data-dragover', false);
    });
    this.motif.on('drop', (_, e: DragEvent) => {
      this.dragDepth = 0;
      mark(this.field, 'data-dragover', false);
      if (!dropping(e)) return;
      e.preventDefault();
      this.attach(e.dataTransfer!.files);
    });
  }

  /** `accept` as the browser's file input reads it: extensions (`.pdf`), media types (`image/png`) and families (`image/*`). */
  private accepts(file: File): boolean {
    const accept = this.accept.trim();
    if (!accept) return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return accept.split(',').some((entry) => {
      const want = entry.trim().toLowerCase();
      if (want.startsWith('.')) return name.endsWith(want);
      if (want.endsWith('/*')) return type.startsWith(want.slice(0, -1));
      return !!want && type === want;
    });
  }

  /** A chip for each context item: on while it goes with the message; its remove button takes it out of the array. */
  private drawContext(): void {
    clearParts(this.contextRow);
    const items = this.contextItems;
    for (const item of items) {
      const chip = new Chip({ text: item.label, icon: item.icon ?? glyph('file'), size: 'sm', selectable: true, selected: item.on !== false, removable: true });
      chip.class.add('mx-chat-composer__context-item');
      chip.onSelectedChanged((e) => {
        if (!e.byUser) return;
        item.on = e.selected;
        this.contextChanged.fire({ item, removed: false, source: this });
      });
      chip.onRemove(() => {
        const at = items.indexOf(item);
        if (at >= 0) items.splice(at, 1);
        this.drawContext();
        this.box.focus();
        this.contextChanged.fire({ item, removed: true, source: this });
      });
      this.contextRow.controls.add(chip);
    }
    kept(this.contextRow, items.length > 0);
  }

  private drawAttach(): void {
    kept(this.attachButton, this.attachments);
    this.name(this.attachButton, uiLocale.strings.chatAttach);
  }

  /** A button that shows its icon alone: its name for assistive technology, and its tooltip. */
  private name(button: Button, said: string): void {
    put(button, 'aria-label', said);
    button.hint = said;
  }

  private current(options: readonly ChatOption[], value: string | undefined): ChatOption | undefined {
    return options.find((o) => o.value === value) ?? options[0];
  }

  private key(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.busy) {
      e.preventDefault();
      this.stop();
      return;
    }
    if (!this.box.motif.isEventFrom(e) || e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Tab' && e.shiftKey && this.modes.length > 1) {
      e.preventDefault();
      this.nextMode();
      return;
    }
    if (e.shiftKey) return;
    // Arrow Up at the start of the box, or on a text it brought back, goes back; Arrow Down on such a text, forward.
    const recalled = this.pastAt < this.past.length && this.value === this.past[this.pastAt];
    if (e.key === 'ArrowUp' && this.pastAt > 0 && (recalled || (this.box.selectionStart === 0 && this.box.selectionEnd === 0))) {
      e.preventDefault();
      this.recall(this.pastAt - 1);
    } else if (e.key === 'ArrowDown' && recalled) {
      e.preventDefault();
      this.recall(this.pastAt + 1);
    }
  }

  private recall(at: number): void {
    if (this.pastAt === this.past.length) this.draft = this.value;
    this.pastAt = at;
    const said = at < this.past.length ? this.past[at] : this.draft;
    this.value = said;
    this.box.setSelectionRange(said.length);
  }

  private pickMode(value: string): void {
    if (value === this.mode) return;
    this.changeProperty('mode', value);
    this.modeChanged.fire({ value, source: this });
  }

  private pickModel(value: string): void {
    if (value === this.model) return;
    this.changeProperty('model', value);
    this.modelChanged.fire({ value, source: this });
  }

  private toggleThinking(): void {
    const value = !this.thinking;
    this.changeProperty('thinking', value);
    this.thinkingChanged.fire({ value, source: this });
  }

  private drawButton(): void {
    const busy = this.busy;
    const strings = uiLocale.strings;
    const said = busy ? strings.chatStop : strings.chatSend;
    this.button.icon = glyph(busy ? 'stop' : 'send');
    this.name(this.button, said);
    mark(this, 'data-busy', busy);
  }

  private drawPlaceholder(): void {
    const strings = uiLocale.strings;
    this.box.placeholder = this.busy ? strings.chatQueuePlaceholder : this.peekProperty<string>('placeholder') || strings.chatPlaceholder;
  }

  /** The mode in use on its button, the modes in its menu. */
  private drawMode(): void {
    const modes = this.modes;
    kept(this.modeButton, modes.length > 0);
    if (!modes.length) return;
    const current = this.mode;
    this.modeButton.text = this.current(modes, current)?.label ?? '';
    this.modeButton.hint = uiLocale.strings.chatModeHint;
    this.modeButton.menu = modes.map(
      (m): MenuItem => ({ text: m.label, description: m.description, group: 'mode', checked: m.value === current, click: () => this.pickMode(m.value) })
    );
  }

  /** The model in use on its button; the models, and thinking when it is set, in its menu. */
  private drawModel(): void {
    const models = this.models;
    const thinking = this.peekProperty<boolean | undefined>('thinking');
    kept(this.modelButton, models.length > 0 || thinking !== undefined);
    const strings = uiLocale.strings;
    const current = this.model;
    this.modelButton.text = this.current(models, current)?.label ?? strings.chatModel;
    this.modelButton.hint = strings.chatModel;
    const items = models.map(
      (m): MenuItem => ({ text: m.label, description: m.description, group: 'model', checked: m.value === current, click: () => this.pickModel(m.value) })
    );
    if (thinking !== undefined) items.push({ text: strings.chatThinkingToggle, checked: thinking === true, beginGroup: models.length > 0, click: () => this.toggleThinking() });
    this.modelButton.menu = items;
  }

  /** How full the context is: the ring's arc, the percent beside it, its name for assistive technology. */
  private drawUsage(): void {
    const usage = this.usage;
    const shown = typeof usage === 'number' && Number.isFinite(usage);
    kept(this.meter, shown);
    if (!shown) return;
    const fraction = Math.min(1, Math.max(0, usage));
    const percent = Math.round(fraction * 100);
    const said = uiLocale.text('chatUsage', { percent });
    css(this.meterRing, '--_usage', `${percent}%`);
    mark(this.meter, 'data-high', fraction >= USAGE_HIGH);
    text(this.meterText, `${percent}%`);
    put(this.meter, 'aria-valuenow', String(percent));
    put(this.meter, 'aria-label', said);
    put(this.meter, 'title', said);
  }
}
