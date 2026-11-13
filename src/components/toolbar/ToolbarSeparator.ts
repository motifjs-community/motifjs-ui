import type { IBaseProp } from '@motifx/core';
import { Control, type ControlProps } from '../../core/control';

/** A line between groups of a `Toolbar` (`role="separator"`). It follows the toolbar's orientation. */
export class ToolbarSeparator extends Control<HTMLDivElement, ControlProps> {
  constructor(props?: IBaseProp<ControlProps>) {
    super(props);
    this.class.add('mx-toolbar__separator');
    this.attr.add({ role: 'separator', 'aria-orientation': 'vertical' });
  }
}
