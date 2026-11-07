import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp, type IDisposable } from "@motifx/core";
import type { data } from "@motifx-community/data";
import { Control } from "../../core/control";
import { css, mark, part, put, shown, text } from "../../core/draw-parts";
import { givenList } from "../../core/given-field";
import { glyph } from "../../core/glyphs";
import { onLookChanged } from "../../core/look-watch";
import { onLanguage } from "../../core/on-language";
import { onReState } from "../../core/on-re-state";
import { onFontsLoaded } from "../../core/fonts-loaded";
import { ResizeWatch } from "../../core/resize-watch";
import { uiLocale } from "../../core/ui-locale";
import { surfaceBehind } from "../../parts/chart/chart-text";
import { TokenLengths } from "../../parts/chart/token-lengths";
import { Button } from "../button/Button";
import type { ChartAxis } from "./chart-axis";
import type { ChartDataErrorEventArgs } from "./chart-data-error-event-args";
import { chartCanvas, chartSvg } from "./chart-export";
import type { ChartExportOptions } from "./chart-export-options";
import type { ChartField } from "./chart-field";
import type { ChartLegendOptions } from "./chart-legend-options";
import { LOOK_TOKENS, readLook, type ChartLook } from "./chart-look";
import { buildModel, familyOf, type ChartFamily, type ChartModel, type ModelPoint, type ModelSlot } from "./chart-model";
import type { ChartPoint } from "./chart-point";
import type { ChartPointEventArgs } from "./chart-point-event-args";
import type { ChartPointSelection } from "./chart-point-selection";
import type { ChartReference } from "./chart-reference";
import type { ChartSelectionChangedEventArgs } from "./chart-selection-changed-event-args";
import type { ChartZoomChangedEventArgs } from "./chart-zoom-changed-event-args";
import type { ChartProps } from "./chart-props";
import type { ChartSeries } from "./chart-series";
import type { ChartSeriesToggledEventArgs } from "./chart-series-toggled-event-args";
import type { ChartStacked } from "./chart-stacked";
import type { ChartTooltipContext } from "./chart-tooltip-context";
import type { ChartTooltipOptions } from "./chart-tooltip-options";
import type { ChartMode } from "./chart-mode";
import type { ChartModeChangedEventArgs } from "./chart-mode-changed-event-args";
import { ChartLegend } from "./ChartLegend";
import { ChartPlot, markOf } from "./ChartPlot";
import { ChartTable } from "./ChartTable";
import { ChartTooltip } from "./ChartTooltip";
import type { LegendEntry } from "./legend-entry";
import { PartsPlot } from "./PartsPlot";
import type { PlotView } from "./plot-view";
import { RadarPlot } from "./RadarPlot";
import { formatNumber } from "../../parts/chart/chart-text";

const OWN = ['data', 'dataSource', 'xField', 'series', 'horizontal', 'stacked', 'title', 'subtitle', 'label', 'xAxis', 'yAxis', 'legend', 'tooltip', 'crosshair', 'height', 'animation', 'tableButton', 'mode', 'emptyText', 'loading', 'zoom', 'references', 'pointSelection'] as const;

/** How far a press must move before it is a drag that zooms, not a click. */
const DRAG_FROM = 4;
/** One step of the wheel or of + and -: a fifth in or out. */
const ZOOM_STEP = 0.8;

/** Sizes for where nothing is laid out, as in a test without a browser. */
const UNMEASURED_WIDTH = 640;
const UNMEASURED_HEIGHT = 320;

/**
 * A chart of lines, areas, bars, dots and bubbles. Each series says how it draws, and they share one axis of values.
 * Series keep their color when others are hidden. Every value is reachable without a pointer: the arrow keys walk the
 * chart and a screen reader hears each value, and the chart turns into a table.
 *
 * @example
 * <Chart title="Monthly sales" data={() => this.rows} xField="month" series={[{ yField: 'sales', type: 'bar' }]} />
 */
export class Chart<T = any> extends Control<HTMLDivElement, ChartProps<T>> {
    pointClick = new Emitter<ChartPointEventArgs<T>>();
    pointFocused = new Emitter<ChartPointEventArgs<T>>();
    seriesToggled = new Emitter<ChartSeriesToggledEventArgs<T>>();
    modeChanged = new Emitter<ChartModeChangedEventArgs<T>>();
    dataError = new Emitter<ChartDataErrorEventArgs<T>>();
    zoomChanged = new Emitter<ChartZoomChangedEventArgs<T>>();
    selectionChanged = new Emitter<ChartSelectionChangedEventArgs<T>>();
    resetButton: Button;
    zoomWindow: { from: number; to: number } | null = null;
    selection = new Set<string>();
    press: { at: number; along: number; moved: boolean } | null = null;
    skipClick = false;
    pendingActive: { x: number; series: number } | null = null;
    lastSize = '';
    head: Component<HTMLDivElement>;
    titles: Component<HTMLDivElement>;
    titleText: Component<HTMLDivElement>;
    subtitleText: Component<HTMLDivElement>;
    tools: Component<HTMLDivElement>;
    modeButton: Button;
    area: Component<HTMLDivElement>;
    surface: Component<HTMLDivElement>;
    message: Component<HTMLDivElement>;
    status: Component<HTMLDivElement>;
    plot: PlotView;
    cartesian: ChartPlot;
    plots = new Map<ChartFamily, PlotView>();
    hiddenParts = new Set<number>();
    legendEntries: LegendEntry[] = [];
    legendPart: ChartLegend;
    tooltipPart: ChartTooltip;
    tablePart: ChartTable;
    model: ChartModel | null = null;
    look: ChartLook | null = null;
    hidden = new Set<number>();
    activeSlot: ModelSlot | null = null;
    activePoint: ModelPoint | null = null;
    queued = false;
    placed = false;
    drawnOnce = false;
    watch: ResizeWatch | null = null;
    stopLook: (() => void) | null = null;
    stopFonts: (() => void) | null = null;
    tokens: TokenLengths;
    listening: IDisposable | null = null;
    source: data.DataSource<T, any> | null = null;
    failedWith: unknown = null;

