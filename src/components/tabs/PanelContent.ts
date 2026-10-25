import type { ComponentBase } from '@motifx/core';

/** What a panel's `content` factory returns. */
export type ContentFactory = () => ComponentBase | readonly ComponentBase[];

/**
 * The content of a panel that is built when it is first shown: the JSX children, kept once
 * placed, and what a `content` factory makes, which can be dropped while the panel is hidden
 * and made again the next time.
 */
export class PanelContent {
  private placedChildren = false;
  private made: ComponentBase[] | null = null;

  constructor(
    private readonly host: ComponentBase,
    private readonly children: readonly ComponentBase[],
    private readonly factory: ContentFactory | undefined,
  ) {}

  get isBuilt(): boolean {
    return this.placedChildren && (!this.factory || !!this.made);
  }

  build(): void {
    if (!this.placedChildren) {
      this.placedChildren = true;
      if (this.children.length) this.host.controls.add(...this.children);
    }
    if (this.factory && !this.made) {
      const made = this.factory();
      this.made = Array.isArray(made) ? [...made] : [made as ComponentBase];
      this.host.controls.add(...this.made);
    }
  }

  /** Disposes what the factory made; the JSX children stay. */
  release(): void {
    if (!this.made) return;
    for (const component of this.made) this.host.controls.remove(component);
    this.made = null;
  }
}
