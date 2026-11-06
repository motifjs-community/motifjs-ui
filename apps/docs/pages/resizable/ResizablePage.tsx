import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Area from './examples/Area';
import Basic from './examples/Basic';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['handles', '`Bind<ResizeHandles>`', "`'all'`", '`all`, `edges`, `corners`, or a list of `top`, `bottom`, `start`, `end`, `top-start`, `top-end`, `bottom-start`, `bottom-end`.'],
    ['minWidth, minHeight', '`Bind<number>`', '`30`', 'The least width and height, in pixels.'],
    ['maxWidth, maxHeight', '`Bind<number | null>`', '`null`', 'The most width and height, in pixels; `null` for no limit.'],
    ['area', "`Bind<'parent' | HTMLElement | null>`", '`null`', 'The box stays inside this: its parent, or an element it lies in.'],
    ['keepAspectRatio', '`Bind<boolean>`', '`false`', 'The width and the height keep their ratio.'],
    ['step', '`Bind<number>`', '`10`', 'Pixels an arrow key changes a side by.'],
    ['width, height', '`Bind<number | string | null>`', '`null`', 'The size to start with, a CSS length or pixels; without one the content decides.'],
    ['size', '`Bind<ResizeSize | null>`', '`null`', 'The size in pixels: given, it is applied; after every resize the new one is written to `x-model`.']
];

const MEMBERS = [
    ['onResizeStarting', 'event', 'A resize is about to begin from a handle (`edge`, `width`, `height`); `cancel = true` keeps the size.'],
    ['onResizing', 'event', 'The box is being resized (`edge`, `width`, `height` so far).'],
    ['onResized', 'event', 'A resize ended: the pointer let go, or a key moved a side.'],
    ['currentSize', 'read-only', 'The size in pixels now.'],
    ['gripElement', 'read-only', 'The grip in the end corner, the Tab stop that takes the keys.']
];

const KEYS = [
    ['Tab', 'The grip in the end corner is the one stop.'],
    ['Arrow keys', 'On the grip: Left and Right change the width by `step` (the other way round in a right-to-left page), Up and Down the height; within the limits, the area and the ratio.']
];

const A11Y = [
    ['The grip', 'A button named “Resize” in the kit language; the new size is read out after every change (“Width 320, height 200”).'],
    ['The handles', 'Strips along the sides and corners for the pointer only, hidden from readers; the grip gives the keys the same.'],
    ['Content', 'The JSX children are the content, untouched: a panel, a picture, a form.']
];

const HOOKS = [
    ['.mx-resizable', 'The box. `data-resizing` and `data-edge` while a handle is dragged; `data-disabled`.'],
    ['.mx-resizable__frame, .mx-resizable__handle', 'The frame over the box and its eight handles (`data-edge`, `data-active` while dragged, `hidden` when not asked for).'],
    ['.mx-resizable__grip, .mx-resizable__grip-glyph', 'The grip in the end corner and its glyph.']
];

const TOKENS = [
    ['resizable.box, .handle, .grip, .grip-glyph', 'Units: the box (`resizing`), a handle (`hover`, `active`, `corner`), the grip (`hover`, `pressed`, `focus`) and its glyph (`icon`).'],
    ['resizable.edge', 'How wide a strip along a side takes the pointer; a corner takes twice that each way.']
];

export default function ResizablePage() {
    return (
        <>
            <p class="lead">
              <Rich text="A box the user resizes from its sides and corners with the pointer, or with the arrow keys on the grip in its end corner. It keeps to its least and most sizes, stays inside an area when told, and can keep its shape." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Resizable } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Sides, corners and the grip">
                <p>
                    <Rich text="The JSX children are the content. `handles` says which sides and corners take the pointer (`all` by default); the grip in the end corner is the Tab stop, and the arrow keys change the size by `step`. `minWidth`, `minHeight`, `maxWidth` and `maxHeight` hold it. A box laid out by its position (`absolute`, `fixed`) also moves when a start or top side is dragged, so the far side stays; one in the flow only changes size." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="area" title="Inside an area, keeping its shape">
                <p>
                    <Rich text="`area` keeps the box inside its parent, or inside an element given; `keepAspectRatio` changes the other side along. Here only the end side, the bottom and the corner between them resize the picture." />
                </p>
                <Example stack files={code('Area.tsx')}>
                    <Area />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`size` gives the size in pixels and `x-model` takes it back after every resize (`onResized` tells too): a layout kept and restored, or set by a button." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'What it does']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'How']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
