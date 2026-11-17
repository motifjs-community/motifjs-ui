/**
 * The door for diagrams: a fenced code block in a language the door draws (`mermaid`) shows its code as it arrives,
 * and once the code is complete the element the door gives, or promises, takes the code's place. The block keeps its
 * language and its copy button, which copies the code. `null`, or a promise that gives `null` or fails, keeps the code.
 *
 * @example
 * const diagrams: DiagramRenderer = {
 *   draws: (language) => language === 'mermaid',
 *   async render(code) {
 *     const { svg } = await mermaid.render(`diagram-${++count}`, code);
 *     const host = document.createElement('div');
 *     host.innerHTML = svg;
 *     return host;
 *   }
 * };
 */
export interface DiagramRenderer {
  /** Whether it draws code fenced as `language`. */
  draws(language: string): boolean;
  render(code: string, language: string): Element | Promise<Element | null> | null;
}
