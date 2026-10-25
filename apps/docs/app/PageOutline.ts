import { reactive } from '@motifx/core';
import type { OutlineEntry } from './outline-entry';

/** The sections of the page on screen. Each `Section` adds itself and leaves with its page. */
export class PageOutline {
  readonly state = reactive({ sections: [] as OutlineEntry[], current: '' });

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

  /** Returns the function that removes it. */
  add(entry: OutlineEntry): () => void {
    this.state.sections.push(entry);
    return () => {
      const sections = this.state.sections;
      const at = sections.findIndex((s) => s.anchor === entry.anchor);
      if (at >= 0) sections.splice(at, 1);
    };
  }
}
