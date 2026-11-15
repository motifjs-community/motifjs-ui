import type { Markdown } from './Markdown';

/** The arguments of `onLinkClick`. Set `cancel` to keep the browser from following the link. */
export interface MarkdownLinkClickEventArgs {
  /** The link's address, as safe addresses are written; `''` for a link whose address was not safe. */
  href: string;
  event: MouseEvent;
  cancel: boolean;
  source: Markdown;
}
