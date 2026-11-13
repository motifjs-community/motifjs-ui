import { untracked, type ComponentBase } from '@motifx/core';
import { fieldOf } from '../../../core/command-fields';
import { put } from '../../../core/part-writes';
import { MenuList } from '../../../parts/menu/MenuList';
import type { MenuItem } from '../../../parts/menu/menu-item';
import { Popup } from '../../../parts/popup/Popup';

/**
 * One kit `MenuList` in a `Popup`, shared by every row (the "more" menu of the actions) or every
 * filter cell (the conditions): opened next to the button that asks, focus inside, back on the
 * button when it closes. Tab closes it.
 */
export class MenuPopup {
  readonly popup: Popup;
  readonly list: MenuList;

  constructor(owner: ComponentBase, className: string, placement: Popup['placement'] = 'bottom-end') {
    const popup = new Popup();
    popup.placement = placement;
    popup.matchWidth = false;
    popup.class.add(className);
    const list = new MenuList();
    list.source = owner;
    popup.controls.add(list);
    owner.controls.add(popup);
    list.onChosen((e) => {
      popup.close('code');
      e.item.click?.(e);
    });
    popup.motif.on('keydown', (_, e) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      popup.close('code');
    });
    this.popup = popup;
    this.list = list;
  }

  get opened(): boolean {
    return this.popup.isOpen;
  }

  /** Opens next to `anchor` (the button that asks); focus goes back to `returnTo` when it closes. */
  open(items: readonly MenuItem[], anchor: ComponentBase, label: string, returnTo: ComponentBase = anchor) {
    put(this.list, 'aria-label', label);
    this.list.setItems(items);
    this.popup.open(anchor, { toggle: anchor, returnFocus: returnTo });
    this.list.focusItem('first');
  }

  /** Focuses the item that is checked (a condition), else the first. */
  focusChecked() {
    this.list.focusWhere((item) => untracked(() => !!fieldOf(item, 'checked', this.list)));
  }

  close() {
    this.popup.close('code');
  }
}
