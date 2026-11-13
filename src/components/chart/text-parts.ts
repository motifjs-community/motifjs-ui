import type { Component, ComponentBase } from '@motifx/core';
import { removePart } from '../../core/draw-parts';
import { put, text } from '../../core/part-writes';
import { svgComponent } from '../../parts/chart/svg-parts';

/** What each text of a pool says: an image of the plot writes it from here. */
const said = new WeakMap<ComponentBase, string>();

/** Texts of a group, kept between draws: `add` hands out the next one, and `done` takes away what was not used. */
export class TextParts {
    part: Component<SVGGElement>;
    texts: Component<SVGTextElement>[] = [];
    used = 0;

    constructor(part: Component<SVGGElement>) {
        this.part = part;
    }

    add(value: string, x: number, y: number, anchor: 'start' | 'middle' | 'end'): Component<SVGTextElement> {
        if (this.used === this.texts.length) this.texts.push(svgComponent(this.part, 'text'));
        const label = this.texts[this.used++];
        text(label, value);
        said.set(label, value);
        put(label, 'x', String(Math.round(x * 10) / 10));
        put(label, 'y', String(Math.round(y * 10) / 10));
        put(label, 'text-anchor', anchor);
        put(label, 'transform', null);
        return label;
    }

    done(): void {
        for (const extra of this.texts.splice(this.used)) removePart(extra);
        this.used = 0;
    }
}

/** The text a part of a `TextParts` says; `null` for any other part. */
export function textOf(part: ComponentBase): string | null {
    return said.get(part) ?? null;
}
