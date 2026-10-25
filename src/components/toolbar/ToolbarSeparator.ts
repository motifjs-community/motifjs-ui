import type { IBaseProp } from '@motifx/core';
import { Control, type ControlProps } from '../../core/control';

/** A line between groups of a `Toolbar` (`role="separator"`); it turns with the toolbar. */
export class ToolbarSeparator extends Control<HTMLDivElement, ControlProps> {
  constructor(props?: IBaseProp<ControlProps>) {
    super(props);
    this.element.classList.add('mx-toolbar__separator');
    this.element.setAttribute('role', 'separator');
    this.element.setAttribute('aria-orientation', 'vertical');
  }
}
