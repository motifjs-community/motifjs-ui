import { createSignal, effect, untracked } from '@motifx/core';
import { moreMark } from '../../../core/glyphs';
import type { MenuItem } from '../../../parts/menu/menu-item';
import { Button } from '../../button/Button';
import type { GridActionLocation } from '../grid-action-location';
import type { ActionEntry } from '../model/action-entry';
import type { GridModel } from '../model/GridModel';
import { readField } from '../model/read-field';

type Shown<T> = { buttons: ActionEntry<T>[]; menu: ActionEntry<T>[] };

/** The face of a kit button: the element that takes focus and its name. */
const faceOf = (button: Button): HTMLElement =>
  button.element.classList.contains('mx-button__face') ? button.element : (button.element.querySelector<HTMLElement>('.mx-button__face') ?? button.element);

/**
 * The actions of the target rows in the toolbar or the bottom bar, as kit buttons the bar holds
 * (so its arrow keys and its "more" menu treat them as its own): one button per action, in order,
 * and one "Actions" menu button for those that go into a menu (`actionsDisplay: 'menu'`, an action's
 * `menu: 'always'`). Buttons are made as more are needed and kept, hidden while unused.
 */
export class BarButtons<T> {
  /** The action buttons, in order. */
  readonly buttons: Button[] = [];
  readonly menuButton: Button;
  private readonly shownSignal = createSignal<Shown<T>>({ buttons: [], menu: [] });
  private readonly stops: (() => void)[] = [];

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
    const sets = model.actionSets;
    const visible = () => options.visible?.() ?? true;
    this.menuButton = new Button({
      text: () => model.text('gridActions'),
      icon: () => moreMark(),
      menu: () => this.shown().menu.map((e) => this.menuItem(e)),
      enabled: () => !model.state.acting,
    });
    this.menuButton.element.classList.add('mx-data-grid__bar-menu');
    this.follow(this.menuButton, () => ({ shown: this.shown().menu.length > 0 && visible(), label: this.shown().menu.length ? sets.targetLabel() : null, id: null }));
    this.stops.push(
      effect(() => {
        const display = model.settings.get('actionsDisplay');
        const entries = sets.barEntries(location);
        const menu = entries.filter((e) => {
          const m = sets.menuOf(e.action);
          return m === 'always' || (display === 'menu' && m !== 'never');
        });
        const buttons = entries.filter((e) => !menu.includes(e));
        untracked(() => {
          this.shownSignal.value = { buttons, menu };
          while (this.buttons.length < buttons.length) this.addButton();
        });
      }),
    );
  }

  /** What shows now. Reactive. */
  shown(): Shown<T> {
    return this.shownSignal.value;
  }

  /** The buttons and the menu button, in the order they stand. */
  all(): Button[] {
    return [...this.buttons, this.menuButton];
  }

  dispose() {
    for (const stop of this.stops.splice(0)) stop();
  }

  private addButton() {
    const model = this.model;
    const sets = model.actionSets;
    const i = this.buttons.length;
    const at = () => this.shown().buttons[i] as ActionEntry<T> | undefined;
    const showsText = (e: ActionEntry<T>) => e.action.showText ?? (e.action.icon === undefined || e.action.icon === null);
    const button = new Button({
      text: () => {
        const e = at();
        return e && showsText(e) ? sets.label(e) : '';
      },
      icon: () => {
        const e = at();
        return e && e.action.icon !== undefined ? readField(e.action, 'icon') : null;
      },
      hint: () => {
        const e = at();
        if (!e) return '';
        return readField(e.action, 'hint') ?? (showsText(e) ? '' : sets.label(e));
      },
      tone: () => at()?.action.tone ?? 'standard',
      enabled: () => !!at() && !at()!.disabled && !model.state.acting,
      focusableWhenDisabled: true,
    });
    button.element.classList.add('mx-data-grid__bar-action');
    button.element.addEventListener('click', () => {
      const e = this.shown().buttons[i];
      if (e && !e.disabled && !model.state.acting) this.options.run(e);
    });
    this.follow(button, () => {
      const e = at();
      return { shown: !!e && (this.options.visible?.() ?? true), label: e && e.count > 1 ? sets.spokenLabel(e) : null, id: e?.action.id ?? null };
    });
    this.buttons.push(button);
    this.options.added(button);
  }

  /**
   * Shows or hides a button, and writes its spoken name, what it acts on and its action's id, as
   * they change. Hidden with the attribute: the button keeps its place among the bar's children.
   */
  private follow(button: Button, look: () => { shown: boolean; label: string | null; id: string | null }) {
    const describedBy = this.options.describedBy;
    this.stops.push(
      effect(() => {
        const { shown, label, id } = look();
        untracked(() => {
          button.element.hidden = !shown;
          const face = faceOf(button);
          if (label) face.setAttribute('aria-label', label);
          else face.removeAttribute('aria-label');
          if (describedBy) face.setAttribute('aria-describedby', describedBy);
          if (id) button.element.dataset.action = id;
          else delete button.element.dataset.action;
        });
      }),
    );
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
