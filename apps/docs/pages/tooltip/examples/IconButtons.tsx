import { Button, Stack, Tooltip } from '@motifx-community/ui';

const BoldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 2.5h4.25a2.75 2.75 0 0 1 0 5.5H4.5zM4.5 8h5a2.75 2.75 0 0 1 0 5.5h-5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
);

const ItalicIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M7 2.5h5M4 13.5h5M9.5 2.5l-3 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6.5 9.5l3-3M7 4.5l1-1a2.83 2.83 0 0 1 4 4l-1 1M9 11.5l-1 1a2.83 2.83 0 0 1-4-4l1-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

/** Icon-only buttons named with aria-label; the tooltips show the name and the shortcut. */
export default function IconButtons() {
  let bold: Button | null = null;
  let italic: Button | null = null;
  let link: Button | null = null;
  return (
    <Stack orientation="horizontal" wrap align="center" role="toolbar" aria-label="Text style">
      <Button ref={(b: Button) => (bold = b)} icon={() => <BoldIcon />} variant="ghost" aria-label="Bold" />
      <Button ref={(b: Button) => (italic = b)} icon={() => <ItalicIcon />} variant="ghost" aria-label="Italic" />
      <Button ref={(b: Button) => (link = b)} icon={() => <LinkIcon />} variant="ghost" aria-label="Link" />
      <Tooltip target={() => bold} text="Bold (Ctrl+B)" />
      <Tooltip target={() => italic} text="Italic (Ctrl+I)" />
      <Tooltip target={() => link} text="Insert a link (Ctrl+K)" />
    </Stack>
  );
}
