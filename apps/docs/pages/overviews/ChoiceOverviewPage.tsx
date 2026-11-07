import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ChoiceDemo from './examples/ChoiceDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[CheckBox](/checkbox)', 'One option on or off, with a third state for a group that is partly on.'],
    ['[Switch](/switch)', 'A setting that takes effect at once.'],
    ['[RadioGroup](/radiogroup)', 'One of a few options, all on show.'],
    ['[DropDown](/dropdown)', 'One of a list, opened from a field.'],
    ['[ComboBox and Autocomplete](/combobox)', 'One of a list found by typing, or a value of your own.'],
    ['[Lookup](/lookup)', 'One row of many, picked from a table with columns, from a server too.'],
];

const CHOOSE = [
    ['Turn a setting on that applies at once', '[Switch](/switch)'],
    ['Agree to something, or pick independent options', '[CheckBox](/checkbox)'],
    ['Pick one of up to about five options', '[RadioGroup](/radiogroup)'],
    ['Pick one of a longer list', '[DropDown](/dropdown)'],
    ['Find an item by typing', '[ComboBox](/combobox)'],
    ['Pick a row by several of its columns', '[Lookup](/lookup)'],
    ['Pick several of a long list', '[TagBox](/tagbox)'],
];

const A11Y = [
    ['Roles', 'Check boxes and switches with their state, radio groups, and list boxes for the lists.'],
    ['Keyboard', 'Space toggles; the arrow keys move inside a group and a list; typing finds an item.'],
    ['Groups', 'A radio group and a set of check boxes are named as a group by their label.'],
];

export default function ChoiceOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Choice components let the reader pick: on or off, one of a few, several of a list, or one of many with search." />
            </p>

            <Section anchor="demo" title="Notification settings">
                <p>
                    <Rich text="Radio buttons for the channel, a switch that applies at once, check boxes with one that sets them all, a drop-down list, a combo box that searches as you type, and a lookup that picks a person from a table." />
                </p>
                <Example stack files={code('ChoiceDemo.tsx')}>
                    <ChoiceDemo />
                </Example>
            </Section>
            <Section anchor="components" title="Components in this group">
                <p>
                    <Rich text="Each component has its own page with its examples and its full API." />
                </p>
                <ApiTable head={['Component', 'For']} rows={MEMBERS} />
            </Section>
            <Section anchor="choosing" title="Choosing a component">
                <p>
                    <Rich text="Several components can do the same job; this table points to the one that reads best for it." />
                </p>
                <ApiTable head={['To', 'Use']} rows={CHOOSE} />
            </Section>
            <Section anchor="shared" title="What they share">
                <p>
                    <Rich text="They are fields like the editors: a label, help text, validation and `x-model`." />
                </p>
                <p>
                    <Rich text="Items are strings or objects read through `textField` and `valueField`; long lists come from a `dataSource` of the data layer and load as the reader scrolls or searches." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
