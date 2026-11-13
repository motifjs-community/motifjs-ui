import { Component } from '@motifx/core';
import { givenField } from '../../../core/given-field';
import { pencilMark, trashMark } from '../../../core/glyphs';
import { Button } from '../../button/Button';
import { part } from '../../../core/draw-parts';
import { css, flag, shown, text } from '../../../core/part-writes';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  /** The appointment shown: the object itself. */
  item: () => T | null;
  canEdit: (item: T) => boolean;
  canDelete: (item: T) => boolean;
  edit: (item: T) => void;
  remove: (item: T) => void;
}

type ResourceLine = ReturnType<SchedulerHost<unknown>['resources']['itemsOf']>[number];
type ResourceItem = ResourceLine['items'][number];

/**
 * What a click on an appointment shows: its color, text, time (and on its own zone's clock), how it repeats, its
 * resources and its description, with Edit and Delete. Its fields are read as they are; `refresh` shows them again. It
 * follows nothing: it draws itself when it is created and on `refresh`.
 */
export class AppointmentTooltip<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private editButton!: Button;
  private deleteButton!: Button;
  private parts!: {
    title: Component<HTMLElement>;
    time: Component<HTMLElement>;
    zone: Component<HTMLElement>;
    repeat: Component<HTMLElement>;
    description: Component<HTMLElement>;
    resources: KeyedParts<ResourceLine, Component<HTMLDivElement>>;
  };
  private readonly itemsOf = new WeakMap<Component<HTMLDivElement>, { label: Component<HTMLElement>; items: KeyedParts<ResourceItem, Component<HTMLSpanElement>> }>();

  constructor(props: Props<T>) {
    super('div', props);
  }

  override onConfigured() {
    this.class.add('mx-scheduler__tooltip');
    const title = part(this, 'div', 'mx-scheduler__tooltip-title');
    const time = part(this, 'div', 'mx-scheduler__tooltip-time');
    const zone = part(this, 'div', 'mx-scheduler__tooltip-zone');
    const repeat = part(this, 'div', 'mx-scheduler__tooltip-repeat');
    const resources = new KeyedParts<ResourceLine, Component<HTMLDivElement>>(
      this,
      (line) => line.kind.field,
      (line) => this.makeLine(line),
      (c, line) => this.drawLine(c, line),
      () => 4,
    );
    const description = part(this, 'div', 'mx-scheduler__tooltip-description');
    const actions = part(this, 'div', 'mx-scheduler__tooltip-actions');
    this.editButton = new Button({ icon: pencilMark() });
    this.editButton.motif.on('click', () => {
      const item = this.props.item();
      if (item) this.props.edit(item);
    });
    this.deleteButton = new Button({ icon: trashMark(), tone: 'danger' });
    this.deleteButton.motif.on('click', () => {
      const item = this.props.item();
      if (item) this.props.remove(item);
    });
    actions.controls.add(this.editButton, this.deleteButton);
    this.parts = { title, time, zone, repeat, description, resources };
    this.made = true;
    this.draw();
  }

  /** Shows the appointment again: another one, or its fields read again. */
  refresh(): void {
    this.draw();
  }

  draw(): void {
    if (this.isDisposed || !this.made) return;
    const { host, item: shownItem } = this.props;
    const item = shownItem();
    const parts = this.parts;
    const field = (name: 'text' | 'description') => givenField(item, host.fields()[name]);
    for (const [name, value] of Object.entries(this.color())) css(this, name, value);
    const title = field('text');
    text(parts.title, title === undefined || title === null || title === '' ? host.text('schedulerNoTitle') : String(title));
    text(parts.time, this.when(item));
    const own = this.ownTime(item);
    shown(parts.zone, own !== '');
    text(parts.zone, own);
    const repeats = this.repeats(item);
    flag(parts.repeat, 'data-exception', !!item && host.model.isException(item));
    shown(parts.repeat, repeats !== '');
    text(parts.repeat, repeats);
    parts.resources.show(item ? host.resources.itemsOf(item) : []);
    const description = String(field('description') ?? '');
    shown(parts.description, description !== '');
    text(parts.description, description);
    this.editButton.text = host.text('schedulerEdit');
    this.editButton.visible = !!item && this.props.canEdit(item);
    this.deleteButton.text = host.text('schedulerDelete');
    this.deleteButton.visible = !!item && this.props.canDelete(item);
  }

  private when(item: T | null): string {
    const host = this.props.host;
    const time = item ? host.model.timeOf(item) : null;
    if (!time) return '';
    if (time.allDay) return host.format.range('day', time.start, time.end);
    const sameDay = host.model.zone.sameDay(time.start, new Date(Math.max(time.start.getTime(), time.end.getTime() - 1)));
    return sameDay
      ? `${host.format.fullDate(time.start)}, ${host.format.timeRange(time.start, time.end)}`
      : `${host.format.fullDate(time.start)} ${host.format.time(time.start)} – ${host.format.fullDate(time.end)} ${host.format.time(time.end)}`;
  }

  /** How it repeats, or that it was changed apart from its series. */
  private repeats(item: T | null): string {
    const host = this.props.host;
    if (!item) return '';
    if (host.model.occurrenceOf(item)) return host.text('schedulerRepeats', { rule: host.recurrenceText(item) });
    return host.model.isException(item) ? host.text('schedulerChanged') : '';
  }

  /** Its time on its own zone's clock, when that is not the scheduler's. */
  private ownTime(item: T | null): string {
    const host = this.props.host;
    const zone = item ? host.zoneOf(item) : '';
    const time = item && zone ? host.model.timeOf(item) : null;
    if (!time || time.allDay) return '';
    return host.text('schedulerInZone', { time: host.format.timeRange(time.start, time.end, zone), zone: zone.replace(/_/g, ' ') });
  }

  /** A line per kind of resource it has: the kind's name, then its items with their colors. */
  private makeLine(line: ResourceLine): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__tooltip-resource');
    const label = part(c, 'span', 'mx-scheduler__tooltip-resource-label');
    const items = new KeyedParts<ResourceItem, Component<HTMLSpanElement>>(
      c,
      (item) => String(item.value),
      (item) => {
        const span = new Component<HTMLSpanElement>('span');
        span.class.add('mx-scheduler__tooltip-resource-item');
        const swatch = part(span, 'span', 'mx-scheduler__resource-swatch');
        swatch.attr.add({ 'aria-hidden': 'true' });
        shown(swatch, !!item.color);
        css(swatch, '--_color', item.color ?? '');
        text(part(span, 'span', ''), item.text);
        return span;
      },
      () => {},
      () => 1,
    );
    this.itemsOf.set(c, { label, items });
    this.drawLine(c, line);
    return c;
  }

  private drawLine(c: Component<HTMLDivElement>, line: ResourceLine): void {
    const drawn = this.itemsOf.get(c)!;
    text(drawn.label, line.kind.label);
    drawn.items.show(line.items);
  }

  /** Its own color, else its resources'. */
  private color(): Record<string, string> {
    const { host, item: shownItem } = this.props;
    const item = shownItem();
    const value = givenField(item, host.fields().color);
    const own = typeof value === 'string' ? value : '';
    return { '--_color': own || (item ? host.resources.colorOf(host.resources.allValuesOf(item)) : '') };
  }
}
