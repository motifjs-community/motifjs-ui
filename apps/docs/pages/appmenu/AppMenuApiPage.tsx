import { ApiTable, Rich, Section } from '../../shared/doc';

const PROPS = [
    ['items', '`Bind<readonly AppMenuItem[]>`', '`[]`', 'The items. Nothing is there until they are given.'],
    ['value', '`Bind<boolean>`', '`false`', 'Whether the menu is open. `x-model` provides two-way binding.'],
    ['selected', '`Bind<string | number | null>`', 'the first page item', 'The key of the page item shown.'],
    ['label', '`Bind<string>`', 'the language pack', 'Names the menu for assistive technology.'],
    ['closeOnCommand', '`Bind<boolean>`', '`true`', 'A command or a link closes the menu. Each item can say otherwise (`closeOnClick`).'],
    ['listHeader, listFooter', '`Bind<ComponentBase | null>`', 'none', 'Any content of the app above and under the items.'],
    ['searchEnabled', '`Bind<boolean>`', '`false`', 'A search field above the items.'],
    ['searchText', '`Bind<string>`', "`''`", 'The text searched for.'],
    ['modal, scrim, closeOnEscape, closeOnScrim, closeOnBack, focusOnOpen, returnFocus, container, disposeOnClose', 'see BottomSheet', '', 'Props shared by all overlay panels, as listed on the [BottomSheet page](/bottomsheet#api).']
];

const ITEM = [
    ['key', '`string | number`', 'Finds the item, and is `selected` while its page is shown. The default is its position.'],
    ['text, hint', '`Bind<string>`', 'The text (`&` marks the access key) and a tooltip.'],
    ['glyph, icon', '`Bind<string>`, `Bind<IconSource>`', 'A glyph name, or an image address or a component.'],
    ['page', '`() => ComponentBase`', 'Makes it a page item. The page is made the first time it is shown, and kept.'],
    ['href, rel, target', '`Bind<string>`', 'Makes it a link.'],
    ['badge, dot', '`Bind<number | null>`, `Bind<boolean>`', 'A count in a badge, or a dot.'],
    ['group', '`Bind<string>`', 'Items of the same group stand together, with a line between groups.'],
    ['bottom', '`Bind<boolean>`', 'Puts the item in the list at the bottom.'],
    ['enabled, visible', '`Bind<boolean>`', '`false` dims or removes the item.'],
    ['closeOnClick', '`Bind<boolean>`', 'Whether pressing a command or a link closes the menu.'],
    ['click', '`(e: AppMenuItemClickEventArgs) => void`', 'Occurs when the item is pressed; `e.keepOpen` keeps the menu open.'],
    ['data', '`unknown`', 'A custom application value.']
];

const MEMBERS = [
    ['open(), close(reason?), toggle(), show(host)', '`boolean`', 'As on every overlay panel.'],
    ['select(key), openAt(key)', '`boolean`', 'Shows a page, as a click does, or opens the menu on it. `false` when `onSelecting` refused.'],
    ['pageOf(key)', '`ComponentBase | null`', 'The page of an item, once it has been shown.'],
    ['addItem, removeItem, moveItem, updateItem', '`boolean`', 'Changes by key; see [Programmatic changes](/appmenu/programmatic).'],
    ['findItem(key)', '`AppMenuItem | null`', 'The item as it is now.'],
    ['beginUpdate(), endUpdate()', '`void`', 'Holds the changes by key, then applies them at once.'],
    ['isOpen, shownKey', 'read-only', 'Whether it is open, and the key of the page shown.']
];

const EVENTS = [
    ['onSelecting', '`AppMenuSelectingEventArgs`', 'Before another page is shown. Setting `cancel` keeps the page shown now.'],
    ['onSelectionChanged', '`AppMenuSelectionChangedEventArgs`', 'After another page is shown.'],
    ['onItemClick', '`AppMenuItemClickEventArgs`', 'An item was pressed, after its own `click`.'],
    ['onSearchTextChanged', '`AppMenuSearchTextChangedEventArgs`', 'The user typed in the search field.'],
    ['onItemsChanged', '`AppMenuItemsChangedEventArgs`', 'A change by key made a new list of items, to keep.'],
    ['onOpening, onOpened, onClosing, onClosed', 'see BottomSheet', 'As on every overlay panel.']
];

const HOOKS = [
    ['.mx-app-menu', 'The layer. `data-full`, `data-stacked`, `data-view` (`list` or `page`), `data-turn` while the list and the page take turns.'],
    ['__panel, __nav, __close', 'The panel, the list’s column and its close button.'],
    ['__header-slot, __search, __list, __list--bottom, __no-match, __footer-slot', 'The parts of the list’s column, top to bottom.'],
    ['__item, __icon, __label, __badge, __separator', 'An item and its parts. `data-selected`, `data-key`.'],
    ['__page, __page-head, __back, __view', 'The page area, the row with the back button, and each item’s page.']
];

const TOKENS = [
    ['app-menu.share, min-size, split-size, nav-size, font-family', 'The share of the window, the width under which it takes the whole window, the width under which list and page take turns, the list’s width, the font.'],
    ['app-menu.close-button, back-button', 'Places: the variant, tone and size of its buttons.'],
    ['app-menu.scrim, panel, nav, list, separator, item, indicator, icon, label', 'Units of the panel and the list.'],
    ['app-menu.header-slot, search, no-match, footer-slot', 'Units of the parts above and under the items.'],
    ['app-menu.page, page-head, view', 'Units of the page area.']
];

export default function AppMenuApiPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Everything `AppMenu` takes, offers and reports. Every prop is also a settable property, and a function is followed." />
            </p>

            <Section anchor="props" title="Props">
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
            </Section>

            <Section anchor="item" title="AppMenuItem">
                <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
            </Section>

            <Section anchor="members" title="Members">
                <ApiTable head={['Member', 'Returns', 'Description']} rows={MEMBERS} />
            </Section>

            <Section anchor="events" title="Events">
                <ApiTable head={['Event', 'Arguments', 'Description']} rows={EVENTS} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                    <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>
        </>
    );
}
