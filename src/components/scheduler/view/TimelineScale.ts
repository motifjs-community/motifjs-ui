import { Component } from '@motifx/core';
import { onReState } from '../../../core/on-re-state';
import type { ScaleCell } from '../model/scale-cell';
import { put, text } from '../../../core/draw-parts';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';
import { TimelineScaleCell } from './TimelineScaleCell';

interface Props<T> {
  host: SchedulerHost<T>;
}

interface Kind {
  field: string;
  label: string;
}

/**
 * The head of a timeline, standing at the top while the rows scroll: over the resource column the names of the kinds
 * grouped by, over the cells two tiers (the days over their hours; the months over their days). Only the heads over
 * the cells built are built; a template may draw a day or an hour. It follows nothing: its view draws it, and the
 * window moving along the time draws its tiers.
 */
export class TimelineScale<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private corner!: KeyedParts<Kind, Component<HTMLDivElement>>;
  private readonly tiers: KeyedParts<ScaleCell, TimelineScaleCell<T>>[] = [];

  constructor(props: Props<T>) {
    super('div', props);
  }

  override onConfigured(): void {
    const { host } = this.props;
    const el = this.element;
    el.className = 'mx-scheduler__scale';
    el.setAttribute('aria-hidden', 'true');
    const corner = new Component<HTMLDivElement>('div');
    corner.element.className = 'mx-scheduler__corner';
    this.controls.add(corner);
    this.corner = new KeyedParts<Kind, Component<HTMLDivElement>>(
      corner,
      (kind) => kind.field,
      (kind) => {
        const label = new Component<HTMLDivElement>('div');
        label.element.className = 'mx-scheduler__corner-label';
        text(label.element, kind.label);
        return label;
      },
      (label, kind) => (label.element.textContent = kind.label),
    );
    const area = new Component<HTMLDivElement>('div');
    area.element.className = 'mx-scheduler__scale-area';
    this.controls.add(area);
    for (const tier of ['upper', 'lower'] as const) {
      const row = new Component<HTMLDivElement>('div');
      row.element.className = 'mx-scheduler__scale-tier';
      put(row.element, 'data-tier', tier);
      area.controls.add(row);
      this.tiers.push(
        new KeyedParts<ScaleCell, TimelineScaleCell<T>>(
          row,
          (cell) => `${cell.kind}:${cell.key}`,
          (cell) => new TimelineScaleCell<T>({ host, cell, tier }),
          (part, cell) => part.show(cell),
        ),
      );
    }
    // The window moved along the time: only the cells that come in are built.
    this.motif.setDisposable(host.model.onChanged((change) => change === 'window' && this.drawTiers()));
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
  }

  draw(): void {
    if (this.isDisposed || !this.made) return;
    const { host } = this.props;
    const st = host.model.state;
    this.corner.show(st.groups[0]?.path.map((p) => ({ field: p.field, label: host.resources.kind(p.field)?.label ?? p.field })) ?? []);
    this.drawTiers();
  }

  private drawTiers(): void {
    if (this.isDisposed || !this.made) return;
    const model = this.props.host.model;
    const [upper, lower] = this.tiers;
    upper.show(model.state.upper.filter((cell) => model.ticksShown(cell.first, cell.span)));
    lower.show(model.state.lower.filter((cell) => model.ticksShown(cell.first, cell.span)));
  }
}
