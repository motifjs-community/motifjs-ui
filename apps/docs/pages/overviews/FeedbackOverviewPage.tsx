import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FeedbackDemo from './examples/FeedbackDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[ProgressBar and Spinner](/progress)', 'How far a task has come, or that it is under way.'],
    ['[Tooltip](/tooltip)', 'A short name or hint for a control, on hover or focus.'],
    ['[Popover](/popover)', 'More detail or a small form beside a control.'],
    ['[LoadPanel](/loadpanel)', 'A panel over a region or the page while it loads.'],
    ['[Toast](/toast)', 'A short message about what has just happened, with an action such as Undo.'],
];

const CHOOSE = [
    ['Show progress that can be measured', '[ProgressBar](/progress)'],
    ['Show a short wait of unknown length', '[Spinner](/progress)'],
    ['Keep a region from use while it loads', '[LoadPanel](/loadpanel)'],
    ['Name or explain a control', '[Tooltip](/tooltip)'],
    ['Show more beside a control, or ask for a little', '[Popover](/popover)'],
    ['Report the result of an action', '[Toast](/toast)'],
];

const A11Y = [
    ['Announcements', 'Progress is read as a value; info and success toasts are announced politely, caution and danger ones at once.'],
    ['Tooltips', 'A tooltip shows on focus as well as on hover, and Escape hides it.'],
    ['Focus', 'A popover takes focus when it opens and gives it back when it closes; a load panel keeps focus out of what it covers.'],
];

export default function FeedbackOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Feedback components tell the reader what is happening: how far a task has come, that something is loading, what a control does, and what has just happened." />
            </p>

            <Section anchor="demo" title="Syncing a folder">
                <p>
                    <Rich text="Sync now shows a spinner while it connects and a bar while it copies, then a toast; Stop leaves a toast with a way to go on. Refresh covers the list with a load panel, Remove undoes from its toast, the button has a tooltip and the info button opens a popover." />
                </p>
                <Example stack files={code('FeedbackDemo.tsx')}>
                    <FeedbackDemo />
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
                    <Rich text="A delay keeps quick work from flashing a spinner or a panel; it shows only when the wait is long enough to notice." />
                </p>
                <p>
                    <Rich text="Tones come from the design language: info, success, caution and danger, never by color alone but with an icon and words." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
