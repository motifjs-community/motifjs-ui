import type { CodeColorer } from './code-colorer';

/**
 * The door for any highlighter. `open` is called when a code block starts, with the language its fence names
 * (`''` for none); `null` keeps the block plain. A highlighter that loads later colours the blocks that open after
 * it is ready: lines already drawn are never coloured again.
 */
export interface CodeHighlighter {
  open(language: string): CodeColorer | null;
}
