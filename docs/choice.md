# Choice

> Choice · @motifx-community/ui 0.1.0-beta.10

Choice components let the reader pick: on or off, one of a few, several of a list, or one of many with search.

## Notification settings

Radio buttons for the channel, a switch that applies at once, check boxes with one that sets them all, a drop-down list, a combo box that searches as you type, and a lookup that picks a person from a table.

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, ComboBox, DropDown, Lookup, RadioGroup, Switch } from '@motifx-community/ui';

const TOPICS = ['Orders', 'Invoices', 'Comments', 'Releases'];

const CITIES = ['Ankara', 'Antalya', 'Berlin', 'Bursa', 'İstanbul', 'İzmir', 'Lisbon', 'London', 'Madrid', 'Paris', 'Rome', 'Vienna'].map(name => ({ id: name, name }));

const PEOPLE = [
    { id: 1, name: 'Ada Yılmaz', team: 'Design', city: 'Ankara' },
    { id: 2, name: 'Deniz Kaya', team: 'Web', city: 'İzmir' },
    { id: 3, name: 'Elif Demir', team: 'Mobile', city: 'İstanbul' },
    { id: 4, name: 'Mert Şahin', team: 'Web', city: 'Bursa' },
    { id: 5, name: 'Selin Aydın', team: 'Support', city: 'Antalya' }
];

/** Notification settings: one of a few, on or off, several of a list with all of them at once, one of many with search, and a pick from a table. */
export default function ChoiceDemo() {
    const s = reactive({
        channel: 'mail' as unknown,
        quiet: false,
        topics: { Orders: true, Invoices: true, Comments: false, Releases: false } as Record<string, boolean>,
        language: 'en' as unknown,
        city: 'İzmir' as unknown,
        deputy: 2 as unknown
    });
    const chosen = () => TOPICS.filter(t => s.topics[t]);
    const all = () => (chosen().length === TOPICS.length ? true : chosen().length === 0 ? false : null);

    return (
        <div class="ov-frame ov-choice">
            <h3 class="ov-title">Notifications</h3>
            <div class="ov-grid">
                <RadioGroup
                    label="Send them by"
                    items={[
                        { value: 'mail', text: 'E-mail' },
                        { value: 'sms', text: 'Text message' },
                        { value: 'push', text: 'Phone notification', helpText: 'Needs the app.' }
                    ]}
                    x-model={() => s.channel}
                />
                <div class="ov-stack">
                    <Switch label="Do not disturb at night" x-model={() => s.quiet} />
                    <CheckBox
                        class="ov-all-topics"
                        label="All topics"
                        threeState
                        value={all}
                        onValueChanged={e => {
                            // Partly on or all off, a press turns them all on; all on, it turns them off.
                            if (!e.byUser) return;
                            const on = chosen().length < TOPICS.length;
                            for (const t of TOPICS) s.topics[t] = on;
                        }}
                    />
                    <div class="ov-indent">
                        {TOPICS.map(t => (
                            <CheckBox label={t} x-model={() => s.topics[t]} />
                        ))}
                    </div>
                </div>
                <div class="ov-stack">
                    <DropDown
                        label="Language"
                        items={[
                            { value: 'en', text: 'English' },
                            { value: 'tr', text: 'Türkçe' },
                            { value: 'de', text: 'Deutsch' }
                        ]}
                        x-model={() => s.language}
                    />
                    <ComboBox label="Office" items={CITIES} textField="name" valueField="id" x-model={() => s.city} helpText="Type to search." />
                    <Lookup
                        label="Deputy while away"
                        items={PEOPLE}
                        textField="name"
                        valueField="id"
                        columns={[
                            { field: 'name', caption: 'Name', width: '2fr' },
                            { field: 'team', caption: 'Team' },
                            { field: 'city', caption: 'City' }
                        ]}
                        x-model={() => s.deputy}
                    />
                </div>
            </div>
            <output class="ov-status ov-choice-sum">
                {() =>
                    `By ${s.channel}${s.quiet ? ', quiet at night' : ''}; ${chosen().join(', ') || 'no topics'}; ${s.language}; ${s.city}; deputy ${PEOPLE.find(p => p.id === s.deputy)?.name ?? 'none'}.`
                }
            </output>
        </div>
    );
}
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[CheckBox](checkbox.md)` | One option on or off, with a third state for a group that is partly on. |
| `[Switch](switch.md)` | A setting that takes effect at once. |
| `[RadioGroup](radiogroup.md)` | One of a few options, all on show. |
| `[DropDown](dropdown.md)` | One of a list, opened from a field. |
| `[ComboBox and Autocomplete](combobox.md)` | One of a list found by typing, or a value of your own. |
| `[Lookup](lookup.md)` | One row of many, picked from a table with columns, from a server too. |

## Choosing a component

Several components can do the same job; this table points to the one that reads best for it.

| To | Use |
| --- | --- |
| `Turn a setting on that applies at once` | [Switch](switch.md) |
| `Agree to something, or pick independent options` | [CheckBox](checkbox.md) |
| `Pick one of up to about five options` | [RadioGroup](radiogroup.md) |
| `Pick one of a longer list` | [DropDown](dropdown.md) |
| `Find an item by typing` | [ComboBox](combobox.md) |
| `Pick a row by several of its columns` | [Lookup](lookup.md) |
| `Pick several of a long list` | [TagBox](tagbox.md) |

## What they share

They are fields like the editors: a label, help text, validation and `x-model`.

Items are strings or objects read through `textField` and `valueField`; long lists come from a `dataSource` of the data layer and load as the reader scrolls or searches.

## Accessibility

| Topic | Details |
| --- | --- |
| `Roles` | Check boxes and switches with their state, radio groups, and list boxes for the lists. |
| `Keyboard` | Space toggles; the arrow keys move inside a group and a list; typing finds an item. |
| `Groups` | A radio group and a set of check boxes are named as a group by their label. |

## Feedback

Loading issues…
