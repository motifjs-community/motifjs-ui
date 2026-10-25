import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs, TextBox } from '@motifx-community/ui';

/** Tabs from JSX bound with x-model, and tabs created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ page: 'general' as string | number, name: '', log: '' });
  let added = 0;

  const reports = new Tabs({ label: 'Reports', closable: true });
  reports.add(new Tab({ title: 'Summary', content: () => <p>The summary, built when it was first shown.</p> }));
  reports.onSelectionChanged((e) => (s.log = e.tab ? `Selected “${e.tab.title}”${e.byUser ? ' by the user' : ' from code'}.` : 'No tab left.'));

  const addReport = () => {
    const n = ++added;
    const tab = reports.add(new Tab({ title: `Report ${n}`, content: () => <p>Report {n}.</p> }));
    reports.select(tab);
  };

  return (
    <>
      <Tabs label="Settings" x-model={() => s.page}>
        <Tab key="general" title="&General">
          <TextBox label="Name" x-model={() => s.name} helpText="Its text stays while you switch tabs." />
        </Tab>
        <Tab key="advanced" title="&Advanced">
          <p>Advanced settings.</p>
        </Tab>
        <Tab key="about" title="A&bout">
          <p>Version 1.0.</p>
        </Tab>
      </Tabs>
      <output class="tabs-page">{() => `value: "${s.page}"`}</output>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a report from code" variant="outline" onclick={addReport} />
        <output class="tabs-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" class="tabs-coded" style="inline-size: 100%" onBuilt={(c) => c.controls.add(reports)} />
    </>
  );
}
