import { Component, type ComponentBase } from "@motifx/core";
import { part } from "../../core/draw-parts";
import { measure, rectOf, whenMeasured, type Rect } from "../../core/measure";
import { css, mark, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";

/** Something a key hint presses: the part its letters stand on, the letters wanted, and what pressing it does. */
export interface KeyHint {
    part: ComponentBase;
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

/** The hints waiting to be drawn, and the surface their letters go in. */
interface Wanted {
    hints: KeyHint[];
    parts: ComponentBase[];
    host: Component<HTMLElement>;
}

interface Spots {
    wanted: Wanted;
    root: Rect;
    boxes: Rect[];
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
    wanted: Wanted | null = null;

    constructor(readonly owner: Component<HTMLElement>, readonly tabs: () => KeyHint[], readonly commands: () => KeyHint[], readonly ended: () => void) {
        this.layer = part<HTMLDivElement>(owner, 'div', 'mx-ribbon-menu__hints');
        this.layer.attr.add({ 'aria-hidden': 'true' });
        mark(this.layer, 'hidden', true);
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
        mark(this.layer, 'hidden', true);
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
            // Nothing else drew or ended the hints while waiting for what the press changed to be laid out.
            const waiting = this.drawn;
            const untouched = () => this.level !== null && this.drawn === waiting;
            const opens = exact.hint.opens;
            if (opens) {
                // What it opened shows its own letters once it is open and laid out.
                void whenMeasured(this.owner).then(() => {
                    if (!untouched()) return;
                    this.inner = opens();
                    this.level = 'inner';
                    this.typed = '';
                    this.draw(this.inner.hints, this.inner.host);
                });
                return true;
            }
            // Pressing a tab goes on to the hints of its commands once they are laid out; pressing a command ends them.
            if (level === 'tabs' && this.level === 'tabs') void whenMeasured(this.owner).then(() => untouched() && this.start('commands'));
            else if (this.level === level) this.stop();
            return true;
        }
        if (this.drawn.some(d => d.keys.startsWith(typed))) this.filter(typed);
        return true;
    }

    // The letters are drawn with the next measuring round, where what they stand on is read.
    draw(hints: KeyHint[], host: Component<HTMLElement> = this.layer): void {
        this.clear();
        mark(this.layer, 'hidden', host !== this.layer);
        const parts = hints.map(hint => hint.part);
        this.wanted = { hints, parts, host };
        measure(this.owner, this.readSpots, this.drawBadges);
    }

    // Over the menu, the letters are placed in its layer, which covers the menu; in a popup (the page's top layer), in the
    // popup itself.
    readonly readSpots = (): Spots | null => {
        const wanted = this.wanted;
        if (!wanted) return null;
        const root = rectOf(wanted.host === this.layer ? this.owner : wanted.host);
        return { wanted, root, boxes: wanted.parts.map(rectOf) };
    };

    readonly drawBadges = (spots: Spots | null): void => {
        if (!spots || spots.wanted !== this.wanted) return;
        const { wanted, root, boxes } = spots;
        this.wanted = null;
        const keys = lettersFor(wanted.hints);
        wanted.hints.forEach((hint, i) => {
            const box = boxes[i];
            if (!box.width && !box.height) return;
            const badge = part<HTMLSpanElement>(wanted.host, 'span', 'mx-ribbon-menu__hint');
            text(badge, keys[i]);
            // A wide command (an icon and its text) has its letters under the icon; anything else under its middle.
            const x = this.level !== 'tabs' && box.width > box.height * 2 ? box.left + box.height / 2 : box.left + box.width / 2;
            css(badge, 'left', `${x - root.left}px`);
            css(badge, 'top', `${box.bottom - root.top}px`);
            this.drawn.push({ hint, keys: keys[i], badge });
        });
    };

    closeInner(): void {
        const inner = this.inner;
        this.inner = null;
        inner?.close();
    }

    filter(typed: string): void {
        this.typed = typed;
        for (const d of this.drawn) mark(d.badge, 'hidden', !d.keys.startsWith(typed));
    }

    clear(): void {
        for (const d of this.drawn) void d.badge.dispose();
        this.drawn = [];
        this.wanted = null;
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
