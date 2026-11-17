import { nextId } from '../../core/next-id';
import type { ChatFlowView } from './chat-flow-view';
import type { ChatNoticePart, ChatPart, ChatSource, ChatThinkingPart, ChatTodoItem, ChatToolPart } from './chat-part';
import type {
  ChatFormAnswer,
  ChatFormPart,
  ChatFormSchema,
  ChatPermission,
  ChatPermissionAnswer,
  ChatPlanAnswer,
  ChatPlanChoice,
  ChatPlanPart,
  ChatQuestion,
  ChatQuestionsAnswer,
  ChatQuestionsPart,
  ChatRequestPart,
  ChatWaiting
} from './chat-request';
import type { ChatToolInit } from './chat-tool-init';
import type { ChatTextPart } from './chat-text-part';

/**
 * Writes the parts of a reply, or of a sub-agent inside a tool call: each call writes the parts first, then draws into
 * the flow while it is on the page. Thinking ends when anything else is written.
 */
export class ChatWriter {
  private timed: boolean;

  constructor(
    private readonly list: () => ChatPart[],
    /** The flow the parts are drawn in, while it is on the page. */
    readonly flowOf: () => ChatFlowView | null,
    /** Something was written: the chat keeps the view at the end, or the height of the turn. */
    readonly changed: () => void,
    private readonly opened: () => boolean,
    /** A request waits for the user: the chat keeps it until they answer; `true` when its choices take the focus. */
    readonly waits: (waiting: ChatWaiting) => boolean,
    /** The time shown above the first text. */
    private readonly time?: Date
  ) {
    this.timed = !time;
  }

  /** `true` while it can be written. */
  get isOpen(): boolean {
    return this.opened();
  }

  /** Adds markdown text: what it completes takes its form, the rest shows as text at once. */
  text(delta: string): void {
    if (!delta || !this.isOpen) return;
    let last = this.last();
    if (last?.kind !== 'text') {
      last = { kind: 'text', text: '' } satisfies ChatTextPart;
      this.add(last, true);
    }
    last.text += delta;
    this.flowOf()?.append(last, delta);
    this.changed();
  }

  /** Adds to the thinking being written, or starts one: called with nothing, it says the model thinks. */
  thinking(delta = ''): void {
    if (!this.isOpen) return;
    const part = this.thought();
    if (delta) {
      part.text = (part.text ?? '') + delta;
      this.flowOf()?.append(part, delta);
    }
    this.changed();
  }

  /** Adds a short note on what the thinking is about; it stands under the thinking's line while it runs. */
  note(note: string): void {
    if (!note || !this.isOpen) return;
    const part = this.thought();
    (part.notes ??= []).push(note);
    this.redraw(part);
  }

  /** Starts a tool call: write its arguments, output and end through what it returns. */
  tool(init: ChatToolInit): ChatToolCall {
    const part: ChatToolPart = {
      kind: 'tool',
      id: init.id ?? nextId('chat-tool'),
      name: init.name,
      label: init.label,
      title: init.title,
      input: init.input,
      look: init.look,
      density: init.density,
      status: init.status ?? 'running',
      started: Date.now()
    };
    if (this.isOpen) this.add(part);
    return new ChatToolCall(part, this);
  }

  /** The to-do list as it stands now; right after another one, it takes its place. */
  todo(items: ChatTodoItem[]): void {
    if (!this.isOpen) return;
    const last = this.last();
    if (last?.kind === 'todo') {
      last.items = items.map((item) => ({ ...item }));
      this.redraw(last);
    } else {
      this.add({ kind: 'todo', items: items.map((item) => ({ ...item })) });
    }
  }

  /** A line in the flow: `retry` while a request is tried again, `info` for anything else. */
  notice(tone: ChatNoticePart['tone'], text?: string): void {
    this.add({ kind: 'notice', tone, text });
  }

  /**
   * The request failed and is tried again in `seconds`: the line counts down to it, says which try it is of how many,
   * and why (`reason`, "Overloaded").
   */
  retrying(seconds: number, options: { attempt?: number; attempts?: number; reason?: string } = {}): void {
    if (!this.isOpen) return;
    this.add({ kind: 'notice', tone: 'retry', text: options.reason, until: Date.now() + seconds * 1000, attempt: options.attempt, attempts: options.attempts });
  }

