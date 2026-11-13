import { Component, type ComponentBase } from '@motifx/core';
import { part, partBefore, removePart } from '../../core/draw-parts';
import { boxOf, measure } from '../../core/measure';
import { css, kept, mark, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { shareText } from './plot-text';
import type { ChartPoint } from './chart-point';
import type { ChartTooltipContext } from './chart-tooltip-context';

/** A row of the tooltip. */
interface TooltipRow {
    mark: string;
    point: ChartPoint;
    active: boolean;
}

/**
 * What a chart shows at the pointer. It is a reading aid only: the same values are in the table, and the keyboard
 * reaches them too. Names are written as text, since they come from data.
 */
export class ChartTooltip {
    part: Component<HTMLDivElement>;
    /** Where the last `place` asked for it, until its size is read. */
    at: { x: number; y: number; width: number; height: number; gap: number } | null = null;
    /** The parts of the tooltip, made the first time they are needed and written in place after. */
    private title: Component<HTMLDivElement> | null = null;
    private lines: { line: Component<HTMLDivElement>; key: Component<HTMLSpanElement>; value: Component<HTMLSpanElement>; name: Component<HTMLSpanElement> }[] = [];
    /** Where the app's format shows, and the component it gave last. */
    private custom: Component<HTMLDivElement> | null = null;
    private given: ComponentBase | null = null;

    /** The tooltip is a part of `parent` (the plot). */
    constructor(parent: ComponentBase) {
        this.part = part<HTMLDivElement>(parent, 'div', 'mx-chart__tooltip');
        this.part.attr.add({ 'aria-hidden': 'true' });
        kept(this.part, false);
    }

    hide(): void {
        kept(this.part, false);
    }

    show(context: ChartTooltipContext, rows: readonly TooltipRow[], format: ((context: ChartTooltipContext) => string | ComponentBase) | undefined): void {
        if (format) {
            const content = format(context);
            this.write('', []);
            if (!this.custom) this.custom = part<HTMLDivElement>(this.part, 'div', 'mx-chart__tooltip-custom');
            // What the app's format gives: a text written in place, a component put in place of the one before.
            if (this.given && this.given !== content) removePart(this.given);
            this.given = null;
            if (typeof content === 'string') text(this.custom, content);
            else {
                text(this.custom, '');
                if (content.parent !== this.custom) this.custom.controls.add(content);
                this.given = content;
            }
            kept(this.custom, true);
        } else {
            this.write(context.title, rows);
        }
        kept(this.part, true);
    }

    /** The title and one row per point, written into the parts the tooltip has; rows are added or taken away at the end. */
    write(title: string, rows: readonly TooltipRow[]): void {
        const tip = this.part;
        if (this.custom) kept(this.custom, false);
        if (title && !this.title) this.title = partBefore<HTMLDivElement>(tip, this.lines[0]?.line ?? null, 'div', 'mx-chart__tooltip-title');
        if (this.title) {
            if (title) text(this.title, title);
            kept(this.title, !!title);
        }
        while (this.lines.length > rows.length) removePart(this.lines.pop()!.line);
        while (this.lines.length < rows.length) {
            const line = part<HTMLDivElement>(tip, 'div', 'mx-chart__tooltip-row');
            this.lines.push({
                line,
                key: part<HTMLSpanElement>(line, 'span', 'mx-chart__tooltip-key'),
                value: part<HTMLSpanElement>(line, 'span', 'mx-chart__tooltip-value'),
                name: part<HTMLSpanElement>(line, 'span', 'mx-chart__tooltip-name'),
            });
        }
        rows.forEach((row, i) => {
            const own = this.lines[i];
            mark(own.line, 'data-active', row.active);
            css(own.key, '--_mark', row.mark);
            const size = row.point.size === null ? '' : ` (${row.point.size})`;
            const share = row.point.share === null ? '' : ` · ${shareText(uiLocale.locale, row.point.share)}`;
            text(own.value, row.point.yText + size + share);
            text(own.name, row.point.series);
        });
    }

    /** Beside the position, on the side with room, and always inside the plot: placed with the next frame, once its size is read. */
    place(x: number, y: number, width: number, height: number, gap: number): void {
        this.at = { x, y, width, height, gap };
        measure(this.part, this.readSize, this.writePlace);
    }

    private readonly readSize = () => {
        const box = boxOf(this.part);
        return { wide: box.offsetWidth, tall: box.offsetHeight };
    };

    private readonly writePlace = ({ wide, tall }: { wide: number; tall: number }) => {
        const at = this.at;
        if (!at) return;
        const left = at.x + at.gap + wide > at.width ? at.x - at.gap - wide : at.x + at.gap;
        const top = Math.max(0, Math.min(at.height - tall, at.y - tall / 2));
        css(this.part, 'transform', `translate(${Math.round(Math.max(0, left))}px, ${Math.round(top)}px)`);
    };
}
