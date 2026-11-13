import { Component, untracked } from "@motifx/core";
import { fillTemplate } from "../../core/fill-template";
import { mediaOf } from "../../core/measure";
import { uiLocale } from "../../core/ui-locale";
import { Button } from "../../components/button/Button";
import { MxForm } from "../../components/form/MxForm";
import type { FormHost } from "../../components/form/form-host";
import { ListBox } from "../../components/listbox/ListBox";
import { Tab } from "../../components/tabs/Tab";
import { Tabs } from "../../components/tabs/Tabs";
import { Toolbar } from "../../components/toolbar/Toolbar";
import type { ToolbarItem } from "../../components/toolbar/toolbar-item";
import { TreeView } from "../../components/treeview/TreeView";
import type { CustomizerCommand } from "./customizer-command";
import type { CustomizerNames } from "./customizer-names";
import type { CustomizerNode } from "./customizer-node";
import type { CustomizerSource } from "./customizer-source";
import { NameForm } from "./NameForm";
import { ShortcutEditor } from "../../components/shortcuteditor/ShortcutEditor";

/**
 * A window in pages. The first shows the items of a menu bar (later a ribbon or a toolbar) in a tree, each with a check
 * box that shows or hides it, and a toolbar that adds groups, renames, deletes, moves and resets items; the second lists the
 * commands the app offers, to add one to a group. It changes nothing itself: each change goes to its `source`, and the
 * items are read again.
 */
export class Customizer extends MxForm {
    source: CustomizerSource;
    names: CustomizerNames;
    pages: Tabs;
    commandsPage: Tab;
    /** The editor of the keyboard page, when the window shows one. */
    keyboard: ShortcutEditor | null = null;
    tree: TreeView<CustomizerNode>;
    commandList: ListBox<CustomizerCommand, string>;
    nodes: CustomizerNode[] = [];
    selected: string | null = null;
    groupBar: Toolbar;
    commandBar: Toolbar;
    // The toolbars' items: the window's own objects, changed in place and read again with refresh().
    newGroup: ToolbarItem;
    rename: ToolbarItem;
    remove: ToolbarItem;
    up: ToolbarItem;
    down: ToolbarItem;
    moveTo: ToolbarItem;
    reset: ToolbarItem;
    addTo: ToolbarItem;

