import { givenList } from '../../core/given-field';
import { lineAfter } from '../../parts/menu/line-after';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { Button } from './Button';

/** A button as an item of the "more" menu: its name, icon (a copy of its own, see `IconSource`), state and menu. */
export function menuItemOf(button: Button): MenuItem {
  const face = button.faceComponent;
  const name = () => button.text || face.attr.get('aria-label') || button.hint || '';
  const press = () => face.attr.add({ click: true });
  const icon = () => button.iconCopy();
  if (button.hasMenu && button.split) {
    return { text: name, icon, hint: () => button.hint, tone: () => button.tone, enabled: () => button.isEnabled, items: () => [lineAfter<MenuItem>({ text: name, click: press }), ...givenList(button.menu)] };
  }
  if (button.hasMenu) {
    return { text: name, icon, hint: () => button.hint, tone: () => button.tone, enabled: () => button.isEnabled, items: () => button.menu };
  }
  return {
    text: name,
    icon,
    hint: () => button.hint,
    tone: () => button.tone,
    enabled: () => button.isEnabled,
    checked: () => (button.toggle ? button.pressed : undefined),
    click: press,
  };
}
