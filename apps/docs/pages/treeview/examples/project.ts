import type { Entry } from './entry';

/** The files of a small project, nested. */
export function project(): Entry[] {
  return [
    {
      id: 'src',
      text: 'src',
      folder: true,
      children: [
        { id: 'main', text: 'main.ts' },
        {
          id: 'components',
          text: 'components',
          folder: true,
          children: [
            { id: 'button', text: 'Button.ts' },
            { id: 'tree', text: 'TreeView.ts' },
          ],
        },
      ],
    },
    { id: 'docs', text: 'docs', folder: true, children: [{ id: 'guide', text: 'guide.md' }] },
    { id: 'package', text: 'package.json' },
  ];
}
