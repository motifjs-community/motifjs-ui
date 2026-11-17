import type { ChatQuestion, ChatTodoItem } from '@motifx-community/ui';
import type { AppTool } from './connect';
import { pause, typed } from './fake-model';

const SOURCE = `export function debounce(run: () => void, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    timer = setTimeout(run, wait);
  };
}`;

const TESTS = ['> vitest run debounce', '', ' ✓ runs once after the wait', ' ✓ uses the last call', ' × runs once for many calls', '   expected 1 call, got 3', '', ' Tests  1 failed | 2 passed (3)'];

const DIFF = `   return () => {
+    clearTimeout(timer);
     timer = setTimeout(run, wait);
   };`;

/**
 * The demo's tools. Asking the user, the plan and the to-do list are tools of the model that draw into the reply; the
 * others stand in for reading a file, running a command, editing and a sub-agent, and take a while as real ones do.
 */
export const tools: Record<string, AppTool> = {
  ask_user: {
    quiet: true,
    run: async (args, reply) => JSON.stringify(await reply.questions(args.questions as ChatQuestion[]))
  },
  plan: {
    quiet: true,
    run: async (args, reply) => JSON.stringify(await reply.plan(String(args.plan)))
  },
  todo: {
    quiet: true,
    run: async (args, reply) => {
      reply.todo(args.items as ChatTodoItem[]);
      return 'Saved.';
    }
  },
  Read: {
    density: 'line',
    title: (args) => String(args.path),
    run: async (_, reply) => {
      await pause(500, reply.signal);
      return SOURCE;
    }
  },
  Bash: {
    look: 'terminal',
    ask: 'Yes, and allow npm test from now on',
    title: (args) => String(args.description ?? args.command),
    run: async (_, reply, call) => {
      for (const line of TESTS) {
        call?.output(`${line}\n`);
        await pause(140, reply.signal);
      }
      throw new Error('Exit code 1');
    }
  },
  Edit: {
    look: 'diff',
    title: (args) => String(args.path),
    run: async (_, reply) => {
      await pause(300, reply.signal);
      return DIFF;
    }
  },
  Task: {
    label: 'Agent',
    title: (args) => String(args.description),
    // A real sub-agent is a model loop of its own, writing into `call` as the agent writes into the reply.
    run: async (_, reply, call) => {
      if (!call) return '';
      await typed((d) => call.text(d), 'Searching for other uses of `debounce`…', reply.signal);
      const grep = call.tool({ name: 'Grep', title: 'debounce(', input: 'debounce\\(', density: 'line' });
      await pause(500, reply.signal);
      grep.done('src/search.ts:12\nsrc/resize.ts:4');
      await typed((d) => call.text(d), ' Two callers; both pass a function and a wait, so nothing else changes.', reply.signal);
      return 'Two callers, no change needed.';
    }
  }
};
