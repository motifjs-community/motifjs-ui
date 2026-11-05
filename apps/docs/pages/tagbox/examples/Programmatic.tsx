import { reactive } from '@motifx/core';
import { Button, Stack, TagBox } from '@motifx-community/ui';
import { skills } from './skills';

/** A tag box bound to an array with x-model, and tag boxes created with `new` and added programmatically. */
export default function Programmatic() {
  const form = reactive({ skills: ['TypeScript', 'CSS'] as string[], result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const tags = new TagBox<string, string>({ label: `Skills ${++added}`, items: skills, placeholder: 'Pick some' });
    tags.onValueChanged((e) => (form.result = `${tags.label}: ${e.value.join(', ')}`));
    host?.controls.add(tags);
    tags.focus();
  };

  return (
    <>
      <TagBox label="&Skills" items={skills} x-model={() => form.skills} stretch />
      <Stack orientation="horizontal" wrap align="center">
        <output class="tg-skills">{() => `skills: ${JSON.stringify(form.skills)}`}</output>
        <Button text="Add a tag box programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="tg-made">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
