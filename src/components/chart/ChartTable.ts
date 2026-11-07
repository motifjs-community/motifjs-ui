import type { ChartModel } from './chart-model';
import type { ChartPlot } from './ChartPlot';

/** The chart's values as a table: what a reader who cannot see the marks, or wants the numbers, reads instead. */
export class ChartTable {
    element: HTMLDivElement;

    constructor(doc: Document) {
        this.element = doc.createElement('div');
        this.element.className = 'mx-chart__table';
        this.element.tabIndex = 0;
        this.element.setAttribute('role', 'region');
    }

    draw(model: ChartModel, plot: ChartPlot, name: string, position: string): void {
        const doc = this.element.ownerDocument;
        this.element.setAttribute('aria-label', name);
        const table = doc.createElement('table');
        const caption = doc.createElement('caption');
        caption.className = 'mx-sr-only';
        caption.textContent = name;
        const head = doc.createElement('thead');
        const headRow = doc.createElement('tr');
        const cell = (tag: 'th' | 'td', text: string, scope?: string) => {
            const el = doc.createElement(tag);
            el.textContent = text;
            if (scope) el.setAttribute('scope', scope);
            return el;
        };
        const shown = model.series.filter(s => s.shown);
        headRow.append(cell('th', position, 'col'), ...shown.map(s => cell('th', s.name, 'col')));
        head.append(headRow);
        const body = doc.createElement('tbody');
        for (const slot of model.slots) {
            const row = doc.createElement('tr');
            row.append(cell('th', plot.xText(slot.key), 'row'));
            for (const s of shown) {
                const point = slot.points.find(p => p.series === s.index);
                const size = point?.size === null || point?.size === undefined ? '' : ` (${point.size})`;
                row.append(cell('td', point ? plot.valueText(point) + size : ''));
            }
            body.append(row);
        }
        table.append(caption, head, body);
        this.element.replaceChildren(table);
    }
}
