import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DataDemo from './examples/DataDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[TreeView](/treeview)', 'A hierarchy that expands, with selection, check boxes, search and children loaded on demand.'],
    ['[ListBox](/listbox)', 'A list always on show, with one or several chosen, groups and search.'],
    ['[TagBox](/tagbox)', 'Several values of a long list, shown as tags.'],
    ['[FilterBuilder](/filterbuilder)', 'A filter of conditions and groups, built by the reader, in the data layer\'s format.'],
];

const CHOOSE = [
    ['Show and pick from a hierarchy', '[TreeView](/treeview)'],
    ['Keep a list on show', '[ListBox](/listbox)'],
    ['Pick several of a long list in little room', '[TagBox](/tagbox)'],
    ['Let the reader build a filter', '[FilterBuilder](/filterbuilder)'],
    ['Show rows with columns', '[DataGrid](/datagrid)'],
];

const A11Y = [
    ['Roles', 'A tree, list boxes and a group of conditions, each with its name.'],
    ['Keyboard', 'The arrow keys move and expand, Space chooses, typing finds an item.'],
    ['Large data', 'Long trees and lists draw only what is on show, and stay quick with thousands of items.'],
];

export default function DataOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Data components show and pick from structured data: hierarchies, lists, sets of tags, and filters that the reader builds. Tables have their own group: see [DataGrid](/datagrid)." />
            </p>

            <Section anchor="demo" title="A file library">
                <p>
                    <Rich text="The folders in a tree, the files of the chosen folder in a searchable list, tags that narrow the files down, and a filter of your own on their names and sizes, written out in words." />
                </p>
                <Example stack files={code('DataDemo.tsx')}>
                    <DataDemo />
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
                    <Rich text="They read the developer's data as it is, through fields such as `textField`, `valueField` and `childrenField`, and never change it." />
                </p>
                <p>
                    <Rich text="Long lists come from a `dataSource` of the data layer; the filter of a FilterBuilder is the data layer's filter, ready for an adapter or for rows in memory." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
