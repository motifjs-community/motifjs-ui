import { Tab, Tabs } from '@motifx-community/ui';
import { CodeFile } from './CodeFile';
import type { ExampleFile } from './example-file';

/** An example's source files: one shown as it is, several as tabs named by file. */
export function ExampleCode(props: { files: ExampleFile[] }) {
  const { files } = props;
  if (files.length === 1) return <CodeFile file={files[0]} />;
  const tabs = new Tabs({ label: 'Files', size: 'sm' });
  for (const file of files) tabs.add(new Tab({ title: file.name, content: () => <CodeFile file={file} /> }));
  return <div class="docs-code-files" onBuilt={(c) => c.controls.add(tabs)} />;
}
