import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Area from './examples/Area';
import Basic from './examples/Basic';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['handles', '`Bind<ResizeHandles>`', "`'all'`", '`all`, `edges`, `corners`, or a list of `top`, `bottom`, `start`, `end`, `top-start`, `top-end`, `bottom-start` and `bottom-end`.'],
    ['minWidth, minHeight', '`Bind<number>`', '`30`', 'The minimum width and height, in pixels.'],
    ['maxWidth, maxHeight', '`Bind<number | null>`', '`null`', 'The maximum width and height, in pixels. `null` means no limit.'],
    ['area', "`Bind<'parent' | HTMLElement | null>`", '`null`', 'The area the box stays inside: its parent, or an element that contains it.'],
    ['keepAspectRatio', '`Bind<boolean>`', '`false`', 'Preserves the ratio of width to height.'],
    ['step', '`Bind<number>`', '`10`', 'The number of pixels an arrow key changes an edge.'],
    ['width, height', '`Bind<number | string | null>`', '`null`', 'The initial size, as a CSS length or in pixels. Without it, the content determines the size.'],
    ['size', '`Bind<ResizeSize | null>`', '`null`', 'The size in pixels. When set, it is applied, and after every resize the new size is written to `x-model`.']
];

const MEMBERS = [
    ['onResizeStarting', 'event', 'Occurs before a resize starts from a handle (`edge`, `width`, `height`). Set `cancel = true` to keep the size.'],
    ['onResizing', 'event', 'Occurs while the box is being resized (`edge`, and the current `width` and `height`).'],
    ['onResized', 'event', 'Occurs when a resize ends, either when the pointer is released or when a key moves an edge.'],
    ['currentSize', 'read-only', 'The current size in pixels.'],
    ['gripElement', 'read-only', 'The grip in the end corner, which is the Tab stop for keyboard resizing.']
];

const KEYS = [
    ['Tab', 'The grip in the end corner is the only Tab stop.'],
    ['Arrow keys', 'On the grip, Left and Right change the width by `step` (reversed on right-to-left pages), and Up and Down change the height, within the limits, the area and the aspect ratio.']
];

const A11Y = [
    ['The grip', 'A button named “Resize” in the kit language. The new size is announced after every change (“Width 320, height 200”).'],
    ['The handles', 'Strips along the edges and corners for pointer use only, hidden from screen readers. The grip provides the same function for the keyboard.'],
    ['Content', 'JSX children are the content and are left unchanged, such as a panel, an image or a form.']
];

const HOOKS = [
    ['.mx-resizable', 'The box. `data-resizing` and `data-edge` while a handle is dragged, and `data-disabled`.'],
    ['.mx-resizable__frame, .mx-resizable__handle', 'The frame over the box and its eight handles (`data-edge`, `data-active` during a drag, and `hidden` when not enabled).'],
    ['.mx-resizable__grip, .mx-resizable__grip-glyph', 'The grip in the end corner and its glyph.']
];

const TOKENS = [
    ['resizable.box, .handle, .grip, .grip-glyph', 'Units: the box (`resizing`), a handle (`hover`, `active`, `corner`), the grip (`hover`, `pressed`, `focus`) and its glyph (`icon`).'],
    ['resizable.edge', 'The width of the pointer target along an edge. A corner is twice that in each direction.']
];

export default function ResizablePage() {
    return (
        <>
            <p class="lead">
              <Rich text="A box that users can resize from its edges and corners with the pointer, or with the arrow keys on the grip in its end corner. It respects minimum and maximum sizes, can stay within an area, and can preserve its aspect ratio." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Resizable } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Edges, corners and the grip">
                <p>
                    <Rich text="JSX children are the content. `handles` sets which edges and corners respond to the pointer (`all` by default). The grip in the end corner is the Tab stop, and the arrow keys change the size by `step`. `minWidth`, `minHeight`, `maxWidth` and `maxHeight` set the limits. A box positioned with `absolute` or `fixed` also moves when its start or top edge is dragged, so the opposite edge stays in place. A box in the normal flow only changes size." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="area" title="Staying within an area and keeping the aspect ratio">
                <p>
                    <Rich text="`area` keeps the box inside its parent or a specified element, and `keepAspectRatio` adjusts the other dimension. In this example, only the end edge, the bottom edge and the corner between them resize the image." />
                </p>
                <Example stack files={code('Area.tsx')}>
                    <Area />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`size` sets the size in pixels, and `x-model` receives it after every resize (`onResized` also reports it). Use this to save and restore a layout, or to set the size from a button." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
