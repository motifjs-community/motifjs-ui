import { Component, type ComponentBase } from '@motifx/core';
import { removePart } from '../../core/draw-parts';
import { put, text } from '../../core/part-writes';

const tags = new WeakMap<ComponentBase, string>();

/** The SVG tag a part was made with by `svgComponent`. */
export function svgTagOf(part: ComponentBase): string | undefined {
    return tags.get(part);
}

/**
 * A new SVG element in `parent`, given as its component. Core makes it in the SVG namespace and puts it in its parent.
 */
export function svgComponent<K extends keyof SVGElementTagNameMap>(parent: ComponentBase, tag: K, className = ''): Component<SVGElementTagNameMap[K]> {
    const part = new Component<SVGElementTagNameMap[K]>(tag, { options: { isSvg: true } });
    tags.set(part, tag);
    if (className) part.class.add(className);
    parent.controls.add(part);
    return part;
}

/** Texts of a group, kept between draws: `add` hands out the next one, and `done` takes away what was not used. */
export class TextPool {
    group: ComponentBase;
    texts: Component<SVGTextElement>[] = [];
    used = 0;

    constructor(group: ComponentBase) {
        this.group = group;
    }

    add(value: string, x: number, y: number, anchor: 'start' | 'middle' | 'end'): Component<SVGTextElement> {
        if (this.used === this.texts.length) this.texts.push(svgComponent(this.group, 'text'));
        const label = this.texts[this.used++];
        text(label, value);
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
