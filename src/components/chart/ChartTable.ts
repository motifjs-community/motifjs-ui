import { uiLocale } from '../../core/ui-locale';
import type { ChartModel } from './chart-model';
import { laneText, shareText } from './plot-text';
import type { PlotView } from './plot-view';

/** The chart's values as a table: what a reader who cannot see the marks, or wants the numbers, reads instead. */
export class ChartTable {
    element: HTMLDivElement;

    constructor(doc: Document) {
        this.element = doc.createElement('div');
        this.element.className = 'mx-chart__table';
        this.element.tabIndex = 0;
        this.element.setAttribute('role', 'region');
    }

    draw(model: ChartModel, plot: PlotView, name: string, position: string): void {
        const doc = this.element.ownerDocument;
        this.element.setAttribute('aria-label', name);
        const table = doc.createElement('table');
        const caption = doc.createElement('caption');
        caption.className = 'mx-sr-only';
        caption.textContent = name;
        const head = doc.createElement('thead');
        const body = doc.createElement('tbody');
        const cell = (tag: 'th' | 'td', text: string, scope?: string) => {
            const el = doc.createElement(tag);
            el.textContent = text;
            if (scope) el.setAttribute('scope', scope);
            return el;
        };
        const row = (...cells: HTMLElement[]) => {
            const tr = doc.createElement('tr');
            tr.append(...cells);
            return tr;
        };
        const shown = model.series.filter(s => s.shown);
        const input = plot.input!;

        if (model.family === 'parts') {
            // The parts of the whole, each with its share.
            const whole = shown[0];
            head.append(row(cell('th', position, 'col'), cell('th', whole?.name ?? '', 'col'), cell('th', uiLocale.strings.chartShare, 'col')));
            for (const p of whole?.points ?? []) if (p.share !== null) body.append(row(cell('th', plot.xText(p.key), 'row'), cell('td', plot.valueText(p)), cell('td', shareText(input.locale, p.share))));
        } else if (shown.some(s => s.type === 'heatmap')) {
            // A heat map reads as a grid: its rows down, its columns across.
            head.append(row(cell('th', '', 'col'), ...model.categories.map(key => cell('th', plot.xText(key), 'col'))));
            model.lanes.forEach((_, lane) => {
                const cells = model.categories.map((_, column) => {
                    const point = model.slots.find(slot => slot.x === column)?.points.find(p => p.lane === lane);
                    return cell('td', point ? plot.valueText(point) : '');
                });
                body.append(row(cell('th', laneText(input, lane), 'row'), ...cells));
            });
        } else {
            head.append(row(cell('th', position, 'col'), ...shown.map(s => cell('th', s.name, 'col'))));
            for (const slot of model.slots) {
                const cells = shown.map(s => {
                    const point = slot.points.find(p => p.series === s.index);
                    const size = point?.size === null || point?.size === undefined ? '' : ` (${point.size})`;
                    return cell('td', point ? plot.valueText(point) + size : '');
                });
                body.append(row(cell('th', plot.xText(slot.key), 'row'), ...cells));
            }
        }
        table.append(caption, head, body);
        this.element.replaceChildren(table);
    }
}
