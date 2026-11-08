import { Component } from "@motifx/core";
import { part } from "../../core/draw-parts";
import { uiLocale } from "../../core/ui-locale";

/** Something a key hint presses: the element its letters stand on, the letters wanted, and what pressing it does. */
export interface KeyHint {
    element: HTMLElement;
    // The letters given for it; empty: they come from its text.
    keys: string;
    text: string;
    press: () => void;
    // What it opens has hints of its own (a folded group's popup): drawn in `host`, closed by `close`.
    opens?: () => InnerHints;
}

/** The hints of what a hint opened, drawn in its own surface. */
export interface InnerHints {
    hints: KeyHint[];
    host: Component<HTMLElement>;
    close: () => void;
}

interface Drawn {
    hint: KeyHint;
    keys: string;
    badge: Component<HTMLSpanElement>;
}

/**
 * The letters shown on the tabs and then on the commands of a menu while key hints are on: typing one presses what it
 * stands on. Letters given are kept; the others come from the text, one letter where it is the only one starting so,
 * a letter and a digit where several do. Escape goes back a level; any other key, a click or leaving the page ends it.
 */
export class RibbonKeyHints {
    layer: Component<HTMLDivElement>;
    drawn: Drawn[] = [];
    typed = '';
    level: 'tabs' | 'commands' | 'inner' | null = null;
    inner: InnerHints | null = null;

    constructor(owner: Component<HTMLElement>, readonly tabs: () => KeyHint[], readonly commands: () => KeyHint[], readonly ended: () => void) {
        this.layer = part<HTMLDivElement>(owner, 'div', 'mx-ribbon-menu__hints');
        this.layer.element.setAttribute('aria-hidden', 'true');
        this.layer.element.hidden = true;
    }

    get active(): boolean {
        return this.level !== null;
    }

    start(level: 'tabs' | 'commands'): void {
        this.level = level;
        this.typed = '';
        this.draw(level === 'tabs' ? this.tabs() : this.commands());
    }

    stop(): void {
        if (!this.level) return;
        this.level = null;
        this.clear();
        this.closeInner();
        this.layer.element.hidden = true;
        this.ended();
    }

    // A key while the hints are shown: `true` when it was theirs.
    key(e: KeyboardEvent): boolean {
        if (!this.level) return false;
        if (e.key === 'Escape') {
            if (this.typed) this.filter('');
            else if (this.level === 'inner') {
                this.closeInner();
                this.start('commands');
            } else if (this.level === 'commands') this.start('tabs');
            else this.stop();
            return true;
        }
        if (e.key === 'Backspace') {
            this.filter(this.typed.slice(0, -1));
            return true;
        }
        if (['Alt', 'Shift', 'Control', 'Meta'].includes(e.key)) return false;
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey) {
            this.stop();
            return false;
        }
        const typed = this.typed + e.key.toLocaleUpperCase(uiLocale.locale);
        const exact = this.drawn.find(d => d.keys === typed);
        if (exact) {
            const level = this.level;
            this.clear();
            exact.hint.press();
            const opens = exact.hint.opens;
            if (opens) {
                // What it opened shows its own letters once it is open.
                queueMicrotask(() => {
                    if (!this.level) return;
                    this.inner = opens();
                    this.level = 'inner';
                    this.typed = '';
                    this.draw(this.inner.hints, this.inner.host);
                });
                return true;
            }
            // Pressing a tab goes on to the hints of its commands; pressing a command ends them.
            if (level === 'tabs' && this.level === 'tabs') queueMicrotask(() => this.level && this.start('commands'));
            else if (this.level === level) this.stop();
            return true;
        }
        if (this.drawn.some(d => d.keys.startsWith(typed))) this.filter(typed);
        return true;
    }

    draw(hints: KeyHint[], host: Component<HTMLElement> = this.layer): void {
        this.clear();
        const layer = this.layer.element;
        layer.hidden = host !== this.layer;
        // Over the menu, the letters are placed in its layer; in a popup (the page's top layer), in the popup itself.
        const root = host === this.layer ? (layer.offsetParent?.getBoundingClientRect() ?? layer.getBoundingClientRect()) : host.element.getBoundingClientRect();
        const keys = lettersFor(hints);
        hints.forEach((hint, i) => {
            const box = hint.element.getBoundingClientRect();
            if (!box.width && !box.height) return;
            const badge = part<HTMLSpanElement>(host, 'span', 'mx-ribbon-menu__hint');
            badge.element.textContent = keys[i];
            // A wide command (an icon and its text) has its letters under the icon; anything else under its middle.
            const x = this.level !== 'tabs' && box.width > box.height * 2 ? box.left + box.height / 2 : box.left + box.width / 2;
            badge.element.style.left = `${x - root.left}px`;
            badge.element.style.top = `${box.bottom - root.top}px`;
            this.drawn.push({ hint, keys: keys[i], badge });
        });
    }

    closeInner(): void {
        const inner = this.inner;
        this.inner = null;
        inner?.close();
    }

    filter(typed: string): void {
        this.typed = typed;
        for (const d of this.drawn) d.badge.element.hidden = !d.keys.startsWith(typed);
    }

    clear(): void {
        for (const d of this.drawn) void d.badge.dispose();
        this.drawn = [];
        this.typed = '';
    }
}

// The letters of each hint: the ones given, else one letter where no other hint starts with it, else a letter and a digit.
function lettersFor(hints: KeyHint[]): string[] {
    const upper = (s: string) => s.toLocaleUpperCase(uiLocale.locale);
    const given = hints.map(h => upper(h.keys.trim()));
    const taken = new Set(given.filter(Boolean));
    const first = hints.map((h, i) => (given[i] ? '' : upper((h.text.trim().match(/\p{L}|\p{N}/u) ?? ['?'])[0])));
    const count = new Map<string, number>();
    for (const f of first) if (f) count.set(f, (count.get(f) ?? 0) + 1);
    const next = new Map<string, number>();
    return hints.map((_, i) => {
        if (given[i]) return given[i];
        const f = first[i];
        if (count.get(f) === 1 && ![...taken].some(t => t !== f && t.startsWith(f))) return f;
        let n = (next.get(f) ?? 0) + 1;
        while (taken.has(`${f}${n}`)) n++;
        next.set(f, n);
        return `${f}${n}`;
    });
}
