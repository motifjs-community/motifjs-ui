import { read, type Bind, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { put } from "../../core/draw-parts";
import { PanelContent } from "../tabs/PanelContent";
import type { MultiView } from "./MultiView";
import type { ViewProps } from "./view-props";

const OWN = ['key', 'title', 'lazy', 'keepAlive'] as const;

/**
 * One page of a `MultiView`: the JSX children are its content, built when it is first in sight (see `lazy`), and
 * what `content` makes besides them.
 *
 * @example
 * <MultiView x-model={() => this.page}>
 *   <View title="Details"><TextBox label="Name" /></View>
 *   <View title="Review" content={() => new ReviewView()} />
 * </MultiView>
 */
export class View extends Control<HTMLDivElement, ViewProps> {
    content: PanelContent;
    owner: MultiView | null = null;

    constructor(props?: IBaseProp<ViewProps>) {
        super('div', props);
        const own = (this.props ?? {}) as ViewProps;
        this.element.classList.add('mx-multi-view__view');
        this.element.setAttribute('role', 'group');
        this.element.setAttribute('aria-hidden', 'true');
        this.element.inert = true;
        this.content = new PanelContent(this, this.childs ?? [], own.content);
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        this.observeProperty('title', () => this.owner?.viewChanged());
        this.observeProperty('key', () => this.owner?.viewChanged());
        this.motif.setDisposable(() => this.owner?.viewGone(this));
    }

    // Properties (see ViewProps).

    /** The `key` prop (also when written as the JSX `key`), `''` without one. */
    get key(): string {
        const own = this.getProperty<string | undefined>('key');
        if (own !== undefined) return own;
        const jsx = (this.props as { indexkey?: unknown } | undefined)?.indexkey;
        const key = read(jsx as Bind<unknown>);
        return key === undefined || key === null ? '' : String(key);
    }
    set key(value: Bind<string>) {
        this.assignProperty('key', value, v => v ?? '');
    }
    get title(): string {
        return this.getProperty<string | undefined>('title') ?? '';
    }
    set title(value: Bind<string>) {
        this.assignProperty('title', value);
    }
    /** This view's own setting; `undefined` follows the multi-view. */
    get lazy(): boolean | undefined {
        return this.getProperty<boolean | undefined>('lazy');
    }
    set lazy(value: Bind<boolean | undefined>) {
        this.assignProperty('lazy', value);
    }
    get keepAlive(): boolean | undefined {
        return this.getProperty<boolean | undefined>('keepAlive');
    }
    set keepAlive(value: Bind<boolean | undefined>) {
        this.assignProperty('keepAlive', value);
    }

    /** Whether it is the view in sight. */
    get isSelected(): boolean {
        return !!this.owner && this.owner.selectedView === this;
    }

    /** Whether its content has been built (see `lazy`). */
    get contentBuilt(): boolean {
        return this.content.isBuilt;
    }

    /** Brings the view into sight; `false` when it is hidden, disabled or not in a `MultiView`. */
    select(): Promise<boolean> {
        return this.owner ? this.owner.select(this) : Promise.resolve(false);
    }

    /** @internal In sight or not; the multi-view decides. */
    reveal(on: boolean, keepAlive: boolean): void {
        put(this.element, 'aria-hidden', on ? null : 'true');
        this.element.inert = !on;
        if (on) this.content.build();
        else if (!keepAlive) this.content.release();
    }

    /** @internal Builds the content now. */
    buildContent(): void {
        this.content.build();
    }

    protected override applyProperty(name: string, value: unknown): void {
        // A view is not a stop for the Tab key; what is in it is.
        if (name === 'tabStop') return;
        super.applyProperty(name, value);
        if (name === 'visible' || name === 'enabled') this.owner?.viewChanged();
    }
}
