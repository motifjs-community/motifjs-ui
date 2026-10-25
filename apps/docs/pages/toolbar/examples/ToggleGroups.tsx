import { Button, Toolbar, ToolbarSeparator } from '@motifx-community/ui';
import { draft } from './draft';
import { BoldIcon, ItalicIcon } from './icons';

/** Toggle buttons as JSX children, bound with x-model, and a separator before a plain button. */
export default function ToggleGroups() {
  return (
    <Toolbar label="Text">
      <Button icon={() => <BoldIcon />} aria-label="Bold" toggle x-model={() => draft.bold} />
      <Button icon={() => <ItalicIcon />} aria-label="Italic" toggle x-model={() => draft.italic} />
      <ToolbarSeparator />
      <Button
        text="Clear"
        onclick={() => {
          draft.bold = draft.italic = draft.underline = false;
        }}
      />
    </Toolbar>
  );
}
