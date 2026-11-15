import { Component, type ComponentBase } from '@motifx/core';
import { focusAndSelect, rememberFocus } from './focus';
import { windowOf } from './page-documents';
import { placeOnPage } from './page-layer';
import { text } from './part-writes';
import { onDocument } from './window-events';

/** What goes on the clipboard: plain text, and the same as HTML where it has one. */
export interface ClipboardText {
  text: string;
  html?: string;
}

/**
 * Puts `content` on the clipboard of the window `owner` is in: through the Clipboard API where the page may use it,
 * else through the copy command, which also works where the API is missing or refused (plain http, an older browser).
 */
export function writeClipboard(owner: ComponentBase, content: ClipboardText): void {
  const view = windowOf(owner);
  const clipboard = view?.navigator.clipboard;
  if (!view || typeof clipboard?.writeText !== 'function') {
    copyByCommand(owner, content);
    return;
  }
  // The window's own constructors: a window the app opened has its own.
  const { ClipboardItem: Item, Blob: Data } = view as Window & { ClipboardItem?: typeof ClipboardItem; Blob: typeof Blob };
  let job: Promise<void>;
  try {
    job =
      content.html !== undefined && typeof Item === 'function' && typeof clipboard.write === 'function'
        ? clipboard.write([new Item({ 'text/plain': new Data([content.text], { type: 'text/plain' }), 'text/html': new Data([content.html], { type: 'text/html' }) })])
        : clipboard.writeText(content.text);
  } catch (error) {
    job = Promise.reject(error);
  }
  void job.catch(() => {
    if (!owner.isDisposed) copyByCommand(owner, content);
  });
}

/** The copy command over a text area put on the page for a moment; returns whether the browser copied. */
function copyByCommand(owner: ComponentBase, content: ClipboardText): boolean {
  const doc = windowOf(owner)?.document;
  if (typeof doc?.execCommand !== 'function') return false;
  const fill = (e: ClipboardEvent) => {
    if (!e.clipboardData) return;
    e.clipboardData.setData('text/plain', content.text);
    if (content.html !== undefined) e.clipboardData.setData('text/html', content.html);
    e.preventDefault();
  };
  const area = new Component<HTMLTextAreaElement>('textarea');
  area.class.add('mx-copy-area');
  area.attr.add({ readonly: '', tabindex: '-1', 'aria-hidden': 'true' });
  text(area, content.text);
  placeOnPage(owner, area);
  const back = rememberFocus();
  const stop = onDocument(owner, 'copy', fill, true);
  try {
    focusAndSelect(area);
    return doc.execCommand('copy');
  } catch {
    // Not allowed here.
    return false;
  } finally {
    stop();
    back?.restore({ preventScroll: true });
    void area.dispose();
  }
}
