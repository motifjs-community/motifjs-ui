import { reactive, type Component } from '@motifx/core';
import { Button, Toolbar } from '@motifx-community/ui';

/** A toolbar made with `new` and filled with `controls.add`. */
export default function FromCode() {
  const s = reactive({ log: '' });
  let added = 0;

  const bar = new Toolbar({ label: 'Actions', size: 'sm' });
  bar.controls.add(new Button({ text: 'First', onclick: () => (s.log = 'First pressed') }));

  const addFromCode = () => {
    const n = ++added;
    bar.controls.add(new Button({ text: `Button ${n}`, onclick: () => (s.log = `Button ${n} pressed`) }));
  };

  return (
    <>
      <Button text="Add a button from code" variant="outline" onclick={addFromCode} />
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />
      <output>{() => s.log}</output>
    </>
  );
}
