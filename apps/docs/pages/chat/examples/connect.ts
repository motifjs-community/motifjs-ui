import type { ChatReply, ChatToolCall, ChatToolDensity, ChatToolLook } from '@motifx-community/ui';
import { ModelError, type Model, type ModelCall, type ModelMessage } from './model';

/** How many times a request that failed before anything came is sent, in all; the waits double from a second. */
const TRIES = 4;

/** A tool of the app: how its call reads in the chat, whether it asks first, and what it does. */
export interface AppTool {
  /** The name a person reads; by default the tool's name. */
  label?: string;
  look?: ChatToolLook;
  density?: ChatToolDensity;
  /** What a call does, in a line, from its arguments: a file, a command. */
  title?: (args: Record<string, unknown>) => string;
  /** The call has no row of its own: the tool draws into the reply itself (questions, a plan, the to-do list). */
  quiet?: boolean;
  /** Asks the user before it runs. A text is the choice that stops asking ("Yes, and allow npm test"). */
  ask?: boolean | string;
  /** Runs the call; what it returns goes back to the model. `call` is its row: write output there as it comes. */
  run(args: Record<string, unknown>, reply: ChatReply, call: ChatToolCall | null): Promise<string>;
}

/** A call while it is read and run. */
interface Running extends ModelCall {
  call: ChatToolCall | null;
}

/**
 * Connects a chat to a model: the conversation the model reads, the tools it may call, and one turn. The model's
 * stream goes into the reply as it comes; then the calls it made run (asking first where a tool says so), what they
 * returned goes back, and the model is asked again, until it answers without calling anything. A request the provider
 * refused for a while (`ModelError.retryable`) is tried again after a wait the chat counts down, when nothing of it had
 * come yet.
 *
 * @example
 * const agent = new Agent(model, tools);
 * <Chat ref={c => (chat = c)} onSend={e => void agent.answer(chat.reply(), e.text)} />
 */
export class Agent {
  /** What the model reads. Load it with the conversation's messages when a saved one opens. */
  readonly history: ModelMessage[] = [];
  /** `auto`: the tools that ask first run without asking (the composer's mode, see `onModeChanged`). */
  mode = 'ask';
  /** Tools the user allowed for the rest of the conversation. */
  private readonly allowed = new Set<string>();

  constructor(private readonly model: Model, private readonly tools: Record<string, AppTool>) {}

  /** Answers what the user sent, into `reply`. */
  async answer(reply: ChatReply, text: string): Promise<void> {
    this.history.push({ role: 'user', text });
    await this.run(reply);
  }

  /** Answers the user's last message again, into `reply` (the chat's `onRetry`): what the model said to it goes. */
  async again(reply: ChatReply): Promise<void> {
    this.history.splice(this.lastQuestion(0) + 1);
    await this.run(reply);
  }

  /** Forgets the user's last `questions` messages and what came after them, as the chat went back (`onRewind`). */
  rewind(questions: number): void {
    if (questions > 0) this.history.splice(Math.max(0, this.lastQuestion(questions - 1)));
  }

  /** Where the user's message is, `skip` of them back from the last; `-1` when there is none. */
  private lastQuestion(skip: number): number {
    for (let i = this.history.length - 1; i >= 0; i--) if (this.history[i].role === 'user' && skip-- === 0) return i;
    return -1;
  }

  private async run(reply: ChatReply): Promise<void> {
    try {
      for (let calls = await this.read(reply); calls.length; calls = await this.read(reply)) {
        for (const c of calls) this.history.push({ role: 'tool', id: c.id, result: await this.use(reply, c) });
      }
      reply.done();
    } catch (error) {
      // Stopped by the user: the chat already says so.
      if (!reply.signal.aborted) reply.fail(error as Error);
    }
  }

  /** One request, tried again while it fails before anything came and the provider says it may work later. */
  private async read(reply: ChatReply): Promise<Running[]> {
    for (let attempt = 1; ; attempt++) {
      const heard = { any: false };
      try {
        return await this.readOnce(reply, heard);
      } catch (error) {
        if (reply.signal.aborted || heard.any || attempt >= TRIES || !(error instanceof ModelError) || !error.retryable) throw error;
        const seconds = 2 ** (attempt - 1);
        reply.retrying(seconds, { attempt: attempt + 1, attempts: TRIES, reason: error.message });
        await this.wait(seconds * 1000, reply.signal);
      }
    }
  }

  /** One request: its events into the reply, and the calls it made. */
  private async readOnce(reply: ChatReply, heard: { any: boolean }): Promise<Running[]> {
    const calls = new Map<string, Running>();
    let said = '';
    reply.status('Thinking');
    for await (const e of this.model.stream(this.history, reply.signal)) {
      heard.any = true;
      switch (e.type) {
        case 'thinking':
          reply.thinking(e.delta);
          break;
        case 'text':
          said += e.delta;
          reply.text(e.delta);
          break;
        case 'tool-start': {
          const tool = this.tools[e.name];
          const call = tool?.quiet ? null : reply.tool({ id: e.id, name: e.name, label: tool?.label, look: tool?.look, density: tool?.density, status: 'assembling' });
          calls.set(e.id, { id: e.id, name: e.name, args: '', call });
          reply.status(tool?.label ?? e.name);
          break;
        }
        case 'tool-args': {
          const c = calls.get(e.id)!;
          c.args += e.delta;
          c.call?.progress(undefined, c.args.length);
          break;
        }
        case 'tool-end': {
          const c = calls.get(e.id)!;
          c.call?.start(c.args, this.tools[c.name]?.title?.(this.parse(c.args)));
          break;
        }
      }
    }
    const made = [...calls.values()];
    this.history.push({ role: 'assistant', text: said, calls: made.map(({ id, name, args }) => ({ id, name, args })) });
    return made;
  }

  /** Runs a call, asking first when its tool says so and the user has not allowed it for good. */
  private async use(reply: ChatReply, c: Running): Promise<string> {
    const tool = this.tools[c.name];
    if (!tool) {
      c.call?.fail(`No tool named ${c.name}`);
      return `There is no tool named ${c.name}.`;
    }
    if (tool.ask && c.call && this.mode !== 'auto' && !this.allowed.has(c.name)) {
      const said = await c.call.permission({ always: typeof tool.ask === 'string' ? tool.ask : undefined });
      if (said.choice === 'always') this.allowed.add(c.name);
      if (said.choice === 'no') return said.text ? `The user did not allow it, and said: ${said.text}` : 'The user did not allow it.';
    }
    reply.status(tool.label ?? c.name);
    try {
      const out = await tool.run(this.parse(c.args), reply, c.call);
      c.call?.done(out);
      return out;
    } catch (error) {
      if (reply.signal.aborted) throw error;
      const said = error instanceof Error ? error.message : String(error);
      // What the call wrote as it ran stays; the model reads it with the error.
      const out = c.call?.part.output;
      c.call?.fail(out ? undefined : said);
      return out ? `${out}\n${said}` : `Failed: ${said}`;
    }
  }

  private wait(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((done, fail) => {
      const timer = setTimeout(done, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        fail(signal.reason);
      }, { once: true });
    });
  }

  private parse(args: string): Record<string, unknown> {
    try {
      return JSON.parse(args || '{}') as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}
