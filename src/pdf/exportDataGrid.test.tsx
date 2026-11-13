import { jsPDF } from 'jspdf';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, settled } from '../../tests/helpers';
import { DataGrid } from '../components/datagrid/DataGrid';
import type { DataGridProps } from '../components/datagrid/data-grid-props';
import type { GridColumn } from '../components/datagrid/grid-column';
import type { GridExportingEventArgs } from '../components/datagrid/grid-exporting-event-args';
import { exportDataGrid } from './export-data-grid';
import type { PdfCustomDrawCellArgs } from './pdf-custom-draw-cell-args';

type Row = { id: number; city: string; amount: number; note: string };

const CITIES = ['Ankara', 'Bursa', 'Izmir'];
const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, city: CITIES[i % 3], amount: (i + 1) * 10, note: `Note ${i + 1}` }));

const columns = (): GridColumn<Row>[] => [
  { field: 'id', title: 'Id', type: 'number', width: 80 },
  { field: 'city', title: 'City', width: 160 },
  { field: 'amount', title: 'Amount', type: 'number', width: 120 },
  { field: 'note', title: 'Note', width: 200 },
];

async function settle() {
  await settled(6);
}

async function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns: columns(), rows: makeRows(4), rowHeight: 36, locale: 'en-US', label: 'Orders', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  await settle();
  return grid;
}

