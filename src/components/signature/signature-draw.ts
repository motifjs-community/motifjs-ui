import type { SignatureStroke } from "./signature-stroke";

/** How a set of strokes is drawn, in the pixels of the target. */
export interface InkLook {
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    color: string;
}

const widthAt = (look: InkLook, pressure: number) => look.minWidth + (look.maxWidth - look.minWidth) * pressure;

/** A closed outline around one stroke, so that the line can change width along the way. */
function outline(stroke: SignatureStroke, look: InkLook): string {
    const points = stroke.points.map(p => ({ x: p.x * look.width, y: p.y * look.height, half: widthAt(look, p.pressure) / 2 }));
    const near = (n: number) => Math.round(n * 100) / 100;
    if (points.length === 0) return '';
    if (points.length === 1) {
        const { x, y, half } = points[0];
        return `M${near(x - half)} ${near(y)}a${near(half)} ${near(half)} 0 1 0 ${near(half * 2)} 0a${near(half)} ${near(half)} 0 1 0 ${near(-half * 2)} 0Z`;
    }
    const left: string[] = [];
    const right: string[] = [];
    points.forEach((p, i) => {
        const from = points[Math.max(0, i - 1)];
        const to = points[Math.min(points.length - 1, i + 1)];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx, dy) || 1;
        const nx = (-dy / length) * p.half;
        const ny = (dx / length) * p.half;
        left.push(`${near(p.x + nx)} ${near(p.y + ny)}`);
        right.push(`${near(p.x - nx)} ${near(p.y - ny)}`);
    });
    const last = points[points.length - 1];
    const first = points[0];
    const cap = (p: { half: number }) => `A${near(p.half)} ${near(p.half)} 0 0 0 `;
    return `M${left[0]}L${left.slice(1).join('L')}${cap(last)}${right[right.length - 1]}L${right.slice(0, -1).reverse().join('L')}${cap(first)}${left[0]}Z`;
}

/** The strokes as the data of one SVG path. */
export function inkPath(strokes: readonly SignatureStroke[], look: InkLook): string {
    return strokes.map(stroke => outline(stroke, look)).join('');
}

/** Draws the strokes on a canvas whose scale is already set. */
export function drawInk(context: CanvasRenderingContext2D, strokes: readonly SignatureStroke[], look: InkLook): void {
    context.fillStyle = look.color;
    context.fill(new Path2D(inkPath(strokes, look)), 'nonzero');
}

/** The strokes as an SVG document. */
export function inkSvg(strokes: readonly SignatureStroke[], look: InkLook, background: string | null): string {
    const fill = background ? `<rect width="${look.width}" height="${look.height}" fill="${background}"/>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${look.width}" height="${look.height}" viewBox="0 0 ${look.width} ${look.height}">${fill}<path fill="${look.color}" d="${inkPath(strokes, look)}"/></svg>`;
}
