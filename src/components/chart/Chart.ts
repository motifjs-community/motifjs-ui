import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp, type IDisposable } from "@motifx/core";
import type { data } from "@motifx-community/data";
import { Control } from "../../core/control";
import { css, mark, part, put, shown, text } from "../../core/draw-parts";
import { givenList } from "../../core/given-field";
import { glyph } from "../../core/glyphs";
import { onLookChanged } from "../../core/look-watch";
import { onLanguage } from "../../core/on-language";
import { onReState } from "../../core/on-re-state";
import { ResizeWatch } from "../../core/resize-watch";
import { uiLocale } from "../../core/ui-locale";
import { surfaceBehind } from "../../parts/chart/chart-text";
import { Button } from "../button/Button";
import type { ChartAxis } from "./chart-axis";
import type { ChartDataErrorEventArgs } from "./chart-data-error-event-args";
import { chartCanvas, chartSvg } from "./chart-export";
import type { ChartExportOptions } from "./chart-export-options";
import type { ChartField } from "./chart-field";
import type { ChartLegendOptions } from "./chart-legend-options";
import { readLook, type ChartLook } from "./chart-look";
import { buildModel, type ChartModel, type ModelPoint, type ModelSlot } from "./chart-model";
import type { ChartPoint } from "./chart-point";
import type { ChartPointEventArgs } from "./chart-point-event-args";
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

