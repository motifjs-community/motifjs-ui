import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DisplayDemo from './examples/DisplayDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[QRCode](/qrcode)', 'A code to scan, drawn as vectors.'],
    ['[Barcode](/barcode)', 'Code 128, Code 39, EAN, UPC and Interleaved 2 of 5.'],
    ['[Badge](/badge)', 'A count or a dot on a corner of another control.'],
    ['[Avatar](/avatar)', 'A person as a picture or initials, alone or in a group.'],
    ['[Chip](/chip)', 'A small label to choose, remove or press, alone or in a group.'],
    ['[Card](/card)', 'A summary of one thing, with media, a title, content and actions.'],
    ['[Gallery](/gallery)', 'Pictures or content one at a time, swiped or played as a slideshow.'],
    ['[TileView](/tileview)', 'Tiles of different sizes on a grid, chosen and reordered.'],
    ['[Timeline](/timeline)', 'Events in the order they happened, down or across.'],
    ['[Skeleton](/skeleton)', 'The shape of content that is still loading.'],
];

const CHOOSE = [
    ['Show a count on something', '[Badge](/badge)'],
    ['Show a person', '[Avatar](/avatar)'],
    ['Show tags or quick filters', '[Chip](/chip)'],
    ['Summarize one thing', '[Card](/card)'],
    ['Show pictures one at a time', '[Gallery](/gallery)'],
    ['Lay out items of different sizes', '[TileView](/tileview)'],
    ['Show events in time', '[Timeline](/timeline)'],
    ['Give a code to scan', '[QRCode](/qrcode) or [Barcode](/barcode)'],
    ['Keep the layout while content loads', '[Skeleton](/skeleton)'],
];

const A11Y = [
    ['Names', 'Codes, avatars and badges have a label that says what they show.'],
    ['Collections', 'A gallery, a tile view and a timeline are one Tab stop, moved through with the arrow keys.'],
    ['Loading', 'A skeleton is marked busy while it waits, and its content is read once it arrives.'],
];

export default function DisplayOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Display components present content: people, counts and labels, cards, pictures, tiles, events in time, codes to scan, and placeholders while content loads." />
            </p>

            <Section anchor="demo" title="A profile">
                <p>
                    <Rich text="A card with an avatar and placeholders while it loads, skills as chips to choose, the team as an avatar group, figures as tiles, projects in a gallery, the year on a timeline, codes to share, and a badge with the unread count." />
                </p>
                <Example stack files={code('DisplayDemo.tsx')}>
                    <DisplayDemo />
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
                    <Rich text="Content comes as props, as JSX children, or as a function that builds it, so a card or a tile can hold any control of the kit." />
                </p>
                <p>
                    <Rich text="Pictures that fail to load fall back to something readable: an avatar to initials, a gallery to its caption." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