    constructor(props?: IBaseProp<ChartProps<T>>) {
        super('div', props);
        const own = (this.props ?? {}) as ChartProps<T>;
        const el = this.element;
        el.classList.add('mx-chart');
        el.setAttribute('role', 'figure');

        this.head = part<HTMLDivElement>(this, 'div', 'mx-chart__head');
        this.titles = part<HTMLDivElement>(this.head, 'div', 'mx-chart__titles');
        this.titleText = part<HTMLDivElement>(this.titles, 'div', 'mx-chart__title');
        this.subtitleText = part<HTMLDivElement>(this.titles, 'div', 'mx-chart__subtitle');
        this.tools = part<HTMLDivElement>(this.head, 'div', 'mx-chart__tools');
        this.modeButton = new Button({
            variant: 'ghost',
            icon: () => glyph(this.mode === 'table' ? 'chart' : 'table'),
            hint: () => (this.mode === 'table' ? uiLocale.strings.chartShowChart : uiLocale.strings.chartShowTable),
            onclick: () => this.changeMode(this.mode === 'table' ? 'chart' : 'table')
        });
        this.resetButton = new Button({
            variant: 'ghost',
            icon: () => glyph('zoom-out'),
            hint: () => uiLocale.strings.chartResetZoom,
            onclick: () => this.resetZoom()
        });
        this.tools.controls.add(this.resetButton, this.modeButton);

        this.area = part<HTMLDivElement>(this, 'div', 'mx-chart__area-box');
        this.surface = part<HTMLDivElement>(this.area, 'div', 'mx-chart__plot');
        const surface = this.surface.element;
        surface.tabIndex = 0;
        surface.setAttribute('role', 'group');
        this.cartesian = new ChartPlot(surface);
        this.plot = this.cartesian;
        this.plots.set('cartesian', this.cartesian);
        this.message = part<HTMLDivElement>(this.surface, 'div', 'mx-chart__message');
        this.tooltipPart = new ChartTooltip(el.ownerDocument);
        surface.append(this.tooltipPart.element);
        this.legendPart = new ChartLegend(el.ownerDocument, id => this.toggleEntry(id));
        el.append(this.legendPart.element);
        this.tablePart = new ChartTable(this);
        this.status = part<HTMLDivElement>(this, 'div', 'mx-sr-only');
        this.status.element.setAttribute('role', 'status');

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onPointClick) this.onPointClick(own.onPointClick);
        if (own.onPointFocused) this.onPointFocused(own.onPointFocused);
        if (own.onSeriesToggled) this.onSeriesToggled(own.onSeriesToggled);
        if (own.onModeChanged) this.onModeChanged(own.onModeChanged);
        if (own.onDataError) this.onDataError(own.onDataError);
        if (own.onZoomChanged) this.onZoomChanged(own.onZoomChanged);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);

        for (const name of OWN) {
            if (name === 'dataSource') this.observeProperty(name, () => this.followSource());
            else if (name === 'height') this.observeProperty<number | null>(name, height => css(el, '--_height', height ? `${height}px` : ''));
            else this.observeProperty(name, () => this.again());
        }
        onLanguage(this, () => this.again());
        onReState(this, () => this.again());

        surface.addEventListener('pointermove', e => this.pointerMoved(e));
        surface.addEventListener('pointerdown', e => this.pressed(e));
        surface.addEventListener('pointerup', e => this.released(e));
        surface.addEventListener('wheel', e => this.wheeled(e), { passive: false });
        // A finger leaves as it lifts: the value stays until the reader taps elsewhere.
        surface.addEventListener('pointerleave', e => {
            if (e.pointerType !== 'touch') this.clearActive();
        });
        surface.addEventListener('click', e => this.plotClick(e));
        surface.addEventListener('keydown', e => this.plotKeyDown(e));
        surface.addEventListener('focus', () => this.plotFocused());
        surface.addEventListener('blur', () => this.clearActive());
        // A stylesheet that comes late or changes the chart's sizes draws it again with them.
        this.tokens = new TokenLengths(this.element, LOOK_TOKENS, () => {
            this.look = null;
            this.again();
        });
        this.motif.setDisposable(() => {
            this.tokens.dispose();
            this.watch?.disconnect();
            this.stopLook?.();
            this.stopFonts?.();
            this.listening?.dispose();
            for (const emitter of [this.pointClick, this.pointFocused, this.seriesToggled, this.modeChanged, this.dataError, this.zoomChanged, this.selectionChanged]) emitter.dispose();
        });
    }

    protected override get focusElement(): HTMLElement {
        return this.surface?.element ?? this.element;
    }

    // In the page now: there is room to measure, and a background behind it.
    override onMounted(): void {
        if (this.placed) return;
        this.placed = true;
        this.watch = new ResizeWatch(() => this.again());
        this.watch.observe(this.surface.element);
        this.stopLook = onLookChanged(() => {
            this.look = null;
            this.again();
        });
        // Texts measured before the font arrived are measured again with it.
        this.stopFonts = onFontsLoaded(this.element, () => {
            this.look = null;
            this.again();
        });
        this.draw();
    }

    // Properties (see ChartProps).

    get data(): readonly T[] | null {
        return this.getProperty<readonly T[] | null | undefined>('data') ?? null;
    }
    set data(value: Bind<readonly T[] | null>) {
        this.assignProperty('data', value);
    }
    get dataSource(): data.DataSource<T, any> | null {
        return this.getProperty<data.DataSource<T, any> | null | undefined>('dataSource') ?? null;
    }
    set dataSource(value: Bind<data.DataSource<T, any> | null>) {
        this.assignProperty('dataSource', value);
    }
    get xField(): ChartField<T> | null {
        return this.getProperty<ChartField<T> | null | undefined>('xField') ?? null;
    }
    set xField(value: Bind<ChartField<T> | null>) {
        this.assignProperty('xField', value);
    }
    get series(): readonly ChartSeries<T>[] {
        return this.getProperty<readonly ChartSeries<T>[] | undefined>('series') ?? [];
    }
    set series(value: Bind<readonly ChartSeries<T>[]>) {
        this.assignProperty('series', value);
    }
    get horizontal(): boolean {
        return this.getProperty<boolean | undefined>('horizontal') ?? false;
    }
    set horizontal(value: Bind<boolean>) {
        this.assignProperty('horizontal', value);
    }
    get stacked(): ChartStacked {
        return this.getProperty<ChartStacked | undefined>('stacked') ?? false;
    }
    set stacked(value: Bind<ChartStacked>) {
        this.assignProperty('stacked', value);
    }
    get title(): string {
        return this.getProperty<string | undefined>('title') ?? '';
    }
    set title(value: Bind<string>) {
        this.assignProperty('title', value);
    }
    get subtitle(): string {
        return this.getProperty<string | undefined>('subtitle') ?? '';
    }
    set subtitle(value: Bind<string>) {
        this.assignProperty('subtitle', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }
    get xAxis(): ChartAxis {
        return this.getProperty<ChartAxis | undefined>('xAxis') ?? {};
    }
    set xAxis(value: Bind<ChartAxis>) {
        this.assignProperty('xAxis', value);
    }
    get yAxis(): ChartAxis {
        return this.getProperty<ChartAxis | undefined>('yAxis') ?? {};
    }
    set yAxis(value: Bind<ChartAxis>) {
        this.assignProperty('yAxis', value);
    }
    get legend(): boolean | ChartLegendOptions {
        return this.getProperty<boolean | ChartLegendOptions | undefined>('legend') ?? {};
    }
    set legend(value: Bind<boolean | ChartLegendOptions>) {
        this.assignProperty('legend', value);
    }
    get tooltip(): boolean | ChartTooltipOptions<T> {
        return this.getProperty<boolean | ChartTooltipOptions<T> | undefined>('tooltip') ?? {};
    }
    set tooltip(value: Bind<boolean | ChartTooltipOptions<T>>) {
        this.assignProperty('tooltip', value);
    }
    get crosshair(): boolean {
        return this.getProperty<boolean | undefined>('crosshair') ?? true;
    }
    set crosshair(value: Bind<boolean>) {
        this.assignProperty('crosshair', value);
    }
    get height(): number | null {
        return this.getProperty<number | null | undefined>('height') ?? null;
    }
    set height(value: Bind<number | null>) {
        this.assignProperty('height', value);
    }
    get animation(): boolean {
        return this.getProperty<boolean | undefined>('animation') ?? true;
    }
    set animation(value: Bind<boolean>) {
        this.assignProperty('animation', value);
    }
    get tableButton(): boolean {
        return this.getProperty<boolean | undefined>('tableButton') ?? true;
    }
    set tableButton(value: Bind<boolean>) {
        this.assignProperty('tableButton', value);
    }
    get mode(): ChartMode {
        return this.getProperty<ChartMode | undefined>('mode') ?? 'chart';
    }
    set mode(value: Bind<ChartMode>) {
        this.assignProperty('mode', value);
    }
    get emptyText(): string {
        return this.getProperty<string | undefined>('emptyText') ?? '';
    }
    set emptyText(value: Bind<string>) {
        this.assignProperty('emptyText', value);
    }
    get loading(): boolean {
        return this.getProperty<boolean | undefined>('loading') ?? false;
    }
    set loading(value: Bind<boolean>) {
        this.assignProperty('loading', value);
    }

    get zoom(): boolean {
        return this.getProperty<boolean | undefined>('zoom') ?? false;
    }
    set zoom(value: Bind<boolean>) {
        this.assignProperty('zoom', value);
    }
    get references(): readonly ChartReference[] {
        return this.getProperty<readonly ChartReference[] | undefined>('references') ?? [];
    }
    set references(value: Bind<readonly ChartReference[]>) {
        this.assignProperty('references', value);
    }
    get pointSelection(): ChartPointSelection {
        return this.getProperty<ChartPointSelection | undefined>('pointSelection') ?? 'none';
    }
    set pointSelection(value: Bind<ChartPointSelection>) {
        this.assignProperty('pointSelection', value);
    }
    get onZoomChanged(): MotifEvent<ChartZoomChangedEventArgs<T>> {
        return this.zoomChanged.event;
    }
    get onSelectionChanged(): MotifEvent<ChartSelectionChangedEventArgs<T>> {
        return this.selectionChanged.event;
    }

    /** The values chosen now. */
    get selectedPoints(): ChartPoint<T>[] {
        const model = this.model;
        if (!model) return [];
        const out: ChartPoint<T>[] = [];
        for (const s of model.series) for (const p of s.points) if (this.selection.has(`${p.series}:${p.index}`) && p.y !== null) out.push(this.pointOf(p));
        return out;
    }

    /** Chooses nothing. */
    clearSelection(): void {
        if (!this.selection.size) return;
        this.selection.clear();
        this.selectionChanged.fire({ points: [], source: this });
        this.again();
    }

    /** Shows the positions from one to another, given as in the rows: a category, a number or a date. */
    zoomTo(from: unknown, to: unknown): void {
        const model = this.model;
        if (!model) return;
        const place = (v: unknown) => {
            if (model.kind !== 'category') return v instanceof Date ? v.getTime() : Number(v);
            const name = v instanceof Date ? v.getTime() : v;
            return model.categories.findIndex(c => (c instanceof Date ? c.getTime() : c) === name);
        };
        const a = place(from);
        const b = place(to);
        if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) return;
        this.setWindow({ from: Math.min(a, b), to: Math.max(a, b) });
    }

    /** Shows every position again. */
    resetZoom(): void {
        this.setWindow(null);
    }

    get onPointClick(): MotifEvent<ChartPointEventArgs<T>> {
        return this.pointClick.event;
    }
    get onPointFocused(): MotifEvent<ChartPointEventArgs<T>> {
        return this.pointFocused.event;
    }
    get onSeriesToggled(): MotifEvent<ChartSeriesToggledEventArgs<T>> {
        return this.seriesToggled.event;
    }
    get onModeChanged(): MotifEvent<ChartModeChangedEventArgs<T>> {
        return this.modeChanged.event;
    }
    get onDataError(): MotifEvent<ChartDataErrorEventArgs<T>> {
        return this.dataError.event;
    }

    /** Draws again from the rows and series as they are now, after they changed in place. */
    refresh(): void {
        this.again();
    }

    /** Hides or shows a series, by its place in `series`. */
    setSeriesVisible(index: number, visible: boolean): void {
        if (visible === !this.hidden.has(index)) return;
        if (visible) this.hidden.delete(index);
        else this.hidden.add(index);
        this.again();
    }

    /** Indicates whether a series is drawn, by its place in `series`. */
    isSeriesVisible(index: number): boolean {
        return !this.hidden.has(index) && this.series[index]?.visible !== false;
    }

    /** The chart as an SVG document, with its title and legend. */
    toSVG(options: ChartExportOptions = {}): string {
        return chartSvg(this, options);
    }

    /** The chart as a data URL, a PNG by default. It takes a moment, since the browser draws the image first. */
    toDataURL(type = 'image/png', options: ChartExportOptions = {}): Promise<string> {
        return chartCanvas(this, options).then(canvas => canvas.toDataURL(type));
    }

    /** The rows in use now: the data source's, or the ones given. */
    get rows(): readonly T[] {
        const source = this.source;
        return source ? source.rows : givenList(this.data);
    }

    get legendOptions(): ChartLegendOptions {
        const legend = this.legend;
        return typeof legend === 'boolean' ? { visible: legend } : legend;
    }

    get tooltipOptions(): ChartTooltipOptions<T> {
        const tooltip = this.tooltip;
        return typeof tooltip === 'boolean' ? { visible: tooltip } : tooltip;
    }

    get accessibleName(): string {
        return this.label || this.title || uiLocale.strings.chartName;
    }

    followSource(): void {
        const source = this.dataSource;
        if (source === this.source) return;
        this.listening?.dispose();
        this.listening = null;
        this.source = source;
        if (source) {
            this.listening = source.onChanged(() => this.sourceChanged());
            if (source.status === 'idle') void source.load();
        }
        this.again();
    }

    sourceChanged(): void {
        const error = this.source?.status === 'error' ? this.source.error : null;
        if (error && error !== this.failedWith) this.dataError.fire({ error, source: this });
        this.failedWith = error;
        this.again();
    }

    // Everything that changes a chart lands here, so several changes at once are one draw.
    again(): void {
        if (this.queued || !this.placed) return;
        this.queued = true;
        queueMicrotask(() => {
            this.queued = false;
            if (!this.isDisposed) this.draw();
        });
    }

    draw(): void {
        const el = this.element;
        const series = givenList(this.series);
        const xAxis = this.xAxis;
        const yAxis = this.yAxis;
        const model = buildModel({ rows: this.rows, series, xField: this.xField, xAxis, yAxis, stacked: this.stacked, hidden: this.hidden, hiddenParts: this.hiddenParts });
        const window = this.windowOf(model);
        this.model = model;
        this.usePlot(model.family);
        // The texts of the legend and the table read through the plot, before it has room to draw.
        // The look is read even with no room yet (a chart in a hidden tab): the probes tell when it changes once shown.
        this.look ??= readLook(el, this.cartesian.labelGroup, this.tokens);
        this.plot.input = { model, xAxis, yAxis, horizontal: this.horizontal, rtl: false, width: 0, height: 0, look: this.look, locale: uiLocale.locale, window };
        this.activeSlot = null;
        this.activePoint = null;
        this.tooltipPart.hide();

        const name = this.accessibleName;
        el.setAttribute('aria-label', name);
        text(this.titleText.element, this.title);
        text(this.subtitleText.element, this.subtitle);
        shown(this.titleText.element, !!this.title);
        shown(this.subtitleText.element, !!this.subtitle);
        shown(this.titles.element, !!(this.title || this.subtitle));
        const zoomed = !!this.zoomWindow && model.family === 'cartesian';
        shown(this.resetButton.element, zoomed);
        shown(this.modeButton.element, this.tableButton);
        shown(this.tools.element, this.tableButton || zoomed);
        shown(this.head.element, !!(this.title || this.subtitle || this.tableButton || zoomed));
        mark(this.surface.element, 'data-zoom', this.zoom && model.family === 'cartesian');

        const legend = this.legendOptions;
        const entries = this.entriesOf(model);
        this.legendEntries = entries;
        const always = model.family !== 'cartesian' || entries.some(e => e.id.startsWith('heat:'));
        const legendOn = (legend.visible ?? (always || entries.length >= 2)) && entries.length > 0;
        this.legendPart.draw(entries, legend.toggle !== false);
        put(el, 'data-legend', legendOn ? (legend.position ?? 'bottom') : null);

        const table = this.mode === 'table';
        put(el, 'data-mode', this.mode);
        shown(this.area.element, !table);
        shown(this.legendPart.element, legendOn && !table);
        shown(this.tablePart.element, table);

        const source = this.source;
        const busy = this.loading || source?.status === 'loading';
        mark(el, 'data-loading', busy);
        put(el, 'aria-busy', busy ? 'true' : null);
        const failed = source?.status === 'error';
        const words = failed ? uiLocale.strings.chartFailed : model.any || busy ? '' : this.emptyText || uiLocale.strings.chartEmpty;
        text(this.message.element, words);
        mark(el, 'data-empty', !model.any && !busy);
        shown(this.message.element, !!words);

        const surface = this.surface.element;
        put(surface, 'aria-label', uiLocale.text('chartPlot', { name }));
        put(surface, 'aria-roledescription', uiLocale.strings.chartRole);
        put(surface, 'aria-description', uiLocale.strings.chartHelp);

        // Hidden as a table, the plot has no size to draw in; it draws when it comes back.
        if (!table) this.drawPlot(model, xAxis, yAxis, window);
        else this.drawTable();
    }

    drawPlot(model: ChartModel, xAxis: ChartAxis, yAxis: ChartAxis, window: { from: number; to: number } | null): void {
        const surface = this.surface.element;
        const measured = typeof ResizeObserver !== 'undefined';
        const width = surface.clientWidth || (measured ? 0 : UNMEASURED_WIDTH);
        const height = surface.clientHeight || (measured ? 0 : UNMEASURED_HEIGHT);
        if (!width || !height) return;
        const el = this.element;
        this.look ??= readLook(el, this.cartesian.labelGroup, this.tokens);
        css(el, '--_surface', surfaceBehind(el));
        const rtl = el.ownerDocument.defaultView?.getComputedStyle(el).direction === 'rtl';
        // The same size as last time: the values changed, and the marks move from where they were.
        const size = `${width}x${height}`;
        const animate = this.animation && this.drawnOnce && size === this.lastSize;
        this.lastSize = size;
        this.plot.draw({ model, xAxis, yAxis, horizontal: this.horizontal, rtl, width, height, look: this.look, locale: uiLocale.locale, window, references: this.references, selected: this.selection, animate });
        const pending = this.pendingActive;
        this.pendingActive = null;
        if (pending) {
            const slot = this.plot.order.find(s => s.x === pending.x);
            const point = slot?.points.find(p => p.series === pending.series) ?? slot?.points[0];
            if (slot && point) this.moveTo(slot, point);
        }
        if (!this.drawnOnce && model.any) {
            this.drawnOnce = true;
            mark(this.plot.marks as unknown as HTMLElement, 'data-reveal', this.animation);
        }
    }

    drawTable(): void {
        // The plot's formats are the table's: it needs the model it would draw.
        const model = this.model;
        if (!model) return;
        this.tablePart.draw(model, this.plot, this.accessibleName, this.xAxis.title ?? (model.kind === 'time' ? uiLocale.strings.chartTime : uiLocale.strings.chartPosition));
    }

    /** The plot of a family, made the first time it is needed; the others step aside. */
    usePlot(family: ChartFamily): void {
        let plot = this.plots.get(family);
        if (!plot) {
            plot = family === 'parts' ? new PartsPlot(this.surface.element) : new RadarPlot(this.surface.element);
            this.plots.set(family, plot);
        }
        for (const [name, each] of this.plots) css(each.svg as unknown as HTMLElement, 'display', name === family ? '' : 'none');
        this.plot = plot;
    }

    /** What the legend lists: the parts of a whole, the colors of a heat map, or the series of the chart's family. */
    entriesOf(model: ChartModel): LegendEntry[] {
        const plot = this.plot;
        if (model.family === 'parts') {
            const whole = model.series.find(s => s.shown);
            if (!whole || whole.source.legend === false) return [];
            return whole.points.filter(p => p.off || (p.y !== null && p.y > 0)).map(p => ({ id: `part:${p.index}`, name: plot.xText(p.key), mark: plot.markOfPoint(p), type: 'bar', shown: !p.off, pressable: true }));
        }
        const heat = model.series.find(s => s.shown && s.type === 'heatmap');
        if (heat) {
            const format = heat.source.format ?? this.yAxis.format;
            const number = (v: number) => formatNumber(v, format, uiLocale.locale, { maximumFractionDigits: 1 });
            return this.cartesian.classesOf(model).map((c, i) => ({ id: `heat:${i}`, name: `${number(c.from)} – ${number(c.to)}`, mark: c.color, type: 'bar', shown: true, pressable: false }));
        }
        return model.series.filter(s => familyOf(s.type) === model.family && s.source.legend !== false).map(s => ({ id: `series:${s.index}`, name: s.name, mark: markOf(s), type: s.type, shown: s.shown, pressable: true }));
    }

    toggleEntry(id: string): void {
        const [kind, number] = id.split(':');
        const index = Number(number);
        if (kind === 'series') return this.toggleSeries(index);
        if (kind !== 'part') return;
        const visible = this.hiddenParts.has(index);
        if (visible) this.hiddenParts.delete(index);
        else this.hiddenParts.add(index);
        const whole = this.model?.series.find(s => s.shown);
        if (whole) this.seriesToggled.fire({ series: whole.source as ChartSeries<T>, visible, part: index, source: this });
        this.again();
    }

    toggleSeries(index: number): void {
        const series = this.series[index];
        if (!series) return;
        const visible = this.hidden.has(index);
        this.setSeriesVisible(index, visible);
        this.seriesToggled.fire({ series, visible, source: this });
    }

    changeMode(mode: ChartMode): void {
        if (mode === this.mode) return;
        this.changeProperty('mode', mode);
        this.bindings.writeModel(mode);
        this.modeChanged.fire({ mode, source: this });
    }

    pointOf(p: ModelPoint): ChartPoint<T> {
        const model = this.model as ChartModel;
        const plot = this.plot;
        return { series: model.series[p.series].name, seriesIndex: p.series, index: p.index, x: p.key, y: p.y as number, xText: plot.xText(p.key), yText: plot.valueText(p), size: p.size, share: p.share, row: p.row as T };
    }

    localPlace(e: MouseEvent): { x: number; y: number } {
        const box = this.plot.svg.getBoundingClientRect();
        return { x: e.clientX - box.left, y: e.clientY - box.top };
    }

    pointerMoved(e: PointerEvent): void {
        const press = this.press;
        if (press) {
            const along = this.along(e);
            if (press.moved || Math.abs(along - press.along) > DRAG_FROM) {
                press.moved = true;
                this.clearActive();
                (this.plot as ChartPlot).showBrush(press.along, along);
                return;
            }
        }
        const { x, y } = this.localPlace(e);
        const found = this.plot.find(x, y);
        if (found) this.setActive(found.slot, found.point, e);
        else this.clearActive();
    }

    plotClick(e: MouseEvent): void {
        if (this.skipClick) {
            this.skipClick = false;
            return;
        }
        const { x, y } = this.localPlace(e);
        const found = this.plot.find(x, y);
        if (!found?.point) return;
        this.choose(found.point);
        this.pointClick.fire({ point: this.pointOf(found.point), originalEvent: e, source: this });
    }

    /** A click or Enter chooses a value, when the chart is asked to. */
    choose(p: ModelPoint): void {
        const mode = this.pointSelection;
        if (mode === 'none') return;
        const key = `${p.series}:${p.index}`;
        const had = this.selection.has(key);
        if (mode === 'single') this.selection.clear();
        if (had) this.selection.delete(key);
        else this.selection.add(key);
        this.selectionChanged.fire({ points: this.selectedPoints, source: this });
        (this.plot as ChartPlot).drawSelected?.call(this.plot);
        if (this.plot !== this.cartesian) this.again();
    }

    /** The positions in view: the zoomed part, or the latest stretch of live data, or null for all. */
    windowOf(model: ChartModel): { from: number; to: number } | null {
        if (model.family !== 'cartesian' || !model.any) return null;
        const [first, last] = this.extent(model);
        if (this.zoomWindow) {
            const from = Math.max(first, this.zoomWindow.from);
            const to = Math.min(last, this.zoomWindow.to);
            return to > from || (model.kind === 'category' && to >= from) ? { from, to } : null;
        }
        const span = this.xAxis.span;
        if (!span || span <= 0) return null;
        return model.kind === 'category' ? { from: Math.max(first, last - span + 1), to: last } : { from: Math.max(first, last - span), to: last };
    }

    /** The first and last position of the data. */
    extent(model: ChartModel): [number, number] {
        if (model.kind === 'category') return [0, Math.max(0, model.categories.length - 1)];
        return [model.xMin, model.xMax];
    }

    setWindow(window: { from: number; to: number } | null): void {
        const model = this.model;
        let next = window;
        if (next && model) {
            const [first, last] = this.extent(model);
            // A window over the whole of the data is no zoom at all.
            if (next.from <= first && next.to >= last) next = null;
        }
        const same = (a: typeof next, b: typeof next) => (a === null && b === null) || (!!a && !!b && a.from === b.from && a.to === b.to);
        if (same(next, this.zoomWindow)) return;
        this.zoomWindow = next;
        const key = (v: number) => (!model ? v : model.kind === 'category' ? model.categories[Math.round(v)] : model.kind === 'time' ? new Date(v) : v);
        this.zoomChanged.fire({ from: next ? key(next.from) : null, to: next ? key(next.to) : null, source: this });
        this.again();
    }

    /** Zooms in or out by `factor` around a position, keeping it where it is. */
    zoomAround(center: number, factor: number): void {
        const model = this.model;
        if (!model || model.family !== 'cartesian') return;
        const [first, last] = this.extent(model);
        const now = this.zoomWindow ?? { from: first, to: last };
        let from = center - (center - now.from) * factor;
        let to = center + (now.to - center) * factor;
        if (model.kind === 'category') {
            // Whole categories, and at least one fewer or one more each step, or a short list would never zoom.
            const width = now.to - now.from;
            const next = factor < 1 ? Math.max(1, Math.min(width - 1, Math.round(width * factor))) : Math.max(width + 1, Math.round(width * factor));
            from = Math.round(center - ((center - now.from) / Math.max(1, width)) * next);
            to = from + next;
            if (to > last) [from, to] = [last - next, last];
            if (from < first) [from, to] = [first, first + next];
        }
        this.setWindow({ from: Math.max(first, from), to: Math.min(last, to) });
    }

    /** Moves the zoomed part along by a share of its width. */
    pan(share: number): void {
        const model = this.model;
        const now = this.zoomWindow;
        if (!model || !now) return;
        const [first, last] = this.extent(model);
        let step = (now.to - now.from) * share;
        if (model.kind === 'category') step = Math.sign(step) * Math.max(1, Math.round(Math.abs(step)));
        step = Math.max(first - now.from, Math.min(last - now.to, step));
        if (step) this.setWindow({ from: now.from + step, to: now.to + step });
    }

    along(e: MouseEvent): number {
        const { x, y } = this.localPlace(e);
        return this.horizontal ? y : x;
    }

    pressed(e: PointerEvent): void {
        this.pointerMoved(e);
        if (!this.zoom || e.pointerType === 'touch' || e.button !== 0 || this.model?.family !== 'cartesian') return;
        const { x, y } = this.localPlace(e);
        const at = (this.plot as ChartPlot).positionValueAt(x, y);
        if (at === null) return;
        this.press = { at, along: this.along(e), moved: false };
    }

    released(e: PointerEvent): void {
        const press = this.press;
        this.press = null;
        if (!press?.moved) return;
        const plot = this.plot as ChartPlot;
        plot.showBrush(null, null);
        const { x, y } = this.localPlace(e);
        const at = plot.positionValueAt(x, y);
        // The press is not a click: what it went across is the new view.
        this.skipClick = true;
        if (at === null || !this.model) return;
        let from = Math.min(press.at, at);
        let to = Math.max(press.at, at);
        if (this.model.kind === 'category') {
            from = Math.max(0, Math.round(from));
            to = Math.round(to);
            if (to <= from) return;
        }
        this.setWindow({ from, to });
    }

    wheeled(e: WheelEvent): void {
        if (!this.zoom || this.model?.family !== 'cartesian') return;
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const { x, y } = this.localPlace(e);
            const at = (this.plot as ChartPlot).positionValueAt(x, y);
            if (at !== null) this.zoomAround(at, e.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP);
        } else if (this.zoomWindow && (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))) {
            e.preventDefault();
            this.pan(Math.sign(e.deltaX || e.deltaY) * 0.1);
        }
    }

    setActive(slot: ModelSlot, point: ModelPoint | null, e: Event | null): void {
        if (slot === this.activeSlot && point === this.activePoint) {
            if (e) this.placeTooltip(e as MouseEvent);
            return;
        }
        this.activeSlot = slot;
        this.activePoint = point;
        this.plot.showActive(slot, point, this.crosshair);
        this.showTooltip(slot, point);
        this.placeTooltip(e as MouseEvent | null);
        if (point) this.pointFocused.fire({ point: this.pointOf(point), originalEvent: e, source: this });
    }

    clearActive(): void {
        if (!this.activeSlot) return;
        this.activeSlot = null;
        this.activePoint = null;
        this.plot.showActive(null, null, false);
        this.tooltipPart.hide();
    }

    showTooltip(slot: ModelSlot, point: ModelPoint | null): void {
        const options = this.tooltipOptions;
        const model = this.model as ChartModel;
        if (options.visible === false) return;
        // A dot, a cell, a slice: the reader points at one value, and the tooltip names that one.
        const single = model.family === 'parts' || model.series.every(s => !s.shown || s.type === 'scatter' || s.type === 'bubble' || s.type === 'heatmap');
        const shared = options.shared ?? !single;
        const chosen = (shared || !point ? slot.points : [point]).filter(p => model.series[p.series].source.tooltip !== false);
        if (!chosen.length) {
            this.tooltipPart.hide();
            return;
        }
        const points = chosen.map(p => this.pointOf(p));
        const context: ChartTooltipContext<T> = { title: this.plot.xText(slot.key), points, point: point ? this.pointOf(point) : null };
        const rows = chosen.map((p, i) => ({ mark: this.plot.markOfPoint(p), point: points[i], active: p === point }));
        this.tooltipPart.show(context, rows, options.format);
    }

    placeTooltip(e: MouseEvent | null): void {
        const slot = this.activeSlot;
        const look = this.look;
        if (!slot || !look) return;
        const box = this.plot.box;
        const point = this.activePoint ?? slot.points[0];
        const place = e && 'clientX' in e ? this.localPlace(e) : { x: point.px, y: point.py };
        // On two axes it follows the position; around a center, the pointer or the value.
        const around = this.model?.family !== 'cartesian';
        const x = around || this.horizontal ? place.x : slot.at;
        const y = around || !this.horizontal ? place.y : slot.at;
        const input = this.plot.input;
        this.tooltipPart.place(x, y, input?.width ?? box.width, input?.height ?? box.height, look.tickPad * 2);
    }

    plotFocused(): void {
        // The first value comes with the keyboard only: a click already says where it means.
        if (!this.surface.element.matches(':focus-visible') || this.activeSlot) return;
        const first = this.plot.order[0];
        if (first) this.moveTo(first, first.points[0]);
    }

    moveTo(slot: ModelSlot, point: ModelPoint): void {
        // Zoomed in, the keyboard still walks every value: the view follows it.
        const window = this.plot.input?.window;
        if (window && (slot.x < window.from || slot.x > window.to) && this.zoomWindow) {
            const width = window.to - window.from;
            const from = slot.x < window.from ? slot.x : slot.x - width;
            this.pendingActive = { x: slot.x, series: point.series };
            this.setWindow({ from, to: from + width });
            return;
        }
        this.setActive(slot, point, null);
        const p = this.pointOf(point);
        text(this.status.element, uiLocale.text('chartValue', { series: p.series, position: p.xText, value: p.yText }));
    }

    plotKeyDown(e: KeyboardEvent): void {
        const order = this.plot.order;
        if (!order.length) return;
        const slot = this.activeSlot ?? order[0];
        const point = this.activePoint ?? slot.points[0];
        const index = order.indexOf(slot);
        const inSlot = slot.points.indexOf(point);
        const across = this.horizontal ? ['ArrowDown', 'ArrowUp'] : ['ArrowRight', 'ArrowLeft'];
        const down = this.horizontal ? ['ArrowRight', 'ArrowLeft'] : ['ArrowUp', 'ArrowDown'];
        let goal: ModelSlot | null = null;
        let at = inSlot;
        if (e.key === across[0]) goal = order[Math.min(order.length - 1, index + 1)];
        else if (e.key === across[1]) goal = order[Math.max(0, index - 1)];
        else if (e.key === down[0]) {
            goal = slot;
            at = Math.min(slot.points.length - 1, inSlot + 1);
        } else if (e.key === down[1]) {
            goal = slot;
            at = Math.max(0, inSlot - 1);
        } else if (e.key === 'Home') goal = order[0];
        else if (e.key === 'End') goal = order[order.length - 1];
        else if (e.key === 'Escape') {
            this.clearActive();
            return;
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.choose(point);
            this.pointClick.fire({ point: this.pointOf(point), originalEvent: e, source: this });
            return;
        } else if (this.zoom && (e.key === '+' || e.key === '=' || e.key === '-')) {
            e.preventDefault();
            const model = this.model as ChartModel;
            const [first, last] = this.extent(model);
            const now = this.zoomWindow ?? { from: first, to: last };
            const center = this.activeSlot ? this.activeSlot.x : (now.from + now.to) / 2;
            this.zoomAround(center, e.key === '-' ? 1 / ZOOM_STEP : ZOOM_STEP);
            return;
        } else if (this.zoom && e.key === '0') {
            e.preventDefault();
            this.resetZoom();
            return;
        } else return;
        e.preventDefault();
        // The same series on the next position, when it has a value there.
        const same = goal.points.find(p => p.series === point.series);
        this.moveTo(goal, goal === slot ? slot.points[at] : (same ?? goal.points[0]));
    }
}
