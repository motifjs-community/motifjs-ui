import { reactive } from '@motifx/core';
import { Stack, Switch, TagBox } from '@motifx-community/ui';

interface Person {
  id: number;
  name: string;
  team: string;
  initials: string;
  away?: boolean;
}

const people: Person[] = [
  { id: 1, name: 'Ada Lovelace', team: 'Design', initials: 'AL' },
  { id: 2, name: 'Grace Hopper', team: 'Design', initials: 'GH' },
  { id: 3, name: 'Alan Turing', team: 'Engineering', initials: 'AT' },
  { id: 4, name: 'Barbara Liskov', team: 'Engineering', initials: 'BL', away: true },
  { id: 5, name: 'Edsger Dijkstra', team: 'Engineering', initials: 'ED' },
  { id: 6, name: 'Margaret Hamilton', team: 'Research', initials: 'MH' },
  { id: 7, name: 'Donald Knuth', team: 'Research', initials: 'DK' },
];

/** Draws a person as initials and a name. */
const drawPerson = (p: Person, el: HTMLElement) => {
  const badge = el.appendChild(document.createElement('span'));
  badge.style.color = 'var(--mx-color-accent-fg)';
  badge.style.fontWeight = 'var(--mx-font-weight-semibold)';
  badge.textContent = p.initials;
  el.append(` ${p.name}`);
};

/** Objects in groups, items that cannot be chosen, a template, and the switches of the list. */
export default function TeamList() {
  const s = reactive({ team: [1, 3] as number[], closeOnSelect: false, hideSelected: false, selectAll: false, limit: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Close on select" x-model={() => s.closeOnSelect} />
        <Switch label="Hide chosen" x-model={() => s.hideSelected} />
        <Switch label="Select all" x-model={() => s.selectAll} />
        <Switch label="At most 3" x-model={() => s.limit} />
      </Stack>
      <TagBox
        label="Team"
        items={people}
        textField="name"
        valueField="id"
        groupField="team"
        enabledField={(p: Person) => !p.away}
        itemTemplate={drawPerson}
        closeOnSelect={() => s.closeOnSelect}
        hideSelected={() => s.hideSelected}
        selectAll={() => s.selectAll}
        maxSelected={() => (s.limit ? 3 : 0)}
        placeholder="Add people"
        stretch
        x-model={() => s.team}
      />
      <output class="tg-team">{() => `ids: ${JSON.stringify(s.team)}`}</output>
    </>
  );
}
