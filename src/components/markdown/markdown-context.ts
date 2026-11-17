import { Component, errorHandler, motifComponent, type ComponentBase } from '@motifx/core';
import { focusOn } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { onLanguage } from '../../core/on-language';
import { put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { CodeHighlighter } from './code-highlighter';
import type { DiagramRenderer } from './diagram-renderer';
import type { MathRenderer } from './math-renderer';
import { TextRun } from './text-run';

/** What the writer asks of the component it draws for; read when a part is made, so a change reaches what comes next. */
export interface MarkdownSettings {
  readonly owner: ComponentBase;
  readonly highlighter: CodeHighlighter | null;
  readonly mathRenderer: MathRenderer | null;
  readonly diagramRenderer: DiagramRenderer | null;
  readonly images: boolean;
  readonly copyButton: boolean;
  /** A code block longer than this many lines is folded to them; `0` folds none. */
  readonly codeLines: number;
  imageAllowed(src: string): boolean;
  /** A link was made: its address (null when it is not a safe one), target and listener are the component's. */
  linkMade(link: Component<HTMLAnchorElement>, href: string | null, title: string): void;
}

/** A footnote: its number, by the order of the first references, the ids of its note and its first reference. */
export interface Footnote {
  number: number;
  id: string;
  refId: string;
  /** The first reference, which the note's back link goes to. */
  ref: ComponentBase | null;
  /** The note, once it is written. */
  note: ComponentBase | null;
}

/** The writers' shared state: the settings, the footnotes, and the text runs to write at the end of the current write. */
export class MarkdownContext {
  private readonly dirty = new Set<TextRun>();
  private readonly notes = new Map<string, Footnote>();
  /** Makes the ids of this markdown's footnotes its own. */
  private readonly prefix = nextId('markdown');

  constructor(readonly settings: MarkdownSettings) {}

  /** The footnote `label` names; the first time, it takes the next number. */
  footnote(label: string): Footnote {
    let note = this.notes.get(label);
    if (!note) {
      const number = this.notes.size + 1;
      note = { number, id: `${this.prefix}-fn-${number}`, refId: `${this.prefix}-fnref-${number}`, ref: null, note: null };
      this.notes.set(label, note);
    }
    return note;
  }

  /** The note of a footnote is written: it is the place its references go to, and it takes the focus there. */
  footnoteNote(note: Footnote, item: ComponentBase): void {
    note.note = item;
    put(item, 'id', note.id);
    put(item, 'value', String(note.number));
    put(item, 'tabindex', '-1');
  }

  /** A link of a footnote: a reference goes to its note, and a note's back link to its first reference. */
  footnoteLink(link: Component<HTMLAnchorElement>, note: Footnote, back: boolean): void {
    put(link, 'href', `#${back ? note.refId : note.id}`);
    if (!back && !note.ref) {
      note.ref = link;
      put(link, 'id', note.refId);
    }
    onLanguage(link, () => put(link, 'aria-label', uiLocale.text(back ? 'markdownFootnoteBack' : 'markdownFootnote', { number: note.number })));
    // The page's address stays: the link moves the focus, and the view goes with it.
    link.motif.on('click', (_sender, e) => {
      const target = back ? note.ref : note.note;
      if (!target || target.isDisposed) return;
      e.preventDefault();
      focusOn(target);
    });
  }

  /** Draws TeX through the math door: the element it gives, as a component, or null to keep the TeX. */
  math(tex: string, display: boolean): ComponentBase | null {
    const renderer = this.settings.mathRenderer;
    if (!renderer || !tex) return null;
    try {
      const element = renderer.render(tex, display);
      return element ? new Component(element as HTMLElement) : null;
    } catch (error) {
      errorHandler.reportSuppressed('Markdown', error);
      return null;
    }
  }

  /** Another text starts: its footnotes count from one again. */
  reset(): void {
    this.notes.clear();
  }

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
