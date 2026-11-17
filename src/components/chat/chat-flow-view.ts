import type { Component, ComponentBase } from '@motifx/core';
import { loose } from '../../core/draw-parts';
import { ChatAskedEntry } from './chat-asked-entry';
import { ChatAttachmentEntry } from './chat-attachment-entry';
import { ChatCompactionEntry } from './chat-compaction-entry';
import type { ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import { ChatNoticeEntry } from './chat-notice-entry';
import type { ChatPart } from './chat-part';
import { ChatPlanEntry } from './chat-plan-entry';
import { ChatTextEntry } from './chat-text-entry';
import { ChatThinkingEntry } from './chat-thinking-entry';
import { ChatTodoEntry } from './chat-todo-entry';
import { ChatToolEntry } from './chat-tool-entry';

/**
 * What the model did in a turn, in order: one entry per part, each with its dot. A part added later is drawn at the
 * end; a part that changes draws its own entry again; text being written is added to its markdown.
 */
export class ChatFlowView {
  readonly row: Component<HTMLDivElement>;
  private readonly entries = new Map<ChatPart, ChatEntry>();
  /** The text being written: it ends when anything else comes, or when the reply ends. */
  private writing: ChatTextEntry | null = null;

  constructor(private readonly look: ChatLook, private readonly live: () => boolean) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__flow');
  }

  /** Draws `part` at the end. `open`: text still being written; `time`: the time shown above it. */
  add(part: ChatPart, open = false, time?: Date): void {
    this.close();
    const entry = this.make(part, open, time);
    this.entries.set(part, entry);
    this.row.controls.add(entry.row);
    if (open && entry instanceof ChatTextEntry) this.writing = entry;
  }

  append(part: ChatPart, delta: string): void {
    this.entries.get(part)?.append(delta);
  }

  update(part: ChatPart): void {
    this.entries.get(part)?.update();
  }

  /** What shows the character at `index` of `part`'s text, for a search; the part's row when nothing smaller does. */
  found(part: ChatPart, index: number): ComponentBase | null {
    const entry = this.entries.get(part);
    return entry ? (entry.found?.(index) ?? entry.row) : null;
  }

  /** The flow of the sub-agent a tool call runs. */
  innerOf(part: ChatPart): ChatFlowView | null {
    const entry = this.entries.get(part);
    return entry instanceof ChatToolEntry ? entry.flow() : null;
  }

  /** The text being written is complete. */
  close(): void {
    this.writing?.end();
    this.writing = null;
  }

  /** The choices of a request waiting in `part` take the focus. */
  focus(part: ChatPart): boolean {
    return this.entries.get(part)?.focus?.() ?? false;
  }

  /** The reply ended: every entry, a sub-agent's too, is drawn as it stands. */
  refresh(): void {
    for (const entry of this.entries.values()) {
      entry.update();
      if (entry instanceof ChatToolEntry) entry.innerFlow?.refresh();
    }
  }

  drawTexts(): void {
    for (const entry of this.entries.values()) entry.drawTexts();
  }

  private make(part: ChatPart, open: boolean, time?: Date): ChatEntry {
    switch (part.kind) {
      case 'text':
        return new ChatTextEntry(part, this.look, open, time);
      case 'thinking':
        return new ChatThinkingEntry(part, this.look, this.live());
      case 'tool':
        return new ChatToolEntry(part, this.look, () => new ChatFlowView(this.look, this.live), this.live);
      case 'todo':
        return new ChatTodoEntry(part);
      case 'notice':
        return new ChatNoticeEntry(part);
      case 'plan':
        return new ChatPlanEntry(part, this.look, this.live);
      case 'questions':
        return new ChatAskedEntry(part, this.look, this.live);
      case 'attachment':
        return new ChatAttachmentEntry(part);
      case 'compaction':
        return new ChatCompactionEntry(part, this.look);
    }
  }
}