    constructor(source: CustomizerSource, names: CustomizerNames, keyboard = false) {
        const s = uiLocale.strings;
        super({ title: s.customizerTitle, width: '36rem', height: '32rem', resizable: true });
        this.source = source;
        this.names = names;
        const button = (text: string, click: () => void): ToolbarItem => ({ text, click: () => untracked(click) });
        const menu = (text: string): ToolbarItem => ({ type: 'menu', text, menu: [] });
        const toolbar = (label: string, items: ToolbarItem[]) => {
            const bar = new Toolbar({ label, size: 'sm', items });
            bar.class.add('mx-customizer__tools');
            return bar;
        };
        // A page's toolbar is the panel's first child, so that it stands against the strip.
        const page = (key: string, title: string, ...parts: Component[]) => {
            const tab = new Tab({ key, title });
            tab.controls.add(...parts);
            return tab;
        };

        this.newGroup = button(fillTemplate(s.customizerNewGroup, { name: names.group }), () => void this.addGroup());
        this.rename = button(s.customizerRename, () => void this.renameSelected());
        this.remove = button(s.customizerDelete, () => this.removeSelected());
        this.up = button(s.customizerMoveUp, () => this.moveSelected(-1));
        this.down = button(s.customizerMoveDown, () => this.moveSelected(1));
        this.moveTo = menu(s.customizerMoveTo);
        this.reset = button(s.customizerReset, () => this.change(() => this.source.reset(this.selected!)));
        this.tree = new TreeView<CustomizerNode>({
            keyField: 'id',
            textField: 'text',
            childrenField: 'children',
            showCheckBoxes: true,
            checkRecursive: false,
            selectionMode: 'single',
            label: names.groups,
        });
        this.tree.class.add('mx-customizer__tree');
        this.tree.onCheckChanged(e => {
            if (!e.byUser || !e.item) return;
            // Refused (a fixed item): the box goes back as well.
            this.source.show(e.item.id, e.state === 'checked');
            this.refresh();
        });
        this.tree.onSelectionChanged(e => {
            this.selected = (e.value as string | null) ?? null;
            this.drawTools();
        });
        this.tree.motif.on('keydown', (_, e) => this.treeKeyDown(e));
        const line: ToolbarItem = { type: 'separator' };
        this.groupBar = toolbar(names.groups, [this.newGroup, this.rename, this.remove, line, this.up, this.down, this.moveTo, { ...line }, this.reset]);
        const groupsPage = page('groups', names.groups, this.groupBar, this.tree);

        this.commandList = new ListBox<CustomizerCommand, string>({
            textField: 'text',
            valueField: 'key',
            searchEnabled: true,
            label: s.customizerCommands,
            labelMode: 'hidden',
            stretch: true,
            height: '100%',
        });
        this.commandList.class.add('mx-customizer__commands');
        this.commandList.onValueChanged(() => this.drawTools());
        this.addTo = menu(s.customizerAddTo);
        this.commandBar = toolbar(s.customizerCommands, [this.addTo]);
        const commandsPage = page('commands', s.customizerCommands, this.commandBar, this.commandList);

        this.pages = new Tabs({ lazy: false, label: s.customizerTitle });
        this.pages.class.add('mx-customizer__pages');
        this.pages.add(groupsPage);
        this.commandsPage = this.pages.add(commandsPage);
        if (keyboard) {
            this.keyboard = new ShortcutEditor();
            const keyboardPage = new Tab({ key: 'keyboard', title: s.customizerKeyboard });
            keyboardPage.controls.add(this.keyboard);
            this.pages.add(keyboardPage);
        }

        const resetAll = new Button({ text: s.customizerResetAll, variant: 'outline' });
        resetAll.motif.on('click', () => this.change(() => this.source.reset(null)));
        const close = new Button({ text: s.close, tone: 'accent' });
        close.motif.on('click', () => this.close('ok'));
        const footer = new Component<HTMLDivElement>('div');
        footer.class.add('mx-customizer__footer');
        footer.controls.add(resetAll, close);

        this.content = this.pages;
        this.footer = footer;
        this.cancelButton = close;
    }

    /** Opens over `host`; on a touch screen it takes the whole window. */
    open(host: FormHost): void {
        if (mediaOf(this, '(pointer: coarse)')) this.windowState = 'maximized';
        this.refresh();
        void this.showDialog(host);
    }

    /** Reads the items and the commands again, keeping the open rows and the selected ones. */
    refresh(): void {
        const expanded = this.tree.expandedKeys;
        this.nodes = this.source.nodes();
        const checked: string[] = [];
        const walk = (list: CustomizerNode[]) => {
            for (const node of list) {
                if (node.shown) checked.push(node.id);
                walk(node.children);
            }
        };
        walk(this.nodes);
        if (this.selected && !this.find(this.selected)) this.selected = null;
        this.tree.items = this.nodes;
        this.tree.checkedKeys = checked;
        this.tree.expandedKeys = expanded;
        this.tree.value = this.selected;
        const commands = this.source.commands();
        this.commandList.items = commands;
        this.commandsPage.visible = commands.length > 0;
        this.keyboard?.refresh();
        this.drawTools();
    }

    find(id: string): CustomizerNode | null {
        const look = (list: CustomizerNode[]): CustomizerNode | null => {
            for (const node of list) {
                if (node.id === id) return node;
                const found = look(node.children);
                if (found) return found;
            }
            return null;
        };
        return look(this.nodes);
    }