  /** The conversation so far was summed up for the model: a line across the flow, `summary` under it on a click. */
  compaction(summary?: string): void {
    if (this.isOpen) this.add({ kind: 'compaction', text: summary });
  }

  /**
   * Shows a plan (markdown) and waits for the user: one of `choices` (by default "Yes, go ahead", value `yes`), or `no`
   * to keep planning, with what to change. When the reply ends first it resolves as `no`.
   */
  plan(text: string, choices?: ChatPlanChoice[]): Promise<ChatPlanAnswer> {
    const unanswered: ChatPlanAnswer = { choice: 'no' };
    if (!this.isOpen) return Promise.resolve(unanswered);
    const part: ChatPlanPart = { kind: 'plan', id: nextId('chat-plan'), text, choices: choices?.map((c) => ({ ...c })) };
    this.add(part);
    return this.wait(part, unanswered, (answer) => {
      part.answer = answer;
      this.redraw(part);
    });
  }

  /**
   * Asks the user questions: the form takes the composer's place until they answer or leave it to the model, and the
   * flow keeps the questions and the answers. When the reply ends first it resolves as declined.
   */
  questions(questions: ChatQuestion[]): Promise<ChatQuestionsAnswer> {
    const unanswered: ChatQuestionsAnswer = { declined: true, answers: [] };
    if (!this.isOpen || !questions.length) return Promise.resolve(unanswered);
    const part: ChatQuestionsPart = {
      kind: 'questions',
      id: nextId('chat-questions'),
      questions: questions.map((q, i) => ({ ...q, id: q.id ?? String(i + 1), options: q.options?.map((o) => ({ ...o })) }))
    };
    this.add(part);
    return this.wait(part, unanswered, (answer) => {
      part.answer = answer;
      this.redraw(part);
    });
  }

  /**
   * Asks the user to fill in a form, as an MCP server's elicitation asks: `message` says what for, `schema` is its
   * `requestedSchema`, `source` who asks. The form takes the composer's place until the user sends it, declines or
   * dismisses it; the answer is the elicitation's result. When the reply ends first it resolves as `cancel`.
   *
   * @example
   * client.setRequestHandler(ElicitRequestSchema, (request) => call.form(request.params.message, request.params.requestedSchema, { source: 'github' }));
   */
  form(message: string, schema: ChatFormSchema, options: { source?: string } = {}): Promise<ChatFormAnswer> {
    const unanswered: ChatFormAnswer = { action: 'cancel' };
    if (!this.isOpen) return Promise.resolve(unanswered);
    const part: ChatFormPart = { kind: 'form', id: nextId('chat-form'), message, schema, source: options.source };
    this.add(part);
    return this.wait(part, unanswered, (answer) => {
      part.answer = answer;
      this.redraw(part);
    });
  }

  /**
   * The sources the reply names, as numbered chips. Right after other sources they join them, each source once (by its
   * address, or its title).
   */
  sources(items: ChatSource[]): void {
    if (!this.isOpen || !items.length) return;
    const last = this.last();
    if (last?.kind !== 'sources') {
      this.add({ kind: 'sources', items: items.map((s) => ({ ...s })) });
      return;
    }
    const known = new Set(last.items.map((s) => s.url || s.title));
    let added = false;
    for (const s of items) {
      const key = s.url || s.title;
      if (known.has(key)) continue;
      known.add(key);
      last.items.push({ ...s });
      added = true;
    }
    if (added) this.redraw(last);
  }

  /** Ends the thinking being written, with its seconds. */
  endThinking(): void {
    const last = this.last();
    if (last?.kind !== 'thinking' || last.seconds !== undefined) return;
    last.seconds = (Date.now() - (last.started ?? Date.now())) / 1000;
    this.flowOf()?.update(last);
  }

  /** Draws a part again: it changed. */
  redraw(part: ChatPart): void {
    this.flowOf()?.update(part);
    this.changed();
  }