const OWN = ['data', 'dataSource', 'xField', 'series', 'horizontal', 'stacked', 'title', 'subtitle', 'label', 'xAxis', 'yAxis', 'legend', 'tooltip', 'crosshair', 'height', 'animation', 'tableButton', 'mode', 'emptyText', 'loading'] as const;

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
    plot: ChartPlot;
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
        this.tools.controls.add(this.modeButton);

        this.area = part<HTMLDivElement>(this, 'div', 'mx-chart__area-box');
        this.surface = part<HTMLDivElement>(this.area, 'div', 'mx-chart__plot');
        const surface = this.surface.element;
        surface.tabIndex = 0;
        surface.setAttribute('role', 'group');
        this.plot = new ChartPlot(surface);
        this.message = part<HTMLDivElement>(this.surface, 'div', 'mx-chart__message');
        this.tooltipPart = new ChartTooltip(el.ownerDocument);
        surface.append(this.tooltipPart.element);
        this.legendPart = new ChartLegend(el.ownerDocument, series => this.toggleSeries(series));
        el.append(this.legendPart.element);
        this.tablePart = new ChartTable(el.ownerDocument);
        el.append(this.tablePart.element);
        this.status = part<HTMLDivElement>(this, 'div', 'mx-sr-only');
        this.status.element.setAttribute('role', 'status');

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onPointClick) this.onPointClick(own.onPointClick);
        if (own.onPointFocused) this.onPointFocused(own.onPointFocused);
        if (own.onSeriesToggled) this.onSeriesToggled(own.onSeriesToggled);
        if (own.onModeChanged) this.onModeChanged(own.onModeChanged);
        if (own.onDataError) this.onDataError(own.onDataError);

        for (const name of OWN) {
            if (name === 'dataSource') this.observeProperty(name, () => this.followSource());
            else if (name === 'height') this.observeProperty<number | null>(name, height => css(el, '--_height', height ? `${height}px` : ''));
            else this.observeProperty(name, () => this.again());
        }
        onLanguage(this, () => this.again());
        onReState(this, () => this.again());

        surface.addEventListener('pointermove', e => this.pointerMoved(e));
        surface.addEventListener('pointerdown', e => this.pointerMoved(e));
        // A finger leaves as it lifts: the value stays until the reader taps elsewhere.
        surface.addEventListener('pointerleave', e => {
            if (e.pointerType !== 'touch') this.clearActive();
        });
        surface.addEventListener('click', e => this.plotClick(e));
        surface.addEventListener('keydown', e => this.plotKeyDown(e));
        surface.addEventListener('focus', () => this.plotFocused());
        surface.addEventListener('blur', () => this.clearActive());
        this.motif.setDisposable(() => {
            this.watch?.disconnect();
            this.stopLook?.();
            this.listening?.dispose();
            for (const emitter of [this.pointClick, this.pointFocused, this.seriesToggled, this.modeChanged, this.dataError]) emitter.dispose();
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
        const model = buildModel({ rows: this.rows, series, xField: this.xField, xAxis, yAxis, stacked: this.stacked, hidden: this.hidden });
        this.model = model;
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
        shown(this.tools.element, this.tableButton);
        shown(this.head.element, !!(this.title || this.subtitle || this.tableButton));

        const legend = this.legendOptions;
        const listed = model.series.filter(s => s.source.legend !== false).length;
        const legendOn = (legend.visible ?? listed >= 2) && listed > 0;
        this.legendPart.draw(model, legend.toggle !== false);
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
        if (!table) this.drawPlot(model, xAxis, yAxis);
        else this.drawTable();
    }

    drawPlot(model: ChartModel, xAxis: ChartAxis, yAxis: ChartAxis): void {
        const surface = this.surface.element;
        const measured = typeof ResizeObserver !== 'undefined';
        const width = surface.clientWidth || (measured ? 0 : UNMEASURED_WIDTH);
        const height = surface.clientHeight || (measured ? 0 : UNMEASURED_HEIGHT);
        if (!width || !height) return;
        const el = this.element;
        this.look ??= readLook(el, this.plot.labelGroup);
        css(el, '--_surface', surfaceBehind(el));
        const rtl = el.ownerDocument.defaultView?.getComputedStyle(el).direction === 'rtl';
        this.plot.draw({ model, xAxis, yAxis, horizontal: this.horizontal, rtl, width, height, look: this.look, locale: uiLocale.locale });
        if (!this.drawnOnce && model.any) {
            this.drawnOnce = true;
            mark(this.plot.marks as unknown as HTMLElement, 'data-reveal', this.animation);
        }
    }

    drawTable(): void {
        // The plot's formats are the table's: it needs the model it would draw.
        const model = this.model;
        if (!model) return;
        const plot = this.plot;
        plot.input = { model, xAxis: this.xAxis, yAxis: this.yAxis, horizontal: this.horizontal, rtl: false, width: 0, height: 0, look: this.look as ChartLook, locale: uiLocale.locale };
        this.tablePart.draw(model, plot, this.accessibleName, this.xAxis.title ?? uiLocale.strings.chartPosition);
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
        return { series: model.series[p.series].name, seriesIndex: p.series, index: p.index, x: p.key, y: p.y as number, xText: plot.xText(p.key), yText: plot.valueText(p), size: p.size, row: p.row as T };
    }

    localPlace(e: MouseEvent): { x: number; y: number } {
        const box = this.plot.svg.getBoundingClientRect();
        return { x: e.clientX - box.left, y: e.clientY - box.top };
    }

    pointerMoved(e: PointerEvent): void {
        const { x, y } = this.localPlace(e);
        const found = this.plot.find(x, y);
        if (found) this.setActive(found.slot, found.point, e);
        else this.clearActive();
    }

    plotClick(e: MouseEvent): void {
        const { x, y } = this.localPlace(e);
        const found = this.plot.find(x, y);
        if (found?.point) this.pointClick.fire({ point: this.pointOf(found.point), originalEvent: e, source: this });
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
        const dots = model.series.every(s => !s.shown || s.type === 'scatter' || s.type === 'bubble');
        const shared = options.shared ?? !dots;
        const chosen = (shared || !point ? slot.points : [point]).filter(p => model.series[p.series].source.tooltip !== false);
        if (!chosen.length) {
            this.tooltipPart.hide();
            return;
        }
        const points = chosen.map(p => this.pointOf(p));
        const context: ChartTooltipContext<T> = { title: this.plot.xText(slot.key), points, point: point ? this.pointOf(point) : null };
        const rows = chosen.map((p, i) => ({ mark: markOf(model.series[p.series]), point: points[i], active: p === point }));
        this.tooltipPart.show(context, rows, options.format);
    }

    placeTooltip(e: MouseEvent | null): void {
        const slot = this.activeSlot;
        const look = this.look;
        if (!slot || !look) return;
        const box = this.plot.box;
        const point = this.activePoint ?? slot.points[0];
        const place = e && 'clientX' in e ? this.localPlace(e) : { x: point.px, y: point.py };
        const x = this.horizontal ? place.x : slot.at;
        const y = this.horizontal ? slot.at : place.y;
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
            this.pointClick.fire({ point: this.pointOf(point), originalEvent: e, source: this });
            return;
        } else return;
        e.preventDefault();
        // The same series on the next position, when it has a value there.
        const same = goal.points.find(p => p.series === point.series);
        this.moveTo(goal, goal === slot ? slot.points[at] : (same ?? goal.points[0]));
    }
}
