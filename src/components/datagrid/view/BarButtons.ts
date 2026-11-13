import { untracked, type ComponentBase } from '@motifx/core';
import { moreMark } from '../../../core/glyphs';
import { kept, put } from '../../../core/part-writes';
import type { MenuItem } from '../../../parts/menu/menu-item';
import { Button } from '../../button/Button';
import type { GridActionLocation } from '../grid-action-location';
import type { ActionEntry } from '../model/action-entry';
import type { GridModel } from '../model/GridModel';
import { readField } from '../model/read-field';

type Shown<T> = { buttons: ActionEntry<T>[]; menu: ActionEntry<T>[] };

/** The face of a kit button: the part that takes focus and its name. */
const faceOf = (button: Button): ComponentBase => button.faceComponent;

/**
 * The actions of the target rows in the toolbar or the bottom bar, as kit buttons the bar holds
 * (so its arrow keys and its "more" menu treat them as its own): one button per action, in order,
 * and one "Actions" menu button for those that go into a menu (`actionsDisplay: 'menu'`, an action's
 * `menu: 'always'`). Buttons are created as more are needed and kept, hidden while unused. It follows
 * nothing: the bar that holds it draws it again (`draw`) whenever the grid tells a change.
 */
export class BarButtons<T> {
  /** The action buttons, in order. */
  readonly buttons: Button[] = [];
  readonly menuButton: Button;
  private current: Shown<T> = { buttons: [], menu: [] };
  /** The menu's items as they were last given to the menu button. */
  private menuSeen: unknown[] | null = null;
  /** The icon each button shows, as it was last given. */
  private readonly icons = new WeakMap<Button, unknown>();
  private disposed = false;

  constructor(
    private readonly model: GridModel<T>,
    private readonly location: GridActionLocation,
    private readonly options: {
      run: (entry: ActionEntry<T>) => void;
      /** A new button joined: the bar puts it in its place. */
      added: (button: Button) => void;
      /** Whether the bar's item shows at all (the toolbar item's `visible`). */
      visible?: () => boolean;
      /** Id of the element that says what the buttons act on. */
      describedBy?: string;
    },
  ) {
    this.menuButton = new Button({ icon: moreMark(), menu: [] });
    this.menuButton.class.add('mx-data-grid__bar-menu');
    this.draw();
  }

  /** What shows now. */
  shown(): Shown<T> {
    return this.current;
  }

  /** The buttons and the menu button, in the order they stand. */
  all(): Button[] {
    return [...this.buttons, this.menuButton];
  }

  dispose() {
    this.disposed = true;
  }

  /** Draws the buttons and the menu button as the target rows and their actions are now. */
  draw() {
    if (this.disposed) return;
    untracked(() => {
      const { model, options } = this;
      const sets = model.actionSets;
      const display = model.settings.get('actionsDisplay');
      const entries = sets.barEntries(this.location);
      const menu = entries.filter((e) => {
        const m = sets.menuOf(e.action);
        return m === 'always' || (display === 'menu' && m !== 'never');
      });
      const buttons = entries.filter((e) => !menu.includes(e));
      this.current = { buttons, menu };
      while (this.buttons.length < buttons.length) this.addButton();
      const visible = options.visible?.() ?? true;
      const acting = model.state.acting;
      const showsText = (e: ActionEntry<T>) => e.action.showText ?? (e.action.icon === undefined || e.action.icon === null);
      this.buttons.forEach((button, i) => {
        const e = buttons[i] as ActionEntry<T> | undefined;
        button.text = e && showsText(e) ? sets.label(e) : '';
        const icon = e && e.action.icon !== undefined ? readField(e.action, 'icon') : null;
        if (!this.icons.has(button) || !Object.is(this.icons.get(button), icon)) {
          this.icons.set(button, icon);
          button.icon = icon ?? null;
        }
        button.hint = !e ? '' : (readField(e.action, 'hint') ?? (showsText(e) ? '' : sets.label(e)));
        button.tone = e?.action.tone ?? 'standard';
        button.enabled = !!e && !e.disabled && !acting;
        this.look(button, !!e && visible, e && e.count > 1 ? sets.spokenLabel(e) : null, e?.action.id ?? null);
      });
      const m = this.menuButton;
      m.text = model.text('gridActions');
      const items = menu.flatMap((e) => [sets.label(e), e.action.icon, e.action.hint, e.action.tone, e.disabled, e.action.beginGroup, e.action.id]);
      if (!this.menuSeen || items.length !== this.menuSeen.length || items.some((v, i) => !Object.is(v, this.menuSeen![i]))) {
        this.menuSeen = items;
        m.menu = menu.map((e) => this.menuItem(e));
      }
      m.enabled = !acting;
      this.look(m, menu.length > 0 && visible, menu.length ? sets.targetLabel() : null, null);
    });
  }

  private addButton() {
    const model = this.model;
    const i = this.buttons.length;
    const button = new Button({ focusableWhenDisabled: true });
    button.class.add('mx-data-grid__bar-action');
    button.motif.on('click', () => {
      const e = this.current.buttons[i];
      if (e && !e.disabled && !model.state.acting) this.options.run(e);
    });
    this.buttons.push(button);
    this.options.added(button);
  }

  /**
   * Shows or hides a button, and writes its spoken name, what it acts on and its action's id. Hidden
   * the MotifJS way: the button keeps its place among the bar's children.
   */
  private look(button: Button, shown: boolean, label: string | null, id: string | null) {
    const describedBy = this.options.describedBy;
    kept(button, shown);
    const face = faceOf(button);
    put(face, 'aria-label', label);
    if (describedBy) put(face, 'aria-describedby', describedBy);
    put(button, 'data-action', id);
  }

  private menuItem(e: ActionEntry<T>): MenuItem {
    const sets = this.model.actionSets;
    return {
      text: sets.label(e),
      icon: e.action.icon,
      hint: e.action.hint,
      tone: e.action.tone,
      enabled: !e.disabled,
      beginGroup: e.action.beginGroup,
      data: e.action.id,
      click: () => this.options.run(e),
    };
  }
}
