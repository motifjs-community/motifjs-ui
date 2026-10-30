import { Component, untracked } from '@motifx/core';
import { handOver, mark, put, text } from '../../../core/draw-parts';
import { filterMark } from '../../../core/glyphs';
import { Button } from '../../button/Button';
import { CheckBox } from '../../checkbox/CheckBox';
import type { GridModel } from '../model/GridModel';
import type { FilterPanelHost } from './filter-panel-host';

/**
 * The filter panel under the rows: a check box that turns the filter value on and off, the filter
 * as text (pressing it opens the filter builder), "Create Filter" while there is none, and "Clear".
 * It follows nothing: made in code, it draws itself again whenever the grid tells a change.
 */
export class FilterPanel<T> extends Component<HTMLDivElement> {
  /** The text button, where focus goes back when the builder closes. */
  textButton: HTMLButtonElement | null = null;
  private enabled: CheckBox | null = null;
  private clear: Button | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: FilterPanelHost,
  ) {
    super('div');
  }

  override onConfigured() {
    this.element.className = 'mx-data-grid__filter-panel';
    this.element.setAttribute('role', 'group');
    this.motif.setDisposable(this.grid.notices.on(() => this.draw()));
  }

  override initializeComponent() {
    const { host } = this;
    const icon = new Component<HTMLSpanElement>('span');
    icon.element.className = 'mx-data-grid__filter-icon';
    icon.element.setAttribute('aria-hidden', 'true');
    icon.element.append(filterMark());
    const enabled = new CheckBox({ labelMode: 'hidden', size: 'sm' });
    enabled.element.classList.add('mx-data-grid__filter-enabled');
    enabled.onValueChanged((e) => e.byUser && host.setEnabled(!!e.value));
    const button = new Component<HTMLButtonElement>('button');
    const b = button.element;
    b.type = 'button';
    b.className = 'mx-data-grid__filter-text';
    b.addEventListener('click', () => host.openBuilder());
    const clear = new Button({});
    clear.element.classList.add('mx-data-grid__filter-clear');
    clear.motif.on('click', () => host.clear());
    this.textButton = b;
    this.enabled = enabled;
    this.clear = clear;
    this.controls.add(icon, enabled, button, clear);
    this.draw();
  }

  /** Draws the panel as the grid's filter is now. */
  draw() {
    const { enabled, clear, textButton } = this;
    if (!enabled || !clear || !textButton || this.isDisposed) return;
    untracked(() => {
      const { grid, host } = this;
      const el = this.element;
      const has = !!grid.filters.filterValue();
      put(el, 'aria-label', grid.text('gridFilterPanel'));
      el.hidden = !grid.settings.get('filterPanel');
      mark(el, 'data-off', !grid.filters.enabled);
      enabled.label = grid.text('gridFilterPanelEnable');
      enabled.hint = grid.text('gridFilterPanelEnable');
      enabled.visible = has;
      handOver(enabled, grid.filters.enabled as boolean | null);
      mark(textButton, 'data-empty', !has);
      put(textButton, 'aria-label', has ? grid.text('gridFilterPanelEdit', { filter: host.text() }) : null);
      text(textButton, has ? host.text() : grid.text('gridFilterPanelCreate'));
      clear.text = grid.text('gridFilterPanelClear');
      clear.visible = has;
    });
  }
}
