import { Component, Emitter, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { part } from "../../core/draw-parts";
import { onWindow } from "../../core/window-events";
import { fillTemplate } from "../../core/fill-template";
import { functionValue } from "../../core/function-value";
import { onLanguage } from "../../core/on-language";
import { css, put, shown, text } from "../../core/part-writes";
import { shortcuts } from "../../core/shortcut-registry";
import type { ShortcutInfo } from "../../core/shortcut-info";
import { shortcutText } from "../../core/shortcut-text";
import { uiLocale } from "../../core/ui-locale";
import { ListBox } from "../listbox/ListBox";
import { TextBox } from "../textbox/TextBox";
import { Toolbar } from "../toolbar/Toolbar";
import type { ToolbarItem } from "../toolbar/toolbar-item";
import type { ShortcutEditorKeysChangedEventArgs } from "./shortcut-editor-keys-changed-event-args";
import type { ShortcutEditorProps } from "./shortcut-editor-props";

const OWN = ['grouped', 'searchEnabled', 'resetAllEnabled', 'height', 'label'] as const;

const MODIFIERS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph']);

/** A shortcut as the list shows it: the shortcuts with one name are one row. */
interface ShortcutRow {
    name: string;
    text: string;
    keys: string;
    category: string;
    changed: boolean;
    customizable: boolean;
    /** The places its shortcuts work in: a component, or app-wide (`null`). */
    scopes: (ComponentBase | null)[];
}

/**
 * The keyboard shortcuts of the app (`shortcuts`), for the user to change: every shortcut with a name, grouped and
 * searchable, with its keys. A field takes the keys pressed and says who uses them already; the toolbar gives them to
 * the selected shortcut, takes its keys away, gives it its own again, or gives every shortcut its own again. It can be
 * put anywhere: a settings page, a window, a tab.
 *
 * The keys the user gives go to `shortcuts.keymap`, one plain object; saving it is up to the app (`onKeysChanged`, or
 * `shortcuts.onKeymapChanged`). The list follows the shortcuts as they are added and taken away.
 *
 * @example
 * <ShortcutEditor height="480px" onKeysChanged={e => settings.save('keys', e.keymap)} />
 */
export class ShortcutEditor extends Control<HTMLDivElement, ShortcutEditorProps> {
    keysChanged = new Emitter<ShortcutEditorKeysChangedEventArgs>();
    bar: Toolbar;
    capture: TextBox;
    status: Component<HTMLOutputElement>;
    list: ListBox<ShortcutRow, string>;
    assignItem: ToolbarItem;
    removeItem: ToolbarItem;
    resetItem: ToolbarItem;
    resetAllItem: ToolbarItem;
    resetAllSeparator: ToolbarItem = { type: 'separator' };
    /** The keys pressed in the field, as `addShortcut` reads them. */
    pressed: string | null = null;
    rows: ShortcutRow[] = [];
    refreshQueued = false;

    constructor(props?: IBaseProp<ShortcutEditorProps>) {
        super('div', props);
        const own = (this.props ?? {}) as ShortcutEditorProps;
        this.class.add('mx-shortcut-editor');
        this.attr.add({ role: 'group' });

        const button = (click: () => void): ToolbarItem => ({ text: '', click: () => untracked(click) });
        this.assignItem = button(() => this.give(this.pressed ? [this.pressed] : null));
        this.removeItem = button(() => this.give([]));
        this.resetItem = button(() => this.give(null));
        this.resetAllItem = button(() => this.resetAll());
        this.bar = new Toolbar({ size: 'sm', items: [this.assignItem, this.removeItem, this.resetItem, this.resetAllSeparator, this.resetAllItem] });
        this.bar.class.add('mx-shortcut-editor__tools');

        this.capture = new TextBox({ labelMode: 'hidden', readOnly: true });
        this.capture.class.add('mx-shortcut-editor__capture');
        this.status = new Component<HTMLOutputElement>('output');
        this.status.class.add('mx-shortcut-editor__status');
        const keysRow = new Component<HTMLDivElement>('div');
        keysRow.class.add('mx-shortcut-editor__keys');
        keysRow.controls.add(this.capture, this.status);

        this.list = new ListBox<ShortcutRow, string>({
            textField: 'text',
            valueField: 'name',
            enabledField: 'customizable',
            labelMode: 'hidden',
            stretch: true,
            height: '100%',
            itemTemplate: (row, holder) => {
                this.drawRow(row, holder);
            },
        });
        this.list.class.add('mx-shortcut-editor__list');
        this.list.onValueChanged(() => this.drawTools());
        this.controls.add(this.bar, keysRow, this.list);

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.filter !== undefined) this.bindProperty('filter', functionValue(own.filter));
        if (own.onKeysChanged) this.onKeysChanged(own.onKeysChanged);

        this.observeProperty('filter', () => this.refresh());
        this.observeProperty('grouped', () => this.drawGroups());
        this.observeProperty<boolean | undefined>('searchEnabled', on => (this.list.searchEnabled = on !== false));
        this.observeProperty('resetAllEnabled', () => this.drawTools());
        this.observeProperty<string | null | undefined>('height', height => css(this, 'block-size', height ?? ''));
        this.observeProperty('label', () => this.drawTexts());
        onLanguage(this, () => {
            this.drawTexts();
            this.refresh();
        });
        this.listenKeys();
        // The list follows the shortcuts: a component that comes or goes adds or takes away its keys.
        const changed = shortcuts.onChanged(() => this.queueRefresh());
        this.motif.setDisposable(() => {
            changed.dispose();
            this.keysChanged.dispose();
        });
        this.drawGroups();
    }

    // Properties (see ShortcutEditorProps).

    get filter(): ((shortcut: ShortcutInfo) => boolean) | null {
        return this.getProperty<((shortcut: ShortcutInfo) => boolean) | null | undefined>('filter') ?? null;
    }
    set filter(value: Bind<((shortcut: ShortcutInfo) => boolean) | null>) {
        this.assignProperty('filter', functionValue(value));
    }
    get grouped(): boolean {
        return this.getProperty<boolean | undefined>('grouped') !== false;
    }
    set grouped(value: Bind<boolean>) {
        this.assignProperty('grouped', value, Boolean);
    }
    get searchEnabled(): boolean {
        return this.getProperty<boolean | undefined>('searchEnabled') !== false;
    }
    set searchEnabled(value: Bind<boolean>) {
        this.assignProperty('searchEnabled', value, Boolean);
    }
    get resetAllEnabled(): boolean {
        return this.getProperty<boolean | undefined>('resetAllEnabled') !== false;
    }
    set resetAllEnabled(value: Bind<boolean>) {
        this.assignProperty('resetAllEnabled', value, Boolean);
    }
    get height(): string | null {
        return this.getProperty<string | null | undefined>('height') ?? null;
    }
    set height(value: Bind<string | null>) {
        this.assignProperty('height', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }
    get onKeysChanged(): MotifEvent<ShortcutEditorKeysChangedEventArgs> {
        return this.keysChanged.event;
    }

    /** The name of the selected shortcut, or `null`. */
    get selected(): string | null {
        return (this.list.value as string | null) ?? null;
    }
    set selected(name: string | null) {
        this.list.value = name;
    }

    /** Reads the shortcuts and their keys again, keeping the selected one. */
    refresh(): void {
        this.refreshQueued = false;
        if (this.isDisposed) return;
        const filter = this.peekProperty<((shortcut: ShortcutInfo) => boolean) | null | undefined>('filter') ?? (s => s.customizable);
        const other = uiLocale.strings.shortcutEditorOther;
        const byName = new Map<string, ShortcutRow>();
        for (const info of shortcuts.list()) {
            if (info.name === null || !filter(info)) continue;
            const row = byName.get(info.name);
            if (row) {
                if (!row.scopes.includes(info.scope)) row.scopes.push(info.scope);
                continue;
            }
            byName.set(info.name, {
                name: info.name,
                text: info.text,
                keys: info.keys.map(shortcutText).join(', '),
                category: info.category || other,
                changed: info.customizable && shortcuts.isAssigned(info.name),
                customizable: info.customizable,
                scopes: [info.scope],
            });
        }
        const selected = this.selected;
        this.rows = [...byName.values()];
        this.list.items = this.rows;
        this.list.value = selected !== null && byName.has(selected) ? selected : null;
        this.drawTools();
    }

    /**
     * Gives the selected shortcut the keys (an empty list: none), or its own again with `null`. Returns `false` when no
     * shortcut the user can change is selected.
     */
    give(keys: readonly string[] | null): boolean {
        const row = this.rows.find(r => r.name === this.selected);
        if (!row?.customizable) return false;
        shortcuts.assign(row.name, keys);
        this.pressed = null;
        this.capture.value = '';
        this.refresh();
        this.keysChanged.fire({ name: row.name, keys: shortcuts.keysOf(row.name), keymap: shortcuts.keymap });
        return true;
    }

    /** Gives every shortcut its own keys again. */
    resetAll(): void {
        shortcuts.keymap = null;
        this.refresh();
        this.keysChanged.fire({ name: null, keys: [], keymap: shortcuts.keymap });
    }

    queueRefresh(): void {
        if (this.refreshQueued) return;
        this.refreshQueued = true;
        queueMicrotask(() => this.refreshQueued && this.refresh());
    }

    /** The list's template: the row's texts as parts of the row's text part. */
    drawRow(row: ShortcutRow, holder: ComponentBase): void {
        const add = (className: string, text: string) => {
            part<HTMLSpanElement>(holder, 'span', className).setText(text);
        };
        add('mx-shortcut-editor__text', row.text);
        if (row.changed) add('mx-shortcut-editor__changed', uiLocale.strings.shortcutEditorChanged);
        add('mx-shortcut-editor__row-keys', row.keys);
    }

    drawGroups(): void {
        const grouped = this.grouped;
        this.list.groupField = (row: ShortcutRow) => (grouped ? row.category : undefined);
    }

    drawTexts(): void {
        const s = uiLocale.strings;
        const label = this.label || s.shortcutEditorLabel;
        put(this, 'aria-label', label);
        this.list.label = label;
        this.bar.label = label;
        this.capture.label = s.shortcutEditorPressKeys;
        this.capture.placeholder = s.shortcutEditorPressKeys;
        this.assignItem.text = s.shortcutEditorAssign;
        this.removeItem.text = s.shortcutEditorRemoveKeys;
        this.resetItem.text = s.shortcutEditorReset;
        this.resetAllItem.text = s.shortcutEditorResetAll;
        this.drawTools();
    }

    drawTools(): void {
        const s = uiLocale.strings;
        const row = this.rows.find(r => r.name === this.selected) ?? null;
        const can = !!row?.customizable;
        this.assignItem.enabled = can && !!this.pressed;
        this.removeItem.enabled = can && row!.keys !== '';
        this.resetItem.enabled = can && row!.changed;
        this.resetAllItem.visible = this.resetAllEnabled;
        this.resetAllSeparator.visible = this.resetAllEnabled;
        this.resetAllItem.enabled = Object.keys(shortcuts.keymap).length > 0;
        this.bar.refresh();
        shown(this.status, !!this.pressed);
        if (!this.pressed) {
            text(this.status, '');
            return;
        }
        // Who uses the keys already, in the places the selected shortcut works; with none selected, app-wide.
        const keys = this.pressed;
        const others = new Map<string, ShortcutInfo>();
        for (const scope of row?.scopes ?? [null]) {
            for (const info of shortcuts.takenBy(keys, scope)) if (info.name !== row?.name) others.set(info.name ?? info.keys.join(), info);
        }
        text(this.status, others.size
            ? fillTemplate(s.shortcutEditorUsedBy, { keys: shortcutText(keys), names: [...others.values()].map(info => info.text).join(', ') })
            : fillTemplate(s.shortcutEditorFree, { keys: shortcutText(keys) }));
    }

    // The field takes the keys before the app's shortcuts see them; Tab and Escape still move on and close.
    listenKeys(): void {
        const onKey = (e: KeyboardEvent) => {
            if (!this.capture.motif.isEventFrom(e) || MODIFIERS.has(e.key)) return;
            const plain = !e.ctrlKey && !e.altKey && !e.metaKey;
            if (plain && (e.key === 'Tab' || e.key === 'Escape')) return;
            e.preventDefault();
            e.stopPropagation();
            untracked(() => {
                if (plain && e.key === 'Backspace') {
                    this.pressed = null;
                    this.capture.value = '';
                } else {
                    this.pressed = pressedKeys(e);
                    this.capture.value = shortcutText(this.pressed);
                }
                this.drawTools();
            });
        };
        // While the box has focus, every key of its window is taken, before the page's own keys.
        let stopKeys: (() => void) | null = null;
        this.capture.motif.on('focusin', () => {
            stopKeys?.();
            stopKeys = onWindow(this.capture, 'keydown', onKey, true);
        });
        this.capture.motif.on('focusout', () => {
            stopKeys?.();
            stopKeys = null;
        });
        this.motif.setDisposable(() => stopKeys?.());
    }
}

/** The keys of a key press, as `addShortcut` reads them: `Ctrl+Shift+S`, `Alt+ArrowUp`, `F2`. */
function pressedKeys(e: KeyboardEvent): string {
    const physical = /^Key[A-Z]$/.test(e.code) ? e.code.slice(3) : /^Digit\d$/.test(e.code) ? e.code.slice(5) : '';
    const key = physical || (e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key);
    return [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Meta', key].filter(Boolean).join('+');
}
