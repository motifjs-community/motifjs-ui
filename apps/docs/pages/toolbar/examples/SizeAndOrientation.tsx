import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, Toolbar, type ControlSize } from '@motifx-community/ui';
import { ImageIcon, LinkIcon, RedoIcon, UndoIcon } from './icons';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A size given to the controls inside, a text field in a toolbar, and a toolbar that turns vertical. */
export default function SizeAndOrientation() {
  const s = reactive({ size: 'md' as ControlSize, vertical: false, log: '' });
  const did = (what: string) => (s.log = what);
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">
        {SIZES.map((size) => (
          <Button key={size} text={size} size="sm" variant={() => (s.size === size ? 'solid' : 'ghost')} aria-pressed={() => s.size === size} onclick={() => (s.size = size)} />
        ))}
        <Button text="Vertical" size="sm" toggle x-model={() => s.vertical} />
      </Stack>
      <Toolbar label="Find" size={() => s.size}>
        <Button text="Previous" onclick={() => did('Previous')} />
        <TextBox label="Find" labelMode="hidden" placeholder="Find" />
        <Button text="Next" onclick={() => did('Next')} />
      </Toolbar>
      <Toolbar
        label="Tools"
        size={() => s.size}
        orientation={() => (s.vertical ? 'vertical' : 'horizontal')}
        items={[
          { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },
          { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },
          { type: 'separator' },
          { icon: () => <LinkIcon />, hint: 'Link', click: () => did('Link') },
          { icon: () => <ImageIcon />, hint: 'Image', enabled: false },
        ]}
      />
      <output>{() => s.log}</output>
    </>
  );
}
