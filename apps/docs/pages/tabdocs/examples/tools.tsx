import type { ComponentBase } from '@motifx/core';
import { Button, TabDocument } from '@motifx-community/ui';
import { FILES } from './files';

const PROBLEMS = [
  { file: 'src/app.ts', line: 3, text: "'App' is declared but never read." },
  { file: 'src/router.ts', line: 1, text: 'The routes list is empty.' },
  { file: 'README.md', line: 3, text: 'A line longer than 80 characters.' },
];

/** A plain list inside a tool. */
const LIST = 'margin: 0; padding: var(--mx-space-2); list-style: none';
const ITEM = 'padding: var(--mx-space-1) var(--mx-space-2); white-space: nowrap';

const LOG = ['> shop@0.0.0 dev', '> vite', '', '  VITE ready in 312 ms', '  ➜  Local:   http://localhost:5173/', '  page reload src/app.ts', '  hmr update /src/router.ts'];

/** The project's files; choosing one opens it among the documents. */
export function explorer(open: (path: string) => void): ComponentBase {
  return (
    <ul style={LIST} aria-label="Project files">
      {FILES.map((file) => (
        <li key={file.path}>
          <Button text={file.path} variant="ghost" size="sm" onclick={() => open(file.path)} />
        </li>
      ))}
    </ul>
  );
}

/** The outline of a file: what it declares. */
export function outline(): ComponentBase {
  return (
    <ul style={LIST} aria-label="Outline">
      {['App', 'router', 'Order', 'routes'].map((name) => (
        <li key={name} style={ITEM}>
          {name}
        </li>
      ))}
    </ul>
  );
}

/** A list of problems found in the files. */
export function problems(): ComponentBase {
  return (
    <ul style={LIST} aria-label="Problems">
      {PROBLEMS.map((p) => (
        <li key={`${p.file}:${p.line}`} style={ITEM}>
          {`${p.file}:${p.line}  ${p.text}`}
        </li>
      ))}
    </ul>
  );
}

/** What the dev server wrote. */
export function output(): ComponentBase {
  return <pre style="margin: 0; padding: var(--mx-space-3); overflow: visible; font: var(--mx-font-size-caption) / var(--mx-font-line-caption) var(--mx-font-family-mono)">{LOG.join('\n')}</pre>;
}

/** A tool's document: it cannot be closed, only moved, docked, floated or folded away. */
export function toolDocument(id: string, title: string, content: () => ComponentBase): TabDocument {
  return new TabDocument({ id, type: 'tool', title, closable: false, content });
}
