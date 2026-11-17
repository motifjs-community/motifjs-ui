import type { ChatMessage, ChatPart, ChatPlanAnswer, ChatQuestion, ChatQuestionsAnswer, ChatTodoItem } from '@motifx-community/ui';
import { ModelError, type Model, type ModelEvent, type ModelMessage } from './model';

/** Waits, or rejects as soon as `signal` is aborted. */
export function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((done, fail) => {
    if (signal.aborted) {
      fail(signal.reason);
      return;
    }
    const timer = setTimeout(done, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      fail(signal.reason);
    }, { once: true });
  });
}

/** Writes `text` a few characters at a time, as a model streams. */
export async function typed(write: (delta: string) => void, text: string, signal: AbortSignal): Promise<void> {
  for (let at = 0; at < text.length; ) {
    const piece = text.slice(at, at + 2 + Math.floor(Math.random() * 6));
    at += piece.length;
    write(piece);
    await pause(22, signal);
  }
}

const QUESTIONS: ChatQuestion[] = [
  {
    text: 'When should the call run?',
    header: 'Timing',
    options: [
      { label: 'After the last call', description: 'Waits until the calls stop', preview: '```\ncalls x xx   x\nruns     ●    ●\n```' },
      { label: 'On the first call', description: 'Runs at once, then waits', preview: '```\ncalls x xx   x\nruns  ●      ●\n```' }
    ]
  },
  { text: 'Anything else to add?', header: 'Extras', multiple: true, options: [{ label: 'A cancel() method' }, { label: 'A test for many calls' }] }
];

const TASKS = ['Read the debounce helper', 'Run its tests', 'Fix the failing case'];

const ANSWER = `Fixed. The returned function started a new timer on every call **without clearing the old one**, so each call ran:

\`\`\`ts
return () => {
  clearTimeout(timer);
  timer = setTimeout(run, wait);
};
\`\`\`

| Test | Before | After |
|:-----|:------:|:-----:|
| runs once after the wait | ✓ | ✓ |
| runs once for many calls | × | ✓ |

The two other callers (\`search.ts\`, \`resize.ts\`) need no change.[^1]`;

const NOTE = '[^1]: Both already wait for the last call: `search.ts` through its own timer, `resize.ts` through `requestAnimationFrame`.';

/** The to-do list with `done` tasks done and the next one under way. */
function tasks(done: number): ChatTodoItem[] {
  return TASKS.map((text, i) => ({ text, status: i < done ? 'done' : i === done ? 'active' : 'pending' }));
}

/**
 * Stands in for your model: a scripted agent that answers anything the same way, one step a request, reading what its
 * calls returned. It asks two questions, shows a plan, keeps a to-do list, reads a file, runs the tests (one fails),
 * edits the file (its arguments arrive in pieces), sends a sub-agent to look around, and answers. What the user says to
 * the questions, the plan and the permission changes what it does. Its very first request is refused as busy once,
 * as a provider does at times: the agent tries it again.
 */
export class FakeModel implements Model {
  private calls = 0;
  private refused = false;

  async *stream(history: readonly ModelMessage[], signal: AbortSignal): AsyncIterable<ModelEvent> {
    if (!this.refused) {
      this.refused = true;
      await pause(300, signal);
      throw new ModelError('Overloaded', true);
    }
    // This turn: from the user's last message on.
    let start = history.length - 1;
    while (start > 0 && history[start].role !== 'user') start--;
    const turn = history.slice(start);
    const names = new Map<string, string>();
    const results = new Map<string, string>();
    for (const m of turn) {
      if (m.role === 'assistant') for (const c of m.calls) names.set(c.id, c.name);
      else if (m.role === 'tool') results.set(names.get(m.id) ?? '', m.result);
    }
    const asked = results.get('ask_user');
    const answers = asked ? (JSON.parse(asked) as ChatQuestionsAnswer) : null;
    const timing = ((!answers?.declined && answers?.answers.find((a) => a.id === '1')?.values[0]) || 'After the last call').toLowerCase();
    switch (turn.filter((m) => m.role === 'assistant').length) {
      case 0: {
        const question = turn[0].role === 'user' ? turn[0].text : '';
        yield* this.say('thinking', `The question: "${question}". Before I start I need to know how the helper should behave.`, signal);
        await pause(400, signal);
        yield* this.call('ask_user', { questions: QUESTIONS }, signal);
        return;
      }
      case 1:
        yield* this.call('plan', { plan: `1. Read \`src/debounce.ts\`\n2. Run its tests to see what fails\n3. Make it run **${timing}**\n4. Check the other callers` }, signal);
        return;
      case 2: {
        const plan = JSON.parse(results.get('plan') ?? '{}') as ChatPlanAnswer;
        if (plan.choice === 'no') {
          yield* this.say('text', plan.text ? `All right, I will plan again with that in mind: *${plan.text}*.` : 'All right: tell me what to change in the plan.', signal);
          return;
        }
        yield* this.call('todo', { items: tasks(0) }, signal);
        return;
      }
      case 3:
        yield* this.call('Read', { path: 'src/debounce.ts' }, signal);
        return;
      case 4:
        yield* this.call('todo', { items: tasks(1) }, signal);
        return;
      case 5:
        yield* this.call('Bash', { command: 'npm test -- debounce', description: 'Run the tests' }, signal);
        return;
      case 6: {
        const ran = results.get('Bash') ?? '';
        if (ran.startsWith('The user did not allow it')) {
          yield* this.say('text', 'I did not run the tests. What should I do instead?', signal);
          return;
        }
        yield* this.say('thinking', 'The returned function starts a new timer on every call and never clears the old one.', signal);
        yield* this.call('Edit', { path: 'src/debounce.ts', old: '    timer = setTimeout(run, wait);', new: '    clearTimeout(timer);\n    timer = setTimeout(run, wait);' }, signal, 4);
        return;
      }
      case 7:
        yield* this.call('Task', { description: 'Look for other callers' }, signal);
        return;
      case 8:
        yield* this.call('todo', { items: tasks(3) }, signal);
        return;
      default:
        yield* this.say('text', `${ANSWER}\n\nIt now runs ${timing}.\n\n${NOTE}`, signal);
    }
  }

