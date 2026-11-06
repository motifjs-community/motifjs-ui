import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Guarded from './examples/Guarded';
import Labels from './examples/Labels';
import Programmatic from './examples/Programmatic';
import Screen from './examples/Screen';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly BottomNavigationItem[]>`', '`[]`', 'The destinations. The bar is designed for three to five; use a `Drawer` for more.'],
    ['value', '`Bind<string | number | null>`', '`null`', 'The `value` of the selected item. `x-model` provides two-way binding.'],
    ['label', '`Bind<string>`', 'The kit string “Navigation”', 'The accessible name of the bar.'],
    ['labelMode', "`Bind<'always' | 'active' | 'never'>`", "`'always'`", 'When items show their labels. A label out of view stays as the accessible name of the item.'],
    ['position', "`Bind<'fixed' | 'sticky' | 'static'>`", "`'fixed'`", 'How the bar stays on the page.'],
    ['hideOnScroll', '`Bind<boolean>`', '`false`', 'Moves the bar away while scrolling down, and brings it back while scrolling up.'],
    ['scrollTarget', '`Bind<HTMLElement | null>`', 'The nearest ancestor that scrolls', 'What `hideOnScroll` watches. Without a scrolling ancestor, it is the page.'],
];

const ITEM = [
    ['value', '`string | number`', 'Its position', 'What `value` is when this item is selected.'],
    ['text', '`Bind<string>`', '—', 'The label, which is also the accessible name.'],
    ['glyph, activeGlyph', '`Bind<string>`', "`''`", 'The glyph, and the glyph while selected.'],
    ['icon, activeIcon', '`Bind<IconSource | null>`', '`null`', 'An image, an element or a component, used instead of a glyph.'],
    ['href, rel, target', '`Bind<string>`', "`''`", 'Make the item a link. Use `rel: \'router\'` for routed pages.'],
    ['badge', '`Bind<number | null>`', '`null`', 'A count in a badge on the icon.'],
    ['dot', '`Bind<boolean>`', '`false`', 'A dot on the icon instead of a count.'],
    ['enabled, visible', '`Bind<boolean>`', '`true`', 'A disabled item is dimmed and cannot be selected. A hidden item is removed.'],
    ['click', '`(e) => void`', '—', 'Occurs when the item is pressed.'],
    ['data', '`unknown`', '—', 'A custom application value for the item.'],
];

const METHODS = [
    ['selectedItem', '`BottomNavigationItem | null`', 'The selected item.'],
    ['focus()', '`boolean`', 'Moves focus to the item Tab reaches.'],
];

const EVENTS = [
    ['onSelecting', '`{ value, previous, item, previousItem, originalEvent, source, cancel }`', 'Occurs before the selection changes. Setting `cancel` keeps the current item, and a link is not followed.'],
    ['onSelectionChanged', '`{ value, previous, item, previousItem, originalEvent, source }`', 'Occurs after the selection changes.'],
    ['onItemClick', '`{ item, value, originalEvent, source }`', 'Occurs when an item is pressed, after its own `click`.'],
];

const KEYS = [
    ['Tab', 'Moves focus into the bar, to the selected item, and out of it.'],
    ['Left, Right', 'Moves between the items, wrapping around at the ends. The direction follows the page.'],
    ['Home, End', 'Moves to the first or the last item.'],
    ['Enter, Space', 'Selects the focused item.'],
];

const A11Y = [
    ['Landmark', 'The bar is a `<nav>` with an accessible name.'],
    ['Selected item', '`aria-current="page"` marks it for screen readers.'],
    ['Disabled item', '`aria-disabled="true"`; the arrow keys pass over it.'],
    ['Focus', 'A bar moved away by `hideOnScroll` comes back when focus enters it.'],
];

const HOOKS = [
    ['.mx-bottom-navigation', 'The bar. `data-label-mode`, `data-position` and `data-hidden` describe its state.'],
    ['.mx-bottom-navigation__list, .mx-bottom-navigation__item', 'The row and an item. `data-selected` and `aria-disabled` describe an item.'],
    ['.mx-bottom-navigation__indicator, .mx-bottom-navigation__icon-host, .mx-bottom-navigation__glyph, .mx-bottom-navigation__icon, .mx-bottom-navigation__label, .mx-bottom-navigation__badge', 'The mark of the selected item, the box of the icon, its glyph or icon, the label and the badge.'],
];

const TOKENS = [
    ['bottom-navigation.bar, .list, .item, .indicator, .icon-host, .label', 'Units: the bar, the row, an item (`hover`, `pressed`, `focus`, `selected`, `disabled`), the mark (`selected`), the box of the icon and the label (`selected`).'],
];

export default function BottomNavigationPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The destinations of an application at the bottom of the screen, each an icon with a label. The bar is one Tab stop, marks the selected item for screen readers and keeps clear of the home indicator of a phone." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { BottomNavigation } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="Destinations">
                <p>
                    <Rich text="`items` defines the destinations, and `x-model` binds the selected one. `badge` shows a count on the icon, `dot` shows a dot, and `activeGlyph` changes the glyph while the item is selected." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="labels" title="Labels">
                <p>
                    <Rich text="`labelMode` shows the labels always, only on the selected item, or never. A label out of view stays as the accessible name of the item." />
                </p>
                <Example stack files={code('Labels.tsx')}>
                    <Labels />
                </Example>
            </Section>

            <Section anchor="selecting" title="Refusing a change">
                <p>
                    <Rich text="`onSelecting` occurs before the selection changes, and setting `cancel` keeps the current item." />
                </p>
                <Example stack files={code('Guarded.tsx')}>
                    <Guarded />
                </Example>
            </Section>

            <Section anchor="screen" title="In a screen">
                <p>
                    <Rich text="By default, the bar is fixed to the bottom of the viewport. In a box that scrolls, use `position='sticky'`. `hideOnScroll` moves it away while scrolling down." />
                </p>
                <Example stack files={code('Screen.tsx')}>
                    <Screen />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new BottomNavigation(props)` creates the bar without JSX. Each prop is also a property." />
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
                    <Rich text="Item fields" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={ITEM} />
                <h3>
                    <Rich text="Properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={METHODS} />
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
