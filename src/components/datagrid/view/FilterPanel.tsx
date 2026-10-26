import { Component } from '@motifx/core';
import { filterMark } from '../../../core/glyphs';
import { Button } from '../../button/Button';
import { CheckBox } from '../../checkbox/CheckBox';
import type { GridModel } from '../model/GridModel';
import type { FilterPanelHost } from './filter-panel-host';

/**
 * The filter panel under the rows: a check box that turns the filter value on and off, the filter
 * as text (pressing it opens the filter builder), "Create Filter" while there is none, and "Clear".
 */
export class FilterPanel<T> extends Component<HTMLDivElement> {
  /** The text button, where focus goes back when the builder closes. */
  textButton: HTMLButtonElement | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: FilterPanelHost,
  ) {
    super('div');
  }

  override onConfigured() {
    const { grid } = this;
    this.class.add('mx-data-grid__filter-panel');
    this.attr.add({
      role: 'group',
      'aria-label': () => grid.text('gridFilterPanel'),
      hidden: () => (grid.settings.get('filterPanel') ? null : ''),
      'data-off': () => (grid.filters.enabled ? null : ''),
    });
  }

  override view() {
    const { grid, host } = this;
    const has = () => !!grid.filters.filterValue();
    return (
      <>
        <span class="mx-data-grid__filter-icon" aria-hidden="true" ref={(c) => c.element.append(filterMark())} />
        <CheckBox
          class="mx-data-grid__filter-enabled"
          label={() => grid.text('gridFilterPanelEnable')}
          labelMode="hidden"
          hint={() => grid.text('gridFilterPanelEnable')}
          size="sm"
          visible={has}
          value={() => grid.filters.enabled}
          onValueChanged={(e) => e.byUser && host.setEnabled(!!e.value)}
        />
        <button
          type="button"
          class="mx-data-grid__filter-text"
          data-empty={() => (has() ? null : '')}
          aria-label={() => (has() ? grid.text('gridFilterPanelEdit', { filter: host.text() }) : null)}
          onclick={() => host.openBuilder()}
          ref={(c) => (this.textButton = c.element as HTMLButtonElement)}
        >
          {() => (has() ? host.text() : grid.text('gridFilterPanelCreate'))}
        </button>
        <Button class="mx-data-grid__filter-clear" text={() => grid.text('gridFilterPanelClear')} size="sm" variant="ghost" tone="accent" visible={has} onclick={() => host.clear()} />
      </>
    );
  }
}