  private async *say(type: 'thinking' | 'text', text: string, signal: AbortSignal): AsyncIterable<ModelEvent> {
    for (let at = 0; at < text.length; ) {
      const delta = text.slice(at, at + 2 + Math.floor(Math.random() * 6));
      at += delta.length;
      yield { type, delta };
      await pause(22, signal);
    }
  }

  /** A call, its arguments in `pieces` that take a while each, as a long argument arrives. */
  private async *call(name: string, args: unknown, signal: AbortSignal, pieces = 1): AsyncIterable<ModelEvent> {
    const id = `call-${++this.calls}`;
    yield { type: 'tool-start', id, name };
    const json = JSON.stringify(args);
    const size = Math.ceil(json.length / pieces);
    for (let at = 0; at < json.length; at += size) {
      yield { type: 'tool-args', id, delta: json.slice(at, at + size) };
      if (pieces > 1) await pause(350, signal);
    }
    yield { type: 'tool-end', id };
  }
}

const TOPICS = ['the router', 'the date box', 'a flaky test', 'the build', 'the grid filter', 'dark mode', 'the release notes', 'a slow page'];

/** One turn of an earlier conversation, as a server would return it. */
function turn(n: number, at: Date): ChatMessage[] {
  const topic = TOPICS[n % TOPICS.length];
  const parts: ChatPart[] = [{ kind: 'thinking', seconds: 1 + (n % 5), notes: [`Looking at ${topic}`] }];
  if (n % 2 === 0) parts.push({ kind: 'tool', id: `t${n}`, name: 'Read', title: `src/${topic.replace(/\s/g, '-')}.ts`, status: 'done', density: 'line', input: 'src/…', output: '…' });
  if (n % 5 === 0) {
    parts.push({
      kind: 'questions',
      id: `q${n}`,
      questions: [{ id: '1', text: 'Which file should I start with?', options: [{ label: 'The view' }, { label: 'The model' }] }],
      answer: { declined: false, answers: [{ id: '1', values: ['The model'] }] }
    });
  }
  if (n % 3 === 0) {
    parts.push({
      kind: 'tool',
      id: `b${n}`,
      name: 'Bash',
      title: 'Run the tests',
      status: 'done',
      look: 'terminal',
      input: 'npm test',
      output: ' ✓ 42 passed\n Tests  42 passed (42)',
      permission: { answer: { choice: 'yes' } }
    });
  }
  parts.push({ kind: 'text', text: `Turn ${n}: looked at **${topic}**.${n % 4 === 0 ? `\n\n- checked the cause\n- wrote the fix\n- ran the tests\n\n\`\`\`ts\nexport const answer${n} = ${n};\n\`\`\`` : ' It is fine as it is.'}` });
  return [
    { id: `q${n}`, role: 'user', time: at, parts: [{ kind: 'text', text: `Can you check ${topic}? (${n})` }] },
    { id: `a${n}`, role: 'assistant', time: new Date(at.getTime() + 20_000), parts }
  ];
}

let first = 0;

/** The last `count` turns of a long conversation: the chat opens at its end. */
export function history(count: number): ChatMessage[] {
  const start = Date.now() - count * 120_000;
  first = 1000;
  const messages: ChatMessage[] = [];
  for (let i = 0; i < count; i++) messages.push(...turn(first + i, new Date(start + i * 120_000)));
  return messages;
}

/** The page of turns before the first one shown. */
export function olderPage(): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const start = Date.now() - (first + 20) * 120_000;
  for (let i = 20; i > 0; i--) messages.push(...turn(first - i, new Date(start + (20 - i) * 120_000)));
  first -= 20;
  return messages;
}
