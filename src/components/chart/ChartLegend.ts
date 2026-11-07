import { css, mark, put, text } from '../../core/draw-parts';
import { uiLocale } from '../../core/ui-locale';
import type { LegendEntry } from './legend-entry';

interface LegendItem {
    button: HTMLButtonElement;
    key: HTMLSpanElement;
    name: HTMLSpanElement;
    id: string;
}

/**
 * The legend: a key that mirrors the mark and a name for each entry, so identity never rests on color alone. An entry
 * that can be hidden is a button; one Tab stop, and the arrow keys walk the legend.
 */
export class ChartLegend {
    element: HTMLDivElement;
    items: LegendItem[] = [];
    toggled: (id: string) => void;
    current = 0;

    constructor(doc: Document, toggled: (id: string) => void) {
        this.toggled = toggled;
        this.element = doc.createElement('div');
        this.element.className = 'mx-chart__legend';
        this.element.setAttribute('role', 'group');
        this.element.addEventListener('click', e => this.click(e));
        this.element.addEventListener('keydown', e => this.keyDown(e));
    }

    draw(entries: readonly LegendEntry[], toggle: boolean): void {
        const doc = this.element.ownerDocument;
        while (this.items.length > entries.length) this.items.pop()!.button.remove();
        entries.forEach((entry, i) => {
            const item = this.items[i] ?? this.addItem(doc);
            item.id = entry.id;
            const pressable = toggle && entry.pressable;
            text(item.name, entry.name);
            css(item.button, '--_mark', entry.mark);
            put(item.key, 'data-type', entry.type);
            put(item.button, 'aria-pressed', pressable ? String(entry.shown) : null);
            item.button.disabled = !pressable;
            mark(item.button, 'data-off', !entry.shown);
        });
        this.current = Math.min(this.current, Math.max(0, entries.length - 1));
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
        const item = { button, key, name, id: '' };
        this.items.push(item);
        return item;
    }

    drawStops(): void {
        const live = this.items.filter(item => !item.button.disabled);
        this.items.forEach(item => (item.button.tabIndex = item === live[Math.min(this.current, live.length - 1)] ? 0 : -1));
    }

    click(e: Event): void {
        const button = (e.target as Element).closest('button');
        const live = this.items.filter(item => !item.button.disabled);
        const index = live.findIndex(item => item.button === button);
        if (index < 0) return;
        this.current = index;
        this.drawStops();
        this.toggled(live[index].id);
    }

    keyDown(e: KeyboardEvent): void {
        const live = this.items.filter(item => !item.button.disabled);
        const count = live.length;
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
        live[this.current].button.focus();
    }
}
