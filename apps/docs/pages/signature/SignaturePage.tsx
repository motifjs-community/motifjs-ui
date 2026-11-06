import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Export from './examples/Export';
import Options from './examples/Options';
import Programmatic from './examples/Programmatic';
import States from './examples/States';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['height', '`Bind<number | null>`', 'From the design language', 'The height of the pad in pixels.'],
    ['penColor', '`Bind<string | null>`', 'From the design language', 'The color of the lines.'],
    ['minWidth, maxWidth', '`Bind<number>`', '`1`, `3`', 'The width of a line at its thinnest and thickest, in pixels.'],
    ['placeholder', '`Bind<string>`', 'The kit string “Sign here”', 'The text of the empty pad. `\'\'` removes it.'],
    ['showGuide', '`Bind<boolean>`', '`true`', 'Draws the line to sign on.'],
    ['showClear, showUndo', '`Bind<boolean>`', '`true`', 'Show the buttons that remove the signature and the last stroke.'],
    ['label, helpText, readOnly, required, rules, error, validateOn', '', '', 'Same as `TextBox`.'],
];

const MEMBERS = [
    ['value', '`readonly SignatureStroke[]`', 'The strokes. `x-model` provides two-way binding.'],
    ['isEmpty', '`boolean`', 'Indicates that nothing has been signed.'],
    ['clear()', '`void`', 'Removes the signature.'],
    ['undo()', '`void`', 'Removes the last stroke.'],
    ['toDataURL(type?, options?)', '`string`', 'The signature as a data URL, a PNG by default.'],
    ['toBlob(type?, options?)', '`Promise<Blob | null>`', 'The signature as an image file, a PNG by default.'],
    ['toSVG(options?)', '`string`', 'The signature as an SVG document.'],
];

const OPTIONS = [
    ['width, height', '`number`', 'Twice the pad', 'The size of the image in pixels. The height keeps the shape of the pad.'],
    ['color', '`string`', "`'#000000'`", 'The color of the lines, which does not depend on the theme.'],
    ['background', '`string`', 'Transparent', 'The background.'],
];

const TYPES = [
    ['SignatureStroke', '`{ points: readonly SignaturePoint[] }`', 'One line drawn without lifting the pen.'],
    ['SignaturePoint', '`{ x, y, pressure }`', '`x` and `y` run from `0` to `1` across the pad, so a signature fits a pad of any size. `pressure` runs from `0` to `1`.'],
];

const EVENTS = [
    ['onStrokeBegan', '`{ stroke, originalEvent, source }`', 'Occurs when the pen touches the pad.'],
    ['onStrokeEnded', '`{ stroke, originalEvent, source }`', 'Occurs when the pen leaves the pad, after the value has changed.'],
    ['onValueChanged', '`{ value, previousValue, byUser, source, event }`', 'Same as `TextBox`.'],
];

const KEYS = [
    ['Delete', 'Removes the signature.'],
    ['Ctrl+Z', 'Removes the last stroke.'],
    ['Tab', 'Moves focus to the pad, and then to its buttons.'],
];

const A11Y = [
    ['Pad', 'The pad has the role `img`, the name of its label, and says whether it is signed.'],
    ['Signing', 'A signature is drawn with a pointer. Where a person may not be able to draw, offer another way, such as typing the name in a `TextBox`.'],
    ['Touch', 'The pad takes every touch, so signing does not scroll the page.'],
];

const HOOKS = [
    ['.mx-signature', 'The field. `data-invalid`, `data-readonly` and `data-disabled` describe its state.'],
    ['.mx-signature__pad, .mx-signature__canvas, .mx-signature__guide, .mx-signature__placeholder', 'The pad, the canvas, the line to sign on and the text.'],
    ['.mx-signature__actions', 'The buttons in the corner of the pad.'],
];

const TOKENS = [
    ['signature.width, .height, .guide-inset, .actions-inset', 'The size of the field and of the pad, and the distances of the line and the buttons.'],
    ['signature.pad, .guide, .placeholder', 'Units: the pad, whose `color` is the color of the ink (`focus`, `invalid`, `readonly`, `disabled`), the line and the text.'],
    ['signature.field', 'Place: the field under the pad, without a box of its own.'],
];

export default function SignaturePage() {
    return (
        <>
            <p class="lead">
                <Rich text="A pad to sign on with a pen, a finger or a mouse. The value is the strokes themselves, so a signature can be stored as data, drawn again at any size and exported as an image." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Signature } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="Signing">
                <p>
                    <Rich text="`x-model` binds the strokes. A pen that reports pressure sets the width of the line, and otherwise it follows the speed. The buttons in the corner remove the last stroke and the whole signature." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="export" title="Creating an image">
                <p>
                    <Rich text="`toDataURL()`, `toBlob()` and `toSVG()` give an image. It is drawn in black so that it does not depend on the theme, and the background is transparent unless you set one." />
                </p>
                <Example stack files={code('Export.tsx')}>
                    <Export />
                </Example>
            </Section>

            <Section anchor="options" title="The pen and the pad">
                <p>
                    <Rich text="`penColor`, `minWidth` and `maxWidth` set the pen, and `height` the pad. `showGuide`, `showClear`, `showUndo` and `placeholder` turn its parts on and off." />
                </p>
                <Example stack files={code('Options.tsx')}>
                    <Options />
                </Example>
            </Section>

            <Section anchor="states" title="Saved signatures and states">
                <p>
                    <Rich text="Giving the stored strokes as `value` draws the signature again. `required`, `readOnly` and `enabled` work as in every field." />
                </p>
                <Example stack files={code('States.tsx')}>
                    <States />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new Signature(props)` creates the pad without JSX. Each prop is also a property." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                    <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                    <Rich text="Properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
                <h3>
                    <Rich text="Image options" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={OPTIONS} />
                <h3>
                    <Rich text="Types" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={TYPES} />
                <h3>
                    <Rich text="Events" />
                </h3>
                <ApiTable head={['Event', 'Type', 'Description']} rows={EVENTS} />
                <h3>
                    <Rich text="Keyboard" />
                </h3>
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
                <h3>
                    <Rich text="Accessibility" />
                </h3>
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
                <h3>
                    <Rich text="Styling hooks" />
                </h3>
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                    <Rich text="Design tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>
        </>
    );
}
