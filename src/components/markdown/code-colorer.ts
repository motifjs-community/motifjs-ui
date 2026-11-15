import type { CodeRun } from './code-run';

/** Colours the lines of one code block, in order, so a highlighter that keeps state between lines works too. */
export interface CodeColorer {
  /**
   * Splits a finished line into runs. Their texts joined must be the line exactly; otherwise the line stays plain.
   * Called once per line, when the line ends.
   */
  line(text: string): readonly CodeRun[];
  /** The block ended. */
  close?(): void;
}
