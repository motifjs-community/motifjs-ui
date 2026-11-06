import { createSignal, read, type Bind, type ComponentBase, type Signal } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { ContentLifetime } from './content-lifetime';
import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabContentClone } from './tab-content-clone';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentContent } from './tab-document-content';
import type { TabDocumentOptions } from './tab-document-options';
import type { TabDockArea } from './TabDockArea';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabShowOptions } from './tab-show-options';
import type { TabTone } from './tab-tone';
import type { TabWindow } from './TabWindow';

const FIELDS = [
  'title',
  'description',
  'icon',
  'tooltip',
  'badge',
  'tone',
  'dirty',
  'pinned',
  'preview',
  'closable',
  'contentLifetime',
  'allowDuplicate',
  'allowDrag',
  'allowFloat',
  'allowDock',
  'dockSides',
  'allowAutoHide',
  'allowHide',
  'allowNewWindow',
  'actions',
  'state',
] as const;

/** What a copy has of its own; it shares the rest with the document it was copied from. */
const OWN_IN_COPY = new Set<string>(['pinned', 'preview', 'contentLifetime']);

const NO_ACTIONS: readonly ToolbarItem[] = [];

/**
 * A document of a `TabDocumentManager`: a tab and its content, which can be any component. Every
 * field accepts a value or a function (`dirty: () => form.changed`), and reading it is reactive.
 *
 * @example
 * const doc = new TabDocument({ type: 'order', title: 'Order 1042', state: { id: 1042 }, content: (d) => new OrderForm(d.state) });
 * manager.open(doc);
 * doc.dirty = true;
 */
export class TabDocument {
  readonly id: string;
  readonly type: string;
  /** What `contentComponent` is created from. */
  content: TabDocumentContent | null;
  /** Creates the content of a copy in another group. */
  clone: TabContentClone | null;
  private readonly values = new Map<string, Signal<unknown>>();
  /** The manager it is open in, and its group (`null` while it is hidden). */
  private readonly where = createSignal<{ manager: TabDocumentManager; group: TabGroup | null } | null>(null);
  private readonly from: TabDocument | null;

  constructor(options: TabDocumentOptions = {}, from: TabDocument | null = null) {
    this.id = options.id ?? nextId('doc');
    this.type = options.type ?? '';
    this.content = options.content ?? null;
    this.clone = options.clone ?? null;
    this.from = from;
    for (const name of FIELDS) if (options[name] !== undefined) this.slot(name).value = options[name];
  }

