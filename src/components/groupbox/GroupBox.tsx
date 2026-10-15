import type { Component, IBaseProp } from '@motifx/core';
import { tabbableIn } from '../../core/focus';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { toSpace, type Space } from '../../core/space';
import { Panel, type PanelProps } from '../panel/Panel';

/** Props of {@link GroupBox}: those of {@link Panel}; `text` is the caption. */
export type GroupBoxProps = PanelProps;

/**
 * A titled frame around related controls. It is a real
 * `<fieldset>` with a `<legend>`, so assistive tech announces the group by its
 * caption. Otherwise it is a Panel: `padding`, `scrollable`, docked children,
 * and `controls.add` puts controls inside the frame. `&` in `text` gives it an
 * access key that moves focus to its first control.
 *
 * @example
 * <GroupBox text="&Shipping address">
 *   <Stack gap="sm">…</Stack>
 * </GroupBox>
 *
 * const g = new GroupBox({ text: 'Options', padding: 'lg' });
 * g.controls.add(new Button({ text: 'Reset' }));
 */
export class GroupBox extends Panel<HTMLFieldSetElement, GroupBoxProps> {
  static override elementTag = 'fieldset';

  private legend: HTMLLegendElement | null = null;

  constructor(element: HTMLFieldSetElement | string, props?: IBaseProp<GroupBoxProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<GroupBoxProps>);
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<GroupBoxProps>?]));
  }

  protected override get panelClass(): string {
    return 'mx-groupbox';
  }

  override view() {
    const frame = (
      <>
        <legend class="mx-groupbox__header" ref={(c: Component<HTMLLegendElement>) => this.attachLegend(c.element)} />
        {this.childs}
      </>
    );
    this.observeProperty<string>('text', (text) => this.renderText(text));
    return frame;
  }

  /** Its access key moves focus to the first control inside the group. */
  override onAccessKey(): boolean {
    const first = tabbableIn(this.element)[0];
    first?.focus();
    return !!first;
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name !== 'padding') return;
    // The legend sits inside the start padding; tell it how much, per side,
    // so the caption keeps its place whatever the padding (LTR and RTL).
    const parts = toSpace(value as Space | undefined).split(' ').filter(Boolean);
    const style = this.element.style;
    if (!parts.length) {
      style.removeProperty('--_mx-pad-left');
      style.removeProperty('--_mx-pad-right');
      return;
    }
    style.setProperty('--_mx-pad-right', parts[1] ?? parts[0]);
    style.setProperty('--_mx-pad-left', parts[3] ?? parts[1] ?? parts[0]);
  }

  /** The ref arrives once the legend is placed: draw the caption it missed. */
  private attachLegend(legend: HTMLLegendElement): void {
    this.legend = legend;
    this.renderText(this.peekProperty<string>('text') ?? '');
  }

  private renderText(text: string): void {
    const legend = this.legend;
    if (!legend) return;
    const parsed = parseAccessKey(text ?? '');
    renderAccessKey(legend, parsed);
    legend.hidden = !parsed.text;
    this.setAccessKey(parsed.key);
  }
}
