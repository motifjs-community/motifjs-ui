import { isElement } from '../../core/node-kind';
import { Tooltip } from './Tooltip';
import { linkTooltip, unlinkTooltip } from './tooltip-hub';
import type { TooltipProps } from './tooltip-props';
import type { TooltipTarget } from './tooltip-target';

/**
 * Adds a tooltip to `target`, created on first use, so it is efficient for many elements.
 * Returns a function that removes it. For a component, it is removed along with the component.
 *
 * @example
 * for (const cell of row.cells) addTooltip(cell, cell.title);
 * const remove = addTooltip(this.help, { text: 'Opens the guide', placement: 'end' });
 */
export function addTooltip(target: TooltipTarget, options: string | Omit<TooltipProps, 'target'>): () => void {
  const element = isElement(target) ? target : (target.element as Element);
  const props = typeof options === 'string' ? { text: options } : options;
  let tooltip: Tooltip | null = null;
  let removed = false;
  const create = () => (tooltip ??= new Tooltip({ ...props, target: element }));
  linkTooltip(element, create);
  const remove = () => {
    if (removed) return;
    removed = true;
    unlinkTooltip(element, create);
    const made = tooltip as Tooltip | null;
    if (made) unlinkTooltip(element, made);
    made?.close();
    void made?.dispose();
  };
  if (!isElement(target)) target.motif.setDisposable(remove);
  return remove;
}
