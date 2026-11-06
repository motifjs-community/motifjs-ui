import { Component } from '@motifx/core';
import { givenField } from '../../../core/given-field';
import type { SchedulerFields } from '../scheduler-fields';
import { css, part, text } from '../../../core/draw-parts';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';

/** What the "+N more" list shows: a day and all of its appointments. */
export interface MoreListState<T> {
  date: Date | null;
  items: T[];
}

interface Props<T> {
  host: SchedulerHost<T>;
  /** The day and its appointments, the objects themselves; the list is drawn again when they change. */
  state: { value: MoreListState<T> };
  choose: (item: T, e: MouseEvent) => void;
}

/** An item as last drawn. */
interface ItemDrawn<T> {
  item: T;
  button: HTMLButtonElement;
  time: HTMLElement;
  text: HTMLElement;
}

/**
 * The list that "+N more" opens: the day, then each appointment of it with its time. It follows nothing: the
 * scheduler draws it when it opens it; an appointment's fields are read as they are.
 */
export class MoreList<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private title!: HTMLElement;
  private items!: KeyedParts<T, Component<HTMLDivElement>>;
  private readonly itemDrawn = new WeakMap<Component<HTMLDivElement>, ItemDrawn<T>>();

  constructor(props: Props<T>) {
    super('div', props);
  }

  override onConfigured(): void {
    const { host } = this.props;
    this.element.className = 'mx-scheduler__more-list';
    this.title = part(this, 'div', 'mx-scheduler__more-title').element;
    const list = part<HTMLDivElement>(this, 'div', 'mx-scheduler__more-items');
    list.element.setAttribute('role', 'list');
    this.items = new KeyedParts<T, Component<HTMLDivElement>>(
      list,
      (item) => host.model.idOf(item),
      (item) => this.makeItem(item),
      (c, item) => this.drawItem(c, item),
    );
    this.made = true;
    this.draw();
  }

  draw(): void {
    if (this.isDisposed || !this.made) return;
    const { host, state } = this.props;
    const date = state.value.date;
    text(this.title, date ? host.format.fullDate(date) : '');
    this.items.show(state.value.items);
  }

  private makeItem(item: T): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.element.setAttribute('role', 'listitem');
    const button = part<HTMLButtonElement>(c, 'button', 'mx-scheduler__more-item');
    button.element.type = 'button';
    button.element.addEventListener('click', (e) => this.props.choose(this.itemDrawn.get(c)!.item, e));
    const time = part(button, 'span', 'mx-scheduler__more-time');
    const text = part(button, 'span', 'mx-scheduler__more-text');
    this.itemDrawn.set(c, { item, button: button.element, time: time.element, text: text.element });
    this.drawItem(c, item);
    return c;
  }

  private drawItem(c: Component<HTMLDivElement>, item: T): void {
    const drawn = this.itemDrawn.get(c)!;
    drawn.item = item;
    const { host } = this.props;
    const field = (name: keyof SchedulerFields) => givenField(item, host.fields()[name]);
    const color = field('color');
    css(drawn.button, '--_color', typeof color === 'string' ? color : '');
    const when = host.model.timeOf(item);
    text(drawn.time, !when || when.allDay ? host.text('schedulerAllDay') : host.format.timeRange(when.start, when.end));
    const value = field('text');
    text(drawn.text, value === undefined || value === null || value === '' ? host.text('schedulerNoTitle') : String(value));
  }
}
