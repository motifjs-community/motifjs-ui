import { motifComponent, type Component, type ComponentBase } from '@motifx/core';
import { text } from '../../core/part-writes';
import type { CodeHighlighter } from './code-highlighter';
import { TextRun } from './text-run';

/** What the writer asks of the component it draws for; read when a part is made, so a change reaches what comes next. */
export interface MarkdownSettings {
  readonly owner: ComponentBase;
  readonly highlighter: CodeHighlighter | null;
  readonly images: boolean;
  readonly copyButton: boolean;
  imageAllowed(src: string): boolean;
  /** A link was made: its address (null when it is not a safe one), target and listener are the component's. */
  linkMade(link: Component<HTMLAnchorElement>, href: string | null, title: string): void;
}

/** The writers' shared state: the settings, and the text runs to write at the end of the current write. */
export class MarkdownContext {
  private readonly dirty = new Set<TextRun>();

  constructor(readonly settings: MarkdownSettings) {}

  /** A new text node at the end of `host`. Core builds it with the run's value of that moment, not of its making. */
  run(host: ComponentBase): TextRun {
    return new TextRun((run) => {
      const node = motifComponent('text', (c: ComponentBase) => c.setText(run.value)) as ComponentBase;
      host.controls.add(node);
      return node;
    });
  }

  touch(run: TextRun): void {
    this.dirty.add(run);
  }

  /** Writes every run that grew since the last flush: one text write per node per write call. */
  flush(): void {
    for (const run of this.dirty) if (!run.node.isDisposed) text(run.node, run.value);
    this.dirty.clear();
  }
}
