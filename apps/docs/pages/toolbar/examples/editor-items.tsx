import type { ToolbarItem } from '@motifx-community/ui';
import { draft } from './draft';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ImageIcon, ItalicIcon, LinkIcon, RedoIcon, UnderlineIcon, UndoIcon } from './icons';

const did = (what: string) => (draft.log = what);

const align = (value: 'left' | 'center' | 'right', hint: string, Icon: typeof BoldIcon): ToolbarItem => ({
  type: 'toggle',
  icon: () => <Icon />,
  hint,
  pressed: () => draft.align === value,
  click: () => (draft.align = value),
});

/** The items of the editor toolbar, bound to the draft. */
export function editorItems(): ToolbarItem[] {
  return [
    { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },
    { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },
    { type: 'separator' },
    { type: 'toggle', icon: () => <BoldIcon />, hint: 'Bold', pressed: () => draft.bold, click: () => (draft.bold = !draft.bold) },
    { type: 'toggle', icon: () => <ItalicIcon />, hint: 'Italic', pressed: () => draft.italic, click: () => (draft.italic = !draft.italic) },
    { type: 'toggle', icon: () => <UnderlineIcon />, hint: 'Underline', pressed: () => draft.underline, click: () => (draft.underline = !draft.underline) },
    { type: 'separator' },
    align('left', 'Align left', AlignLeftIcon),
    align('center', 'Center', AlignCenterIcon),
    align('right', 'Align right', AlignRightIcon),
    { type: 'separator' },
    {
      type: 'menu',
      text: 'Insert',
      menu: [
        { text: '&Link', icon: () => <LinkIcon />, shortcut: 'Ctrl+K', click: () => did('Insert link') },
        { text: '&Image', icon: () => <ImageIcon />, click: () => did('Insert image') },
        { text: '&Table', items: [2, 3, 4].map((n) => ({ text: `${n} × ${n}`, click: () => did(`Insert a ${n} × ${n} table`) })) },
      ],
    },
    { text: '&Publish', click: () => did('Publish'), overflow: 'never' },
  ];
}
