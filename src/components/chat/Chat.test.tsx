import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, settled, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Chat } from './Chat';
import type { ChatContextItem } from './chat-context-item';
import type { ChatMention } from './chat-mention';
import type { ChatLoadOlderEventArgs } from './chat-load-older-event-args';
import type { ChatLook } from './chat-look';
import type { ChatMessage } from './chat-message';
import type { ChatProps } from './chat-props';
import { ChatTurnView } from './chat-turn-view';

const hosts: Component[] = [];

afterEach(async () => {
  vi.useRealTimers();
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
  uiLocale.strings = enStrings;
});

function chatOf(props: ChatProps = {}): Chat {
  const chat = new Chat(props);
  hosts.push(mountHost(chat));
  return chat;
}

const say = (role: ChatMessage['role'], text: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({ id: `${role}-${text}`, role, parts: [{ kind: 'text', text }], ...extra });
const $ = (chat: Component, selector: string) => chat.element.querySelector(selector) as HTMLElement | null;
const $$ = (chat: Component, selector: string) => Array.from(chat.element.querySelectorAll(selector)) as HTMLElement[];
const shown = (el: HTMLElement | null) => !!el && el.isConnected && el.style.display !== 'none' && !el.hidden;
const kinds = (chat: Component) => $$(chat, '.mx-chat__flow > .mx-chat__entry').filter(shown).map((e) => e.dataset.kind);
const area = (chat: Chat) => $(chat, 'textarea') as HTMLTextAreaElement;
const look: ChatLook = {
  highlighter: null,
  linkTarget: '_blank',
  time: () => '10:00',
  answer: () => {},
  ask: () => {},
  rewind: () => {},
  resend: () => {},
  fork: null,
  retry: null,
  isLatest: () => true
};

function type(chat: Chat, text: string) {
  area(chat).value = text;
  area(chat).dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function press(chat: Chat, key: string, init: KeyboardEventInit = {}) {
  area(chat).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
}

/** Gives the conversation's view a size: jsdom lays nothing out. */
function sized(chat: Chat, content: number, client: number, top: number) {
  const view = $(chat, '.mx-chat__scroller')!;
  Object.defineProperty(view, 'scrollHeight', { configurable: true, get: () => content });
  Object.defineProperty(view, 'clientHeight', { configurable: true, get: () => client });
  Object.defineProperty(view, 'scrollTop', { configurable: true, get: () => top, set: () => {} });
  view.dispatchEvent(new Event('scroll'));
}

describe('Chat: turns', () => {
  it('draws a turn as the question in its box and what the model did, each part with its dot', async () => {
    const chat = chatOf({
      messages: [
        say('user', 'Fix *the* bug', { time: new Date(2026, 10, 15, 9, 5) }),
        {
          id: 'a',
          role: 'assistant',
          parts: [
            { kind: 'thinking', text: 'Looking', seconds: 2 },
            { kind: 'tool', id: 't', name: 'Bash', title: 'Run the tests', status: 'done', input: 'npm test', output: '12 passed' },
            { kind: 'todo', items: [{ text: 'Read', status: 'done' }, { text: 'Fix', status: 'active' }] },
            { kind: 'text', text: 'Done: **fixed**.' }
          ]
        }
      ]
    });
    await tick();
    // What was typed shows as typed: not markdown.
    expect($(chat, '.mx-chat__bubble')?.textContent).toBe('Fix *the* bug');
    expect($(chat, '.mx-chat__question .mx-chat__time')?.textContent).toMatch(/9:05|09:05/);
    expect(kinds(chat)).toEqual(['thinking', 'tool', 'todo', 'text']);
    expect($(chat, '.mx-chat__thinking-label')?.textContent).toBe('Thought for 2s');
    expect($(chat, '.mx-chat__tool-name')?.textContent).toBe('Bash');
    expect($(chat, '.mx-chat__tool-title')?.textContent).toBe('Run the tests');
    expect($$(chat, '.mx-chat__tool-label').map((l) => l.textContent)).toEqual(['IN', 'OUT']);
    expect($(chat, '.mx-chat__entry[data-kind="tool"]')?.dataset.status).toBe('done');
    expect($$(chat, '.mx-chat__todo-item').map((i) => i.dataset.status)).toEqual(['done', 'active']);
    expect($(chat, '.mx-chat__text strong')?.textContent).toBe('fixed');
  });

  it('starts a turn at each question; a message of the model joins the turn before it', async () => {
    const chat = chatOf({ messages: [say('assistant', 'Welcome'), say('user', 'One'), say('assistant', 'A'), say('assistant', 'B'), say('user', 'Two')] });
    await tick();
    const turns = $$(chat, '.mx-chat__turn');
    expect(turns.length).toBe(3);
    expect(turns.map((t) => t.querySelector('.mx-chat__bubble')?.textContent ?? null)).toEqual([null, 'One', 'Two']);
    expect(turns[1].querySelectorAll('.mx-chat__entry').length).toBe(2);
  });

  it('opens hidden, and shows once the turns at the end are placed and the view has a size', async () => {
    const chat = chatOf({ messages: [say('user', 'Hi')] });
    await tick();
    expect(chat.element.hasAttribute('data-opening')).toBe(true);
    sized(chat, 1000, 300, 700);
    for (let i = 0; i < 6; i++) await tick();
    expect(chat.element.hasAttribute('data-opening')).toBe(false);
  });

  it('shows the first lines of a long question, and a button for the rest', async () => {
    const chat = chatOf({ messages: [say('user', 'a\nb\nc\nd\ne\nf')] });
    await tick();
    const question = $(chat, '.mx-chat__question')!;
    expect(question.hasAttribute('data-long')).toBe(true);
    const more = $(chat, '.mx-chat__more')!;
    expect(more.textContent).toBe(enStrings.chatShowMore);
    more.click();
    expect(question.hasAttribute('data-expanded')).toBe(true);
    expect(more.textContent).toBe(enStrings.chatShowLess);
  });
});

describe('Chat: replies', () => {
  it('streams text into one markdown, as it comes, and ends it when the reply is done', () => {
    const chat = chatOf();
    chat.send('Hi');
    const reply = chat.reply();
    expect(chat.isBusy).toBe(true);
    expect(shown($(chat, '.mx-chat__status'))).toBe(true);
    reply.text('Hello **wor');
    expect($(chat, '.mx-chat__text')?.textContent).toContain('Hello');
    reply.text('ld**');
    // The closing marks wait at the end as text until the text says what they are.
    expect($(chat, '.mx-chat__text strong')?.textContent).toBe('world**');
    expect($$(chat, '.mx-chat__text').length).toBe(1);
    reply.done();
    expect($(chat, '.mx-chat__text strong')?.textContent).toBe('world');
    expect(reply.message.status).toBe('done');
    expect(chat.isBusy).toBe(false);
    expect(shown($(chat, '.mx-chat__status'))).toBe(false);
    expect(reply.message.parts).toEqual([{ kind: 'text', text: 'Hello **world**' }]);
  });

  it('draws thinking while it runs, and ends it with its seconds when anything else is written', () => {
    vi.useFakeTimers();
    const chat = chatOf();
    chat.send('Why?');
    const reply = chat.reply();
    reply.thinking('Let me ');
    reply.note('Reading the code');
    vi.advanceTimersByTime(2400);
    expect($(chat, '.mx-chat__thinking-label')?.textContent).toBe('Thinking 2s');
    expect($(chat, '.mx-chat__thinking-note')?.textContent).toBe('Reading the code');
    reply.text('Because.');
    expect($(chat, '.mx-chat__thinking-label')?.textContent).toBe('Thought for 2s');
    expect(shown($(chat, '.mx-chat__thinking-note'))).toBe(false);
    const head = $(chat, '.mx-chat__thinking-head')!;
    expect(head.getAttribute('aria-expanded')).toBe('false');
    head.click();
    expect(head.getAttribute('aria-expanded')).toBe('true');
    expect($(chat, '.mx-chat__thinking-text')?.textContent).toContain('Let me');
  });

  it('draws nothing for thinking with nothing written that ended within a second', () => {
    const chat = chatOf();
    chat.send('Quick');
    const reply = chat.reply();
    reply.thinking();
    reply.text('Sure.');
    expect(kinds(chat)).toEqual(['text']);
  });

  it('draws a tool call from its first sign: assembling, then what went in and came out, then its end', () => {
    const chat = chatOf();
    chat.send('Write it');
    const reply = chat.reply();
    const call = reply.tool({ name: 'write_file', label: 'Write', status: 'assembling' });
    call.progress('poem.txt', 3 * 1024);
    const row = $(chat, '.mx-chat__entry[data-kind="tool"]')!;
    expect(row.dataset.status).toBe('assembling');
    expect($(chat, '.mx-chat__tool-name')?.textContent).toBe('Write');
    expect($(chat, '.mx-chat__tool-wait')?.textContent).toBe('poem.txt › 3 KB');
    call.start('{"path":"poem.txt"}', 'poem.txt');
    expect(row.dataset.status).toBe('running');
    expect($(chat, '.mx-chat__tool-side[data-side="in"] .mx-chat__tool-code')?.textContent).toBe('{"path":"poem.txt"}');
    call.output('wrote ');
    call.output('3 KB');
    expect($(chat, '.mx-chat__tool-side[data-side="out"] .mx-chat__tool-code')?.textContent).toBe('wrote 3 KB');
    call.done();
    expect(row.dataset.status).toBe('done');
    expect(reply.message.parts[0]).toMatchObject({ kind: 'tool', status: 'done', input: '{"path":"poem.txt"}', output: 'wrote 3 KB' });
  });

  it('opens a tool call by its density: a line opens on a click, a failed one opens by itself', () => {
    const chat = chatOf();
    chat.send('Go');
    const reply = chat.reply();
    const quiet = reply.tool({ name: 'current_time', density: 'line', input: '{}' });
    quiet.done('10:00');
    const rows = $$(chat, '.mx-chat__entry[data-kind="tool"]');
    const box = () => rows[0].querySelector('.mx-chat__tool-box') as HTMLElement | null;
    expect(shown(box())).toBe(false);
    (rows[0].querySelector('.mx-chat__tool-head') as HTMLElement).click();
    expect(shown(box())).toBe(true);
    const failing = reply.tool({ name: 'current_time', density: 'line', input: '{}' });
    failing.fail('No clock');
    const failed = $$(chat, '.mx-chat__entry[data-kind="tool"]')[1];
    expect(failed.dataset.status).toBe('error');
    expect(shown(failed.querySelector('.mx-chat__tool-box') as HTMLElement)).toBe(true);
  });

  it('draws a diff line by line and counts what was added and removed', () => {
    const chat = chatOf();
    chat.send('Edit');
    const call = chat.reply().tool({ name: 'Edit', look: 'diff', title: 'a.ts' });
    call.done(' same\n-old\n+new\n+more');
    expect($$(chat, '.mx-chat__diff-line').map((l) => l.dataset.line)).toEqual(['same', 'removed', 'added', 'added']);
    expect($(chat, '.mx-chat__tool-wait')?.textContent).toBe('+2 −1');
  });

  it('draws what a sub-agent writes inside its call', () => {
    const chat = chatOf();
    chat.send('Look around');
    const reply = chat.reply();
    const agent = reply.tool({ name: 'Task', title: 'Explore the code' });
    agent.text('Found it.');
    agent.tool({ name: 'Read', title: 'a.ts' }).done('…');
    agent.done('Summary');
    const inner = $(chat, '.mx-chat__entry[data-kind="tool"] .mx-chat__flow')!;
    expect(Array.from(inner.children).map((e) => (e as HTMLElement).dataset.kind)).toEqual(['text', 'tool']);
    expect((reply.message.parts[0] as { parts: unknown[] }).parts.length).toBe(2);
  });

  it('changes the to-do list in place when it is written again right after', () => {
    const chat = chatOf();
    chat.send('Plan');
    const reply = chat.reply();
    reply.todo([{ text: 'One', status: 'active' }, { text: 'Two', status: 'pending' }]);
    const first = $(chat, '.mx-chat__todo-item')!;
    reply.todo([{ text: 'One', status: 'done' }, { text: 'Two', status: 'active' }]);
    expect($$(chat, '.mx-chat__entry[data-kind="todo"]').length).toBe(1);
    expect($(chat, '.mx-chat__todo-item')).toBe(first);
    expect(first.dataset.status).toBe('done');
  });

  it('stops a reply with Escape: its signal is aborted and the flow says it stopped', () => {
    const onStop = vi.fn();
    const chat = chatOf({ onStop });
    chat.send('Long one');
    const reply = chat.reply();
    reply.text('Partial');
    press(chat, 'Escape');
    expect(reply.signal.aborted).toBe(true);
    expect(reply.message.status).toBe('stopped');
    expect($(chat, '.mx-chat__notice')?.textContent).toBe(enStrings.chatStopped);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('says a failed reply in the flow, as an alert', () => {
    const chat = chatOf();
    chat.send('Hi');
    chat.reply().fail('Rate limited');
    const notice = $(chat, '.mx-chat__notice')!;
    expect(notice.textContent).toBe('Rate limited');
    expect(notice.getAttribute('role')).toBe('alert');
  });

  it('queues what is sent while a reply is written, and sends it when the reply ends', () => {
    const sent: string[] = [];
    const chat = chatOf({ onSend: (e) => sent.push(e.text) });
    type(chat, 'First');
    press(chat, 'Enter');
    const reply = chat.reply();
    expect(area(chat).placeholder).toBe(enStrings.chatQueuePlaceholder);
    type(chat, 'Second');
    press(chat, 'Enter');
    expect(sent).toEqual(['First']);
    expect(chat.queuedTexts).toEqual(['Second']);
    expect($(chat, '.mx-chat__queued-text')?.textContent).toBe('Second');
    reply.done();
    expect(sent).toEqual(['First', 'Second']);
    expect(chat.queuedTexts).toEqual([]);
  });

  it('aborts the requests of open replies when it goes', async () => {
    const chat = chatOf();
    chat.send('Hi');
    const reply = chat.reply();
    await hosts[0].dispose();
    expect(reply.signal.aborted).toBe(true);
  });
});

describe('Chat: requests', () => {
  const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
  const choices = (chat: Chat) => $$(chat, '.mx-chat__choice');
  const answerOf = (chat: Chat) => $(chat, '.mx-chat__answer')?.textContent;

  it('asks before a tool call runs: it waits open, the number key takes a choice, then it runs', async () => {
    const chat = chatOf();
    chat.send('Test it');
    const reply = chat.reply();
    const call = reply.tool({ name: 'Bash', input: 'npm test' });
    const asked = call.permission({ always: 'Yes, and allow npm commands' });
    const row = $(chat, '.mx-chat__entry[data-kind="tool"]')!;
    expect(row.dataset.status).toBe('waiting');
    expect(row.dataset.density).toBe('full');
    // What went in shows; nothing came out yet, so that side is not there.
    expect(shown(row.querySelector('.mx-chat__tool-side[data-side="in"]'))).toBe(true);
    expect(shown(row.querySelector('.mx-chat__tool-side[data-side="out"]'))).toBe(false);
    expect($(chat, '.mx-chat__choices-title')?.textContent).toBe('Allow Bash to run?');
    expect(choices(chat).map((c) => c.textContent)).toEqual(['1Yes', '2Yes, and allow npm commands', `3${enStrings.chatDeny}`]);
    expect($(chat, '.mx-chat__status-text')?.textContent).toBe(enStrings.chatWaitingYou);
    choices(chat)[0].focus();
    key(choices(chat)[0], '2');
    await expect(asked).resolves.toEqual({ choice: 'always', text: undefined });
    expect(row.dataset.status).toBe('running');
    expect(choices(chat)).toEqual([]);
    expect(answerOf(chat)).toBe(enStrings.chatAllowedAlways);
    expect(call.part.permission).toMatchObject({ answer: { choice: 'always' } });
    expect(chat.isWaiting).toBe(false);
  });

  it('denies with what to do instead, written in the box under the choice', async () => {
    const chat = chatOf();
    chat.send('Publish');
    const call = chat.reply().tool({ name: 'Bash', input: 'npm publish' });
    const asked = call.permission();
    expect(choices(chat).length).toBe(2);
    choices(chat)[1].click();
    const input = $(chat, '.mx-chat__choice-box input') as HTMLInputElement;
    input.value = 'Run the tests first';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    key(input, 'Enter');
    await expect(asked).resolves.toEqual({ choice: 'no', text: 'Run the tests first' });
    expect($(chat, '.mx-chat__entry[data-kind="tool"]')?.dataset.status).toBe('denied');
    expect(answerOf(chat)).toBe(`${enStrings.chatDenied}: Run the tests first`);
  });

  it('takes the focus to the choices when the composer had it and was empty', () => {
    const chat = chatOf();
    chat.send('Go');
    area(chat).focus();
    void chat.reply().tool({ name: 'Bash' }).permission();
    expect(document.activeElement).toBe(choices(chat)[0]);
  });

  it('leaves a request unanswered when the reply stops: it resolves as no, and the call failed with the reply', async () => {
    const chat = chatOf();
    chat.send('Go');
    const reply = chat.reply();
    const asked = reply.tool({ name: 'Bash' }).permission();
    reply.stop();
    await expect(asked).resolves.toEqual({ choice: 'no' });
    expect($(chat, '.mx-chat__entry[data-kind="tool"]')?.dataset.status).toBe('error');
    expect(choices(chat)).toEqual([]);
    expect(answerOf(chat)).toBe(enStrings.chatUnanswered);
  });

  it('shows a plan and asks to go on; "keep planning" takes what to change', async () => {
    const chat = chatOf();
    chat.send('Plan it');
    const reply = chat.reply();
    const first = reply.plan('1. Read\n2. **Fix**');
    expect($(chat, '.mx-chat__plan-text strong')?.textContent).toBe('Fix');
    expect(choices(chat).map((c) => c.textContent)).toEqual([`1${enStrings.chatPlanApprove}`, `2${enStrings.chatPlanKeep}`]);
    choices(chat)[1].click();
    const input = $(chat, '.mx-chat__choice-box input') as HTMLInputElement;
    input.value = 'Add tests';
    key(input, 'Enter');
    await expect(first).resolves.toEqual({ choice: 'no', text: 'Add tests' });
    expect(answerOf(chat)).toBe(`${enStrings.chatPlanKept}: Add tests`);
    const second = reply.plan('1. Read\n2. Fix\n3. Test', [{ value: 'auto', label: 'Yes, and accept the edits' }]);
    $$(chat, '.mx-chat__entry[data-kind="plan"]')[1].querySelector<HTMLElement>('.mx-chat__choice')!.click();
    await expect(second).resolves.toEqual({ choice: 'auto', text: undefined });
    expect($$(chat, '.mx-chat__answer')[1].textContent).toBe('Yes, and accept the edits');
  });

  it('asks questions in the composer\'s place: one at a time, a single choice goes on, the answers come back', async () => {
    const chat = chatOf();
    chat.send('Make a site');
    const reply = chat.reply();
    const asked = reply.questions([
      { text: 'Which stack?', header: 'Stack', options: [{ label: 'MotifJS', description: 'Components as objects' }, { label: 'Plain' }] },
      { text: 'Anything else?' }
    ]);
    expect(shown($(chat, '.mx-chat-composer'))).toBe(false);
    expect(shown($(chat, '.mx-chat__ask'))).toBe(true);
    expect($(chat, '.mx-chat__asked-count')?.textContent).toBe('2 questions');
    expect($(chat, '.mx-chat__asked-state')?.textContent).toBe(enStrings.chatWaitingAnswer);
    expect($$(chat, '.mx-chat__ask-tab').map((t) => t.textContent)).toEqual(['Stack', 'Anything else?']);
    expect($(chat, '.mx-chat__ask-count')?.textContent).toBe('1 / 2');
    expect($$(chat, '.mx-chat__ask-option').map((o) => o.getAttribute('role'))).toEqual(['radio', 'radio', 'radio']);
    $$(chat, '.mx-chat__ask-option')[0].click();
    expect($(chat, '.mx-chat__ask-count')?.textContent).toBe('2 / 2');
    expect($$(chat, '.mx-chat__ask-tab')[0].hasAttribute('data-answered')).toBe(true);
    const free = $(chat, '.mx-chat__ask-free textarea') as HTMLTextAreaElement;
    free.value = 'Dark theme';
    free.dispatchEvent(new InputEvent('input', { bubbles: true }));
    ($(chat, '.mx-chat__ask-submit') as HTMLElement).click();
    await expect(asked).resolves.toEqual({ declined: false, answers: [{ id: '1', values: ['MotifJS'] }, { id: '2', values: ['Dark theme'] }] });
    expect(shown($(chat, '.mx-chat__ask'))).toBe(false);
    expect(shown($(chat, '.mx-chat-composer'))).toBe(true);
    expect($$(chat, '.mx-chat__asked-answer').map((a) => a.textContent)).toEqual(['MotifJS', 'Dark theme']);
    expect($(chat, '.mx-chat__asked-state')?.textContent).toBe(enStrings.chatAnswered);
  });

  it('goes to a required question left empty instead of sending, and takes several with "Other"', async () => {
    const chat = chatOf();
    chat.send('Go');
    const asked = chat.reply().questions([
      { text: 'Name?' },
      { text: 'Which?', multiple: true, required: true, options: [{ label: 'A' }, { label: 'B' }] }
    ]);
    ($(chat, '.mx-chat__ask-submit') as HTMLElement).click();
    expect($(chat, '.mx-chat__ask-text')?.textContent).toBe('Which?');
    expect(shown($(chat, '.mx-chat__ask-missing'))).toBe(true);
    const options = $$(chat, '.mx-chat__ask-option');
    expect(options.map((o) => o.getAttribute('role'))).toEqual(['checkbox', 'checkbox', 'checkbox']);
    options[1].focus();
    key(options[1], '2');
    key(options[1], '3');
    const other = $(chat, '.mx-chat__ask-other input') as HTMLInputElement;
    other.value = 'C';
    other.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(shown($(chat, '.mx-chat__ask-missing'))).toBe(false);
    ($(chat, '.mx-chat__ask-submit') as HTMLElement).click();
    await expect(asked).resolves.toEqual({ declined: false, answers: [{ id: '2', values: ['B', 'C'] }] });
  });

  it('leaves the decision to the model with "Decide for me"', async () => {
    const chat = chatOf();
    chat.send('Go');
    const asked = chat.reply().questions([{ text: 'Color?', options: [{ label: 'Red' }] }]);
    expect(shown($(chat, '.mx-chat__ask-header'))).toBe(false);
    ($(chat, '.mx-chat__ask-decline') as HTMLElement).click();
    await expect(asked).resolves.toEqual({ declined: true, answers: [] });
    expect($(chat, '.mx-chat__asked-state')?.textContent).toBe(enStrings.chatDeclined);
  });

  it('draws a waiting request again from its turn\'s messages, answerable', () => {
    const answer = vi.fn();
    const question = say('user', 'Q');
    const reply: ChatMessage = {
      id: 'a',
      role: 'assistant',
      status: 'streaming',
      parts: [{ kind: 'tool', id: 't', name: 'Bash', status: 'waiting', input: 'ls', permission: {} }]
    };
    const view = new ChatTurnView({ messages: [question, reply] }, { ...look, answer });
    hosts.push(mountHost(view.row));
    view.row.element.querySelector<HTMLElement>('.mx-chat__choice')!.click();
    expect(answer).toHaveBeenCalledWith(reply.parts[0], { choice: 'yes', text: undefined });
  });
});

describe('ChatComposer', () => {
  const MODES = [
    { value: 'ask', label: 'Ask before edits' },
    { value: 'auto', label: 'Edit automatically' },
    { value: 'plan', label: 'Plan', description: 'Read only' }
  ];
  const textOf = (chat: Chat, selector: string) => $(chat, selector)?.textContent ?? null;

  it('shows the mode in use, goes to the next with Shift+Tab in the box, and says so', () => {
    const onModeChanged = vi.fn();
    const chat = chatOf({ composer: { modes: MODES, onModeChanged } });
    expect(textOf(chat, '.mx-chat-composer__mode')).toContain('Ask before edits');
    expect(chat.composer.mode).toBe('ask');
    press(chat, 'Tab', { shiftKey: true });
    expect(chat.composer.mode).toBe('auto');
    expect(textOf(chat, '.mx-chat-composer__mode')).toContain('Edit automatically');
    expect(onModeChanged).toHaveBeenCalledWith(expect.objectContaining({ value: 'auto' }));
    press(chat, 'Tab', { shiftKey: true });
    press(chat, 'Tab', { shiftKey: true });
    expect(chat.composer.mode).toBe('ask');
  });

  it('hides the mode and the model buttons and the meter until they are given', () => {
    const chat = chatOf();
    expect(shown($(chat, '.mx-chat-composer__mode'))).toBe(false);
    expect(shown($(chat, '.mx-chat-composer__model'))).toBe(false);
    expect(shown($(chat, '.mx-chat-composer__usage'))).toBe(false);
    chat.composer.models = [{ value: 'a', label: 'Model A' }, { value: 'b', label: 'Model B' }];
    chat.composer.model = 'b';
    expect(textOf(chat, '.mx-chat-composer__model')).toContain('Model B');
  });

  it('shows how full the context is, and marks it when nearly full', () => {
    const chat = chatOf({ composer: { usage: 0.42 } });
    const meter = $(chat, '.mx-chat-composer__usage')!;
    expect(shown(meter)).toBe(true);
    expect(meter.getAttribute('role')).toBe('meter');
    expect(meter.getAttribute('aria-valuenow')).toBe('42');
    expect(meter.getAttribute('aria-label')).toBe('42% of the context used');
    expect(textOf(chat, '.mx-chat-composer__usage-text')).toBe('42%');
    expect(meter.hasAttribute('data-high')).toBe(false);
    chat.composer.usage = 0.85;
    expect($(chat, '.mx-chat-composer__usage')!.hasAttribute('data-high')).toBe(true);
    chat.composer.usage = null;
    expect(shown($(chat, '.mx-chat-composer__usage'))).toBe(false);
  });

  it('brings back what was sent with Arrow Up at the start of the box, and goes forward to the draft with Arrow Down', () => {
    const chat = chatOf();
    for (const said of ['first', 'second']) {
      type(chat, said);
      press(chat, 'Enter');
    }
    type(chat, '');
    press(chat, 'ArrowUp');
    expect(area(chat).value).toBe('second');
    press(chat, 'ArrowUp');
    expect(area(chat).value).toBe('first');
    press(chat, 'ArrowUp');
    expect(area(chat).value).toBe('first');
    press(chat, 'ArrowDown');
    expect(area(chat).value).toBe('second');
    press(chat, 'ArrowDown');
    expect(area(chat).value).toBe('');
    expect(chat.composer.history).toEqual(['first', 'second']);
  });

  it('leaves Arrow Up to the box when the caret is not at its start', () => {
    const chat = chatOf({ composer: { history: ['earlier'] } });
    type(chat, 'two\nlines');
    area(chat).setSelectionRange(5, 5);
    press(chat, 'ArrowUp');
    expect(area(chat).value).toBe('two\nlines');
  });

  it('attaches files picked, pasted or dropped, as chips above the box; sends them with the message and shows them under it', async () => {
    const urls: string[] = [];
    const created = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      urls.push(`blob:${urls.length}`);
      return urls[urls.length - 1];
    });
    const revoked = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const sent: { text: string; files: string[] }[] = [];
    const chat = chatOf({ composer: { attachments: true, accept: 'image/*,.md' }, onSend: (e) => sent.push({ text: e.text, files: e.attachments.map((f) => f.name) }) });
    expect(shown($(chat, '.mx-chat-composer__attach'))).toBe(true);
    const shot = new File(['x'], 'shot.png', { type: 'image/png' });
    const notes = new File(['# hi'], 'notes.md', { type: 'text/markdown' });
    const binary = new File(['x'], 'tool.exe', { type: 'application/octet-stream' });
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { files: [shot] } });
    area(chat).dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(true);
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { types: ['Files'], files: [notes, binary] } });
    $(chat, '.mx-chat-composer__field')!.dispatchEvent(drop);
    expect(chat.composer.files.map((f) => f.name)).toEqual(['shot.png', 'notes.md']);
    expect($$(chat, '.mx-chat-composer__file').map((c) => c.textContent?.trim())).toEqual(['shot.png', 'notes.md']);
    expect(created).toHaveBeenCalledTimes(1);
    type(chat, 'Look at these');
    press(chat, 'Enter');
    expect(sent).toEqual([{ text: 'Look at these', files: ['shot.png', 'notes.md'] }]);
    expect(chat.composer.files).toEqual([]);
    expect(shown($(chat, '.mx-chat-composer__files'))).toBe(false);
    // The composer's picture goes with its chip, disposed a turn later; the question draws its own.
    await tick();
    expect(revoked).toHaveBeenCalledWith('blob:0');
    expect($$(chat, '.mx-chat__files .mx-chat__file').map((c) => c.textContent?.trim())).toEqual(['shot.png', 'notes.md']);
    expect(chat.messages[chat.messages.length - 1].parts.map((p) => p.kind)).toEqual(['text', 'attachment', 'attachment']);
    created.mockRestore();
    revoked.mockRestore();
  });

  it('sends files with no text, and queues them while a reply is written', () => {
    const chat = chatOf({ composer: { attachments: true } });
    chat.composer.attach([new File(['x'], 'a.txt', { type: 'text/plain' })]);
    press(chat, 'Enter');
    expect(shown($(chat, '.mx-chat__bubble'))).toBe(false);
    expect($(chat, '.mx-chat__files')?.textContent).toContain('a.txt');
    chat.reply();
    chat.composer.attach([new File(['x'], 'b.txt', { type: 'text/plain' })]);
    type(chat, 'And this');
    press(chat, 'Enter');
    expect($(chat, '.mx-chat__queued-text')?.textContent).toBe('And this · 1 file');
  });

  it('takes a file off with its chip’s remove button, and has no attach button unless asked', () => {
    const plain = chatOf();
    expect(shown($(plain, '.mx-chat-composer__attach'))).toBe(false);
    const chat = chatOf({ composer: { attachments: true } });
    chat.composer.attach([new File(['x'], 'a.txt'), new File(['y'], 'b.txt')]);
    ($(chat, '.mx-chat-composer__file .mx-chip__remove') as HTMLElement).click();
    expect(chat.composer.files.map((f) => f.name)).toEqual(['b.txt']);
  });


  const COMMANDS = [
    { name: 'review', description: 'Review the changes' },
    { name: 'compact', description: 'Sum up the conversation' },
    { name: 'clear' }
  ];
  const options = (chat: Chat) => $$(chat, '[role="option"]').filter((o) => o.isConnected).map((o) => o.textContent?.trim());

  it('lists the commands after `/` at the start of the box; Enter takes the active one instead of sending', async () => {
    const sent: string[] = [];
    const chat = chatOf({ composer: { commands: COMMANDS }, onSend: (e) => sent.push(e.text) });
    expect(area(chat).getAttribute('aria-autocomplete')).toBe('list');
    type(chat, '/c');
    await settled();
    // Those that start with what was written come first.
    expect(options(chat)).toEqual(['/compactSum up the conversation', '/clear']);
    expect(area(chat).getAttribute('aria-activedescendant')).toBeTruthy();
    press(chat, 'ArrowDown');
    press(chat, 'Enter');
    expect(area(chat).value).toBe('/clear ');
    expect(sent).toEqual([]);
    expect(area(chat).hasAttribute('aria-activedescendant')).toBe(false);
    press(chat, 'Enter');
    expect(sent).toEqual(['/clear ']);
  });

  it('opens the commands from its button, and closes the menu with Escape without stopping the reply', async () => {
    const chat = chatOf({ composer: { commands: COMMANDS } });
    ($(chat, '.mx-chat-composer__commands') as HTMLElement).click();
    await settled();
    expect(area(chat).value).toBe('/');
    expect(options(chat).length).toBe(3);
    const reply = chat.reply();
    press(chat, 'Escape');
    expect(area(chat).hasAttribute('aria-controls')).toBe(false);
    expect(reply.isOpen).toBe(true);
    press(chat, 'Escape');
    expect(reply.isOpen).toBe(false);
  });

  it('asks the app what fits after `@`, shows the latest answer, and puts the pick in the text', async () => {
    const queries: string[] = [];
    let later: (items: ChatMention[]) => void = () => {};
    const chat = chatOf({
      composer: {
        onMention: (e) => {
          queries.push(e.query);
          if (e.query === 'ch') e.items = [{ label: 'Chat.ts', value: 'src/Chat.ts', description: 'src' }, { label: 'chip.css' }];
          else e.promise = new Promise((done) => (later = done));
        }
      }
    });
    type(chat, 'look at @ch');
    await settled();
    expect(queries).toEqual(['ch']);
    expect(options(chat)).toEqual(['Chat.tssrc', 'chip.css']);
    press(chat, 'Tab');
    expect(area(chat).value).toBe('look at @src/Chat.ts ');
    type(chat, 'and @x');
    later([{ label: 'x.ts' }]);
    await settled();
    expect(options(chat)).toEqual(['x.ts']);
  });

  it('shows what the app adds as chips the user turns off or takes off; what is on goes with the message', () => {
    const items: ChatContextItem[] = [{ label: 'Chat.ts', data: 'src/Chat.ts' }, { label: 'Lines 10–20' }, { label: 'README.md' }];
    const changed = vi.fn();
    const sent: string[][] = [];
    const chat = chatOf({ composer: { contextItems: items, onContextChanged: changed }, onSend: (e) => sent.push(e.contextItems.map((i) => i.label)) });
    const chips = () => $$(chat, '.mx-chat-composer__context-item');
    expect(chips().map((c) => c.textContent?.trim())).toEqual(['Chat.ts', 'Lines 10–20', 'README.md']);
    chips()[1].click();
    expect(items[1].on).toBe(false);
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ item: items[1], removed: false }));
    (chips()[2].querySelector('.mx-chip__remove') as HTMLElement).click();
    expect(items.map((i) => i.label)).toEqual(['Chat.ts', 'Lines 10–20']);
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ removed: true }));
    expect(chips().length).toBe(2);
    type(chat, 'Explain it');
    press(chat, 'Enter');
    expect(sent).toEqual([['Chat.ts']]);
    expect($$(chat, '.mx-chat__files .mx-chat__file').map((c) => c.textContent?.trim())).toEqual(['Chat.ts']);
  });
});

