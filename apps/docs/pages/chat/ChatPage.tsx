import { CodeFile } from '../../shared/CodeFile';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Conversation from './examples/Conversation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const REPLY = [
  ['text(delta)', 'Adds markdown text. What it completes takes its form, and the rest shows as text at once (see Markdown).'],
  ['thinking(delta?)', 'Adds to the thinking being written, or starts one. It shows “Thinking 3s” while it runs and “Thought for 3s” after; a click opens what it wrote. Anything else written ends it. A thinking with nothing written that ended within a second is not drawn.'],
  ['note(text)', 'A short note on what the thinking is about. The newest stands beside the thinking line while it runs; all of them are inside it.'],
  ['tool(init)', 'Starts a tool call and returns a `ChatToolCall`: `progress(file?, bytes?)` while its arguments arrive (`status: \'assembling\'`), `start(input?, title?)`, `output(delta)`, `done(output?)`, `fail(error?)`. A sub-agent writes its own `text()` and `tool()` into the call, and they are drawn inside it.'],
  ['todo(items)', 'The to-do list as it stands (`{ text, status: \'pending\' | \'active\' | \'done\' }`). Written again right after, it changes in place.'],
  ['notice(tone, text?)', 'A line in the flow: `retry`, `info`, `stopped` or `error`.'],
  ['retrying(seconds, { attempt?, attempts?, reason? })', 'The request failed and is tried again in `seconds`: the line counts down to it, and says which try it is of how many and why (“Overloaded · Trying again in 4s · 3/4”).'],
  ['compaction(summary?)', 'The conversation so far was summed up for the model: a line across the flow, “Conversation summarized”, which opens the summary.'],
  ['call.permission({ always? })', 'Asks the user whether a tool call may run, and returns a `Promise<ChatPermissionAnswer>` (`{ choice: \'yes\' | \'always\' | \'no\', text? }`). The call waits open with its choices under it: “Yes”, `always` when given (“Yes, and allow npm commands”), and “No” with a box for what to do instead. Then it runs or is denied.'],
  ['plan(text, choices?)', 'Shows a plan (markdown) and asks to go on. Returns a `Promise<ChatPlanAnswer>`: the `value` of the choice taken (by default one, “Yes, go ahead”, value `yes`), or `no` with what to change.'],
  ['questions(list)', 'Asks the user questions and returns a `Promise<ChatQuestionsAnswer>`: `{ declined, answers: [{ id, values }] }`. The form takes the composer’s place; the flow keeps the questions and their answers.'],
  ['status(text)', 'What the model does now, in a word or two. The line under the conversation says it, with the seconds since the reply started.'],
  ['done()', 'The reply is complete.'],
  ['stop()', 'Stops the reply where it is: `signal` is aborted, and the flow says it stopped.'],
  ['fail(error?)', 'The reply failed: the flow says `error`, or the kit text, as an alert.'],
  ['signal', 'An `AbortSignal`, aborted when the user stops the reply or the chat is disposed. Pass it to the request.'],
  ['message', 'The message being written. Its `parts`, `status` and `error` are updated as the reply arrives.'],
  ['isOpen', '`true` until the reply is done, stopped or failed.'],
];

const MESSAGE = [
  ['id', '`string | number`', 'Identifies the message.'],
  ['role', "`'user' | 'assistant' | 'system'`", 'Who wrote it. Each user message starts a turn; the messages after it, up to the next one, are its flow.'],
  ['parts', '`ChatPart[]`', 'The pieces of the message, in order: `text` (markdown), `thinking`, `tool` (with `permission` when it asked), `todo`, `notice`, `plan`, `questions`, `attachment`, `compaction`. A request’s `answer` is written when the user answers, so a turn drawn again shows it. A user message shows its text as it was typed.'],
  ['time', '`Date`', 'Shown above the question, and above the first text of a reply.'],
  ['status', "`'streaming' | 'done' | 'stopped' | 'error'`", 'The default is `done`.'],
  ['error', '`string`', 'Shown under a message whose status is `error`.'],
];

