import type { ExampleFile } from './example-file';

/**
 * The files of a page's examples, read as text. Give it the page's
 * `import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true })`; it returns a
 * function that picks files by name: `code('Mask.tsx', 'orders.ts')`.
 */
export function sources(glob: Record<string, unknown>): (...names: string[]) => ExampleFile[] {
  return (...names) =>
    names.map((name) => {
      const source = glob[`./examples/${name}`];
      if (typeof source !== 'string') throw new Error(`docs: no example file "${name}"`);
      return { name, source };
    });
}
