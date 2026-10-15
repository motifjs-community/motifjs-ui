import type { Bind, IBaseProp } from '@motifx/core';
import { Control, type ControlProps } from '../../core/control';
import { toSpace, type Space } from '../../core/space';

/** Direction of a {@link Stack}. */
export type StackOrientation = 'vertical' | 'horizontal';
/** Cross-axis alignment of the children. */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
/** Main-axis distribution of the children. */
export type StackJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

/** Props of {@link Stack}. */
export interface StackProps extends ControlProps {
  /** `vertical` (default, top to bottom) or `horizontal` (in reading direction, so RTL flips it). */
  orientation?: Bind<StackOrientation>;
  /** Space between children: a token step (`'sm'`), pixels or any CSS length. Default `'none'`. */
  gap?: Bind<Space | undefined>;
  /** Space inside the stack, like `Panel.padding`. */
  padding?: Bind<Space | undefined>;
  /** Cross-axis alignment. Default `stretch` for vertical, `center` for horizontal. */
  align?: Bind<StackAlign | undefined>;
  /** Main-axis distribution. Default `start`. */
  justify?: Bind<StackJustify | undefined>;
  /** Wrap children onto new lines/columns when they do not fit. Default `false`. */
  wrap?: Bind<boolean>;
}

const OWN = ['orientation', 'gap', 'padding', 'align', 'justify', 'wrap'] as const;

/**
 * Lays its children out in one line, vertically or
 * horizontally, with a gap between them. Everything is CSS flexbox: no script
 * runs on resize. Horizontal stacks follow the reading direction (RTL too).
 *
 * @example
 * <Stack orientation="horizontal" gap="sm" justify="end">
 *   <Button text="Cancel" />
 *   <Button text="OK" tone="accent" />
 * </Stack>
 *
 * const s = new Stack({ gap: 8 });
 * s.controls.add(new Button({ text: 'One' }), new Button({ text: 'Two' }));
 * s.orientation = 'horizontal';
 */
export class Stack<TProps extends StackProps = StackProps> extends Control<HTMLDivElement, TProps> {
  constructor(element: HTMLDivElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<TProps>?]));
    this.class.add('mx-stack');
    this.element.setAttribute('data-orientation', 'vertical');
    const props = (this.props ?? {}) as StackProps;
    for (const name of OWN) if (props[name] !== undefined) this.bindProperty(name, props[name]);
  }

  /** See the prop. Reactive. */
  get orientation(): StackOrientation {
    return this.getProperty<StackOrientation | undefined>('orientation') ?? 'vertical';
  }
  set orientation(value: StackOrientation) {
    this.setProperty('orientation', value);
  }
  get gap(): Space | undefined {
    return this.getProperty<Space | undefined>('gap');
  }
  set gap(value: Space | undefined) {
    this.setProperty('gap', value);
  }
  get padding(): Space | undefined {
    return this.getProperty<Space | undefined>('padding');
  }
  set padding(value: Space | undefined) {
    this.setProperty('padding', value);
  }
  get align(): StackAlign | undefined {
    return this.getProperty<StackAlign | undefined>('align');
  }
  set align(value: StackAlign | undefined) {
    this.setProperty('align', value);
  }
  get justify(): StackJustify | undefined {
    return this.getProperty<StackJustify | undefined>('justify');
  }
  set justify(value: StackJustify | undefined) {
    this.setProperty('justify', value);
  }
  get wrap(): boolean {
    return !!this.getProperty<boolean>('wrap');
  }
  set wrap(value: boolean) {
    this.setProperty('wrap', !!value);
  }

  protected override applyProperty(name: string, value: unknown): void {
    const el = this.element;
    switch (name) {
      case 'orientation':
        el.setAttribute('data-orientation', value === 'horizontal' ? 'horizontal' : 'vertical');
        break;
      case 'gap':
        el.style.gap = toSpace(value as Space | undefined);
        break;
      case 'padding':
        el.style.padding = toSpace(value as Space | undefined);
        break;
      case 'align':
      case 'justify':
        if (value) el.setAttribute(`data-${name}`, String(value));
        else el.removeAttribute(`data-${name}`);
        break;
      case 'wrap':
        el.toggleAttribute('data-wrap', !!value);
        break;
      default:
        super.applyProperty(name, value);
    }
  }
}