/** A jsPDF document whose text calls are recorded: the text and where, on which page. */
function recorded() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const texts: { text: string; x: number; y: number; page: number; align?: string }[] = [];
  const text = doc.text.bind(doc);
  vi.spyOn(doc, 'text').mockImplementation(((t: string | string[], x: number, y: number, o?: { align?: string }) => {
    texts.push({ text: Array.isArray(t) ? t.join('\n') : t, x, y, page: doc.getCurrentPageInfo().pageNumber, align: o?.align });
    return text(t, x, y, o as never);
  }) as typeof doc.text);
  return { doc, texts };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('exportDataGrid (pdf)', () => {
  it('draws the header and the rows with the grid’s texts and alignment, in the margins', async () => {
    const grid = await make();
    const { doc, texts } = recorded();
    const result = await exportDataGrid({ jsPDFDocument: doc, component: grid });
    const shown = texts.map((t) => t.text);
    expect(shown.slice(0, 4)).toEqual(['Id', 'City', 'Amount', 'Note']);
    expect(shown.slice(4, 8)).toEqual(['1', 'Ankara', '10', 'Note 1']);
    expect(shown).toHaveLength(4 * 5);
    // Numbers at the end of their cells, text at the start; the table starts at the 40 pt margin.
    const amount = texts.find((t) => t.text === '10')!;
    const city = texts.find((t) => t.text === 'Ankara')!;
    expect([amount.align, city.align]).toEqual(['right', 'left']);
    expect(texts[1].x).toBeCloseTo(40 + 80 * 0.75 + 5);
    expect(result.page).toBe(1);
    expect(result.y).toBeGreaterThan(40);
    expect(doc.getNumberOfPages()).toBe(1);
    await grid.dispose();
  });

  it('goes on to more pages with the header rows again, or only once without repeatHeaders', async () => {
    const grid = await make({ rows: makeRows(120) });
    const { doc, texts } = recorded();
    const result = await exportDataGrid({ jsPDFDocument: doc, component: grid });
    const pages = doc.getNumberOfPages();
    expect(pages).toBeGreaterThan(1);
    expect(result.page).toBe(pages);
    const heads = texts.filter((t) => t.text === 'Note');
    expect(heads.map((t) => t.page)).toEqual(Array.from({ length: pages }, (_, i) => i + 1));
    // Every row once, in order, and none below the bottom margin.
    const ids = texts.filter((t) => /^\d+$/.test(t.text) && t.x < 100).map((t) => Number(t.text));
    expect(ids).toEqual(Array.from({ length: 120 }, (_, i) => i + 1));
    expect(Math.max(...texts.map((t) => t.y))).toBeLessThan(doc.internal.pageSize.getHeight() - 40);
    const once = recorded();
    await exportDataGrid({ jsPDFDocument: once.doc, component: grid, repeatHeaders: false });
    expect(once.texts.filter((t) => t.text === 'Note')).toHaveLength(1);
    await grid.dispose();
  });

  it('draws group rows across the row, indents their rows, and the footers and totals', async () => {
    const grid = await make({
      rows: makeRows(6),
      columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)),
      summary: { groupItems: [{ column: 'id', summaryType: 'count', showInColumn: 'note', showInGroupFooter: true }], totalItems: [{ column: 'amount', summaryType: 'sum' }] },
    });
    const { doc, texts } = recorded();
    const rects: Record<string, { x: number; w: number }> = {};
    await exportDataGrid({
      jsPDFDocument: doc,
      component: grid,
      indent: 12,
      customDrawCell: ({ gridCell, rect, pdfCell }) => {
        rects[`${gridCell.rowType}:${pdfCell.text}`] = { x: rect.x, w: rect.w };
      },
    });
    const shown = texts.map((t) => t.text);
    expect(shown.slice(0, 3)).toEqual(['Id', 'Amount', 'Note']);
    expect(shown[3]).toBe('City: Ankara');
    expect(shown).toContain('Count: 2');
    expect(shown.at(-1)).toBe('Sum: 210');
    // The group row spans every column; the data rows under it sit in by the indent.
    const head = rects['header:Id'];
    const group = rects['group:City: Ankara'];
    expect(group.x).toBeCloseTo(head.x);
    expect(group.w).toBeGreaterThan(head.w * 2);
    expect(rects['data:1'].x).toBeCloseTo(head.x + 12);
    expect(rects['data:1'].w).toBeCloseTo(head.w - 12);
    await grid.dispose();
  });

  it('merges a band over its columns and a column header down the band rows', async () => {
    const banded = () => [{ title: 'Order', columns: [{ field: 'id', title: 'Id', width: 80 }, { field: 'city', title: 'City', width: 160 }] }, { field: 'amount', title: 'Amount', width: 120 }];
    const grid = await make({ columns: banded() as DataGridProps<Row>['columns'] });
    const { doc, texts } = recorded();
    const cells: PdfCustomDrawCellArgs<Row>['rect'][] = [];
    const named: Record<string, PdfCustomDrawCellArgs<Row>['rect']> = {};
    await exportDataGrid({
      jsPDFDocument: doc,
      component: grid,
      customDrawCell: ({ gridCell, rect, pdfCell }) => {
        if (gridCell.rowType === 'header') {
          cells.push(rect);
          named[pdfCell.text] = rect;
        }
      },
    });
    expect(texts.slice(0, 4).map((t) => t.text)).toEqual(['Order', 'Amount', 'Id', 'City']);
    // Order, Amount (down two rows), Id, City: four header cells drawn.
    expect(cells).toHaveLength(4);
    expect(named.Order.w).toBeCloseTo(named.Id.w + named.City.w);
    expect(named.Amount.h).toBeCloseTo(named.Order.h + named.Id.h);
    await grid.dispose();
  });

  it('lets customizeCell change a cell and customDrawCell draw it instead', async () => {
    const grid = await make();
    const { doc, texts } = recorded();
    const fill = vi.spyOn(doc, 'rect');
    await exportDataGrid({
      jsPDFDocument: doc,
      component: grid,
      customizeCell: ({ gridCell, pdfCell }) => {
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'city' && gridCell.value === 'Bursa') {
          pdfCell.text = 'BURSA';
          pdfCell.backgroundColor = '#FFEEEE';
        }
      },
      customDrawCell: (e) => {
        if (e.gridCell.rowType === 'data' && e.gridCell.column?.field === 'note') e.cancel = true;
      },
    });
    const shown = texts.map((t) => t.text);
    expect(shown).toContain('BURSA');
    expect(shown).not.toContain('Bursa');
    expect(shown.filter((t) => t.startsWith('Note '))).toEqual([]);
    expect(fill).toHaveBeenCalledTimes(1);
    await grid.dispose();
  });

  it('fits wide columns to the page, keeps given widths, and wraps or cuts long text', async () => {
    const wide = columns().map((c) => ({ ...c, width: 400 }));
    const rows = makeRows(2);
    rows[0].note = 'A long note that does not fit in its column at all, not even close';
    const grid = await make({ columns: wide, rows });
    const room = (doc: jsPDF) => doc.internal.pageSize.getWidth() - 80;
    const widths = (run: (seen: number[]) => Promise<unknown>) => {
      const seen: number[] = [];
      return run(seen).then(() => seen);
    };
    const fitted = await widths((seen) =>
      exportDataGrid({ jsPDFDocument: new jsPDF({ unit: 'pt' }), component: grid, customDrawCell: (e) => e.gridCell.rowType === 'header' && seen.push(e.rect.w) }),
    );
    expect(fitted.reduce((a, w) => a + w, 0)).toBeCloseTo(room(new jsPDF({ unit: 'pt' })));
    const given = await widths((seen) =>
      exportDataGrid({ jsPDFDocument: new jsPDF({ unit: 'pt' }), component: grid, columnWidths: [50, 60, 70, 80], customDrawCell: (e) => e.gridCell.rowType === 'header' && seen.push(e.rect.w) }),
    );
    expect(given).toEqual([50, 60, 70, 80]);

    const cut = recorded();
    await exportDataGrid({ jsPDFDocument: cut.doc, component: grid, columnWidths: [50, 60, 70, 80] });
    const note = cut.texts.find((t) => t.text.startsWith('A long'))!;
    expect(note.text.endsWith('…')).toBe(true);
    const wrapped = recorded();
    const heights: number[] = [];
    await exportDataGrid({ jsPDFDocument: wrapped.doc, component: grid, columnWidths: [50, 60, 70, 80], wordWrapEnabled: true, onRowExporting: (e) => heights.push(e.rowHeight) });
    expect(wrapped.texts.find((t) => t.text.startsWith('A long'))!.text.split('\n').length).toBeGreaterThan(2);
    expect(heights[1]).toBeGreaterThan(heights[2] * 2);
    await grid.dispose();
  });

  it('exports only the selected rows, lays out right to left, and starts at topLeft', async () => {
    const grid = await make({ settings: { selection: 'multiple' }, selectedKeys: [2, 3] });
    const { doc, texts } = recorded();
    await exportDataGrid({ jsPDFDocument: doc, component: grid, selectedRowsOnly: true, topLeft: { x: 10, y: 20 } });
    expect(texts.filter((t) => t.text.startsWith('Note ')).map((t) => t.text)).toEqual(['Note 2', 'Note 3']);
    expect(texts[1].x).toBeCloseTo(40 + 10 + 80 * 0.75 + 5);
    grid.element.dir = 'rtl';
    const rtl = recorded();
    await exportDataGrid({ jsPDFDocument: rtl.doc, component: grid });
    const id = rtl.texts.find((t) => t.text === 'Id')!;
    const note = rtl.texts.find((t) => t.text === 'Note')!;
    expect(id.x).toBeGreaterThan(note.x);
    expect(rtl.texts.find((t) => t.text === 'Ankara')!.align).toBe('right');
    await grid.dispose();
  });

  it('stops with the load panel’s Stop or a signal, drawing nothing', async () => {
    const grid = await make();
    const { doc, texts } = recorded();
    const controller = new AbortController();
    controller.abort();
    await expect(exportDataGrid({ jsPDFDocument: doc, component: grid, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(texts).toEqual([]);
    await expect(exportDataGrid({ jsPDFDocument: {} as jsPDF, component: grid })).rejects.toBeInstanceOf(TypeError);
    await grid.dispose();
  });

  it('is what the toolbar’s PDF command asks for through onExporting', async () => {
    const seen: GridExportingEventArgs[] = [];
    const grid = await make({ export: { formats: ['pdf', 'csv'] }, settings: { exportButton: true }, onExporting: (e) => seen.push(e) });
    const items = (grid as any).exportCommands().map((c: { text: string }) => c.text);
    expect(items).toEqual(['Export all data to PDF', 'Export all data to CSV']);
    await grid.exportTo('pdf');
    expect(seen.map((e) => [e.format, e.selectedRowsOnly])).toEqual([['pdf', false]]);
    const { doc, texts } = recorded();
    const done = vi.fn();
    grid.onExported(done);
    await exportDataGrid({ jsPDFDocument: doc, component: seen[0].component as DataGrid<Row> });
    expect(texts.length).toBe(20);
    expect(done).toHaveBeenCalledWith(expect.objectContaining({ format: 'pdf', rows: 4 }));
    await grid.dispose();
  });
});
