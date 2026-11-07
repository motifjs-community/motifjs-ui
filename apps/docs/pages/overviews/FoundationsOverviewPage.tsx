import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FoundationsDemo from './examples/FoundationsDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[Control](/control)', 'The base of every control: properties set as values or functions, enabled through the tree, and controls added programmatically.'],
    ['[Keyboard and focus](/keyboard)', 'Access keys, shortcuts, the Tab order and keeping focus where it belongs.'],
    ['[Language](/language)', 'The kit\'s texts and formats, loaded as packs and switched live.'],
];

const A11Y = [
    ['Keyboard', 'Every control works with the keyboard alone, and access keys reach a command or a field in one step.'],
    ['Focus', 'Focus is always visible, and it returns to a sensible place when a panel closes or a control goes away.'],
    ['Language', 'The page language follows the kit\'s, so assistive technology reads texts in the right language.'],
];

export default function FoundationsOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The foundations are what every control of the kit shares: the Control base with its properties, keyboard and focus, and the language of the texts and formats." />
            </p>

            <Section anchor="demo" title="What every control shares">
                <p>
                    <Rich text="Access keys with Alt on buttons and labels, one Tab stop for each control, a switch that turns a whole panel off, and the kit's language switched live with every text and format drawn again." />
                </p>
                <Example stack files={code('FoundationsDemo.tsx')}>
                    <FoundationsDemo />
                </Example>
            </Section>
            <Section anchor="components" title="Components in this group">
                <p>
                    <Rich text="Each component has its own page with its examples and its full API." />
                </p>
                <ApiTable head={['Component', 'For']} rows={MEMBERS} />
            </Section>
            <Section anchor="shared" title="What they share">
                <p>
                    <Rich text="Every prop is also a property: a value is taken as it is, and a function is followed, so a control changes with the data without copying it." />
                </p>
                <p>
                    <Rich text="Enabled and visible pass down the tree: a disabled panel disables everything inside, and each control keeps its own setting for when the panel comes back." />
                </p>
                <p>
                    <Rich text="Texts and formats come from the language in use; a page can switch it at any time, and every control draws again." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
