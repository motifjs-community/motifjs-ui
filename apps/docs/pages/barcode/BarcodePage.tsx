import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Export from './examples/Export';
import Formats from './examples/Formats';
import Options from './examples/Options';
import Programmatic from './examples/Programmatic';
import Validation from './examples/Validation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FORMATS = [
    ['code128', 'Any ASCII text', 'The default, for labels, shipping and stock. Digits are packed in pairs, so it stays short.'],
    ['code39', 'Capitals, digits and `- . $ / + %` and space', 'Older industrial labels. Lower-case letters become capitals.'],
    ['ean13', '12 or 13 digits', 'Retail products. The check digit is worked out, and a wrong one is refused.'],
    ['ean8', '7 or 8 digits', 'Small retail products.'],
    ['upca', '11 or 12 digits', 'Retail products in North America.'],
    ['itf', 'Digits', 'Interleaved 2 of 5, for cartons. An odd number of digits gets a leading zero.'],
];

const PROPS = [
    ['value', '`Bind<string>`', "`''`", 'The value of the code.'],
    ['format', '`Bind<BarcodeFormat>`', "`'code128'`", 'The kind of barcode.'],
    ['checkDigit', '`Bind<boolean>`', '`false`', 'Adds the optional check character of Code 39.'],
    ['moduleWidth', '`Bind<number>`', '`2`', 'The width of the thinnest bar in pixels.'],
    ['height', '`Bind<number | null>`', 'From the design language', 'The height of the bars in pixels.'],
    ['margin', '`Bind<number>`', '`10`', 'The quiet zone at each side, in modules. Readers need it.'],
    ['showText', '`Bind<boolean>`', '`true`', 'Shows the text under the bars.'],
    ['label', '`Bind<string>`', 'The kit string “Barcode: …”', 'The accessible name.'],
];

const MEMBERS = [
    ['isInvalid', '`boolean`', 'Indicates that the value could not be drawn.'],
    ['codeText', '`string`', 'The text under the bars, with the check digit where the format has one.'],
    ['toSVG(options?)', '`string`', 'The code as an SVG document, with its text.'],
    ['toDataURL(type?, options?)', '`string`', 'The code as a data URL, a PNG by default.'],
];

const OPTIONS = [
    ['scale', '`number`', '`2`', 'The width of a module in pixels.'],
    ['color', '`string`', "`'#000000'`", 'The color of the bars and the text.'],
    ['background', '`string`', "`'#ffffff'`", 'The background.'],
];

const EVENTS = [
    ['onEncodeFailed', '`{ value, format, source }`', 'Occurs when the format cannot hold the value, which then draws nothing.'],
];

const A11Y = [
    ['Name', 'The code has the role `img`, and its name holds the value, so a screen reader can read it.'],
    ['Colors', 'A code stays dark on a light sheet in every theme, as readers expect.'],
    ['Width', 'A narrow parent scrolls the code rather than squeezing its bars, which would stop it reading.'],
];

const HOOKS = [
    ['.mx-barcode', 'The sheet. `data-invalid` says the value could not be drawn.'],
    ['.mx-barcode__svg, .mx-barcode__text', 'The bars and the text.'],
];

const TOKENS = [
    ['barcode.height', 'The height of the bars.'],
    ['barcode.sheet, .text', 'Units: the sheet, whose `color` is the color of the bars, and the text.'],
];

export default function BarcodePage() {
    return (
        <>
            <p class="lead">
                <Rich text="A linear barcode, drawn as vectors: Code 128, Code 39, EAN-13, EAN-8, UPC-A or Interleaved 2 of 5. It has no dependencies, works out check digits and refuses a value the format cannot hold." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Barcode } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="formats" title="Formats">
                <p>
                    <Rich text="`format` sets the kind of barcode, and `value` what it holds." />
                </p>
                <ApiTable head={['Format', 'Value', 'Description']} rows={FORMATS} />
                <Example stack files={code('Formats.tsx')}>
                    <Formats />
                </Example>
            </Section>

            <Section anchor="options" title="Size and text">
                <p>
                    <Rich text="`moduleWidth` and `height` set the size of the bars, and `showText` the text under them. Keep the bars wide enough for the distance it is read from." />
                </p>
                <Example stack files={code('Options.tsx')}>
                    <Options />
                </Example>
            </Section>

            <Section anchor="validation" title="Values that do not fit">
                <p>
                    <Rich text="A value the format cannot hold draws nothing and raises `onEncodeFailed`. Change the last digit of this EAN-13 to see it refused." />
                </p>
                <Example stack files={code('Validation.tsx')}>
                    <Validation />
                </Example>
            </Section>

            <Section anchor="export" title="Creating an image">
                <p>
                    <Rich text="`toDataURL()` and `toSVG()` give an image with the text under the bars, in black on white unless you set other colors." />
                </p>
                <Example stack files={code('Export.tsx')}>
                    <Export />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new Barcode(props)` creates the code without JSX. Each prop is also a property." />
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
                    <Rich text="Events" />
                </h3>
                <ApiTable head={['Event', 'Type', 'Description']} rows={EVENTS} />
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
