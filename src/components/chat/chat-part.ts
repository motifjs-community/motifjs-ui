import type { ChatPermission, ChatPlanPart, ChatQuestionsPart } from './chat-request';
import type { ChatTextPart } from './chat-text-part';

/** A piece of a reply's thinking. Drawn open while it is written; then one line, "Thought for 3s", that opens. */
export interface ChatThinkingPart {
  kind: 'thinking';
  /** The thinking as markdown, when the app shows it. */
  text?: string;
  /** Short notes on what the thinking is about, newest last: the newest stands under its line while it runs. */
  notes?: string[];
  /** When it started, in milliseconds since the epoch (`Date.now()`). */
  started?: number;
  /** How long it took, in seconds; set when it ends. A thinking with no text or notes, shorter than a second, is not drawn. */
  seconds?: number;
}

/** Where a tool call stands. `assembling`: its arguments are still arriving; `waiting`: it waits for the user's approval. */
export type ChatToolStatus = 'assembling' | 'waiting' | 'running' | 'done' | 'error' | 'denied';

/**
 * How much of a tool call shows without being asked: `line` (its name and outcome), `summary` (what went in and what
 * came out, a few lines of each) or `full`. A property of the tool, not of the call: the same tool reads the same way
 * every time. A failed call and one waiting for approval always open.
 */
export type ChatToolDensity = 'line' | 'summary' | 'full';

/** How a tool call's input and output are drawn: as text, as a terminal's, or as a diff (`+` and `-` lines). */
export type ChatToolLook = 'text' | 'terminal' | 'diff';

/** A call of a tool: one row from the first sign of it to its end. */
export interface ChatToolPart {
  kind: 'tool';
  id: string;
  /** The tool's name as the model called it. */
  name: string;
  /** The name a person reads; by default `name`. */
  label?: string;
  /** What the call does, in a line: a file, a command, a pattern. */
  title?: string;
  status: ChatToolStatus;
  /** What went in, as text. */
  input?: string;
  /** What came out, as text. */
  output?: string;
  look?: ChatToolLook;
  density?: ChatToolDensity;
  /** While the arguments arrive: the file they name, and how many bytes came. */
  file?: string;
  bytes?: number;
  /** When the call was first heard of, in milliseconds since the epoch: the seconds it waits show from it. */
  started?: number;
  /** What a sub-agent the call ran wrote: its own text and calls, drawn inside the call. */
  parts?: ChatPart[];
  /** The call asked before it ran (`call.permission()`), and what the user said. */
  permission?: ChatPermission;
}

/** One task of a to-do list. */
export interface ChatTodoItem {
  text: string;
  status: 'pending' | 'active' | 'done';
}

/** The model's to-do list, as it last wrote it. */
export interface ChatTodoPart {
  kind: 'todo';
  items: ChatTodoItem[];
}

/** A line in the flow: the reply stopped (`stopped`), failed (`error`), is tried again (`retry`), or anything else (`info`). */
export interface ChatNoticePart {
  kind: 'notice';
  tone: 'info' | 'stopped' | 'error' | 'retry';
  /** By default, the kit's text for its tone; for a retry, why it is tried again ("Overloaded"). */
  text?: string;
  /** A retry: when it is tried again, in milliseconds since the epoch. The line counts the seconds down to it. */
  until?: number;
  /** A retry: which try this is, of how many. */
  attempt?: number;
  attempts?: number;
}

/** The conversation before it was summed up for the model: a line across the flow, the summary opens under it. */
export interface ChatCompactionPart {
  kind: 'compaction';
  /** The summary, as markdown. */
  text?: string;
}

/** A file attached to a message: a chip, an image with its picture. */
export interface ChatAttachmentPart {
  kind: 'attachment';
  name: string;
  /** Its media type (`image/png`): an image shows its picture. */
  type?: string;
  /** Its size in bytes. */
  size?: number;
  /** Where its picture is, for an image the app keeps elsewhere; by default it is read from `file` while it is shown. */
  url?: string;
  /** The file itself, while the page has it. */
  file?: File;
}

/** A piece of a message, drawn in order: text, thinking, tool calls, a to-do list, notices, a plan, questions, files, a summary. */
export type ChatPart =
  | ChatTextPart
  | ChatThinkingPart
  | ChatToolPart
  | ChatTodoPart
  | ChatNoticePart
  | ChatPlanPart
  | ChatQuestionsPart
  | ChatAttachmentPart
  | ChatCompactionPart;
