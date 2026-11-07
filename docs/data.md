# Data

> Data · @motifx-community/ui 0.1.0-beta.5

Data components show and pick from structured data: hierarchies, lists, sets of tags, and filters that the reader builds. Tables have their own group: see [DataGrid](datagrid.md).

## A file library

The folders in a tree, the files of the chosen folder in a searchable list, tags that narrow the files down, and a filter of your own on their names and sizes, written out in words.

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { FilterBuilder, ListBox, TagBox, TreeView, filterText, type FilterBuilderField } from '@motifx-community/ui';

interface Doc {
    id: number;
    name: string;
    folder: string;
    size: number;
    tags: string[];
}

const FOLDERS = [
    {
        id: 'all',
        text: 'All files',
        children: [
            { id: 'invoices', text: 'Invoices', children: [{ id: 'invoices-2025', text: '2025' }, { id: 'invoices-2026', text: '2026' }] },
            { id: 'letters', text: 'Letters' },
            { id: 'pictures', text: 'Pictures' }
        ]
    }
];

const DOCS: Doc[] = [
    { id: 1, name: 'january.pdf', folder: 'invoices-2025', size: 120, tags: ['paid'] },
    { id: 2, name: 'february.pdf', folder: 'invoices-2025', size: 98, tags: ['paid'] },
    { id: 3, name: 'march.pdf', folder: 'invoices-2026', size: 140, tags: ['open'] },
    { id: 4, name: 'april.pdf', folder: 'invoices-2026', size: 310, tags: ['open', 'urgent'] },
    { id: 5, name: 'bank.docx', folder: 'letters', size: 45, tags: ['sent'] },
    { id: 6, name: 'landlord.docx', folder: 'letters', size: 38, tags: ['draft'] },
    { id: 7, name: 'holiday.jpg', folder: 'pictures', size: 2400, tags: [] },
    { id: 8, name: 'team.png', folder: 'pictures', size: 860, tags: ['shared'] }
];

const FIELDS: FilterBuilderField[] = [
    { dataField: 'name', caption: 'Name' },
    { dataField: 'size', caption: 'Size (KB)', dataType: 'number' }
];

const TAGS = ['paid', 'open', 'urgent', 'sent', 'draft', 'shared'];

/** A file library: folders in a tree, the files of the folder in a list, tags to narrow them down, and a filter of your own. */
export default function DataDemo() {
    const s = reactive({
        folder: 'all' as unknown,
        file: null as unknown,
        tags: [] as unknown,
        filter: null as data.FilterExpression | null
    });
    const inFolder = (doc: Doc, folder: string) => folder === 'all' || doc.folder === folder || doc.folder.startsWith(folder + '-');
    const files = () => {
        const folder = String((Array.isArray(s.folder) ? s.folder[0] : s.folder) ?? 'all');
        const tags = s.tags as string[];
        const own = data.createRowFilter(s.filter);
        return DOCS.filter(d => inFolder(d, folder) && tags.every(t => d.tags.includes(t))).filter(own);
    };
    const chosen = () => DOCS.find(d => d.id === s.file);

    return (
        <div class="ov-frame ov-data">
            <div class="ov-split">
                <TreeView label="Folders" items={FOLDERS} expandedKeys={['all', 'invoices']} selectionMode="single" x-model={() => s.folder} />
                <div class="ov-stack">
                    <TagBox label="Tags" items={TAGS} x-model={() => s.tags} placeholder="Any tag" />
                    <FilterBuilder label="Filter" fields={FIELDS} locale="en" x-model={() => s.filter} />
                    <output class="ov-muted">{() => filterText(s.filter, { fields: FIELDS, locale: 'en' }) || 'No filter of your own.'}</output>
                    <ListBox class="ov-files-list" label="Files" items={files} textField="name" valueField="id" searchEnabled height={6} noItemsText="No files match." x-model={() => s.file} />
                </div>
            </div>
            <output class="ov-status ov-data-sum">{() => (chosen() ? `${chosen()!.name}, ${chosen()!.size} KB, ${chosen()!.tags.join(', ') || 'no tags'}` : `${files().length} file(s)`)}</output>
        </div>
    );
}
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[TreeView](treeview.md)` | A hierarchy that expands, with selection, check boxes, search and children loaded on demand. |
| `[ListBox](listbox.md)` | A list always on show, with one or several chosen, groups and search. |
| `[TagBox](tagbox.md)` | Several values of a long list, shown as tags. |
| `[FilterBuilder](filterbuilder.md)` | A filter of conditions and groups, built by the reader, in the data layer's format. |

## Choosing a component

Several components can do the same job; this table points to the one that reads best for it.

| To | Use |
| --- | --- |
| `Show and pick from a hierarchy` | [TreeView](treeview.md) |
| `Keep a list on show` | [ListBox](listbox.md) |
| `Pick several of a long list in little room` | [TagBox](tagbox.md) |
| `Let the reader build a filter` | [FilterBuilder](filterbuilder.md) |
| `Show rows with columns` | [DataGrid](datagrid.md) |

## What they share

They read the developer's data as it is, through fields such as `textField`, `valueField` and `childrenField`, and never change it.

Long lists come from a `dataSource` of the data layer; the filter of a FilterBuilder is the data layer's filter, ready for an adapter or for rows in memory.

## Accessibility

| Topic | Details |
| --- | --- |
| `Roles` | A tree, list boxes and a group of conditions, each with its name. |
| `Keyboard` | The arrow keys move and expand, Space chooses, typing finds an item. |
| `Large data` | Long trees and lists draw only what is on show, and stay quick with thousands of items. |

## Feedback

Loading issues…
