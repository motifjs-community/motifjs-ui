import { reactive } from '@motifx/core';
import type { OutlineEntry } from './outline-entry';

/**
 * The sections of the page on screen. Each `Section` adds itself with the page it belongs to and
 * leaves with it. The router disposes a left page after the new one is shown, so the first section
 * of a new page starts the list again, and a late removal only takes its own entry.
 */
export class PageOutline {
  readonly state = reactive({ sections: [] as OutlineEntry[], current: '' });
  private page: object | null = null;

  get sections(): readonly OutlineEntry[] {
    return this.state.sections;
  }

  /** The section being read. */
  get current(): string {
    return this.state.current;
  }
  set current(anchor: string) {
    this.state.current = anchor;
  }

  /** Adds a section of `page`; returns the function that removes it. */
  add(entry: OutlineEntry, page: object): () => void {
    if (page !== this.page) {
      this.page = page;
      this.state.sections = [];
      this.state.current = '';
    }
    const own = { ...entry };
    this.state.sections.push(own);
    return () => {
      if (page !== this.page) return;
      const sections = this.state.sections;
      const at = sections.findIndex((s) => s.anchor === own.anchor && s.title === own.title);
      if (at >= 0) sections.splice(at, 1);
    };
  }
}
