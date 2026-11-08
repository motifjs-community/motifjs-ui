import type { IconSource } from '../../core/icon-source';
import { givenList } from '../../core/given-field';
import { isNode } from '../../core/node-kind';
import { lineAfter } from '../../parts/menu/line-after';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { Button } from './Button';

/** The menu shows a copy: the node of an icon stays in its button. */
function iconCopy(icon: IconSource | null): IconSource | null {
  if (!icon || typeof icon === 'string') return icon;
  const node = isNode(icon) ? icon : (icon.element as Node | undefined);
  return node ? node.cloneNode(true) : null;
}

/** A button as an item of the "more" menu: its name, icon, state and menu. */
export function menuItemOf(button: Button): MenuItem {
  const face = button.element.querySelector<HTMLElement>('.mx-button__main') ?? button.element;
  const name = () => button.text || face.getAttribute('aria-label') || button.hint || face.textContent?.trim() || '';
  const press = () => face.click();
  if (button.hasMenu && button.split) {
    return { text: name, icon: () => iconCopy(button.icon), hint: () => button.hint, tone: () => button.tone, enabled: () => button.isEnabled, items: () => [lineAfter<MenuItem>({ text: name, click: press }), ...givenList(button.menu)] };
  }
  if (button.hasMenu) {
    return { text: name, icon: () => iconCopy(button.icon), hint: () => button.hint, tone: () => button.tone, enabled: () => button.isEnabled, items: () => button.menu };
  }
  return {
    text: name,
    icon: () => iconCopy(button.icon),
    hint: () => button.hint,
    tone: () => button.tone,
    enabled: () => button.isEnabled,
    checked: () => (button.toggle ? button.pressed : undefined),
    click: press,
  };
}
