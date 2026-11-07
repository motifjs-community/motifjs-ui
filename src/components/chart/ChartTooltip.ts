import { css, shown, text } from '../../core/draw-parts';
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
    element: HTMLDivElement;

    constructor(doc: Document) {
        this.element = doc.createElement('div');
        this.element.className = 'mx-chart__tooltip';
        this.element.setAttribute('aria-hidden', 'true');
        shown(this.element, false);
    }

    hide(): void {
        shown(this.element, false);
    }

    show(context: ChartTooltipContext, rows: readonly TooltipRow[], format: ((context: ChartTooltipContext) => string | Node) | undefined): void {
        const el = this.element;
        if (format) {
            const content = format(context);
            if (typeof content === 'string') text(el, content);
            else el.replaceChildren(content);
        } else {
            this.write(context.title, rows);
        }
        shown(el, true);
    }

    write(title: string, rows: readonly TooltipRow[]): void {
        const el = this.element;
        const doc = el.ownerDocument;
        el.replaceChildren();
        if (title) {
            const head = doc.createElement('div');
            head.className = 'mx-chart__tooltip-title';
            head.textContent = title;
            el.append(head);
        }
        for (const row of rows) {
            const line = doc.createElement('div');
            line.className = 'mx-chart__tooltip-row';
            if (row.active) line.setAttribute('data-active', '');
            const key = doc.createElement('span');
            key.className = 'mx-chart__tooltip-key';
            css(key, '--_mark', row.mark);
            const value = doc.createElement('span');
            value.className = 'mx-chart__tooltip-value';
            const size = row.point.size === null ? '' : ` (${row.point.size})`;
            const share = row.point.share === null ? '' : ` · ${shareText(uiLocale.locale, row.point.share)}`;
            value.textContent = row.point.yText + size + share;
            const name = doc.createElement('span');
            name.className = 'mx-chart__tooltip-name';
            name.textContent = row.point.series;
            line.append(key, value, name);
            el.append(line);
        }
    }

    /** Beside the position, on the side with room, and always inside the plot. */
    place(x: number, y: number, width: number, height: number, gap: number): void {
        const el = this.element;
        const wide = el.offsetWidth;
        const tall = el.offsetHeight;
        const left = x + gap + wide > width ? x - gap - wide : x + gap;
        const top = Math.max(0, Math.min(height - tall, y - tall / 2));
        css(el, 'transform', `translate(${Math.round(Math.max(0, left))}px, ${Math.round(top)}px)`);
    }
}
