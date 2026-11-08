import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const METHODS = [
    ['addItem(item, index?)', 'Adds an item at `index`, the end by default.'],
    ['removeItem(key)', 'Removes the item with `key`; its page goes with it.'],
    ['moveItem(key, index)', 'Moves the item to `index`.'],
    ['updateItem(key, changes)', 'Changes some of its fields, such as `text`, `badge`, `enabled` or `visible`; the others stay as they are, and its page is kept.'],
    ['findItem(key)', 'The item as it is now.'],
    ['beginUpdate(), endUpdate()', 'Holds the changes until `endUpdate()`, which applies them at once.'],
    ['select(key), openAt(key), pageOf(key)', 'Shows a page, opens the menu on it, and returns its page once it has been shown.']
];

export default function AppMenuProgrammaticPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Items can be added, removed, moved and changed at any time, by their keys. Items that stay keep their place, and pages that were opened keep their state." />
            </p>

            <Section anchor="example" title="Changes by key">
                <Example files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="methods" title="Methods">
                <ApiTable head={['Method', 'Description']} rows={METHODS} />
                <p>
                    <Rich text="Each change method returns `false` when nothing changed, such as for a key that does not exist." />
                </p>
            </Section>

            <Section anchor="data" title="Your data">
                <p>
                    <Rich text="The methods never change the items you gave. Each change makes a new list, the item changed a new object and the others the ones given, and it becomes `items`. `onItemsChanged` reports the new list to keep. When the items are in reactive state, you can also change that state directly; the menu follows it, and each item’s fields can be functions it follows." />
                </p>
            </Section>
        </>
    );
}
