/** A picture for the examples: a coloured scene as a data address, so nothing is fetched; the caption names it. */
export function scene(hue: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 58%)"/><stop offset="1" stop-color="hsl(${hue + 40} 60% 32%)"/></linearGradient></defs>
<rect width="800" height="450" fill="url(#g)"/>
<circle cx="640" cy="120" r="64" fill="hsl(${hue + 180} 70% 88% / 0.55)"/>
<path d="M0 330 Q200 250 400 330 T800 330 V450 H0 Z" fill="hsl(${hue + 20} 50% 25% / 0.5)"/>
</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
