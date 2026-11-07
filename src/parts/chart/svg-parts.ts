const SVG = 'http://www.w3.org/2000/svg';

/** A new SVG element in `parent`. */
export function svgPart<K extends keyof SVGElementTagNameMap>(parent: Element, tag: K, className = ''): SVGElementTagNameMap[K] {
    const el = parent.ownerDocument.createElementNS(SVG, tag);
    if (className) el.setAttribute('class', className);
    parent.appendChild(el);
    return el;
}

/** An attribute written only when it changed, or taken away. */
export function svgPut(el: Element, name: string, value: string | number | null): void {
    if (value === null) {
        if (el.hasAttribute(name)) el.removeAttribute(name);
        return;
    }
    const text = String(value);
    if (el.getAttribute(name) !== text) el.setAttribute(name, text);
}

/** Texts of a group, kept between draws: `add` hands out the next one, and `done` takes away what was not used. */
export class TextPool {
    group: SVGGElement;
    used = 0;

    constructor(group: SVGGElement) {
        this.group = group;
    }

    add(text: string, x: number, y: number, anchor: 'start' | 'middle' | 'end'): SVGTextElement {
        const el = (this.group.children[this.used] as SVGTextElement | undefined) ?? svgPart(this.group, 'text');
        this.used++;
        if (el.textContent !== text) el.textContent = text;
        svgPut(el, 'x', Math.round(x * 10) / 10);
        svgPut(el, 'y', Math.round(y * 10) / 10);
        svgPut(el, 'text-anchor', anchor);
        svgPut(el, 'transform', null);
        return el;
    }

    done(): void {
        while (this.group.children.length > this.used) this.group.lastElementChild!.remove();
        this.used = 0;
    }
}
