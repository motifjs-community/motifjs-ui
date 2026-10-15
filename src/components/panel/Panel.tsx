import type { Bind, IBaseProp } from '@motifx/core';
import { Control, type ControlProps } from '../../core/control';
import { DockHost } from '../../core/dock';
import { toSpace, type Space } from '../../core/space';

/** Props of {@link Panel}. */
export interface PanelProps extends ControlProps {
  /** Space inside the panel: a token step (`'md'`), pixels (`12`), a CSS length or a shorthand (`'sm lg'`). */
  padding?: Bind<Space | undefined>;
  /**
   * The panel scrolls its own content when it does not fit. A scrolling panel is a Tab stop, so keyboard users can scroll it (as
   * browsers make scrollers focusable); `tabStop={false}` opts out. Default `false`.
   */
  scrollable?: Bind<boolean>;
}

/**
 * A plain container: holds controls and lays them out by their `dock`
 * (top / bottom / start / end / fill / float), scrolls its own
 * content with `scrollable`, and takes `padding` as a token step or any CSS
 * length. Children without `dock` flow normally; once one child docks, the
 * flow children share the area that is left.
 *
 * @example
 * <Panel height="100%">
 *   <Toolbar dock="top" />
 *   <StatusBar dock="bottom" />
 *   <Tree dock="start" width={240} />
 *   <Editor dock="fill" />
 * </Panel>
 *
 * const p = new Panel({ padding: 'md', scrollable: true });
 * p.controls.add(new Button({ text: 'Top', dock: 'top' }));
 */
export class Panel<TElement extends HTMLElement = HTMLDivElement, TProps extends PanelProps = PanelProps> extends Control<
  TElement,
  TProps
> {
  constructor(element: TElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<TProps>?]));
    this.class.add(this.panelClass);
    new DockHost(this.element);
    const props = (this.props ?? {}) as PanelProps;
    if (props.padding !== undefined) this.bindProperty('padding', props.padding);
    if (props.scrollable !== undefined) this.bindProperty('scrollable', props.scrollable);
  }

  /** Space inside the panel (see the prop). Reactive. */
  get padding(): Space | undefined {
    return this.getProperty<Space | undefined>('padding');
  }
  set padding(value: Space | undefined) {
    this.setProperty('padding', value);
  }

  /** See the prop. Reactive. */
  get scrollable(): boolean {
    return !!this.getProperty<boolean>('scrollable');
  }
  set scrollable(value: boolean) {
    this.setProperty('scrollable', !!value);
  }

  /** The styling hook class; subclasses use their own. */
  protected get panelClass(): string {
    return 'mx-panel';
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'padding') this.element.style.padding = toSpace(value as Space | undefined);
    else if (name === 'scrollable') {
      const el = this.element;
      el.toggleAttribute('data-scrollable', !!value);
      // Reachable by keyboard; an explicit tabindex (or tabStop) wins.
      if (value && !el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('data-mx-scroll-stop', '');
      } else if (!value && el.hasAttribute('data-mx-scroll-stop')) {
        el.removeAttribute('tabindex');
        el.removeAttribute('data-mx-scroll-stop');
      }
    }
    else super.applyProperty(name, value);
  }
}
