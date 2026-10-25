import type { Bind, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { LayoutSpace } from './layout-space';
import type { PanelProps } from './panel-props';
import type { PanelScroll } from './panel-scroll';
import type { PanelVariant } from './panel-variant';
import { setPadding } from './set-padding';

const OWN = ['scrollable', 'padding', 'variant'] as const;

function scrollOf(value: PanelScroll | undefined): 'vertical' | 'horizontal' | 'both' | null {
  if (value === true) return 'both';
  return value || null;
}

/**
 * A plain container: padding, an optional frame, and its own scrolling. A scrolling panel is a
 * Tab stop, so it can be scrolled with the keys; `text` names it (a region landmark).
 *
 * @example
 * <Panel scrollable="vertical" padding="md" variant="outline" text="Messages">…</Panel>
 *
 * const panel = new Panel({ padding: 'sm' });
 * panel.controls.add(new Button({ text: 'Later' }));
 */
export class Panel extends Control<HTMLDivElement, PanelProps> {
  constructor(props?: IBaseProp<PanelProps>) {
    super('div', props);
    const own = (this.props ?? {}) as PanelProps;
    this.element.classList.add('mx-panel');
    this.observeProperty<string>('text', (text) => this.renderName(text));
    this.observeProperty('scrollable', () => this.renderScroll());
    this.observeProperty<LayoutSpace>('padding', (padding) => setPadding(this.element, padding));
    this.observeProperty<PanelVariant>('variant', (variant) => (this.element.dataset.variant = variant ?? 'plain'));
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (this.childs?.length) this.controls.add(...this.childs);
  }

  get scrollable(): PanelScroll {
    return this.getProperty<PanelScroll | undefined>('scrollable') ?? false;
  }
  set scrollable(value: Bind<PanelScroll>) {
    this.assignProperty('scrollable', value);
  }
  get padding(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('padding');
  }
  set padding(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('padding', value);
  }
  get variant(): PanelVariant {
    return this.getProperty<PanelVariant | undefined>('variant') ?? 'plain';
  }
  set variant(value: Bind<PanelVariant>) {
    this.assignProperty('variant', value);
  }

  protected override applyProperty(name: string, value: unknown): void {
    // Only a scrolling panel is a Tab stop; renderScroll decides its tabindex.
    if (name === 'tabStop') this.renderScroll();
    else super.applyProperty(name, value);
  }

  private renderName(text: string | undefined): void {
    const el = this.element;
    if (text) {
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', text);
    } else {
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
    }
  }

  private renderScroll(): void {
    const el = this.element;
    const scroll = scrollOf(this.peekProperty<PanelScroll>('scrollable'));
    if (scroll) {
      el.dataset.scroll = scroll;
      el.tabIndex = this.peekProperty('tabStop') === false ? -1 : 0;
    } else {
      delete el.dataset.scroll;
      el.removeAttribute('tabindex');
    }
  }
}