    /** The places to add to: the top and every group. */
    groups(): CustomizerNode[] {
        const out: CustomizerNode[] = [{ id: '', parent: '', text: this.names.top, shown: true, fixed: false, holds: true, added: false, children: [] }];
        const walk = (list: CustomizerNode[]) => {
            for (const node of list) {
                if (!node.holds) continue;
                out.push(node);
                walk(node.children);
            }
        };
        walk(this.nodes);
        return out;
    }

    drawTools(): void {
        const node = this.selected ? this.find(this.selected) : null;
        this.rename.enabled = !!node && !node.fixed;
        this.remove.enabled = !!node && node.added;
        this.up.enabled = !!node && this.source.canMove(node.id, -1);
        this.down.enabled = !!node && this.source.canMove(node.id, 1);
        const targets = node && !node.fixed ? this.source.targets(node.id) : [];
        this.moveTo.enabled = targets.length > 0;
        this.moveTo.menu = targets.map(t => ({ text: t.text, click: () => this.moveInto(node!.id, t.id) }));
        this.reset.enabled = !!node;
        const command = this.commandList.value as string | null;
        this.addTo.enabled = command !== null && command !== undefined;
        this.addTo.menu = this.groups().map(g => ({ text: g.text, click: () => this.insertCommand(command as string, g.id) }));
        this.groupBar.refresh();
        this.commandBar.refresh();
    }

    /** Runs a change of the source and reads the items again. */
    change(run: () => boolean): void {
        if (run()) this.refresh();
        else this.drawTools();
    }

    /** Shows `id` selected in the groups page, its group open. */
    reveal(id: string, parent: string): void {
        this.selected = id;
        if (parent && !this.tree.expandedKeys.includes(parent)) this.tree.expandedKeys = [...this.tree.expandedKeys, parent];
        this.refresh();
    }

    /** Adds a command at the end of a group, and shows it there. */
    insertCommand(command: string, parent: string): void {
        const id = this.source.add(parent, null, { command });
        if (!id) return;
        this.pages.value = 'groups';
        this.reveal(id, parent);
    }

    /** Adds a group of the user's own beside the selected item. */
    async addGroup(): Promise<void> {
        const title = fillTemplate(uiLocale.strings.customizerNewGroup, { name: this.names.group });
        const name = await new NameForm(title, title).ask(this);
        if (!name) return;
        const node = this.selected ? this.find(this.selected) : null;
        const parent = node?.parent ?? '';
        const id = this.source.add(parent, node?.id ?? null, { text: name });
        if (id) this.reveal(id, parent);
    }

    async renameSelected(): Promise<void> {
        const node = this.selected ? this.find(this.selected) : null;
        if (!node || node.fixed) return;
        const name = await new NameForm(uiLocale.strings.customizerRename, node.text).ask(this);
        if (name) this.change(() => this.source.rename(node.id, name));
    }

    removeSelected(): void {
        const node = this.selected ? this.find(this.selected) : null;
        if (!node?.added) return;
        this.selected = node.parent || null;
        this.change(() => this.source.remove(node.id));
    }

    moveSelected(step: 1 | -1): void {
        if (this.selected) this.change(() => this.source.move(this.selected!, step));
    }

    /** Moves an item into another group, opened so that the item stays in sight. */
    moveInto(id: string, target: string): void {
        if (this.source.moveInto(id, target)) this.reveal(id, target);
    }

    // Alt with an arrow moves the selected item, F2 renames it, Delete deletes an item the user added.
    treeKeyDown(e: KeyboardEvent): void {
        if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) this.moveSelected(e.key === 'ArrowUp' ? -1 : 1);
        else if (e.key === 'F2' && !e.altKey) void this.renameSelected();
        else if (e.key === 'Delete' && !e.altKey) this.removeSelected();
        else return;
        e.preventDefault();
        e.stopPropagation();
    }
}
