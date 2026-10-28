import type { HeaderCell } from '../model/header-cell';
import type { HeaderRow } from '../model/header-row';
import type { ResourceHeaderContext } from '../resource-header-context';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  /** The columns start after the time ruler (the day views). */
  ruler: boolean;
}

/**
 * The heads of the groups over the columns: a row per level of resources (the rooms, then the
 * people), each head over the columns of its item. Under `groupByDate` they stand under the dates
 * (the view orders the rows); a template may draw a head's content.
 */
export function GroupHeads<T>(props: Props<T>) {
  const { host, ruler } = props;
  const st = host.model.state;
  const offset = ruler ? 2 : 1;
  const context = (row: HeaderRow, cell: HeaderCell): ResourceHeaderContext => ({
    field: cell.resource?.field ?? '',
    get label() {
      return row.label;
    },
    value: cell.resource?.value,
    item: cell.resource?.item,
    text: cell.resource?.text ?? '',
    color: cell.resource?.color ?? '',
    level: cell.level,
    values: cell.values,
    get date() {
      return cell.day?.date ?? null;
    },
  });
  return (
    <div class="mx-scheduler__group-rows" aria-hidden="true">
      {st.heads.map((row) => (
        <div key={row.level} class="mx-scheduler__groups" data-level={() => String(row.level)}>
          {ruler && <div class="mx-scheduler__corner" />}
          {row.cells.map((cell) => (
            <div
              key={cell.key}
              class="mx-scheduler__group-head"
              data-level={() => String(cell.level)}
              data-edge={() => cell.edge || null}
              style={() => ({ gridColumn: `${cell.first + offset} / span ${cell.span}` })}
            >
              {host.headerTemplate() ? (
                <div class="mx-scheduler__group-content">{host.headerTemplate()!(context(row, cell))}</div>
              ) : (
                <div class="mx-scheduler__group-content">
                  <span
                    class="mx-scheduler__group-swatch"
                    x-display={() => !!cell.resource?.color}
                    style={() => ({ '--_color': cell.resource?.color ?? '' })}
                  />
                  <span class="mx-scheduler__group-text">{() => cell.resource?.text ?? ''}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
