import { css, mark, put, text } from '../../core/draw-parts';
import { uiLocale } from '../../core/ui-locale';
import type { ChartModel, ModelSeries } from './chart-model';
import { markOf } from './ChartPlot';

interface LegendItem {
    button: HTMLButtonElement;
    key: HTMLSpanElement;
    name: HTMLSpanElement;
    series: number;
}

/**
 * The legend: a key that mirrors the mark and a name for each series, so identity never rests on color alone. With
 * `toggle` each is a button that hides or shows its series; one Tab stop, and the arrow keys walk it.
 */
export class ChartLegend {
    element: HTMLDivElement;
    items: LegendItem[] = [];
    toggled: (series: number) => void;
    current = 0;

    constructor(doc: Document, toggled: (series: number) => void) {
        this.toggled = toggled;
        this.element = doc.createElement('div');
        this.element.className = 'mx-chart__legend';
        this.element.setAttribute('role', 'group');
        this.element.addEventListener('click', e => this.click(e));
        this.element.addEventListener('keydown', e => this.keyDown(e));
    }

    draw(model: ChartModel, toggle: boolean): void {
        const listed = model.series.filter(s => s.source.legend !== false);
        const doc = this.element.ownerDocument;
        while (this.items.length > listed.length) this.items.pop()!.button.remove();
        listed.forEach((s, i) => {
            const item = this.items[i] ?? this.addItem(doc);
            item.series = s.index;
            this.drawItem(item, s, toggle);
        });
        this.current = Math.min(this.current, Math.max(0, listed.length - 1));
        this.drawStops();
        this.element.setAttribute('aria-label', uiLocale.strings.chartLegend);
    }

    addItem(doc: Document): LegendItem {
        const button = doc.createElement('button');
        button.type = 'button';
        button.className = 'mx-chart__legend-item';
        const key = doc.createElement('span');
        key.className = 'mx-chart__legend-key';
        const name = doc.createElement('span');
        name.className = 'mx-chart__legend-name';
        button.append(key, name);
        this.element.append(button);
        const item = { button, key, name, series: 0 };
        this.items.push(item);
        return item;
    }

    drawItem(item: LegendItem, s: ModelSeries, toggle: boolean): void {
        text(item.name, s.name);
        css(item.button, '--_mark', markOf(s));
        put(item.key, 'data-type', s.type);
        put(item.button, 'aria-pressed', toggle ? String(s.shown) : null);
        item.button.disabled = !toggle;
        mark(item.button, 'data-off', !s.shown);
    }

    drawStops(): void {
        this.items.forEach((item, i) => (item.button.tabIndex = i === this.current ? 0 : -1));
    }

    click(e: Event): void {
        const button = (e.target as Element).closest('button');
        const index = this.items.findIndex(item => item.button === button);
        if (index < 0) return;
        this.current = index;
        this.drawStops();
        this.toggled(this.items[index].series);
    }

    keyDown(e: KeyboardEvent): void {
        const count = this.items.length;
        if (!count) return;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        let next = this.current;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next += e.key === 'ArrowRight' && rtl ? -1 : 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next += e.key === 'ArrowLeft' && rtl ? 1 : -1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = count - 1;
        else return;
        e.preventDefault();
        this.current = (next + count) % count;
        this.drawStops();
        this.items[this.current].button.focus();
    }
}
