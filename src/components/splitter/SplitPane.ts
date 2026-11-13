import { read, type Bind, type ComponentBase, type IBaseProp } from "@motifx/core";
import { givenField } from "../../core/given-field";
import { nextId } from "../../core/next-id";
import { Panel } from "../layout/Panel";
import type { PanelProps } from "../layout/panel-props";
import type { SplitPaneProps } from "./split-pane-props";
import type { Splitter } from "./Splitter";

const OWN = ['key', 'size', 'minSize', 'maxSize', 'collapsible', 'collapsed', 'resizable'] as const;

/**
 * One pane of a `Splitter`: a `Panel` with its place in the split. It sets its `size` (pixels, a percentage, or an
 * equal share of what remains), `minSize` and `maxSize`, and whether the adjacent handles can collapse it
 * (`collapsible`) or change its size (`resizable`).
 *
 * @example
 * <Splitter>
 *   <SplitPane size={240} minSize={160} collapsible><FolderTree /></SplitPane>
 *   <SplitPane><MessageList /></SplitPane>
 *   <SplitPane size="30%" scrollable="vertical"><Preview /></SplitPane>
 * </Splitter>
 */
export class SplitPane extends Panel {
    owner: Splitter | null = null;
    private ownId = '';

    constructor(props?: IBaseProp<SplitPaneProps>) {
        super(props as IBaseProp<PanelProps> | undefined);
        const own = (this.props ?? {}) as SplitPaneProps;
        this.class.add('mx-splitter__pane');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        const made = own.content?.();
        if (made) this.controls.add(...(Array.isArray(made) ? made : [made as ComponentBase]));
        for (const name of OWN) this.observeProperty(name, () => this.owner?.paneChanged());
        this.motif.setDisposable(() => this.owner?.paneGone(this));
    }

    // Properties (see SplitPaneProps).

    /** The `key` prop, which the JSX `key` also sets, or `''` if there is none. */
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
    get size(): number | string | null {
        return this.getProperty<number | string | null | undefined>('size') ?? null;
    }
    set size(value: Bind<number | string | null>) {
        this.assignProperty('size', value);
    }
    get minSize(): number {
        return Math.max(0, this.getProperty<number | undefined>('minSize') ?? 0);
    }
    set minSize(value: Bind<number>) {
        this.assignProperty('minSize', value);
    }
    get maxSize(): number | null {
        return this.getProperty<number | null | undefined>('maxSize') ?? null;
    }
    set maxSize(value: Bind<number | null>) {
        this.assignProperty('maxSize', value);
    }
    /** This pane's own setting. `undefined` inherits from the splitter. */
    get collapsible(): boolean | undefined {
        return this.getProperty<boolean | undefined>('collapsible');
    }
    set collapsible(value: Bind<boolean | undefined>) {
        this.assignProperty('collapsible', value);
    }
    get collapsed(): boolean {
        return this.getProperty<boolean | undefined>('collapsed') === true;
    }
    set collapsed(value: Bind<boolean>) {
        this.assignProperty('collapsed', value);
    }
    get resizable(): boolean {
        return this.getProperty<boolean | undefined>('resizable') !== false;
    }
    set resizable(value: Bind<boolean>) {
        this.assignProperty('resizable', value);
    }

    /** The id the pane goes by, which the handle after it names: the `id` it was given, else one made here. */
    get paneId(): string {
        if (!this.ownId) this.ownId = String(givenField(this.props, 'id') ?? '') || nextId('split-pane');
        return this.ownId;
    }

    /** Indicates whether the adjacent handles can collapse it: its own `collapsible`, otherwise the splitter's. */
    get isCollapsible(): boolean {
        return this.collapsible ?? this.owner?.collapsible ?? false;
    }

    /** Collapses the pane as the handle's button does. Returns `false` if it cannot collapse or `onCollapsing` canceled it. */
    collapse(): boolean {
        return this.owner?.collapse(this) ?? false;
    }

    /** Expands the pane. */
    expand(): boolean {
        return this.owner?.expand(this) ?? false;
    }

    /** @internal The user hid or showed the pane: the change is the pane's own, not its binding's. */
    setCollapsed(on: boolean): void {
        this.changeProperty('collapsed', on);
    }

    protected override applyProperty(name: string, value: unknown): void {
        super.applyProperty(name, value);
        if (name === 'visible') this.owner?.paneChanged();
    }
}
