import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import EditorsDemo from './examples/EditorsDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[TextBox](/textbox)', 'A line of text, with a mask, a type such as e-mail, a counter or a clear button.'],
    ['[TextArea](/textarea)', 'Longer text that grows with its content.'],
    ['[NumberBox](/numberbox)', 'A number in the formats of the language, with limits and spin buttons.'],
    ['[DateBox](/datebox)', 'A date, a time or both, typed or picked.'],
    ['[DateRangeBox](/daterangebox)', 'A start and an end, with presets and limits on the length.'],
    ['[Signature](/signature)', 'A signature drawn with a pen, a finger or a mouse, kept as strokes.'],
    ['[OtpInput](/otpinput)', 'A one-time code in a row of boxes.'],
    ['[ColorBox](/colorbox)', 'A color, typed or picked.'],
    ['[Calendar](/calendar)', 'A month always on show, to pick a day or a range.'],
    ['[Slider](/slider)', 'A value or a range picked by dragging.'],
    ['[Rating](/rating)', 'A score in stars or other marks.'],
    ['[ValidationSummary](/validationsummary)', 'The invalid fields of a group, with links to them.'],
    ['[FileUploader](/fileuploader)', 'Files dropped or chosen, with limits, progress and uploading in chunks.'],
    ['[ShortcutEditor](/shortcuteditor)', 'The app’s keyboard shortcuts, for the user to assign other keys.'],
];

const CHOOSE = [
    ['Take a short text, or one with a fixed pattern', '[TextBox](/textbox)'],
    ['Take a longer text', '[TextArea](/textarea)'],
    ['Take an exact number', '[NumberBox](/numberbox)'],
    ['Pick a number or a range by feel', '[Slider](/slider)'],
    ['Take one date or time', '[DateBox](/datebox)'],
    ['Take a start and an end', '[DateRangeBox](/daterangebox)'],
    ['Show a month all the time', '[Calendar](/calendar)'],
    ['Take a code sent by message', '[OtpInput](/otpinput)'],
    ['Take files', '[FileUploader](/fileuploader)'],
    ['Let the user change keyboard shortcuts', '[ShortcutEditor](/shortcuteditor)'],
];

const A11Y = [
    ['Names', 'The label names the field; help text and the error are read with it.'],
    ['Errors', 'An invalid field is marked invalid for assistive technology, and its message is announced.'],
    ['Keyboard', 'Every editor works without a pointer: pickers open with Alt+Down, sliders move with the arrow keys, Page Up and Page Down.'],
];

export default function EditorsOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Editors take values: text, numbers, dates and times, ranges, colors, ratings, codes, files and signatures. They share one field model, so a label, help text, validation and binding work the same in all of them." />
            </p>

            <Section anchor="demo" title="A booking form">
                <p>
                    <Rich text="Fourteen editors in one form. Book checks the required fields and their rules together, and the summary at the top lists what is missing, with links that move to each field." />
                </p>
                <Example stack files={code('EditorsDemo.tsx')}>
                    <EditorsDemo />
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
                    <Rich text="Every editor is a field: `label` with an access key, `helpText`, `prefix` and `suffix`, `readOnly`, `stretch`, and `x-model` for its value. The value is the developer's own: a field reads it and writes it back, and never wraps it." />
                </p>
                <p>
                    <Rich text="`required` and `rules` check the value; the error shows under the field once the reader leaves it. A `ValidationGroup` checks several fields at once, and a `ValidationSummary` lists the ones that failed." />
                </p>
                <p>
                    <Rich text="Numbers, dates and times follow the language of the kit, and change at once when it changes." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
