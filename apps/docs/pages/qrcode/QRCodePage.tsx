import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Export from './examples/Export';
import Levels from './examples/Levels';
import Logo from './examples/Logo';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['value', '`Bind<string>`', "`''`", 'The text of the code. It may hold any characters.'],
    ['level', "`Bind<'L' | 'M' | 'Q' | 'H'>`", "`'M'`", 'How much of the code can be damaged: about 7, 15, 25 or 30 percent.'],
    ['size', '`Bind<number | null>`', 'From the design language', 'The width and height in pixels.'],
    ['margin', '`Bind<number>`', '`4`', 'The quiet zone around the code, in modules. Readers need at least `4`.'],
    ['logo', '`Bind<string | null>`', '`null`', 'The address of an image in the middle of the code. Use level `H` with it.'],
    ['logoSize', '`Bind<number>`', '`0.2`', 'The share of the code the logo covers, at most `0.3`.'],
    ['label', '`Bind<string>`', 'The kit string “QR code: …”', 'The accessible name.'],
];

const MEMBERS = [
    ['isInvalid', '`boolean`', 'Indicates that the value could not be drawn.'],
    ['modules', '`number`', 'The number of modules along a side of the code, without its margin.'],
    ['toSVG(options?)', '`string`', 'The code as an SVG document. The logo is not part of it.'],
    ['toDataURL(type?, options?)', '`string`', 'The code as a data URL, a PNG by default. The logo is not part of it.'],
];

const OPTIONS = [
    ['size', '`number`', '`512`', 'The width and height in pixels, rounded to whole modules.'],
    ['color', '`string`', "`'#000000'`", 'The color of the modules.'],
    ['background', '`string`', "`'#ffffff'`", 'The background.'],
];

const EVENTS = [
    ['onEncodeFailed', '`{ value, source }`', 'Occurs when the text does not fit in a code, which then draws nothing.'],
];

const A11Y = [
    ['Name', 'The code has the role `img`, and its name holds the text, so a screen reader can read it.'],
    ['Colors', 'A code stays dark on a light sheet in every theme, as readers expect.'],
    ['Size', 'For printing, keep a module at least 0.4 mm wide, and leave the quiet zone in place.'],
];

const HOOKS = [
    ['.mx-qr-code', 'The sheet. `data-invalid` says the value could not be drawn.'],
    ['.mx-qr-code__svg, .mx-qr-code__logo', 'The code and the logo.'],
];

const TOKENS = [
    ['qr-code.size', 'The width and height.'],
    ['qr-code.sheet, .logo', 'Units: the sheet, whose `color` is the color of the modules, and the logo.'],
];

export default function QRCodePage() {
    return (
        <>
            <p class="lead">
                <Rich text="A QR code, drawn as vectors so that it stays sharp at any size. It has no dependencies, chooses the smallest version that holds the text, and can carry a logo." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { QRCode } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="A code from a text">
                <p>
                    <Rich text="`value` is the text of the code, and the code follows it. Change the text to see the code grow." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="levels" title="Error correction">
                <p>
                    <Rich text="`level` sets how much of the code can be damaged. A higher level holds less text, so the code grows." />
                </p>
                <Example stack files={code('Levels.tsx')}>
                    <Levels />
                </Example>
            </Section>

            <Section anchor="logo" title="A logo">
                <p>
                    <Rich text="`logo` puts an image in the middle, which takes the place of some modules. Level `H` restores what it covers. `logoSize` sets its share, at most `0.3`." />
                </p>
                <Example stack files={code('Logo.tsx')}>
                    <Logo />
                </Example>
            </Section>

            <Section anchor="export" title="Creating an image">
                <p>
                    <Rich text="`toDataURL()` and `toSVG()` give an image, in black on white unless you set other colors. `onEncodeFailed` occurs when a text does not fit in a code." />
                </p>
                <Example stack files={code('Export.tsx')}>
                    <Export />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new QRCode(props)` creates the code without JSX. Each prop is also a property." />
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
