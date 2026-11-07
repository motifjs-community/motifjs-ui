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
