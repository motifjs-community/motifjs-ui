import { Component } from "@motifx/core";
import { parseAccessKey } from "../../core/access-key";
import { glyphPart, iconPart, part, put, shown } from "../../core/draw-parts";
import { focusInitial } from "../../core/focus";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { chevronDown } from "../../core/glyphs";
import type { IconSource } from "../../core/icon-source";
import { isNode } from "../../core/node-kind";
import { Popup } from "../../parts/popup/Popup";
import { Button } from "../button/Button";
import type { RibbonCommand } from "./ribbon-command";
import type { RibbonGalleryItem } from "./ribbon-gallery-item";

type Key = string | number;

interface ItemLook {
    item: RibbonGalleryItem;
    key: Key;
    text: string;
    glyph: string;
    icon: IconSource | null;
    hint: string;
    enabled: boolean;
}

/**
 * A `gallery` command: the first of its choices in a row, and a button that opens all of them in a grid. The chosen one
 * is marked. Small, it is the button alone, with the command's text.
 */
export class RibbonGallery extends Component<HTMLDivElement> {
    row: Component<HTMLDivElement>;
    opener: Button;
    popup: Popup;
    grid: Component<HTMLDivElement>;
    looks: ItemLook[] = [];
    chosen: Key | null = null;
    small = false;

    constructor(readonly command: RibbonCommand, readonly picked: (item: RibbonGalleryItem, e: Event) => void) {
        super('div');
        this.element.className = 'mx-ribbon-menu__gallery';
        this.element.setAttribute('role', 'group');
        this.row = part<HTMLDivElement>(this, 'div', 'mx-ribbon-menu__gallery-row');
        this.opener = new Button({ icon: chevronDown() });
        this.opener.element.classList.add('mx-ribbon-menu__gallery-open');
        this.opener.element.setAttribute('aria-haspopup', 'dialog');
        this.opener.element.setAttribute('aria-expanded', 'false');
        this.opener.element.addEventListener('click', () => this.toggle());
        this.controls.add(this.opener);
        this.popup = new Popup();
        this.popup.matchWidth = false;
        this.popup.element.classList.add('mx-ribbon-menu__gallery-popup');
        this.popup.element.setAttribute('role', 'dialog');
        this.popup.onClosed(() => this.opener.element.setAttribute('aria-expanded', 'false'));
        this.grid = part<HTMLDivElement>(this.popup, 'div', 'mx-ribbon-menu__gallery-grid');
        this.controls.add(this.popup);
        const stop = follow(
            this,
            'items',
            () => ({
                looks: givenList(givenField<readonly RibbonGalleryItem[] | undefined>(command, 'items')).map((item, i) => lookOf(item, i)),
                chosen: givenField<Key | null | undefined>(command, 'value') ?? null,
                columns: Math.max(1, Number(givenField(command, 'columns') ?? 4)),
                text: parseAccessKey(String(givenField(command, 'text') ?? '')).text
            }),
            now => this.draw(now.looks, now.chosen, now.columns, now.text)
        );
        this.motif.setDisposable(stop);
    }

    /** Small: the button alone, with the command's text. */
    setSmall(on: boolean): void {
        this.small = on;
        const text = parseAccessKey(String(givenField(this.command, 'text') ?? '')).text;
        this.opener.text = on ? text : '';
        this.opener.iconPosition = on ? 'end' : 'start';
        this.opener.hint = text;
        shown(this.row.element, !on);
    }

    draw(looks: ItemLook[], chosen: Key | null, columns: number, text: string): void {
        this.looks = looks;
        this.chosen = chosen;
        put(this.element, 'aria-label', text);
        put(this.popup.element, 'aria-label', text);
        this.grid.element.style.setProperty('--_columns', String(columns));
        for (const host of [this.row, this.grid]) for (const old of [...host.controls.items]) void old.dispose();
        looks.slice(0, columns).forEach(look => this.makeTile(this.row, look));
        looks.forEach(look => this.makeTile(this.grid, look));
        this.setSmall(this.small);
    }

    makeTile(host: Component<HTMLDivElement>, look: ItemLook): void {
        const tile = part<HTMLButtonElement>(host, 'button', 'mx-ribbon-menu__tile');
        const el = tile.element;
        el.type = 'button';
        el.setAttribute('aria-pressed', String(look.key === this.chosen));
        put(el, 'title', look.hint || look.text);
        put(el, 'aria-label', look.text);
        el.disabled = !look.enabled;
        // Each tile has its own icon: the row and the grid show the same choice twice.
        const icon = look.icon ? iconOf(look.item) : null;
        if (icon) iconPart(tile, icon);
        else if (look.glyph) glyphPart(tile, look.glyph, 'mx-ribbon-menu__tile-glyph');
        const caption = part<HTMLSpanElement>(tile, 'span', 'mx-ribbon-menu__tile-text');
        caption.element.textContent = look.text;
        el.addEventListener('click', e => {
            this.popup.close('code');
            this.picked(look.item, e);
        });
    }

    toggle(): void {
        if (this.popup.isOpen) {
            this.popup.close('code');
            return;
        }
        this.popup.open(this.opener.element);
        this.opener.element.setAttribute('aria-expanded', 'true');
        const chosen = this.grid.element.querySelector<HTMLElement>('[aria-pressed="true"]');
        if (chosen) chosen.focus();
        else if (!focusInitial(this.popup.element)) this.popup.element.focus();
    }
}

function lookOf(item: RibbonGalleryItem, index: number): ItemLook {
    return {
        item,
        key: givenValue<Key | undefined>(item, 'key') ?? index,
        text: String(givenField(item, 'text') ?? ''),
        glyph: String(givenField(item, 'glyph') ?? ''),
        icon: givenField<IconSource | null | undefined>(item, 'icon') ?? null,
        hint: String(givenField(item, 'hint') ?? ''),
        enabled: givenField(item, 'enabled') !== false
    };
}

// A new icon of the item: its function called again, or its element copied.
function iconOf(item: RibbonGalleryItem): IconSource | null {
    const given = givenValue<unknown>(item, 'icon');
    const icon = (typeof given === 'function' ? (given as () => unknown)() : given) as IconSource | null | undefined;
    if (!icon || typeof icon === 'string') return icon ?? null;
    if (isNode(icon)) return icon.cloneNode(true);
    return icon;
}
