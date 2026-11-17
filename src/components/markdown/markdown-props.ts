import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { CodeHighlighter } from './code-highlighter';
import type { DiagramRenderer } from './diagram-renderer';
import type { MathRenderer } from './math-renderer';
import type { MarkdownLinkClickEventArgs } from './markdown-link-click-event-args';

/**
 * Props of `Markdown`. `text` (from `ControlProps`) is the markdown. Each prop is also a settable property, and a
 * function is tracked. A setting reaches the parts drawn after it changes; what is drawn stays as it is.
 */
export interface MarkdownProps extends ControlProps {
  /**
   * While `true`, `text` is still arriving: each new value that goes on from the last one adds only what is new, and
   * what is not understood yet stays at the end as text. `false` ends it. The default is `false`.
   */
  streaming?: Bind<boolean>;
  /** Colours code blocks; any highlighter fits through this door. The default is none: code stays plain. */
  highlighter?: Bind<CodeHighlighter | null>;
  /** Draws math (`$…$`, `$$…$$`, ```` ```math ````) once its TeX is complete. The default is none: `$` is text. */
  mathRenderer?: Bind<MathRenderer | null>;
  /** Draws a fenced block in a language it draws (`mermaid`) once its code is complete. The default is none. */
  diagramRenderer?: Bind<DiagramRenderer | null>;
  /**
   * Shows images. The default is `false`: an image address in a model's answer can carry data away, so an image is
   * shown as a link to it until images are allowed.
   */
  images?: Bind<boolean>;
  /** With `images`, decides which addresses may be shown; the others stay links. The default allows every safe one. */
  allowImage?: Bind<((src: string) => boolean) | null>;
  /** Where links open. The default is `'_blank'`; `''` opens them in the same tab. */
  linkTarget?: Bind<string>;
  /** Shows a copy button on code blocks. The default is `true`. */
  copyButton?: Bind<boolean>;
  /**
   * A code block longer than this many lines shows that many, folded, and a button under it shows them all. The
   * default is `0`: every line shows.
   */
  codeLines?: Bind<number>;
  onLinkClick?: (e: MarkdownLinkClickEventArgs) => void;
}
