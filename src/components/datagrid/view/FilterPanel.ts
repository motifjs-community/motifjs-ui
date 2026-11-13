import { Component, untracked } from '@motifx/core';
import { glyphPart, handOver } from '../../../core/draw-parts';
import { mark, put, text } from '../../../core/part-writes';
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
  textButton: Component<HTMLButtonElement> | null = null;
  private enabled: CheckBox | null = null;
  private clear: Button | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: FilterPanelHost,
  ) {
    super('div');
  }

  override onConfigured() {
    this.class.add('mx-data-grid__filter-panel');
    this.attr.add({ role: 'group' });
    this.motif.setDisposable(this.grid.notices.on(() => this.draw()));
  }

  override initializeComponent() {
    const { host } = this;
    const icon = new Component<HTMLSpanElement>('span');
    icon.class.add('mx-data-grid__filter-icon');
    icon.attr.add({ 'aria-hidden': 'true' });
    glyphPart(icon, 'filter');
    const enabled = new CheckBox({ labelMode: 'hidden', size: 'sm' });
    enabled.class.add('mx-data-grid__filter-enabled');
    enabled.onValueChanged((e) => e.byUser && host.setEnabled(!!e.value));
    const button = new Component<HTMLButtonElement>('button');
    button.attr.add({ type: 'button' });
    button.class.add('mx-data-grid__filter-text');
    button.motif.on('click', () => host.openBuilder());
    const clear = new Button({});
    clear.class.add('mx-data-grid__filter-clear');
    clear.motif.on('click', () => host.clear());
    this.textButton = button;
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
      const has = !!grid.filters.filterValue();
      put(this, 'aria-label', grid.text('gridFilterPanel'));
      mark(this, 'hidden', !grid.settings.get('filterPanel'));
      mark(this, 'data-off', !grid.filters.enabled);
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
