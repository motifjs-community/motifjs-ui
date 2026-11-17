import type { ChatFlowView } from './chat-flow-view';
import type { ChatMessage } from './chat-message';
import type { ChatMessageStatus } from './chat-message-status';
import type { ChatPart } from './chat-part';
import type { ChatWaiting } from './chat-request';
import { ChatWriter } from './ChatWriter';

/** What a reply asks of its chat. */
export interface ChatReplyHost {
  /** The flow `message` is drawn in, while its turn is on the page. */
  flowOf(message: ChatMessage): ChatFlowView | null;
  /** `message` was written: the chat keeps the view at the end, or the height of its turn. */
  changed(message: ChatMessage): void;
  /** What the model is doing now, for the line under the conversation. */
  status(reply: ChatReply, text: string): void;
  /** A request of the reply waits for the user; `true` when its choices take the focus. */
  wait(reply: ChatReply, waiting: ChatWaiting): boolean;
  /** The reply ended: what still waits is answered with `null`. */
  ended(reply: ChatReply): void;
}

/**
 * A reply being written, as `Chat.reply()` returns it: its text, thinking, tool calls, to-do list and notices, in the
 * order they happen. Each call writes the message object first, and draws at once while its turn is on the page; a
 * turn drawn later is drawn from the message. `signal` is aborted when the user stops the reply or the chat goes: give
 * it to the request.
 *
 * @example
 * const reply = chat.reply();
 * for await (const event of this.model.ask(text, reply.signal)) {
 *   if (event.type === 'thinking') reply.thinking(event.delta);
 *   else if (event.type === 'text') reply.text(event.delta);
 * }
 * reply.done();
 */
export class ChatReply extends ChatWriter {
  constructor(
    readonly message: ChatMessage,
    private readonly host: ChatReplyHost,
    /** The chat's: it aborts it too when it is disposed. */
    private readonly controller: AbortController
  ) {
    super(
      () => message.parts,
      () => host.flowOf(message),
      () => host.changed(message),
      () => message.status === 'streaming',
      (waiting) => host.wait(this, waiting),
      message.time
    );
  }

  /** Aborted when the reply is stopped (the stop button, Escape, `stop()`) or the chat is disposed. */
  get signal(): AbortSignal {
    return this.controller.signal;
  }

  /** What the model is doing now, in a word or two ("Reading files"): the line under the conversation says it. */
  status(text: string): void {
    if (this.isOpen) this.host.status(this, text);
  }

  /** The reply is complete. */
  done(): void {
    this.finish('done');
  }

  /** Stops the reply where it is: `signal` is aborted, and the flow says it stopped. */
  stop(): void {
    if (!this.isOpen) return;
    this.controller.abort();
    this.notice('stopped');
    this.finish('stopped');
  }

  /** The reply failed: the flow says `error`, or the kit's text. */
  fail(error?: string | Error): void {
    if (!this.isOpen) return;
    const said = typeof error === 'string' ? error : error?.message;
    if (said) this.message.error = said;
    this.notice('error', said);
    this.finish('error');
  }

  private finish(status: ChatMessageStatus): void {
    if (!this.isOpen) return;
    this.endThinking();
    this.message.status = status;
    if (status !== 'done') this.cut(this.message.parts);
    const flow = this.flowOf();
    flow?.close();
    // What waited for the user, and calls cut short, are drawn as they ended.
    flow?.refresh();
    this.host.changed(this.message);
    this.host.ended(this);
  }

  /** The reply stopped or failed: a call that had not ended failed with it, a sub-agent's calls too. */
  private cut(parts: ChatPart[]): void {
    for (const p of parts) {
      if (p.kind !== 'tool') continue;
      if (p.status === 'assembling' || p.status === 'running' || p.status === 'waiting') p.status = 'error';
      if (p.parts) this.cut(p.parts);
    }
  }
}