  /** Hands `part` to the chat until the user answers: `write` keeps the answer, `unanswered` is what a reply ending gives. */
  protected wait<T extends object>(part: ChatRequestPart, unanswered: T, write: (answer: T) => void, flow = this.flowOf): Promise<T> {
    return new Promise<T>((resolve) => {
      const waiting: ChatWaiting = {
        part,
        answer: (value) => {
          if (value === null) {
            resolve(unanswered);
            return;
          }
          write(value as T);
          resolve(value as T);
        }
      };
      if (this.waits(waiting)) flow()?.focus(part);
    });
  }

  private add(part: ChatPart, open = false): void {
    this.endThinking();
    this.list().push(part);
    let time: Date | undefined;
    if (!this.timed && part.kind === 'text') {
      this.timed = true;
      time = this.time;
    }
    this.flowOf()?.add(part, open, time);
    this.changed();
  }

  private thought(): ChatThinkingPart {
    const last = this.last();
    if (last?.kind === 'thinking' && last.seconds === undefined) return last;
    const part: ChatThinkingPart = { kind: 'thinking', started: Date.now() };
    this.add(part);
    return part;
  }

  private last(): ChatPart | undefined {
    const parts = this.list();
    return parts[parts.length - 1];
  }
}

/**
 * A tool call being written, as `reply.tool()` returns it. While its arguments arrive, `progress()` says the file and
 * the bytes; `start()` gives what went in, `output()` adds what comes out, and `done()` or `fail()` ends it. A sub-agent
 * the call runs writes its own text and calls into it, as a reply does: they are drawn inside the call.
 */
export class ChatToolCall extends ChatWriter {
  constructor(readonly part: ChatToolPart, private readonly parent: ChatWriter) {
    super(
      () => (part.parts ??= []),
      () => parent.flowOf()?.innerOf(part) ?? null,
      parent.changed,
      () => parent.isOpen && (part.status === 'assembling' || part.status === 'running' || part.status === 'waiting'),
      parent.waits
    );
  }

  /**
   * Asks the user whether the call may run: it waits open, what goes in shown, with the choices under it ("Yes", `always`
   * when given, "No" with what to do instead). Then it runs, or is denied. When the reply ends first it resolves as `no`.
   */
  permission(options: { always?: string } = {}): Promise<ChatPermissionAnswer> {
    const p = this.part;
    const unanswered: ChatPermissionAnswer = { choice: 'no' };
    if (!this.parent.isOpen) return Promise.resolve(unanswered);
    const asked: ChatPermission = (p.permission = { always: options.always });
    p.status = 'waiting';
    this.parent.redraw(p);
    return this.wait(
      p,
      unanswered,
      (answer) => {
        asked.answer = answer;
        p.status = answer.choice === 'no' ? 'denied' : 'running';
        this.parent.redraw(p);
      },
      this.parent.flowOf
    );
  }

  /** While the arguments arrive: the file they name, and how many bytes came. */
  progress(file?: string, bytes?: number): void {
    if (file !== undefined) this.part.file = file;
    if (bytes !== undefined) this.part.bytes = bytes;
    this.parent.redraw(this.part);
  }

  /** The arguments are complete: what went in, and what the call does in a line. */
  start(input?: string, title?: string): void {
    const p = this.part;
    p.status = 'running';
    if (input !== undefined) p.input = input;
    if (title !== undefined) p.title = title;
    this.parent.redraw(p);
  }

  /** Adds to what came out. */
  output(delta: string): void {
    if (!delta) return;
    this.part.output = (this.part.output ?? '') + delta;
    this.parent.flowOf()?.append(this.part, delta);
    this.changed();
  }

  /** The call ended; `output`, when given, is all it returned. */
  done(output?: string): void {
    this.end('done', output);
  }

  /** The call failed; `error`, when given, is what it says. */
  fail(error?: string): void {
    this.end('error', error);
  }

  private end(status: 'done' | 'error', output?: string): void {
    this.endThinking();
    if (output !== undefined) this.part.output = output;
    this.part.status = status;
    this.parent.redraw(this.part);
  }
}
