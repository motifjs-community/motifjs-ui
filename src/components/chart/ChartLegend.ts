import type { Component, ComponentBase } from '@motifx/core';
import { part, removePart } from '../../core/draw-parts';
import { focusOn } from '../../core/focus';
import { isRtl } from '../../core/measure';
import { css, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { LegendEntry } from './legend-entry';

interface LegendItem {
    button: Component<HTMLButtonElement>;
    key: Component<HTMLSpanElement>;
    name: Component<HTMLSpanElement>;
    id: string;
    pressable: boolean;
}

/**
 * The legend: a key that mirrors the mark and a name for each entry, so identity never rests on color alone. An entry
 * that can be hidden is a button; one Tab stop, and the arrow keys walk the legend.
 */
export class ChartLegend {
    part: Component<HTMLDivElement>;
    items: LegendItem[] = [];
    toggled: (id: string) => void;
    current = 0;

    /** The legend is a part of `parent` (the chart). */
    constructor(parent: ComponentBase, toggled: (id: string) => void) {
        this.toggled = toggled;
        this.part = part<HTMLDivElement>(parent, 'div', 'mx-chart__legend');
        this.part.attr.add({ role: 'group' });
        this.part.motif.on('keydown', (_, e) => this.keyDown(e));
    }

    draw(entries: readonly LegendEntry[], toggle: boolean): void {
        while (this.items.length > entries.length) removePart(this.items.pop()!.button);
        entries.forEach((entry, i) => {
            const item = this.items[i] ?? this.addItem();
            item.id = entry.id;
            const pressable = toggle && entry.pressable;
            text(item.name, entry.name);
            css(item.button, '--_mark', entry.mark);
            put(item.key, 'data-type', entry.type);
            put(item.button, 'aria-pressed', pressable ? String(entry.shown) : null);
            mark(item.button, 'disabled', !pressable);
            item.pressable = pressable;
            mark(item.button, 'data-off', !entry.shown);
        });
        this.current = Math.min(this.current, Math.max(0, entries.length - 1));
        this.drawStops();
        put(this.part, 'aria-label', uiLocale.strings.chartLegend);
    }

    addItem(): LegendItem {
        const button = part<HTMLButtonElement>(this.part, 'button', 'mx-chart__legend-item');
        button.attr.add({ type: 'button' });
        const key = part<HTMLSpanElement>(button, 'span', 'mx-chart__legend-key');
        const name = part<HTMLSpanElement>(button, 'span', 'mx-chart__legend-name');
        const item = { button, key, name, id: '', pressable: false };
        button.motif.on('click', () => this.press(item));
        this.items.push(item);
        return item;
    }

    drawStops(): void {
        const live = this.items.filter(item => item.pressable);
        this.items.forEach(item => put(item.button, 'tabindex', item === live[Math.min(this.current, live.length - 1)] ? '0' : '-1'));
    }

    press(item: LegendItem): void {
        const live = this.items.filter(each => each.pressable);
        const index = live.indexOf(item);
        if (index < 0) return;
        this.current = index;
        this.drawStops();
        this.toggled(item.id);
    }

    keyDown(e: KeyboardEvent): void {
        const live = this.items.filter(item => item.pressable);
        const count = live.length;
        if (!count) return;
        const rtl = isRtl(this.part);
        let next = this.current;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next += e.key === 'ArrowRight' && rtl ? -1 : 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next += e.key === 'ArrowLeft' && rtl ? 1 : -1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = count - 1;
        else return;
        e.preventDefault();
        this.current = (next + count) % count;
        this.drawStops();
        focusOn(live[this.current].button);
    }
}
