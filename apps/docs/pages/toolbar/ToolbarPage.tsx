import { reactive } from '@motifx/core';
import { Button, enStrings, TextBox, Toolbar, ToolbarSeparator, trStrings, uiLocale, type ControlSize, type ToolbarItem, type ToolbarOverflow } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

function icon(d: string) {
  return () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');
const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');
const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');
const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');
const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');
const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');
const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');
const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');
const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');
const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];
const OVERFLOWS: ToolbarOverflow[] = ['menu', 'wrap', 'scroll'];

const PROPS = [
  ['items', '`Bind<readonly ToolbarItem[]>`', '`[]`', 'Items as data, drawn before the JSX children (see Items).'],
  ['label', '`Bind<string>`', "`''`", 'Names the toolbar for screen readers (`aria-label`). The same property as `text`.'],
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'horizontal'`", 'Which way it runs; the arrow keys follow it.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'Given to the controls inside that have no `size` of their own.'],
  ['buttonVariant', '`Bind<ButtonVariant>`', "`'ghost'`", 'Given to the buttons inside that have no `variant` of their own.'],
  ['overflow', "`Bind<'menu' | 'wrap' | 'scroll'>`", "`'menu'`", '`menu`: what does not fit goes into a “more” menu at the end; `wrap`: a second row; `scroll`: the bar scrolls.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', '`enabled={false}` disables every control inside.'],
];

const ITEM = [
  ['type', "`Bind<'button' | 'toggle' | 'separator' | 'menu'>`", "Default `'button'`."],
  ['text, icon, hint', '`Bind<…>`', 'The caption (`&Bold` is an access key), an icon, a tooltip. A button with only an icon is named by its `hint`.'],
  ['pressed', '`Bind<boolean>`', 'A toggle’s state. As a function the item follows the app: its `click` changes what it reads.'],
  ['enabled, visible', '`Bind<boolean>`', 'Dimmed, or left out.'],
  ['menu', '`Bind<readonly MenuItem[]>`', 'The commands of a `menu` item: submenus, check and radio items, shortcuts.'],
  ['overflow', "`Bind<'auto' | 'always' | 'never'>`", 'Whether it may move into the “more” menu; wins over the toolbar. A JSX child says it with `data-overflow`.'],
  ['click', '`(e) => void`', 'Pressed, in the bar or in the “more” menu. `e`: `{ item, source, event }`.'],
  ['data', '`unknown`', 'Your own value.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['overflowed', 'read-only, reactive', 'The controls in the “more” menu now.'],
];

const METHODS = [
  ['controlOf(item)', '`Control | null`', 'The control made for an item of `items`.'],
  ['updateOverflow()', '`void`', 'Works out again what fits, e.g. after a control changed its width.'],
  ['focus()', '`boolean`', 'Focuses the control Tab reaches.'],
];

const EVENTS = [['onItemClick(e)', 'An item of `items` was pressed, after its own `click`. `e`: `{ item, source, event }`.']];

const KEYS = [
  ['Tab', 'Into the toolbar, to the control used last; Tab again leaves it.'],
  ['Right / Left', 'The next / previous control, wrapping around (Left / Right in a right-to-left page). Down / Up when vertical.'],
  ['Home / End', 'The first / last control.'],
  ['In a text field', 'The arrows, Home and End move in the text; Tab leaves.'],
  ['Down on a menu button', 'Opens its menu (horizontal toolbar).'],
];

const A11Y = [
  ['Role', '`role="toolbar"` with `aria-orientation`, named by `label`.'],
  ['Focus', 'One Tab stop: the control used last has `tabindex="0"`, the others `-1` (roving tabindex).'],
  ['Separators', '`role="separator"`, turned across the toolbar.'],
  ['Toggles', 'Toggle items are buttons with `aria-pressed`.'],
  ['“More” menu', 'A menu button named from `uiLocale` (“More options”); the items keep their names (an icon-only button its `hint` or `aria-label`), toggles become check items, menu buttons submenus.'],
];

const HOOKS = [
  ['.mx-toolbar', 'The toolbar. `data-orientation`, `data-size`, `data-overflow`, `data-disabled`.'],
  ['.mx-toolbar__separator', 'A separator.'],
  ['.mx-toolbar__more', 'The “more” button (a `Button` with a menu).'],
  ['[data-overflowed]', 'On a control that is in the “more” menu now.'],
];

const TOKENS = [
  ['toolbar.height, toolbar.padding, toolbar.gap', 'The bar’s height (the density-aware bar height), padding and spacing.'],
  ['toolbar.radius, toolbar.background', 'Its corners and fill (the bar color).'],
  ['toolbar.separator-color, toolbar.separator-width, toolbar.separator-inset', 'The separators.'],
];

export default function ToolbarPage() {
  const s = reactive({
    bold: true,
    italic: false,
    underline: false,
    align: 'left' as 'left' | 'center' | 'right',
    log: 'Nothing yet.',
    width: 100,
    overflow: 'menu' as ToolbarOverflow,
    size: 'md' as ControlSize,
    vertical: false,
    lang: 'en',
  });
  let added = 0;
  let coded: Toolbar | null = null;

  const did = (what: string) => (s.log = what);
  const align = (value: 'left' | 'center' | 'right', hint: string, Icon: typeof BoldIcon): ToolbarItem => ({
    type: 'toggle',
    icon: () => <Icon />,
    hint,
    pressed: () => s.align === value,
    click: () => (s.align = value),
  });

  const editor: ToolbarItem[] = [
    { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },
    { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },
    { type: 'separator' },
    { type: 'toggle', icon: () => <BoldIcon />, hint: 'Bold', pressed: () => s.bold, click: () => (s.bold = !s.bold) },
    { type: 'toggle', icon: () => <ItalicIcon />, hint: 'Italic', pressed: () => s.italic, click: () => (s.italic = !s.italic) },
    { type: 'toggle', icon: () => <UnderlineIcon />, hint: 'Underline', pressed: () => s.underline, click: () => (s.underline = !s.underline) },
    { type: 'separator' },
    align('left', 'Align left', AlignLeftIcon),
    align('center', 'Center', AlignCenterIcon),
    align('right', 'Align right', AlignRightIcon),
    { type: 'separator' },
    {
      type: 'menu',
      text: 'Insert',
      menu: [
        { text: '&Link', icon: () => <LinkIcon />, shortcut: 'Ctrl+K', click: () => did('Insert link') },
        { text: '&Image', icon: () => <ImageIcon />, click: () => did('Insert image') },
        { text: '&Table', items: [2, 3, 4].map((n) => ({ text: `${n} × ${n}`, click: () => did(`Insert a ${n} × ${n} table`) })) },
      ],
    },
    { text: '&Publish', click: () => did('Publish'), overflow: 'never' },
  ];

  const addFromCode = () => {
    const button = new Button({ text: `Button ${++added}`, onclick: () => did(`Button ${added} pressed`) });
    coded?.controls.add(button);
  };

  const preview = () =>
    `font-weight: ${s.bold ? 600 : 400}; font-style: ${s.italic ? 'italic' : 'normal'}; text-decoration: ${s.underline ? 'underline' : 'none'}; text-align: ${s.align}; inline-size: 100%; margin: 0`;

  return (
    <>
      <p class="lead">
        A bar of commands: buttons, toggle buttons, menus and fields in groups between separators. It is one Tab stop and the
        arrow keys move inside it; items that do not fit move into a “more” menu at the end. Items come as data, as JSX
        children, or both.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Toolbar, ToolbarSeparator, type ToolbarItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="`items` describes the commands as data, each field a value or a function; JSX children (any control) come after them. From code, a toolbar is filled like any control: `toolbar.controls.add(button)`. Every prop is also a property." />
        </p>
        <Example
          title="An editor toolbar"
          code={`
<Toolbar label="Format" items={[
  { icon: () => <UndoIcon />, hint: 'Undo', click: () => this.doc.undo() },
  { type: 'separator' },
  { type: 'toggle', icon: () => <BoldIcon />, hint: 'Bold',
    pressed: () => this.doc.bold, click: () => (this.doc.bold = !this.doc.bold) },
  { type: 'separator' },
  { type: 'toggle', icon: () => <AlignLeftIcon />, hint: 'Align left',
    pressed: () => this.doc.align === 'left', click: () => (this.doc.align = 'left') },
  // …center, right
  { type: 'menu', text: 'Insert', menu: [{ text: '&Link', shortcut: 'Ctrl+K', click: … }] },
  { text: '&Publish', click: () => this.publish(), overflow: 'never' },
]} />
`}
          stack
        >
          <Toolbar label="Format" items={editor} style="inline-size: 100%" />
          <p style={preview}>The quick brown fox jumps over the lazy dog.</p>
          <output class="tb-log">{() => s.log}</output>
        </Example>
        <Example
          title="Filled from code"
          code={`
const bar = new Toolbar({ label: 'Actions', size: 'sm' });
this.host.controls.add(bar);
bar.controls.add(new Button({ text: 'Refresh', onclick: () => this.load() }));
`}
          stack
        >
          <Button text="Add a button from code" variant="outline" onclick={addFromCode} />
          <Toolbar ref={(t: Toolbar) => (coded = t)} label="Actions" size="sm" style="inline-size: 100%">
            <Button text="First" onclick={() => did('First pressed')} />
          </Toolbar>
        </Example>
      </Section>

      <Section anchor="groups" title="Toggle groups and separators">
        <p>
          <Rich text="A `toggle` item is a toggle button (`aria-pressed`). Bound to the app with a function, it shows the app’s state: Bold, Italic and Underline above are three independent toggles, the alignment buttons a group where one is pressed. `separator` items (or `<ToolbarSeparator />`) draw the lines between groups." />
        </p>
        <Example
          code={`
<Toolbar label="Text">
  <Button icon={() => <BoldIcon />} aria-label="Bold" toggle x-model={() => this.doc.bold} />
  <ToolbarSeparator />
  <Button text="Clear" onclick={() => this.doc.clear()} />
</Toolbar>
`}
        >
          <Toolbar label="Text">
            <Button icon={() => <BoldIcon />} aria-label="Bold" toggle x-model={() => s.bold} />
            <Button icon={() => <ItalicIcon />} aria-label="Italic" toggle x-model={() => s.italic} />
            <ToolbarSeparator />
            <Button
              text="Clear"
              onclick={() => {
                s.bold = s.italic = s.underline = false;
              }}
            />
          </Toolbar>
        </Example>
      </Section>

      <Section anchor="overflow" title="Overflow">
        <p>
          <Rich text="With `overflow` set to `menu` (the default) the items that do not fit move into a “more” menu at the end, from the last one back; the toolbar watches its own size. There they keep their names (an icon-only button its `hint` or `aria-label`), a toggle becomes a check item and a menu button a submenu. An item’s `overflow` says `always` or `never`; fields stay in the bar. `wrap` starts a second row, `scroll` lets the bar scroll." />
        </p>
        <Example
          code={`
<Toolbar label="Format" items={items} overflow="menu" />
<Toolbar label="Format" items={items} overflow="wrap" />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Width">
            {[100, 70, 45, 25].map((width) => (
              <Button key={width} text={`${width}%`} size="sm" variant={() => (s.width === width ? 'solid' : 'ghost')} aria-pressed={() => s.width === width} onclick={() => (s.width = width)} />
            ))}
          </div>
          <div class="docs-flow" role="group" aria-label="Overflow">
            {OVERFLOWS.map((mode) => (
              <Button key={mode} text={mode} size="sm" variant={() => (s.overflow === mode ? 'solid' : 'ghost')} aria-pressed={() => s.overflow === mode} onclick={() => (s.overflow = mode)} />
            ))}
          </div>
          <div class="tb-frame" style={() => `inline-size: ${s.width}%`}>
            <Toolbar label="Format (narrow)" items={editor} overflow={() => s.overflow} />
          </div>
        </Example>
      </Section>

      <Section anchor="look" title="Orientation, size, fields">
        <p>
          <Rich text="`size` and `buttonVariant` reach the controls inside that have none of their own. A vertical toolbar moves with Up and Down. A text field inside keeps the arrow keys for its text." />
        </p>
        <Example
          code={`
<Toolbar label="Find" size="sm">
  <Button text="Previous" />
  <TextBox label="Find" labelMode="hidden" placeholder="Find" />
  <Button text="Next" />
</Toolbar>
<Toolbar label="Tools" orientation="vertical" items={tools} />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Size">
            {SIZES.map((size) => (
              <Button key={size} text={size} size="sm" variant={() => (s.size === size ? 'solid' : 'ghost')} aria-pressed={() => s.size === size} onclick={() => (s.size = size)} />
            ))}
            <Button text="Vertical" size="sm" toggle x-model={() => s.vertical} />
          </div>
          <Toolbar label="Find" size={() => s.size}>
            <Button text="Previous" onclick={() => did('Previous')} />
            <TextBox label="Find" labelMode="hidden" placeholder="Find" />
            <Button text="Next" onclick={() => did('Next')} />
          </Toolbar>
          <Toolbar
            label="Tools"
            size={() => s.size}
            orientation={() => (s.vertical ? 'vertical' : 'horizontal')}
            items={[
              { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },
              { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },
              { type: 'separator' },
              { icon: () => <LinkIcon />, hint: 'Link', click: () => did('Link') },
              { icon: () => <ImageIcon />, hint: 'Image', enabled: false },
            ]}
          />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The only text a toolbar writes itself is the name of its “more” button, from `uiLocale.strings.moreOptions`." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;   // "Diğer seçenekler"
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
          <span>
            The “more” button is named <output class="tb-more-name">{() => uiLocale.strings.moreOptions}</output>
          </span>
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>ToolbarItem</h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}

