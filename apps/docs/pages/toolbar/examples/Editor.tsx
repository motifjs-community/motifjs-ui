import { Toolbar } from '@motifx-community/ui';
import { draft } from './draft';
import { editorItems } from './editor-items';

/** An editor toolbar from `items`: buttons, toggles, an alignment group, a menu, and a button kept out of the “more” menu. */
export default function Editor() {
  const preview = () =>
    `font-weight: ${draft.bold ? 600 : 400}; font-style: ${draft.italic ? 'italic' : 'normal'}; text-decoration: ${draft.underline ? 'underline' : 'none'}; text-align: ${draft.align}; inline-size: 100%; margin: 0`;
  return (
    <>
      <Toolbar label="Format" items={editorItems()} style="inline-size: 100%" />
      <p style={preview}>The quick brown fox jumps over the lazy dog.</p>
      <output class="tb-log">{() => draft.log}</output>
    </>
  );
}