const PROPS = [
  ['messages', '`Bind<ChatMessage[]>`', '`[]`', 'The messages, oldest first. The chat keeps this array and its objects: `add`, `prepend` and `remove` change it, and replies are written into their messages. A different array is a new conversation, which opens at its end.'],
  ['hasOlder', '`Bind<boolean>`', '`false`', 'There are older messages. They load near the top or from the button above the first message.'],
  ['placeholder', '`Bind<string>`', 'The kit string “Message”', 'The hint in the empty message box.'],
  ['highlighter', '`Bind<CodeHighlighter | null>`', 'None', 'Colours the code blocks of messages drawn after it is set.'],
  ['mathRenderer', '`Bind<MathRenderer | null>`', 'None', 'Draws the math of messages drawn after it is set (see Markdown). Without it, `$` is text.'],
  ['diagramRenderer', '`Bind<DiagramRenderer | null>`', 'None', 'Draws the diagrams of messages drawn after it is set, such as a fenced `mermaid` block (see Markdown).'],
  ['linkTarget', '`Bind<string>`', "`'_blank'`", 'Where links in messages open.'],
  ['label', '`Bind<string>`', 'The kit string “Conversation”', 'The accessible name of the conversation.'],
  ['composer', '`ChatComposerProps`', '', 'Props of the composer, given to it as they are (see “The composer”): `attachments`, `accept`, `contextItems`, `commands`, `onMention`, `modes`, `mode`, `models`, `model`, `thinking`, `usage`, `history` and their events. `onSend` and `onStop` are the chat’s.'],
  ['onSend', '`(e) => void`', '', 'A message of the user is sent (`e.text`, `e.message`). It is added unless `e.cancel` is set. Start the reply here. What the user sends while a reply is written waits above the box and is sent when the replies end.'],
  ['onStop', '`(e) => void`', '', 'The user stopped the reply. Its `signal` is already aborted.'],
  ['onRewind', '`(e: ChatRewindEventArgs) => void`', '', 'The conversation goes back to before a question (its edit or go-back button, `rewind()`, `resend()`): `e.removed` are it and what came after. Set `e.cancel` to keep them; forget them in your model’s history.'],
  ['onFork', '`(e: ChatForkEventArgs) => void`', '', 'Given, a question has a button that starts another conversation from it: open it with `e.messages`, those before `e.message`.'],
  ['onRetry', '`(e: ChatRetryEventArgs) => void`', '', 'Given, the latest reply, when it failed or stopped, has a button to try again: it is gone; write the new one with `reply()` (`e.question` is the message it answered).'],
  ['onLoadOlder', '`(e: ChatLoadOlderEventArgs) => void`', '', 'Older messages are needed. Call `chat.prepend()`, then `e.release()`, or set `e.promise`. Use `e.release(true)` when there are no more. If the promise rejects or you call `e.fail()`, a button appears to try again.'],
];

