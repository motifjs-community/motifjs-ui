import { Component } from '@motifx/core';
import { onReState } from '../../../core/on-re-state';
import type { HeaderCell } from '../model/header-cell';
import type { HeaderRow } from '../model/header-row';
import type { ResourceHeaderContext } from '../resource-header-context';
import { part } from '../../../core/draw-parts';
import { css, put, shown, text } from '../../../core/part-writes';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  /** The columns start after the time ruler (the day views). */
  ruler: boolean;
}

/** A head as last drawn: its cell and row, and the template its content was filled with. */
interface Drawn {
  cell: HeaderCell;
  row: HeaderRow;
  template: unknown;
  swatch: Component<HTMLElement> | null;
  text: Component<HTMLElement> | null;
}

/**
 * The heads of the groups over the columns: a row per level of resources (the rooms, then the people), each head over
 * the columns of its item. Under `groupByDate` they stand under the dates (the view orders the rows); a template may
 * draw a head's content. It follows nothing: its view draws it.
 */
export class GroupHeads<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private rows!: KeyedParts<HeaderRow, Component<HTMLDivElement>>;
  /** The heads of each row. */
  private readonly cellsOf = new WeakMap<Component<HTMLDivElement>, KeyedParts<HeaderCell, Component<HTMLDivElement>>>();
  private readonly drawn = new WeakMap<Component<HTMLDivElement>, Drawn>();

  constructor(props: Props<T>) {
    super('div', props);
  }

  override onConfigured(): void {
    this.class.add('mx-scheduler__group-rows');
    this.attr.add({ 'aria-hidden': 'true' });
    this.rows = new KeyedParts<HeaderRow, Component<HTMLDivElement>>(
      this,
      (row) => String(row.level),
      (row) => this.makeRow(row),
      (c, row) => this.drawRow(c, row),
    );
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(this.props.host.keepDrawn(() => this.draw()));
  }

  draw(): void {
    if (this.isDisposed || !this.made) return;
    this.rows.show(this.props.host.model.state.heads);
  }

  private makeRow(row: HeaderRow): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__groups');
    const ruler = this.props.ruler;
    if (ruler) part(c, 'div', 'mx-scheduler__corner');
    this.cellsOf.set(
      c,
      new KeyedParts<HeaderCell, Component<HTMLDivElement>>(
        c,
        (cell) => cell.key,
        (cell) => this.makeHead(cell, row),
        (head, cell) => this.drawHead(head, cell, row),
        () => (ruler ? 1 : 0),
      ),
    );
    this.drawRow(c, row);
    return c;
  }

  private drawRow(c: Component<HTMLDivElement>, row: HeaderRow): void {
    put(c, 'data-level', String(row.level));
    this.cellsOf.get(c)?.show(this.props.host.model.shownHeads(row.cells));
  }

  private makeHead(cell: HeaderCell, row: HeaderRow): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__group-head');
    this.drawn.set(c, { cell, row, template: undefined, swatch: null, text: null });
    this.fill(c);
    this.drawHead(c, cell, row);
    return c;
  }

  /** The content: the template's, else a swatch and the text. */
  private fill(c: Component<HTMLDivElement>): void {
    const drawn = this.drawn.get(c)!;
    const host = this.props.host;
    c.controls.clear();
    const content = part<HTMLDivElement>(c, 'div', 'mx-scheduler__group-content');
    const template = host.headerTemplate();
    drawn.template = template;
    drawn.swatch = drawn.text = null;
    if (template) {
      content.controls.add(template(this.headerContext(c)));
      return;
    }
    drawn.swatch = part(content, 'span', 'mx-scheduler__group-swatch');
    drawn.text = part(content, 'span', 'mx-scheduler__group-text');
  }

  private drawHead(c: Component<HTMLDivElement>, cell: HeaderCell, row: HeaderRow): void {
    const drawn = this.drawn.get(c)!;
    drawn.cell = cell;
    drawn.row = row;
    if (drawn.template !== this.props.host.headerTemplate()) this.fill(c);
    put(c, 'data-level', String(cell.level));
    put(c, 'data-edge', cell.edge || null);
    css(c, 'grid-column', `${cell.first + (this.props.ruler ? 2 : 1)} / span ${cell.span}`);
    if (drawn.swatch) {
      shown(drawn.swatch, !!cell.resource?.color);
      css(drawn.swatch, '--_color', cell.resource?.color ?? '');
    }
    if (drawn.text) text(drawn.text, cell.resource?.text ?? '');
  }

  /** What a header template is given: each read reads the head as it is now. */
  private headerContext(c: Component<HTMLDivElement>): ResourceHeaderContext {
    const drawn = this.drawn.get(c)!;
    const host = this.props.host;
    const cell = () => drawn.cell;
    return {
      get field() {
        return cell().resource?.field ?? '';
      },
      get label() {
        return drawn.row.label;
      },
      get value() {
        return cell().resource?.value;
      },
      get item() {
        const resource = cell().resource;
        return resource ? host.resources.kind(resource.field)?.find(resource.value) : undefined;
      },
      get text() {
        return cell().resource?.text ?? '';
      },
      get color() {
        return cell().resource?.color ?? '';
      },
      get level() {
        return cell().level;
      },
      get values() {
        return cell().values;
      },
      get date() {
        return cell().day?.date ?? null;
      },
    };
  }
}