describe('Chat: history', () => {
  const actionsOf = (chat: Chat, n = 0) => $$(chat, '.mx-chat__question')[n].querySelectorAll<HTMLElement>('.mx-chat__question-actions .mx-chat__action');
  const named = (el: Element) => el.getAttribute('aria-label');

  async function answered(chat: Chat, question: string, answer: string) {
    chat.send(question);
    const reply = chat.reply();
    reply.text(answer);
    reply.done();
  }

  it('copies a question and a reply, and says so for a moment', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const chat = chatOf();
    await answered(chat, 'Hi there', 'Hello **you**');
    const copy = actionsOf(chat)[0];
    expect(named(copy)).toBe(enStrings.chatCopy);
    copy.click();
    expect(writeText).toHaveBeenLastCalledWith('Hi there');
    expect(named(copy)).toBe(enStrings.chatCopied);
    ($(chat, '.mx-chat__turn-actions .mx-chat__action') as HTMLElement).click();
    expect(writeText).toHaveBeenLastCalledWith('Hello **you**');
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('edits a question in place and sends it again: what came after it goes', async () => {
    const sent: string[] = [];
    const rewound = vi.fn();
    const chat = chatOf({ onSend: (e) => sent.push(e.text), onRewind: rewound });
    await answered(chat, 'First', 'One');
    await answered(chat, 'Second', 'Two');
    actionsOf(chat, 0)[1].click();
    const box = $(chat, '.mx-chat__edit textarea') as HTMLTextAreaElement;
    expect(box.value).toBe('First');
    expect(shown($$(chat, '.mx-chat__question')[0].querySelector<HTMLElement>('.mx-chat__bubble'))).toBe(false);
    box.value = 'First, again';
    box.dispatchEvent(new InputEvent('input', { bubbles: true }));
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(rewound).toHaveBeenCalledWith(expect.objectContaining({ removed: expect.arrayContaining([expect.objectContaining({ role: 'assistant' })]) }));
    expect(rewound.mock.calls[0][0].removed.length).toBe(4);
    expect(sent).toEqual(['First', 'Second', 'First, again']);
    expect(chat.messages.map((m) => m.parts[0]?.kind === 'text' && m.parts[0].text)).toEqual(['First, again']);
  });

  it('goes back out of editing with Escape, the message as it was', async () => {
    const chat = chatOf();
    await answered(chat, 'Keep me', 'Kept');
    actionsOf(chat)[1].click();
    const box = $(chat, '.mx-chat__edit textarea') as HTMLTextAreaElement;
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect($(chat, '.mx-chat__edit')).toBe(null);
    expect($(chat, '.mx-chat__bubble')?.textContent).toBe('Keep me');
    expect(chat.messages.length).toBe(2);
  });

  it('goes back to before a question: it and what came after go, its text back in the box; onRewind can keep them', async () => {
    let keep = true;
    const chat = chatOf({ onRewind: (e) => (e.cancel = keep) });
    await answered(chat, 'One', 'A');
    await answered(chat, 'Two', 'B');
    actionsOf(chat, 1)[2].click();
    expect(chat.messages.length).toBe(4);
    keep = false;
    actionsOf(chat, 1)[2].click();
    expect(chat.messages.length).toBe(2);
    expect(area(chat).value).toBe('Two');
    expect($$(chat, '.mx-chat__question').length).toBe(1);
  });

  it('has a fork button only when the app takes forks, and gives the messages before the question', async () => {
    const plain = chatOf();
    await answered(plain, 'Q', 'A');
    expect(actionsOf(plain).length).toBe(3);
    const forks: number[] = [];
    const chat = chatOf({ onFork: (e) => forks.push(e.messages.length) });
    await answered(chat, 'One', 'A');
    await answered(chat, 'Two', 'B');
    const fork = actionsOf(chat, 1)[3];
    expect(named(fork)).toBe(enStrings.chatFork);
    fork.click();
    expect(forks).toEqual([2]);
    expect(chat.messages.length).toBe(4);
  });

  it('tries a failed last reply again: it goes, and the app writes the new one', () => {
    const retried: string[] = [];
    const chat = chatOf({
      onRetry: (e) => {
        retried.push(e.question?.parts[0]?.kind === 'text' ? e.question.parts[0].text : '');
        chat.reply().text('Fine now');
      }
    });
    chat.send('Go');
    chat.reply().fail('Overloaded');
    const actions = $(chat, '.mx-chat__turn-actions')!;
    expect(actions.hasAttribute('data-failed')).toBe(true);
    const retry = actions.querySelector<HTMLElement>('.mx-chat__action:last-child')!;
    expect(retry.textContent).toContain(enStrings.chatRetry);
    retry.click();
    expect(retried).toEqual(['Go']);
    expect(chat.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect($$(chat, '.mx-chat__notice').length).toBe(0);
    expect($(chat, '.mx-chat__text')?.textContent).toBe('Fine now');
  });

  it('offers to try again only on the latest turn', () => {
    const chat = chatOf({ onRetry: () => {} });
    chat.send('One');
    chat.reply().fail();
    chat.send('Two');
    expect($$(chat, '.mx-chat__turn-actions').filter(shown).length).toBe(0);
  });

  it('counts down to the next try, says which it is and why', () => {
    vi.useFakeTimers();
    const chat = chatOf();
    chat.send('Go');
    chat.reply().retrying(3, { attempt: 2, attempts: 5, reason: 'Overloaded' });
    const line = () => $(chat, '.mx-chat__notice')?.textContent;
    expect(line()).toBe('Overloaded · Trying again in 3s · 2/5');
    vi.advanceTimersByTime(1000);
    expect(line()).toBe('Overloaded · Trying again in 2s · 2/5');
    vi.advanceTimersByTime(2000);
    expect(line()).toBe(`Overloaded · ${enStrings.chatRetried} · 2/5`);
  });

  it('draws where the conversation was summed up, the summary opening under it', () => {
    const chat = chatOf();
    chat.send('Compact');
    chat.reply().compaction('We fixed **the timer**.');
    const head = $(chat, '.mx-chat__compaction-head')!;
    expect(head.textContent).toBe(enStrings.chatCompacted);
    expect(head.getAttribute('aria-expanded')).toBe('false');
    expect(shown($(chat, '.mx-chat__compaction-text'))).toBe(false);
    head.click();
    expect(head.getAttribute('aria-expanded')).toBe('true');
    expect($(chat, '.mx-chat__compaction-text strong')?.textContent).toBe('the timer');
  });
});

describe('ChatTurnView', () => {
  it('is drawn again from its messages as far as they are written, and goes on from there', () => {
    const question = say('user', 'Q');
    const answer: ChatMessage = { id: 'a', role: 'assistant', status: 'streaming', parts: [{ kind: 'text', text: 'Half **way' }] };
    const view = new ChatTurnView({ messages: [question, answer] }, look);
    const host = mountHost(view.row);
    hosts.push(host);
    // The open text was not ended: its emphasis waits for its end, as text.
    view.flow.append(answer.parts[0], '** there');
    expect(view.row.element.querySelector('.mx-chat__text strong')?.textContent).toBe('way');
  });
});

describe('Chat: the view', () => {
  it('shows the button back to the latest when scrolled away, counts what came, and goes back with it', async () => {
    const chat = chatOf({ messages: [say('user', 'Hi')] });
    await tick();
    sized(chat, 1000, 300, 0);
    expect($(chat, '.mx-chat__jump')?.textContent).toBe(enStrings.chatJumpToLatest);
    chat.add(say('assistant', 'One'));
    chat.reply().done();
    expect($(chat, '.mx-chat__jump')?.textContent).toBe('2 new messages');
    $(chat, '.mx-chat__jump')!.click();
    expect(shown($(chat, '.mx-chat__jump'))).toBe(false);
  });

  it('asks for older messages from the button, adds them before the first, and stops asking when there are none', async () => {
    const asked: (string | number | null)[] = [];
    let last!: ChatLoadOlderEventArgs;
    const chat = chatOf({
      messages: [say('user', 'Latest')],
      hasOlder: true,
      onLoadOlder: (e) => {
        asked.push(e.before?.id ?? null);
        last = e;
      }
    });
    await tick();
    const button = $(chat, '.mx-chat__older-button')!;
    expect(button.textContent).toBe(enStrings.chatLoadEarlier);
    button.click();
    expect(asked).toEqual(['user-Latest']);
    expect(chat.loadOlder()).toBe(false);
    chat.prepend([say('user', 'First'), say('assistant', 'Second')]);
    last.release();
    await tick();
    await tick();
    expect(chat.messages.map((m) => m.id)).toEqual(['user-First', 'assistant-Second', 'user-Latest']);
    chat.loadOlder();
    expect(asked).toEqual(['user-Latest', 'user-First']);
    last.release(true);
    expect(chat.hasOlder).toBe(false);
  });

  it('does not ask for older messages when it opens, only when the user goes up', async () => {
    const onLoadOlder = vi.fn();
    const chat = chatOf({ messages: [say('user', 'Hi')], hasOlder: true, onLoadOlder });
    await tick();
    sized(chat, 300, 300, 0);
    for (let i = 0; i < 6; i++) await tick();
    expect(onLoadOlder).not.toHaveBeenCalled();
    sized(chat, 3000, 300, 2700);
    sized(chat, 3000, 300, 100);
    expect(onLoadOlder).toHaveBeenCalledTimes(1);
  });

  it('follows the kit language in its placeholder', async () => {
    const chat = chatOf({ placeholder: '' });
    expect(area(chat).placeholder).toBe(enStrings.chatPlaceholder);
    await uiLocale.use('tr');
    expect(area(chat).placeholder).toBe('Mesaj yazın');
  });
});
