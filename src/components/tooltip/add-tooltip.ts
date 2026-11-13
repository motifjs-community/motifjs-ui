import { Tooltip } from './Tooltip';
import { linkTooltip, unlinkTooltip } from './tooltip-hub';
import type { TooltipProps } from './tooltip-props';
import type { TooltipTarget } from './tooltip-target';

/**
 * Adds a tooltip to the component `target`, created on first use, so it is efficient for many components.
 * Returns a function that removes it. It is also removed along with the component.
 *
 * @example
 * for (const cell of row.cells) addTooltip(cell, cell.title);
 * const remove = addTooltip(this.help, { text: 'Opens the guide', placement: 'end' });
 */
export function addTooltip(anchor: TooltipTarget, options: string | Omit<TooltipProps, 'target'>): () => void {
  const props = typeof options === 'string' ? { text: options } : options;
  let tooltip: Tooltip | null = null;
  let removed = false;
  const create = () => (tooltip ??= new Tooltip({ ...props, target: anchor }));
  linkTooltip(anchor, create);
  const remove = () => {
    if (removed) return;
    removed = true;
    unlinkTooltip(anchor, create);
    const made = tooltip as Tooltip | null;
    if (made) unlinkTooltip(anchor, made);
    made?.close();
    void made?.dispose();
  };
  anchor.motif.setDisposable(remove);
  return remove;
}
