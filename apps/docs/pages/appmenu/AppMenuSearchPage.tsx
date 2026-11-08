import { Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import SlotsSearch from './examples/SlotsSearch';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function AppMenuSearchPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The list can hold the app’s own content above and under its items, such as the user’s name or the version, and a search that narrows a long list as the user types." />
            </p>

            <Section anchor="example" title="Slots and search">
                <Example files={code('SlotsSearch.tsx')}>
                    <SlotsSearch />
                </Example>
            </Section>

            <Section anchor="slots" title="Above and under the items">
                <p>
                    <Rich text="`listHeader` stands under the close button, above the items; `listFooter` stands at the bottom, after the items at the bottom. Each is any component and can be given again at any time." />
                </p>
            </Section>

            <Section anchor="search" title="Search">
                <p>
                    <Rich text="`searchEnabled` adds a search field above the items. Typing leaves the items whose text or hint holds what was typed, without case and marks, in the language of the page, and says so when nothing matches. Arrow Down moves to the first item left, Enter presses it, and Escape clears the search before it closes the menu. `searchText` is the text, and `onSearchTextChanged` reports what the user typed." />
                </p>
            </Section>
        </>
    );
}
