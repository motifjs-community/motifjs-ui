import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';
import { tx } from '../app/texts';
import { Code } from './Code';
import type { ExampleFile } from './example-file';

/** One file of an example's code, with a button that copies it. */
export function CodeFile(props: { file: ExampleFile }) {
  const s = reactive({ copied: false });
  const copy = async () => {
    await navigator.clipboard.writeText(props.file.source);
    s.copied = true;
    setTimeout(() => (s.copied = false), 1500);
  };
  return (
    <div class="docs-code-file">
      <Button
        class="docs-code-file__copy"
        size="sm"
        variant="ghost"
        text={() => tx(s.copied ? 'Copied' : 'Copy')}
        aria-label={() => (s.copied ? tx('Copied') : `${tx('Copy')} ${props.file.name}`)}
        onclick={copy}
      />
      <Code code={props.file.source} />
    </div>
  );
}