  get title(): string {
    return this.get<string>('title') ?? '';
  }
  set title(value: Bind<string>) {
    this.slot('title').value = value;
  }
  get description(): string {
    return this.get<string>('description') ?? '';
  }
  set description(value: Bind<string>) {
    this.slot('description').value = value;
  }
  get icon(): IconSource | null {
    return this.get<IconSource | null>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null | undefined>) {
    this.slot('icon').value = value;
  }
  get tooltip(): string {
    return this.get<string>('tooltip') ?? '';
  }
  set tooltip(value: Bind<string>) {
    this.slot('tooltip').value = value;
  }
  /** A short text or number, or `true` to show a dot. */
  get badge(): string | number | boolean | null {
    return this.get<string | number | boolean | null>('badge') ?? null;
  }
  set badge(value: Bind<string | number | boolean | null | undefined>) {
    this.slot('badge').value = value;
  }
  get tone(): TabTone | null {
    return this.get<TabTone | null>('tone') ?? null;
  }
  set tone(value: Bind<TabTone | null | undefined>) {
    this.slot('tone').value = value;
  }
  get dirty(): boolean {
    return !!this.get<boolean>('dirty');
  }
  set dirty(value: Bind<boolean>) {
    this.slot('dirty').value = value;
  }
  /** Use the manager's `pin` and `unpin` so that events are raised. */
  get pinned(): boolean {
    return !!this.get<boolean>('pinned');
  }
  set pinned(value: Bind<boolean>) {
    this.slot('pinned').value = value;
  }
  /** To set it to `false`, use the manager's `keep` so that events are raised. */
  get preview(): boolean {
    return !!this.get<boolean>('preview');
  }
  set preview(value: Bind<boolean>) {
    this.slot('preview').value = value;
  }
  get closable(): boolean {
    return this.get<boolean>('closable') ?? true;
  }
  set closable(value: Bind<boolean>) {
    this.slot('closable').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's. */
  get contentLifetime(): ContentLifetime | undefined {
    return this.get<ContentLifetime>('contentLifetime') ?? undefined;
  }
  set contentLifetime(value: Bind<ContentLifetime | undefined>) {
    this.slot('contentLifetime').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's. */
  get allowDuplicate(): boolean | undefined {
    return this.get<boolean>('allowDuplicate') ?? undefined;
  }
  set allowDuplicate(value: Bind<boolean | undefined>) {
    this.slot('allowDuplicate').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's `allowDrag`. */
  get allowDrag(): boolean | undefined {
    return this.get<boolean>('allowDrag') ?? undefined;
  }
  set allowDrag(value: Bind<boolean | undefined>) {
    this.slot('allowDrag').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's `allowFloat`. */
  get allowFloat(): boolean | undefined {
    return this.get<boolean>('allowFloat') ?? undefined;
  }
  set allowFloat(value: Bind<boolean | undefined>) {
    this.slot('allowFloat').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's `allowDock`. */
  get allowDock(): boolean | undefined {
    return this.get<boolean>('allowDock') ?? undefined;
  }
  set allowDock(value: Bind<boolean | undefined>) {
    this.slot('allowDock').value = value;
  }
  /** The dock areas this document can move to. `undefined` uses the manager's `dockSides`. */
  get dockSides(): readonly TabDockSide[] | undefined {
    return this.get<readonly TabDockSide[]>('dockSides') ?? undefined;
  }
  set dockSides(value: Bind<readonly TabDockSide[] | undefined>) {
    this.slot('dockSides').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's `allowAutoHide`. */
  get allowAutoHide(): boolean | undefined {
    return this.get<boolean>('allowAutoHide') ?? undefined;
  }
  set allowAutoHide(value: Bind<boolean | undefined>) {
    this.slot('allowAutoHide').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's `allowHide`. */
  get allowHide(): boolean | undefined {
    return this.get<boolean>('allowHide') ?? undefined;
  }
  set allowHide(value: Bind<boolean | undefined>) {
    this.slot('allowHide').value = value;
  }
  /** This document's own setting. `undefined` uses the manager's `allowNewWindow`. */
  get allowNewWindow(): boolean | undefined {
    return this.get<boolean>('allowNewWindow') ?? undefined;
  }
  set allowNewWindow(value: Bind<boolean | undefined>) {
    this.slot('allowNewWindow').value = value;
  }
  get actions(): readonly ToolbarItem[] {
    return this.get<readonly ToolbarItem[]>('actions') ?? NO_ACTIONS;
  }
  set actions(value: Bind<readonly ToolbarItem[]>) {
    this.slot('actions').value = value;
  }
  get state(): unknown {
    return this.get<unknown>('state');
  }
  set state(value: Bind<unknown>) {
    this.slot('state').value = value;
  }

  /** The document this one is a copy of (open in another group), or `null` for the document itself. */
  get original(): TabDocument | null {
    return this.from;
  }
  /** The manager it is open in. Reactive. */
  get manager(): TabDocumentManager | null {
    return this.where.value?.manager ?? null;
  }
  /** The group it is open in. Reactive. */
  get group(): TabGroup | null {
    return this.where.value?.group ?? null;
  }
  /** Indicates whether it is in a manager: in one of its groups, or hidden there. */
  get isOpen(): boolean {
    return !!this.where.value;
  }
  /**
   * Indicates whether its manager has hidden it. Until `show`, it is in no group, and its content is
   * kept according to its `contentLifetime`. Reactive.
   */
  get isHidden(): boolean {
    const where = this.where.value;
    return !!where && !where.group;
  }
  /** Indicates whether it is the active tab of its group. Reactive. */
  get isActive(): boolean {
    const group = this.group;
    return !!group && group.activeDocument === this;
  }
  /** The content created for it, or `null` until it is created. */
  get contentComponent(): ComponentBase | null {
    return this.manager?.contentOf(this) ?? null;
  }

  /** The floating window containing it, otherwise `null`. Reactive. */
  get window(): TabWindow | null {
    return this.group?.window ?? null;
  }
  /** The dock area containing it, otherwise `null`. Reactive. */
  get dockArea(): TabDockArea | null {
    return this.group?.dockArea ?? null;
  }
  /** The new browser window containing it, or `null` in the main window. Reactive. */
  get browserWindow(): TabBrowserWindow | null {
    return this.group?.browserWindow ?? null;
  }

  /** Makes it the active tab of its group. */
  activate(focus = false): boolean {
    return this.manager?.activate(this, focus) ?? false;
  }

  /** Closes it as its close button does. `onClosing` can keep it open. */
  close(): Promise<boolean> {
    return this.manager?.close(this) ?? Promise.resolve(false);
  }

  /** Removes it from its group and keeps it for `show`. */
  hide(): boolean {
    return this.manager?.hide(this) ?? false;
  }

  /** Restores it after `hide`: to its previous place, unless `options` name another. */
  show(options?: TabShowOptions): boolean {
    return this.manager?.show(this, options) ?? false;
  }

  /**
   * Indicates whether a copy of it can have its own content: from `clone`, from a `content` function,
   * or from the manager's factory.
   */
  canCopy(factory: boolean): boolean {
    const root = this.from ?? this;
    return !!root.clone || typeof root.content === 'function' || (!root.content && factory);
  }

  /** @internal A copy for another group: the same id and type, sharing every field but `pinned`, `preview` and `contentLifetime`. */
  makeCopy(): TabDocument {
    const root = this.from ?? this;
    const clone = root.clone;
    const content = clone ? (copy: TabDocument) => clone(copy) : typeof root.content === 'function' ? root.content : null;
    const copy = new TabDocument({ id: root.id, type: root.type, content: content ?? undefined }, root);
    for (const name of FIELDS) if (!OWN_IN_COPY.has(name)) copy.values.set(name, root.slot(name));
    return copy;
  }

  /** @internal Where the manager put it. */
  placeIn(manager: TabDocumentManager | null, group: TabGroup | null): void {
    this.where.value = manager && group ? { manager, group } : null;
  }

  /** @internal Hidden: still the manager's, in no group. */
  markHidden(manager: TabDocumentManager): void {
    this.where.value = { manager, group: null };
  }

  private get<T>(name: string): T | undefined {
    return read(this.slot(name).value as Bind<T>);
  }

  private slot(name: string): Signal<unknown> {
    let slot = this.values.get(name);
    if (!slot) this.values.set(name, (slot = createSignal<unknown>(undefined)));
    return slot;
  }
}
