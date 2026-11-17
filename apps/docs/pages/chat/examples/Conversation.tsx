import { Chat } from '@motifx-community/ui';
import { Agent } from './connect';
import { tools } from './demo-tools';
import { FakeModel, history, olderPage } from './fake-model';

const MODES = [
  { value: 'ask', label: 'Ask before edits' },
  { value: 'auto', label: 'Edit automatically' },
  { value: 'plan', label: 'Plan mode', description: 'Reads, then plans' }
];

const COMMANDS = [
  { name: 'review', description: 'Review the changes' },
  { name: 'compact', description: 'Sum up the conversation so far' },
  { name: 'clear', description: 'Start a new conversation' }
];

const FILES = ['src/debounce.ts', 'src/debounce.test.ts', 'src/search.ts', 'src/resize.ts', 'README.md'];

const MODELS = [
  { value: 'large', label: 'Large', description: 'The most capable' },
  { value: 'small', label: 'Small', description: 'The fastest' }
];

/**
 * A long conversation that opens at its end, and an agent connected the way a real one is (`connect.ts`), to a model
 * that stands in for yours: send anything and it asks two questions, shows a plan, keeps a to-do list, reads a file,
 * asks before running the tests (one fails), edits the file, sends a sub-agent and answers. Send again while it works:
 * the message waits above the box. Escape stops it. Scroll up for older turns. In the box: files to attach (the button,
 * paste or drop), the open file as context, `/` for commands, `@` for files; under it the mode (Shift+Tab; "Edit
 * automatically" runs the tests without asking), the model and its thinking, and how full the context is. Hover a
 * question to copy it, edit and send it again, go back to it, or start a new conversation from it; `/compact` sums the
 * conversation up. The model's first request is refused as busy once: the agent counts down and tries again.
 */
export default function Conversation() {
  let chat!: Chat;
  let pages = 0;
  let agent = new Agent(new FakeModel(), tools);
  return (
    <Chat
      ref={(c: Chat) => (chat = c)}
      style="block-size: 36rem"
      messages={history(200)}
      hasOlder
      composer={{
        attachments: true,
        contextItems: [{ label: 'debounce.ts', data: 'src/debounce.ts' }],
        commands: COMMANDS,
        onMention: (e) => (e.items = FILES.filter((f) => f.includes(e.query)).map((f) => ({ label: f.split('/').pop()!, value: f, description: f }))),
        modes: MODES,
        onModeChanged: (e) => (agent.mode = e.value),
        models: MODELS,
        thinking: true,
        usage: 0.18
      }}
      onRewind={(e) => agent.rewind(e.removed.filter((m) => m.role === 'user').length)}
      onFork={(e) => {
        // Another conversation from that question: its messages before it, the question back in the box.
        const said = e.message.parts.map((p) => (p.kind === 'text' ? p.text : '')).join('');
        agent = new Agent(new FakeModel(), tools);
        agent.mode = chat.composer.mode;
        chat.messages = e.messages.slice();
        chat.composer.value = said;
      }}
      onRetry={() => void agent.again(chat.reply())}
      onSend={(e) => {
        if (e.text.trim() === '/compact') {
          const reply = chat.reply();
          reply.compaction('So far: the debounce helper started a new timer on every call; it now clears the old one first. Its two callers need no change.');
          reply.done();
          // A real app asks its model for the summary, and the model's history starts again from it.
          agent.history.length = 0;
          return;
        }
        // A real app sends the files and the context to its model too; this one only names them.
        const named = [...e.contextItems.map((c) => String(c.data)), ...e.attachments.map((f) => f.name)];
        const said = named.length ? `${e.text} (${named.join(', ')})` : e.text;
        void agent.answer(chat.reply(), said).then(() => (chat.composer.usage = Math.min(0.97, chat.composer.usage! + 0.21)));
      }}
      onLoadOlder={(e) => {
        e.promise = new Promise((done) => setTimeout(done, 600)).then(() => {
          chat.prepend(olderPage());
          if (++pages === 3) e.release(true);
        });
      }}
    />
  );
}
