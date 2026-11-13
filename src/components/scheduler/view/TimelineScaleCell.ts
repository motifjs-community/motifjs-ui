import { Component } from '@motifx/core';
import { onReState } from '../../../core/on-re-state';
import type { ScaleCell } from '../model/scale-cell';
import { css, flag, put, text } from '../../../core/part-writes';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  cell: ScaleCell;
  tier: 'upper' | 'lower';
}

/**
 * A head cell of a timeline: a month or a day over the cells (upper tier), a day or an hour (lower tier). It follows
 * nothing: it draws itself when it is created, when the scale hands it its cell again (`show`), on `reState()` and when an
 * option or a text it shows changes; a template may draw a day or an hour.
 */
export class TimelineScaleCell<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private cell: ScaleCell;
  private content: Component<HTMLDivElement> | null = null;
  /** The template the content was filled with: another one (another view, another prop) fills it again. */
  private template: unknown = undefined;
  private readonly texts: Record<'upper' | 'weekday' | 'number' | 'hour', Component<HTMLElement> | null> = { upper: null, weekday: null, number: null, hour: null };

  constructor(props: Props<T>) {
    super('div', props);
    this.cell = props.cell;
  }

  /** The cell again, after the window or the layout moved: drawn where it is now. */
  show(cell: ScaleCell): void {
    this.cell = cell;
    this.draw();
  }

  override onConfigured(): void {
    const { host, tier } = this.props;
    this.class.add('mx-scheduler__scale-cell');
    put(this, 'data-tier', tier);
    const content = new Component<HTMLDivElement>('div');
    content.class.add('mx-scheduler__scale-content');
    this.controls.add(content);
    this.content = content;
    this.fill();
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(host.keepDrawn(() => this.draw()));
  }

  /** The template this cell's kind uses, if any. */
  private templateNow(): unknown {
    const { host, tier } = this.props;
    if (this.cell.kind === 'day') return host.dateTemplate();
    return tier === 'lower' ? host.timeTemplate() : null;
  }

  /** The content: the template's, else the texts the cell writes (the kind of a cell never changes). */
  private fill(): void {
    const content = this.content;
    if (!content) return;
    const { host, tier } = this.props;
    const texts = this.texts;
    content.controls.clear();
    text(content, '');
    texts.upper = texts.weekday = texts.number = texts.hour = null;
    const kind = this.cell.kind;
    this.template = this.templateNow();
    const dateTemplate = host.dateTemplate();
    const timeTemplate = host.timeTemplate();
    if (kind === 'day' && dateTemplate) content.controls.add(dateTemplate(this.dateContext()));
    else if (tier === 'upper') texts.upper = content;
    else if (kind === 'day') {
      texts.weekday = this.span(content, 'mx-scheduler__weekday');
      texts.number = this.span(content, 'mx-scheduler__day-number');
    } else if (timeTemplate) content.controls.add(timeTemplate(this.timeContext()));
    else texts.hour = content;
  }

  draw(): void {
    if (this.isDisposed || !this.made) return;
    if (this.templateNow() !== this.template) this.fill();
    const { cell, texts } = this;
    const { host, tier } = this.props;
    const format = host.format;
    if (tier === 'upper') {
      flag(this, 'data-today', cell.kind === 'day' && cell.day.today);
    } else {
      put(this, 'data-kind', cell.kind);
      flag(this, 'data-today', cell.day.today);
      flag(this, 'data-weekend', cell.kind === 'day' && cell.day.weekend);
      flag(this, 'data-day-start', cell.kind === 'hour' && cell.dayStart);
    }
    css(this, 'grid-column', `${cell.first + 1} / span ${cell.span}`);
    if (texts.upper) text(texts.upper, cell.kind === 'month' ? format.monthYear(cell.day.date) : format.fullDate(cell.day.date));
    if (texts.weekday) text(texts.weekday, format.weekday(cell.day.date));
    if (texts.number) text(texts.number, format.dayNumber(cell.day.date));
    if (texts.hour) text(texts.hour, format.hour(cell.minutes));
  }

  private span(parent: Component<HTMLDivElement>, className: string): Component<HTMLSpanElement> {
    const c = new Component<HTMLSpanElement>('span');
    c.class.add(className);
    parent.controls.add(c);
    return c;
  }

  /** What a date template is given: each read reads the cell as it is now. */
  private dateContext() {
    const view = this;
    const { host } = this.props;
    return {
      get date() {
        return view.cell.day.date;
      },
      get weekday() {
        return host.format.weekday(view.cell.day.date);
      },
      get number() {
        return host.format.dayNumber(view.cell.day.date);
      },
      get today() {
        return view.cell.day.today;
      },
      get view() {
        return host.model.view.type;
      },
      resources: null,
    };
  }

  /** What a time template is given. */
  private timeContext() {
    const view = this;
    const { host } = this.props;
    return {
      get date() {
        return host.model.zone.date(view.cell.day.wall + view.cell.minutes * 60_000);
      },
      get minutes() {
        return view.cell.minutes;
      },
      get text() {
        return host.format.hour(view.cell.minutes);
      },
      get view() {
        return host.model.view.type;
      },
    };
  }
}
