import type { Component } from '@motifx/core';
import { clearParts, part } from '../../core/draw-parts';
import { put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { safeHref } from '../markdown/safe-href';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatSource, ChatSourcesPart } from './chat-part';

/**
 * The sources of a reply, a numbered chip each: its title and its site. A chip with a safe address is a link there,
 * opened where the chat's links open; what the reply took from the source is its hint. Sources added later follow.
 */
export class ChatSourcesEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly list: Component<HTMLDivElement>;
  private drawn = 0;

  constructor(private readonly sources: ChatSourcesPart, private readonly look: ChatLook) {
    const { row, main } = entryFrame('sources');
    this.row = row;
    this.list = part<HTMLDivElement>(main, 'div', 'mx-chat__sources');
    put(this.list, 'role', 'group');
    this.update();
  }

  append(): void {}

  update(): void {
    const items = this.sources.items;
    if (items.length < this.drawn) {
      clearParts(this.list);
      this.drawn = 0;
    }
    for (; this.drawn < items.length; this.drawn++) this.chip(items[this.drawn], this.drawn + 1);
    this.drawTexts();
  }

  drawTexts(): void {
    put(this.list, 'aria-label', uiLocale.strings.chatSources);
  }

  private chip(source: ChatSource, n: number): void {
    const href = source.url ? safeHref(source.url) : null;
    const chip = part<HTMLElement>(this.list, href ? 'a' : 'span', 'mx-chat__source');
    if (href) {
      put(chip, 'href', href);
      const target = this.look.linkTarget;
      if (target) {
        put(chip, 'target', target);
        put(chip, 'rel', 'noopener noreferrer');
      }
    }
    if (source.snippet) put(chip, 'title', source.snippet);
    text(part<HTMLSpanElement>(chip, 'span', 'mx-chat__source-index'), String(n));
    text(part<HTMLSpanElement>(chip, 'span', 'mx-chat__source-title'), source.title);
    const site = href ? this.siteOf(href) : '';
    if (site && site !== source.title) text(part<HTMLSpanElement>(chip, 'span', 'mx-chat__source-site'), site);
  }

  /** The site of an address, without `www.`; nothing for an address with no host. */
  private siteOf(href: string): string {
    try {
      return new URL(href).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }
}