const METHODS = [
  ['reply(init?)', 'Starts a reply from the model at the end and returns a `ChatReply`.'],
  ['add(message)', 'Adds a message at the end.'],
  ['prepend(messages)', 'Adds older messages before the first one. The messages on screen stay where they are.'],
  ['remove(message), clear()', 'Removes one message, or all of them. `clear` also stops open replies.'],
  ['rewind(message)', 'Goes back to before a question: it and everything after it go (`onRewind` can keep them), open replies among them stop, the queue empties, and its text goes back in the box.'],
  ['resend(message, text)', 'Sends `text` in place of a question, with its files: back to before it, then sent.'],
  ['send(text)', 'Sends `text` as the user, the same as the message box. Returns whether it was added.'],
  ['stop()', 'Stops every open reply, the same as the stop button.'],
  ['loadOlder()', 'Requests older messages now, the same as the button.'],
  ['scrollToEnd(smooth?)', 'Goes to the end. From there, new messages keep the view at the end.'],
  ['openSearch(query?), closeSearch()', 'Opens the search at the top (with `query` when given) and focuses it; closes it, and its mark goes.'],
  ['find(query)', 'Searches every message for `query`, the turns off the page too, and goes to the result nearest the end. Returns how many it found.'],
  ['findNext(), findPrevious()', 'Goes to the next result, down towards the end, or the one before, up; around the ends.'],
  ['focus()', 'Focuses where the user writes: the questions waiting, or the message box.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['isBusy', 'read-only', '`true` while a reply is being written.'],
  ['queuedTexts', 'read-only', 'The messages waiting above the box, in order.'],
  ['isWaiting', 'read-only', '`true` while a reply waits for the user: a permission, a plan or questions.'],
  ['composer', 'read-only', 'The `ChatComposer`, the box where the user writes.'],
];

const KEYBOARD = [
  ['Enter', 'Sends the message; while a reply is written, queues it. Pressing Enter to finish an input method’s composition never sends. On a touch screen with no pointer that hovers (a phone, a tablet without a mouse), Enter starts a new line and the send button sends, as in a phone’s messages; the keyboard’s Enter key says so.'],
  ['Shift+Enter', 'Starts a new line.'],
  ['Escape', 'Closes the menu of commands or mentions; otherwise stops the reply while one is being written, from the box or the form of questions. In the box under a choice, goes back to the choice.'],
  ['/ at the start of the box, @', 'Lists the commands, or what the app suggests for the word after `@`. Arrow Up and Down move in the list, Enter or Tab puts the active one in the text.'],
  ['Enter, Escape while a question is edited', 'Sends it in place of the old one; goes back to it as it was.'],
  ['Arrow Up, Arrow Down in the box', 'At the start of the box, brings back what was sent before; on a text brought back, goes back or forward, down to what was being written.'],
  ['Shift+Tab in the box', 'Goes to the next mode, when there are modes.'],
  ['Ctrl+F (Cmd+F)', 'Opens the search, while the focus is in the chat.'],
  ['Enter, Shift+Enter, Escape in the search', 'Goes up to the older result, down to the newer one; closes the search, and the focus goes back to the box.'],
  ['Page Down, Page Up in a turn', 'Moves the focus to the next turn, or the one before; above the first, older messages are asked for.'],
  ['Ctrl+End, Ctrl+Home in a turn', 'Moves the focus to the box (or the questions waiting), or to the conversation itself.'],
  ['1–9', 'Takes the choice or the option with that number, while the focus is among them.'],
  ['Arrow Up / Arrow Down', 'Moves between the choices of a request, or the options of a question.'],
  ['Tab', 'Moves through the button for older messages, the conversation (it scrolls with the arrow keys), the line of each thinking and tool call (Enter or Space opens it), the button back to the latest message, the box and the send button.'],
];

const A11Y = [
  ['Conversation', 'A focusable region named “Conversation” in the kit language. Its turns are a feed (`role="feed"`, `aria-busy` while older messages load): each turn is an `article` named by its question, with `aria-posinset` and `aria-setsize` (`-1` while older messages may still come) whether it is on the page or not, and `aria-busy` while its reply is written.'],
  ['Announcements', 'Screen readers hear when a reply ends, stops or fails, and when it waits for the user, from a polite live region that is not shown.'],
  ['Search', 'The search is a `search` landmark; its box is named “Search in conversation”, and the count of results is a polite live region. The result shown is marked (`data-found`) on the block that holds it.'],
  ['Thinking and tool calls', 'Their lines are buttons with `aria-expanded` when they open something.'],
  ['Errors', 'The notice of a failed reply has the role `alert`, so it is announced.'],
  ['Requests', 'The choices are a group named by their question. The options of a question are `radio` or `checkbox` items with `aria-checked` in a group named by the question; with several questions the tabs have the role `tab` and `aria-selected`. When a request appears while the focus is in the chat and nothing is being written, its first choice takes the focus; after the answer the focus goes back to the box.'],
  ['Buttons', 'The send button says “Send” or “Stop”, and the button back to the latest message says how many messages arrived.'],
  ['Actions', 'A question’s actions (copy, edit, go back, fork) and a reply’s (copy, try again) are buttons named by what they do; where a pointer can hover they show on hover or when the focus is in the question or the turn, and they are always in the Tab order. The button of a summary has `aria-expanded`.'],
  ['Composer', 'The attach, commands and send buttons show their icon alone and are named (`aria-label`, and a tooltip). The box has `aria-autocomplete="list"` when it suggests, and `aria-activedescendant` points to the active line of the open menu. The context meter has the role `meter` with its percent. Files and context items are chips: their remove buttons, Delete and Backspace take them off.'],
];

const LOCALE = [
  ['chatLabel, chatYou, chatAssistant, chatSystem', 'The conversation’s name, and the default author names.'],
  ['chatLoadEarlier, chatLoadFailed', 'The button for older messages, and what it says when loading failed.'],
  ['chatNewMessages, chatJumpToLatest', 'The button back to the latest message.'],
  ['chatSend, chatStop, chatPlaceholder', 'The message box and its button.'],
  ['chatStopped, chatFailed', 'The notices of a stopped or failed reply.'],
  ['chatThinking, chatThought, chatThoughtBrief, chatSeconds, chatKilobytes', 'The thinking line, and what a tool call waits on.'],
  ['chatWorking, chatStopHint', 'The line under the conversation while a reply is written.'],
  ['chatShowMore, chatShowLess, chatTasks', 'The button of a long question, and the title of the to-do list.'],
  ['chatQueuePlaceholder, chatRemove', 'The box while a reply is written, and the button that removes a queued message.'],
  ['chatAllowTool, chatAllow, chatDeny, chatDenyHint, chatAllowed, chatAllowedAlways, chatDenied, chatUnanswered', 'A permission: its question, its choices, what the user said, and a request nobody answered.'],
  ['chatPlan, chatPlanReady, chatPlanApprove, chatPlanKeep, chatPlanHint, chatPlanApproved, chatPlanKept', 'A plan: its title, its question, its choices and what the user said.'],
  ['chatQuestions, chatQuestionCount, chatWaitingAnswer, chatAnswered, chatDeclined, chatAnswer', 'Questions in the flow: how many, where they stand, and the button to the form.'],
  ['chatOther, chatOtherHint, chatDecide, chatPrevious, chatNext, chatSubmitAnswers, chatRequired', 'The form of questions.'],
  ['chatWaitingYou', 'The line under the conversation while a reply waits for the user.'],
  ['chatAttach, chatAttachments, chatCommands', 'The attach and commands buttons, and how many files a queued message carries.'],
  ['chatModeHint, chatModel, chatThinkingToggle, chatUsage', 'The mode and model buttons, the thinking check box, and the context meter’s name.'],
  ['chatCopy, chatCopied, chatEdit, chatRewind, chatFork, chatCancel, chatRetry', 'The actions of questions and replies, and editing a question.'],
  ['chatRetryingIn, chatRetried, chatCompacted', 'A retry’s countdown, and the line where the conversation was summed up.'],
  ['chatReplied', 'What screen readers hear when a reply ends.'],
  ['chatSearch, chatSearchCount, chatSearchNone, chatSearchPrevious, chatSearchNext', 'The search: its box, “3 of 12”, no results, and its buttons. Its close button says the kit’s `close`.'],
];

const HOOKS = [
  ['.mx-chat', 'The component (`data-searching` while the search is open). An on-screen keyboard over its end gives it room there through `--_keyboard`, and it keeps clear of a phone’s edges (`env(safe-area-inset-*)`).'],
  ['.mx-chat__search, __search-box, __search-count, __search-previous, __search-next, __search-close', 'The search at the top.'],
  ['[data-found], .mx-chat__live', 'The block that holds the result shown; what is said to screen readers.'],
  ['.mx-chat__view, .mx-chat__scroller', 'The part that scrolls (a `ScrollView`).'],
  ['.mx-chat__older, .mx-chat__older-button', 'The button for older messages.'],
  ['.mx-chat__list, .mx-chat__turn', 'The turns: only those in and near the view are on the page.'],
  ['.mx-chat__question-head, __question-actions, __action, __edit, __edit-box, __edit-actions, __edit-cancel, __edit-send, __turn-actions', 'The actions of a question (over its box, with its time) and of a reply (at the end of its turn, `data-failed` when it can be tried again), and a question being edited (`data-editing` on the question).'],
  ['.mx-chat__compaction, __compaction-line, __compaction-head, __compaction-text', 'Where the conversation was summed up (`data-expanded` on its entry).'],
  ['.mx-chat__question, __time, __bubble, __more', 'The user’s question (`data-long`, `data-expanded`), its time, its box and the button for the rest.'],
  ['.mx-chat__flow, .mx-chat__entry, __dot, __entry-main', 'What the model did: one entry per part, with `data-kind` (`text`, `thinking`, `tool`, `todo`, `notice`), and on a tool call `data-status`, `data-density`, `data-look` and `data-full`.'],
  ['.mx-chat__tool-head, __tool-name, __tool-title, __tool-wait, __tool-box, __tool-side, __tool-label, __tool-code, __diff-line', 'A tool call: its line, what went in and came out, a diff’s lines (`data-line`).'],
  ['.mx-chat__thinking-head, __thinking-label, __thinking-note, __thinking-body, __thinking-item', 'A thinking (`data-state`): its line, its newest note, what it wrote and its notes.'],
  ['.mx-chat__todo-title, __todo-list, __todo-item, __todo-glyph, __notice', 'The to-do list (`data-status` on each task) and a notice (`data-tone`).'],
  ['.mx-chat__request, __choices, __choices-title, __choice, __choice-key, __choice-label, __choice-box, __answer', 'What a tool call or a plan asks: the choices while it waits, then the answer (`data-answer`: `yes`, `always`, `no`, `none`).'],
  ['.mx-chat__plan, __plan-title, __plan-text', 'A plan’s box.'],
  ['.mx-chat__asked-head, __asked-count, __asked-state, __asked-button, __asked-list, __asked-pair, __asked-question, __asked-answer', 'Questions in the flow.'],
  ['.mx-chat__ask, __ask-header, __ask-tabs, __ask-tab, __ask-count, __ask-body, __ask-text, __ask-choice, __ask-options, __ask-option, __ask-key, __ask-label, __ask-description, __ask-check, __ask-preview, __ask-other, __ask-free, __ask-missing, __ask-actions', 'The form of questions in the composer’s place; tabs carry `data-selected` and `data-answered`, options `data-checked`, the options area `data-preview`.'],
  ['.mx-chat__status, __status-glyph, __status-text, __status-detail', 'The line under the conversation while a reply is written (`data-waiting` while it waits for the user).'],
  ['.mx-chat__queue, __queued, __queued-text, __queued-remove', 'The messages waiting above the box.'],
  ['.mx-chat__jump', 'The button back to the latest message.'],
  ['.mx-chat-composer, __field, __files, __file, __box, __tools', 'The composer (`data-busy` while a reply is written): the field (`data-dragover` while files are dragged over it) with the files above the box and the tools under it.'],
  ['.mx-chat-composer__attach, __commands, __context, __context-item, __mode, __model, __space, __usage, __usage-ring, __usage-text, __button', 'The tools: attach, commands, the context chips, the mode and the model, the context meter (`data-high` when nearly full) and the send button.'],
  ['.mx-chat-composer__popup, __menu, __menu-label, __menu-description', 'The menu of commands or mentions.'],
  ['.mx-chat__files, .mx-chat__file', 'The files and context of a question, as chips under its box.'],
];

const TOKENS = [
  ['chat.turns-gap, chat.jump-offset, chat.clamp-lines, chat.status-spin', 'The space between turns, where the button back to the latest message sits, how many lines a long question and a summary show, and one turn of the status glyph.'],
  ['chat.list, turn, question, time, bubble, flow, entry, dot, main', 'Units of the turns and their entries. The dot has a state per kind: `text`, `thinking`, `running`, `waiting`, `done`, `error`, `todo`, `notice`, `alert`.'],
  ['chat.tool-head, tool-name, tool-title, tool-wait, tool-box, tool-side, tool-label, tool-code, diff-line', 'Units of a tool call; `diff-line` has `added` and `removed`.'],
  ['chat.thinking-head, thinking-note, thinking-body, thinking-item, todo-title, todo-list, todo-item, todo-glyph, notice', 'Units of a thinking, the to-do list (`active`, `done`) and a notice (`error`).'],
  ['chat.status, status-glyph, status-detail, queue, queued, queued-text, older', 'Units of the line under the conversation, the queue and the place of the button for older messages.'],
  ['chat.request, choices, choices-title, choice, choice-key, choice-label, answer, plan, plan-title', 'Units of a request in the flow; `choice` has `hover` and `focus`, `answer` has `yes` and `no`.'],
  ['chat.asked-head, asked-count, asked-state, asked-list, asked-pair, asked-question, asked-answer', 'Units of questions in the flow.'],
  ['chat.ask, ask-header, ask-tabs, ask-tab, ask-tab-check, ask-count, ask-body, ask-text, ask-choice, ask-options, ask-option, ask-key, ask-label, ask-description, ask-check, ask-preview, ask-missing, ask-actions', 'Units of the form of questions; `ask-tab` has `selected`, `ask-option` has `checked`, both `hover` and `focus`.'],
  ['chat.question-head, question-actions, turn-actions, edit, edit-actions, compaction, compaction-line, compaction-head, compaction-text', 'Units of the actions, of editing a question and of a summary; `compaction-head` has `hover` and `focus`.'],
  ['chat.question-action, chat.turn-action, chat.edit-cancel, chat.edit-send (places)', 'The variant, tone and size of the action buttons and of the edit buttons.'],
  ['chat.search, search-count, found', 'Units of the search, and of the block that holds the result shown. `turn` has `focus`, for Page Down and Page Up.'],
  ['chat.search-previous, chat.search-next, chat.search-close (places)', 'The variant, tone and size of the search’s buttons.'],
  ['chat.older-button, chat.jump, chat.more, chat.queued-remove, chat.asked-button, chat.ask-previous, chat.ask-next, chat.ask-decline, chat.ask-submit (places)', 'The variant, tone and size of those buttons.'],
  ['chat-composer.usage-fill, usage-high, usage-track', 'The context meter’s ring: the part used, the part used once nearly full, and the rest.'],
  ['chat-composer.frame, field, files, tools, context, usage, usage-ring, menu-label, menu-description', 'Units of the composer; `field` has `focus` and `dragover`.'],
  ['chat-composer.box, attach, commands, mode, model, send (places)', 'The box with no frame of its own, and the variant, tone and size of the buttons.'],
];

export default function ChatPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A conversation with a model, drawn by turn: the user’s question, then what the model did, in order — its thinking, text, tool calls, to-do list — each with a dot at its start. The chat draws everything, and your app talks to the model and writes the reply. There is no built-in provider: any streaming API connects through `reply()`." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Chat } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="usage" title="Usage">
        <Example files={code('Conversation.tsx', 'connect.ts', 'model.ts', 'demo-tools.ts', 'fake-model.ts')}>
          <Conversation />
        </Example>
      </Section>

      <Section anchor="replies" title="Streaming replies">
        <p>
          <Rich text="Start a reply in `onSend` and write each piece with `text()` as it arrives. Each piece shows the moment it comes, and nothing already drawn is drawn again (see Markdown). Pass `signal` to the request so that stopping the reply, or removing the chat, cancels it." />
        </p>
        <Code
          code={`
<Chat ref={(c) => (chat = c)} onSend={async (e) => {
  const reply = chat.reply();
  try {
    const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ text: e.text }), signal: reply.signal });
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
    for (let r = await reader.read(); !r.done; r = await reader.read()) reply.text(r.value);
    reply.done();
  } catch (error) {
    if (!reply.signal.aborted) reply.fail(error as Error);
  }
}} />
`}
        />
        <ApiTable head={['ChatReply', 'Description']} rows={REPLY} />
        <h3>
          <Rich text="ChatMessage" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={MESSAGE} />
      </Section>

      <Section anchor="composer" title="The composer">
        <p>
          <Rich text="The box and its tools sit in one field. Each tool shows when it is given, through the chat’s `composer` prop or `chat.composer`. Files (`attachments`, `accept`) are picked with the attach button, pasted or dropped, each a chip above the box, and go with the message (`e.attachments`). What the app adds by itself, such as the open file or a selection (`contextItems`), shows as chips the user turns off or takes off; those on go with the message (`e.contextItems`). Both show as chips under the question. `/` at the start of the box lists the `commands`, and `@` asks the app what fits the word after it (`onMention`, with `e.items` or `e.promise`). The mode (`modes`, Shift+Tab goes to the next), the model and its thinking (`models`, `thinking`) are menus; `usage` shows how full the context is. Arrow Up at the start of the box brings back what was sent." />
        </p>
        <Code
          code={`
<Chat composer={{
  attachments: true,
  accept: 'image/*,.pdf,.md',
  contextItems: () => this.editor.selections,
  commands: [{ name: 'review', description: 'Review the changes' }],
  onMention: (e) => (e.promise = this.files.search(e.query)),
  modes: [{ value: 'ask', label: 'Ask before edits' }, { value: 'auto', label: 'Edit automatically' }],
  onModeChanged: (e) => (this.agent.mode = e.value),
  models: this.models,
  thinking: true,
  usage: () => this.agent.usage,
}} onSend={(e) => this.agent.answer(chat.reply(), e.text, e.attachments, e.contextItems)} />
`}
        />
      </Section>

      <Section anchor="history" title="Actions and history">
        <p>
          <Rich text="A question’s actions copy it, edit it in place and send it again, go back to before it (its text back in the box) and, with `onFork`, start another conversation from it. Going back and editing remove the question and what came after it: `onRewind` says what goes, so your model forgets it too. At the end of a turn the reply can be copied, and the latest one, when it failed or stopped, tried again with `onRetry`. While a request is tried again, `reply.retrying()` counts down to it; `reply.compaction()` marks where the conversation was summed up." />
        </p>
        <Code
          code={`
<Chat
  onRewind={(e) => this.agent.rewind(e.removed.filter((m) => m.role === 'user').length)}
  onFork={(e) => this.sessions.open(e.messages)}
  onRetry={() => void this.agent.again(chat.reply())}
/>
`}
        />
      </Section>

      <Section anchor="search" title="Search">
        <p>
          <Rich text="Ctrl+F in the chat opens a search over every message, the turns that are not on the page too: what the user wrote, the model’s texts and its plans, without case. The result nearest the end shows first, as in a terminal; Enter goes up to older ones and Shift+Enter down. Going to a result draws its turn when it is off the page and marks the block that holds it: a paragraph, a heading, a code block, a table row or the question’s box. From code, `find()`, `findNext()` and `findPrevious()` do the same." />
        </p>
        <Code
          code={`
const count = chat.find('timeout');
chat.findPrevious();
`}
        />
      </Section>

      <Section anchor="mobile" title="Phones and tablets">
        <p>
          <Rich text="On a touch screen Enter starts a new line and the send button sends, and the keyboard’s Enter key says so. While the user writes, an on-screen keyboard that covers the chat’s end gives the chat that much room at its end, so the box stands on the keyboard and the conversation, at its end, above it. The chat also keeps clear of the home indicator and the notch where the page lays out to the edges (`viewport-fit=cover`)." />
        </p>
      </Section>

      <Section anchor="connect" title="Connecting a model">
        <p>
          <Rich text="The chat has no provider. Your server, or the provider’s SDK, reads the model’s stream and gives five things, which most providers send in their own words: thinking, text, the start of a tool call, its arguments as they arrive, and its end (`model.ts`). The loop below is the code to copy (`connect.ts`): it writes the stream into the reply as it comes, runs the calls the model made, asking first where a tool says so and remembering “always”, gives the model what they returned, and asks again until the model answers without calling anything. Asking the user, the plan and the to-do list are tools of your model too: their `run` calls `reply.questions()`, `reply.plan()` and `reply.todo()`, and what the user said goes back to the model as the tool’s result. The demo above runs this code against a model that stands in for yours (`fake-model.ts`, `demo-tools.ts`)." />
        </p>
        <CodeFile file={code('connect.ts')[0]} />
        <CodeFile file={code('model.ts')[0]} />
      </Section>

      <Section anchor="requests" title="Waiting for the user">
        <p>
          <Rich text="A reply can stop and ask. Each request returns a promise that resolves with what the user said, and the reply goes on from there. A tool call asks before it runs (`call.permission()`): it waits open, what goes in shown, with the choices under it. A plan (`reply.plan()`) is drawn in its box with the ways to go on. Questions (`reply.questions()`) take the composer’s place: one question at a time, a tab for each when there are several, options with a line under them and a preview beside them, “Other” for the user’s own words, and “Decide for me” to leave it to the model. The flow keeps every request and its answer, written into the message, so a turn drawn again shows them. When the reply stops first, a request resolves as `no` (questions as declined) and the flow says nobody answered." />
        </p>
        <Code
          code={`
const run = reply.tool({ name: 'Bash', title: 'Run the tests', input: 'npm test', look: 'terminal' });
const allowed = await run.permission({ always: 'Yes, and allow npm test from now on' });
if (allowed.choice === 'no') return model.toolResult(run.part.id, allowed.text ?? 'The user said no.');

// A tool of your model that asks the user: its arguments go in, the answer is the tool's result.
const answer = await reply.questions([
  { text: 'When should the call run?', header: 'Timing', options: [{ label: 'After the last call' }, { label: 'On the first call' }] },
  { text: 'Anything else?', multiple: true, options: [{ label: 'A cancel() method' }] },
]);
`}
        />
      </Section>

      <Section anchor="scrolling" title="Scrolling as a reply arrives">
        <p>
          <Rich text="While the view is at the end, a growing reply keeps it there. If you scroll up, the view stays where you are and a button shows how many messages arrived. Click it to go back to the end. Sending a message always goes to the end." />
        </p>
        <p>
          <Rich text="While a reply is written, a line under the conversation says what the model does (`reply.status()`), for how long, and that Escape stops it. What the user sends meanwhile waits above the box, and goes when the replies end." />
        </p>
      </Section>

      <Section anchor="large" title="Large conversations">
        <p>
          <Rich text="Only the turns in and near the view are on the page. A turn is drawn from its messages when it comes near the view and disposed when it moves far away: only its messages and its measured height are kept, and it is drawn again when it comes back. A reply written into a turn far from the view writes its message, and the turn shows all of it when it comes back. Heights are estimated until measured, and the turn on screen stays in place while estimates become measurements. A turn that holds focus stays on the page. The chat opens at its end in one frame: until the turns at the end are placed it is laid out but not shown. The browser’s own find sees only the turns on the page; Ctrl+F in the chat searches them all (see Search)." />
        </p>
      </Section>

      <Section anchor="older" title="Loading older messages">
        <p>
          <Rich text="With `hasOlder`, older messages are requested when the user goes up near the top — never when the chat opens — and also from the button above the first message for keyboard users. Add them with `prepend()`: the messages on screen stay in place, so the view does not jump. If loading fails, the button offers to try again, and the chat does not ask again on its own." />
        </p>
        <Code
          code={`
<Chat hasOlder={() => this.history.more} onLoadOlder={(e) => {
  e.promise = this.history.before(e.before).then((page) => chat.prepend(page.messages));
}} />
`}
        />
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Action']} rows={KEYBOARD} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="localization" title="Localization">
        <ApiTable head={['String', 'Used for']} rows={LOCALE} />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
        <p>
          <Rich text="`ChatComposer` (the message box) can also be used on its own, with the props of “The composer” and `placeholder`, `busy`, `maxRows`, `onSend` and `onStop`. From code: `send()`, `stop()`, `value`, `files`, `attach(files)`, `detach(file)`, `pick()`, `nextMode()`, and every prop as a property. While `busy`, Enter still sends and the button stops." />
        </p>
      </Section>
    </>
  );
}
