import { Component, createSignal, untracked, type Signal } from "@motifx/core";
import { parseAccessKey } from "../../core/access-key";
import { glyphPart, iconPart, loose, part } from "../../core/draw-parts";
import { focusFirstIn, focusOn } from "../../core/focus";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { chevronDown } from "../../core/glyphs";
import { iconCopy, type IconSource } from "../../core/icon-source";
import { css, mark, put, shown, text } from "../../core/part-writes";
import { Popup } from "../../parts/popup/Popup";
import { Button } from "../button/Button";
import type { RibbonCommand } from "./ribbon-command";
import type { RibbonGalleryItem } from "./ribbon-gallery-item";

type Key = string | number;

/**
 * A `gallery` command: the first of its choices in a row, and a button that opens all of them in a grid. The chosen one
 * is marked. Small, it is the button alone, with the command's text.
 */
export class RibbonGallery extends Component<HTMLDivElement> {
    row: Component<HTMLDivElement>;
    opener: Button;
    popup: Popup;
    grid: Component<HTMLDivElement>;
    /** The chosen item's tile in the grid: focus goes there when the grid opens. */
    chosenTile: Component<HTMLButtonElement> | null = null;
    small = false;
    // The command shown: given anew under its key, the gallery keeps its parts and what shows the command follows.
    readonly commandBox: Signal<RibbonCommand>;

    get command(): RibbonCommand {
        return this.commandBox.value;
    }

    set command(command: RibbonCommand) {
        this.commandBox.value = command;
    }

    constructor(command: RibbonCommand, readonly picked: (item: RibbonGalleryItem, e: Event) => void) {
        super('div');
        this.commandBox = createSignal(command);
        this.class.add('mx-ribbon-menu__gallery');
        this.attr.add({ role: 'group' });
        this.row = part<HTMLDivElement>(this, 'div', 'mx-ribbon-menu__gallery-row');
        this.opener = new Button({ icon: chevronDown() });
        this.opener.class.add('mx-ribbon-menu__gallery-open');
        this.opener.attr.add({ 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
        this.opener.motif.on('click', () => this.toggle());
        this.controls.add(this.opener);
        this.popup = new Popup();
        this.popup.matchWidth = false;
        this.popup.class.add('mx-ribbon-menu__gallery-popup');
        this.popup.attr.add({ role: 'dialog' });
        this.popup.onClosed(() => put(this.opener, 'aria-expanded', 'false'));
        this.grid = part<HTMLDivElement>(this.popup, 'div', 'mx-ribbon-menu__gallery-grid');
        this.controls.add(this.popup);
        // Built once: the text, the columns and the choice each change only what shows them; the lists keep their tiles.
        this.bindings.watch(() => {
            const label = this.label();
            untracked(() => {
                put(this, 'aria-label', label);
                put(this.popup, 'aria-label', label);
                this.opener.hint = label;
                if (this.small) this.opener.text = label;
            });
        });
        this.bindings.watch(() => {
            const columns = String(this.columns());
            untracked(() => css(this.grid, '--_columns', columns));
        });
        this.row.bindings.list(() => this.items().slice(0, this.columns()), item => this.makeTile(item, false));
        this.grid.bindings.list(() => this.items(), item => this.makeTile(item, true));
    }

    items(): RibbonGalleryItem[] {
        return givenList(givenField<readonly RibbonGalleryItem[] | undefined>(this.command, 'items'));
    }

    columns(): number {
        return Math.max(1, Number(givenField(this.command, 'columns') ?? 4));
    }

    /** The item's key (its place when it has none) is the command's value. */
    isChosen(item: RibbonGalleryItem): boolean {
        const key = givenValue<Key | undefined>(item, 'key') ?? this.items().indexOf(item);
        return key === (givenField<Key | null | undefined>(this.command, 'value') ?? null);
    }

    label(): string {
        return parseAccessKey(String(givenField(this.command, 'text') ?? '')).text;
    }

    /** Small: the button alone, with the command's text. */
    setSmall(on: boolean): void {
        this.small = on;
        const text = this.label();
        this.opener.text = on ? text : '';
        this.opener.iconPosition = on ? 'end' : 'start';
        this.opener.hint = text;
        shown(this.row, !on);
    }

    makeTile(item: RibbonGalleryItem, inGrid: boolean): Component<HTMLButtonElement> {
        const tile = loose<HTMLButtonElement>('button', 'mx-ribbon-menu__tile');
        tile.attr.add({ type: 'button' });
        // Each tile takes its icon once: the row and the grid show the same choice twice.
        const icon = iconOf(item, inGrid);
        const glyph = icon ? null : glyphPart(tile, '', 'mx-ribbon-menu__tile-glyph');
        if (icon) iconPart(tile, icon);
        const caption = part<HTMLSpanElement>(tile, 'span', 'mx-ribbon-menu__tile-text');
        tile.bindings.watch(() => {
            const label = String(givenField(item, 'text') ?? '');
            const hint = String(givenField(item, 'hint') ?? '');
            untracked(() => {
                put(tile, 'title', hint || label);
                put(tile, 'aria-label', label);
                text(caption, label);
            });
        });
        tile.bindings.watch(() => {
            const enabled = givenField(item, 'enabled') !== false;
            untracked(() => mark(tile, 'disabled', !enabled));
        });
        if (glyph) {
            tile.bindings.watch(() => {
                const name = String(givenField(item, 'glyph') ?? '');
                untracked(() => {
                    put(glyph, 'data-icon', name || null);
                    shown(glyph, !!name);
                });
            });
        }
        tile.bindings.watch(() => {
            const pressed = this.isChosen(item);
            untracked(() => {
                put(tile, 'aria-pressed', String(pressed));
                if (!inGrid) return;
                if (pressed) this.chosenTile = tile;
                else if (this.chosenTile === tile) this.chosenTile = null;
            });
        });
        if (inGrid) tile.motif.setDisposable(() => {
            if (this.chosenTile === tile) this.chosenTile = null;
        });
        tile.motif.on('click', (_, e) => {
            this.popup.close('code');
            this.picked(item, e);
        });
        return tile;
    }

    toggle(): void {
        if (this.popup.isOpen) {
            this.popup.close('code');
            return;
        }
        this.popup.open(this.opener);
        put(this.opener, 'aria-expanded', 'true');
        if (this.chosenTile) focusOn(this.chosenTile);
        else if (!focusFirstIn(this.popup)) focusOn(this.popup);
    }
}

// A new icon of the item: an address as it is, its function called again. A component given as is goes to the grid.
function iconOf(item: RibbonGalleryItem, inGrid: boolean): IconSource | null {
    const given = givenValue<unknown>(item, 'icon');
    if (typeof given === 'object') return inGrid ? (given as IconSource | null) : null;
    return untracked(() => iconCopy(given));
}
