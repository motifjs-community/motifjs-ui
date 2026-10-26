import { createSignal, read, type Bind, type ComponentBase, type Signal } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { ContentLifetime } from './content-lifetime';
import type { TabContentClone } from './tab-content-clone';
import type { TabDocumentContent } from './tab-document-content';
import type { TabDocumentOptions } from './tab-document-options';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabTone } from './tab-tone';

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
  'actions',
  'state',
] as const;

/** What a copy has of its own; it shares the rest with the document it was copied from. */
const OWN_IN_COPY = new Set<string>(['pinned', 'preview', 'contentLifetime']);

const NO_ACTIONS: readonly ToolbarItem[] = [];

/**
 * A document of a `TabDocumentManager`: a tab and its content, which can be any component. Every
 * field takes a value or a function (`dirty: () => form.changed`) and is reactive to read.
 *
 * @example
 * const doc = new TabDocument({ type: 'order', title: 'Order 1042', state: { id: 1042 }, content: (d) => new OrderForm(d.state) });
 * manager.open(doc);
 * doc.dirty = true;
 */
export class TabDocument {
  readonly id: string;
  readonly type: string;
  /** What `contentComponent` is made from. */
  content: TabDocumentContent | null;
  /** Makes the content of a copy in another group. */
  clone: TabContentClone | null;
  private readonly values = new Map<string, Signal<unknown>>();
  private readonly where = createSignal<{ manager: TabDocumentManager; group: TabGroup } | null>(null);
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
  /** A text, a number, or `true` for a dot. */
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
  /** Set it through the manager's `pin` and `unpin` to be asked and told. */
  get pinned(): boolean {
    return !!this.get<boolean>('pinned');
  }
  set pinned(value: Bind<boolean>) {
    this.slot('pinned').value = value;
  }
  /** Set it to `false` through the manager's `keep` to be asked and told. */
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
  /** The document's own setting; `undefined` follows the manager. */
  get contentLifetime(): ContentLifetime | undefined {
    return this.get<ContentLifetime>('contentLifetime') ?? undefined;
  }
  set contentLifetime(value: Bind<ContentLifetime | undefined>) {
    this.slot('contentLifetime').value = value;
  }
  /** The document's own setting; `undefined` follows the manager. */
  get allowDuplicate(): boolean | undefined {
    return this.get<boolean>('allowDuplicate') ?? undefined;
  }
  set allowDuplicate(value: Bind<boolean | undefined>) {
    this.slot('allowDuplicate').value = value;
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

  /** The document this one is a copy of (open in another group), `null` for the document itself. */
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
  get isOpen(): boolean {
    return !!this.where.value;
  }
  /** Whether it is its group's active tab. Reactive. */
  get isActive(): boolean {
    const group = this.group;
    return !!group && group.activeDocument === this;
  }
  /** The content made for it, `null` while it is not built. */
  get contentComponent(): ComponentBase | null {
    return this.manager?.contentOf(this) ?? null;
  }

  /** Makes it its group's active tab. */
  activate(focus = false): boolean {
    return this.manager?.activate(this, focus) ?? false;
  }

  /** Closes it as its close button does: `onClosing` may keep it. */
  close(): Promise<boolean> {
    return this.manager?.close(this) ?? Promise.resolve(false);
  }

  /** Whether a copy of it can get content of its own: from `clone`, from `content` given as a function, or from the manager's factory. */
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

  private get<T>(name: string): T | undefined {
    return read(this.slot(name).value as Bind<T>);
  }

  private slot(name: string): Signal<unknown> {
    let slot = this.values.get(name);
    if (!slot) this.values.set(name, (slot = createSignal<unknown>(undefined)));
    return slot;
  }
}
