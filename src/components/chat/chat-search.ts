import { textRanges } from '../../core/text-ranges';
import { uiLocale } from '../../core/ui-locale';
import type { ChatMessage } from './chat-message';
import type { ChatPart } from './chat-part';
import type { ChatTurn } from './chat-turn';

/** Where a search found its text: in a part of a message of a turn, from `start` to `end` of the part's text. */
export interface ChatFound {
  turn: ChatTurn;
  message: ChatMessage;
  part: ChatPart;
  start: number;
  end: number;
}

/** A part's text in lower case, kept while its text and the language stay. */
interface Lowered {
  text: string;
  locale: string;
  lower: string;
}

/**
 * Finds a text in the messages of the conversation, the turns off the page too: in what the user wrote, the model's
 * texts and its plans, without case in the kit's language. A part's text in lower case is kept until it changes, so
 * each letter typed searches again at once.
 */
export class ChatSearch {
  query = '';
  found: ChatFound[] = [];
  /** The result shown: an index of `found`, or `-1`. */
  at = -1;
  /** The messages changed since the search: it runs again before it moves. */
  stale = false;
  private readonly lowered = new WeakMap<ChatPart, Lowered>();

  /** Searches the turns for `query`; the result shown is the last one, nearest the end. */
  run(turns: readonly ChatTurn[], query: string): void {
    this.query = query;
    this.found = [];
    this.stale = false;
    const needle = query.trim();
    if (needle) {
      const locale = uiLocale.locale;
      const lower = needle.toLocaleLowerCase(locale);
      for (const turn of turns) {
        for (const message of turn.messages) {
          for (const part of message.parts) {
            const said = part.kind === 'text' || part.kind === 'plan' ? part.text : '';
            if (said) this.collect(turn, message, part, said, needle, lower, locale);
          }
        }
      }
    }
    this.at = this.found.length - 1;
  }

  /** Searches again after the messages changed, staying on the result shown while it is still found. */
  again(turns: readonly ChatTurn[]): void {
    const was = this.found[this.at];
    const at = this.at;
    this.run(turns, this.query);
    const same = was ? this.found.findIndex((f) => f.part === was.part && f.start === was.start) : -1;
    this.at = same >= 0 ? same : Math.min(at, this.found.length - 1);
  }

  /** Goes `step` results on, around the ends; `false` when there is none. */
  move(step: number): boolean {
    const count = this.found.length;
    if (!count) return false;
    this.at = (((this.at + step) % count) + count) % count;
    return true;
  }

  clear(): void {
    this.query = '';
    this.found = [];
    this.at = -1;
    this.stale = false;
  }

  private collect(turn: ChatTurn, message: ChatMessage, part: ChatPart, said: string, needle: string, lower: string, locale: string): void {
    let kept = this.lowered.get(part);
    if (!kept || kept.text !== said || kept.locale !== locale) {
      kept = { text: said, locale, lower: said.toLocaleLowerCase(locale) };
      this.lowered.set(part, kept);
    }
    // A letter whose lower case is longer moves the places after it: those texts are searched letter by letter.
    if (kept.lower.length !== said.length) {
      for (const [start, end] of textRanges(said, needle, locale, false)) this.found.push({ turn, message, part, start, end });
      return;
    }
    for (let at = kept.lower.indexOf(lower); at >= 0; at = kept.lower.indexOf(lower, at + lower.length)) {
      this.found.push({ turn, message, part, start: at, end: at + lower.length });
    }
  }
}
