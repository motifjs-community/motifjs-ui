import type { Component, ComponentBase } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { uiLocale } from '../../core/ui-locale';
import { DataGrid } from '../datagrid/DataGrid';
import type { GridColumn } from '../datagrid/grid-column';
import type { ChartModel, ModelPoint } from './chart-model';
import { laneText, shareText } from './plot-text';
import type { PlotView } from './plot-view';

/** A row of the table: what it sorts by, and the values it shows. Made by the chart, never the developer's. */
export interface TableRow {
    id: number;
    sort: unknown;
    key: unknown;
    points: (ModelPoint | null)[];
}

/** The columns and rows of the table for a model. */
export interface TableShape {
    columns: GridColumn<TableRow>[];
    rows: TableRow[];
}

const valueOf = (p: ModelPoint | null) => (p ? (p.heat ?? p.y) : null);

/**
 * The chart's values as a table: what a reader who cannot see the marks, or wants the numbers, reads instead. It is the
 * kit's DataGrid, so a hundred thousand rows scroll as easily as ten: only the rows in view are drawn, and a cell is
 * formatted when it is.
 */
export class ChartTable {
    host: Component<HTMLDivElement>;
    grid: DataGrid<TableRow> | null = null;
    shape: TableShape | null = null;

    constructor(owner: ComponentBase) {
        this.host = part<HTMLDivElement>(owner, 'div', 'mx-chart__table');
        this.host.element.setAttribute('role', 'region');
    }

    get element(): HTMLDivElement {
        return this.host.element;
    }

    draw(model: ChartModel, plot: PlotView, name: string, position: string): void {
        this.element.setAttribute('aria-label', name);
        const shape = shapeOf(model, plot, position);
        this.shape = shape;
        this.grid?.dispose();
        this.grid = new DataGrid<TableRow>({ columns: shape.columns, rows: shape.rows, rowKey: 'id', label: name });
        this.host.controls.add(this.grid);
    }

    /** The texts of the first rows, as the table shows them. */
    texts(count = Infinity): string[][] {
        const shape = this.shape;
        if (!shape) return [];
        return shape.rows.slice(0, count).map(row => shape.columns.map(c => cellText(c, row)));
    }
}

/** A cell as its column writes it. */
export function cellText(column: GridColumn<TableRow>, row: TableRow): string {
    const value = column.value ? column.value(row) : undefined;
    return typeof column.format === 'function' ? column.format(value, row) : String(value ?? '');
}

/** The table of a model: positions down, series across; the parts with their shares; a heat map as its grid. */
export function shapeOf(model: ChartModel, plot: PlotView, position: string): TableShape {
    const input = plot.input!;
    const shown = model.series.filter(s => s.shown);
    // The positions take the room they need, a date with its time included; the values share the rest.
    const first: GridColumn<TableRow> = { field: 'position', title: position, flex: 2, minWidth: 160, value: row => row.sort, format: (_, row) => plot.xText(row.key) };
    const number = (title: string, index: number, write: (p: ModelPoint) => string): GridColumn<TableRow> => ({
        field: `value${index}`,
        title,
        type: 'number',
        align: 'end',
        flex: 1,
        minWidth: 96,
        value: row => valueOf(row.points[index]),
        format: (_, row) => (row.points[index] ? write(row.points[index]!) : '')
    });

    if (model.family === 'parts') {
        const whole = shown[0];
        const points = (whole?.points ?? []).filter(p => p.share !== null);
        return {
            columns: [first, number(whole?.name ?? '', 0, p => plot.valueText(p)), { field: 'share', title: uiLocale.strings.chartShare, type: 'number', align: 'end', value: row => row.points[0]?.share ?? null, format: (_, row) => shareText(input.locale, row.points[0]?.share ?? 0) }],
            rows: points.map((p, i) => ({ id: i, sort: i, key: p.key, points: [p] }))
        };
    }

    if (shown.some(s => s.type === 'heatmap')) {
        // Its rows down, its columns across, as the cells lie.
        const cells = new Map<string, ModelPoint>();
        for (const slot of model.slots) for (const p of slot.points) cells.set(`${p.lane}:${slot.x}`, p);
        return {
            columns: [{ field: 'lane', title: '', value: row => row.sort, format: (_, row) => laneText(input, row.sort as number) }, ...model.categories.map((key, column) => number(plot.xText(key), column, p => plot.valueText(p)))],
            rows: model.lanes.map((_, lane) => ({ id: lane, sort: lane, key: lane, points: model.categories.map((__, column) => cells.get(`${lane}:${column}`) ?? null) }))
        };
    }

    const sizeOf = (p: ModelPoint) => (p.size === null ? '' : ` (${p.size})`);
    return {
        columns: [first, ...shown.map((s, i) => number(s.name, i, p => plot.valueText(p) + sizeOf(p)))],
        rows: model.slots.map((slot, i) => ({ id: i, sort: model.kind === 'category' ? i : slot.x, key: slot.key, points: shown.map(s => slot.points.find(p => p.series === s.index) ?? null) }))
    };
}
