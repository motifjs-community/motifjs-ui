import type { ChatToolPart } from './chat-part';

/**
 * What the user said to a tool call that asked before it ran: `yes`, `always` (yes, and do not ask again for what the
 * call's `always` named), or `no`, with what to do instead when they wrote it.
 */
export interface ChatPermissionAnswer {
  choice: 'yes' | 'always' | 'no';
  text?: string;
}

/** A tool call that asks before it runs: the choices stand under it until the user answers. */
export interface ChatPermission {
  /** The second choice, naming what would not be asked again ("Yes, and allow npm commands"); without it there is none. */
  always?: string;
  /** What the user said; missing while the call waits, and when the reply ended first. */
  answer?: ChatPermissionAnswer;
}

/** A way to go on with a plan, as the app names it ("Yes, and accept the edits"). */
export interface ChatPlanChoice {
  value: string;
  label: string;
}

/** What the user said to a plan: the `value` of the choice they took, or `no` to keep planning, with what to change. */
export interface ChatPlanAnswer {
  choice: string;
  text?: string;
}

/** A plan the model wrote, waiting for the user to approve it. */
export interface ChatPlanPart {
  kind: 'plan';
  id: string;
  /** The plan as markdown. */
  text: string;
  /** The ways to go on; by default one, "Yes, go ahead". "No, keep planning" always stands last. */
  choices?: ChatPlanChoice[];
  /** What the user said; missing while it waits, and when the reply ended first. */
  answer?: ChatPlanAnswer;
}

/** An option of a question: its label is what the answer carries. */
export interface ChatQuestionOption {
  label: string;
  /** A line under the label. */
  description?: string;
  /** Markdown shown beside the options while the option is focused: a layout, a piece of code. */
  preview?: string;
}

/** A question the model asks: with options a choice (one, or several with `multiple`), without them a text. */
export interface ChatQuestion {
  /** What the answer names it by; by default its position, from `1`. */
  id?: string;
  text: string;
  /** A word or two for its tab when there are several questions; by default `text`. */
  header?: string;
  options?: ChatQuestionOption[];
  multiple?: boolean;
  /** The answers cannot be sent without this one. */
  required?: boolean;
  /** A choice ends with "Other", where the user writes their own answer; `false` leaves it out. */
  other?: boolean;
}

/** The answer to one question: the labels of the options taken, or the text written. */
export interface ChatQuestionAnswer {
  id: string;
  values: string[];
}

/**
 * What the user said to the questions. `declined`: they left the decision to the model ("Decide for me") and `answers`
 * is empty; otherwise the questions they answered, a question left empty not among them.
 */
export interface ChatQuestionsAnswer {
  declined: boolean;
  answers: ChatQuestionAnswer[];
}

/** Questions the model asked: the form takes the composer's place, the flow keeps the questions and their answers. */
export interface ChatQuestionsPart {
  kind: 'questions';
  id: string;
  questions: ChatQuestion[];
  /** What the user said; missing while they wait, and when the reply ended first. */
  answer?: ChatQuestionsAnswer;
}

/** A part that waits for the user: a tool call asking before it runs, a plan, questions. */
export type ChatRequestPart = ChatToolPart | ChatPlanPart | ChatQuestionsPart;

/** What the user said to a request. */
export type ChatAnswer = ChatPermissionAnswer | ChatPlanAnswer | ChatQuestionsAnswer;

/** A request waiting for the user: `answer` writes what they said and lets the reply go on; `null`, the reply ended. */
export interface ChatWaiting {
  readonly part: ChatRequestPart;
  answer(value: ChatAnswer | null): void;
}
