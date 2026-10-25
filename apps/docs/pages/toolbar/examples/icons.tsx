/** A small outline icon drawn from one path. */
function icon(d: string) {
  return () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');
export const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');
export const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');
export const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');
export const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');
export const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');
export const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');
export const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');
export const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');
export const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');
