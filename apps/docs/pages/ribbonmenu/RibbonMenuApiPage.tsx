import { ApiTable, Rich, Section } from '../../shared/doc';

const PROPS = [
    ['items', '`Bind<readonly RibbonTab[]>`', '`[]`', 'The tabs. Nothing is there until they are given.'],
    ['value', '`Bind<string | number | null>`', 'the first tab', 'The key of the tab shown. `x-model` provides two-way binding.'],
    ['label', '`Bind<string>`', 'the language pack', 'Names the tabs for assistive technology. The same property as `text`.'],
    ['layout', "`Bind<'classic' | 'simple'>`", "`'classic'`", 'The commands in columns under the names of their groups, or in a single row.'],
    ['layoutSwitch', '`Bind<boolean>`', '`true`', 'The button at the end of the commands that switches the layout.'],
    ['adaptive', '`Bind<boolean>`', '`true`', 'Groups give way step by step when the commands do not fit. Off, they only scroll.'],
    ['display', "`Bind<'always' | 'tabs' | 'auto'>`", "`'always'`", 'The commands always, only the tabs, or a strip that opens the menu over the page.'],
    ['appButton', '`Bind<string>`', 'none', 'The text of the button before the tabs. `&` gives it an access key.'],
    ['quickCommands', '`Bind<readonly RibbonCommand[]>`', '`[]`', 'The quick commands, pressed from any tab.'],
    ['quickBar', "`Bind<'start' | 'below' | 'hidden'>`", "`'start'`", 'Where the quick commands stand.'],
    ['barStart, barEnd', '`Bind<ComponentBase | null>`', 'none', 'Any content of the app at the start or the end of the row of tabs.'],
    ['keyHints', '`Bind<boolean>`', '`true`', 'Alt and F10 show the key hints.'],
    ['customizable', '`Bind<boolean>`', '`true`', 'The context menu that lets the user hide, move and add commands.'],
    ['customization', '`Bind<RibbonMenuCustomization | null>`', 'none', 'What the user changed, to give back: the menu starts from it.'],
    ['text, enabled, visible, tabStop, tabIndex', 'see Control', '', 'Props shared by all controls.']
];

const TAB = [
    ['key', '`string | number`', 'Finds the tab, and is `value` while it is shown. The default is its position.'],
    ['text', '`Bind<string>`', 'The text. `&` before a letter makes it the access key.'],
    ['hint', '`Bind<string>`', 'A tooltip.'],
    ['groups', '`Bind<readonly RibbonGroup[]>`', 'The groups, made the first time the tab is shown.'],
    ['context', '`Bind<string>`', 'Makes it a tab of a context, drawn in the context color.'],
    ['visible, enabled', '`Bind<boolean>`', '`false` removes or dims the tab.'],
    ['data', '`unknown`', 'A custom application value.']
];

const GROUP = [
    ['key', '`string | number`', 'Finds the group. The default is its position.'],
    ['text', '`Bind<string>`', 'The name under the commands.'],
    ['commands', '`Bind<readonly RibbonCommand[]>`', 'The commands.'],
    ['glyph, icon', '`Bind<string>`, `Bind<IconSource>`', 'Shown on the button the group folds into.'],
    ['priority', '`Bind<number>`', 'Lower gives way first. The default is `0`.'],
    ['collapsible', '`Bind<boolean>`', '`false` keeps it from folding or moving into the “more” menu.'],
    ['fixed', '`Bind<boolean>`', '`true` keeps the user from hiding or moving it.'],
    ['more, moreHint', '`(e) => void`, `Bind<string>`', 'The button beside the name, and its tooltip.'],
    ['visible', '`Bind<boolean>`', '`false` removes the group.'],
    ['data', '`unknown`', 'A custom application value.']
];

const COMMAND = [
    ['key', '`string | number`', 'Finds the command. The default is its position.'],
    ['type', '`Bind<RibbonCommandType>`', "`button`, `toggle`, `split`, `menu`, `row`, `content`, `gallery`, `separator`. The default is `'button'`."],
    ['text, hint', '`Bind<string>`', 'The text (`&` marks the access key) and a tooltip.'],
    ['glyph, icon', '`Bind<string>`, `Bind<IconSource>`', 'A glyph name, or an image, an element or a component.'],
    ['size', "`Bind<'large' | 'medium' | 'small'>`", "The default is `'medium'` (`'large'` for a gallery)."],
    ['pressed', '`Bind<boolean>`', 'The state of a toggle.'],
    ['menu', '`Bind<readonly MenuItem[]>`', 'The menu of a `menu` or `split` command.'],
    ['commands', '`Bind<readonly RibbonCommand[]>`', 'The commands of a `row`.'],
    ['content', '`() => ComponentBase`', 'The content of a `content` command, made once.'],
    ['items, value, columns', '`Bind<…>`', 'The choices of a `gallery`, the one marked as chosen, and how many stand in a row.'],
    ['simple', '`Bind<boolean>`', '`false` leaves it out of the simplified row.'],
    ['keyHint', '`Bind<string>`', 'The letters that press it while key hints are shown.'],
    ['fixed', '`Bind<boolean>`', '`true` keeps the user from hiding or moving it.'],
    ['enabled, visible', '`Bind<boolean>`', '`false` dims or removes the command.'],
    ['click', '`(e: RibbonCommandClickEventArgs) => void`', 'Occurs when it is pressed; for a gallery, `e.item` is the choice.'],
    ['data', '`unknown`', 'A custom application value.']
];

const MEMBERS = [
    ['select(key)', '`boolean`', 'Shows a tab, as a click does. `false` when `onSelecting` refused.'],
    ['findTab(key), findGroup(path), findCommand(path)', 'the object', 'Finds a tab by its key, a group or a command by its path (`tab/group/command`), as it is now.'],
    ['addTab, addGroup, addCommand, remove, move, update', '`boolean`', 'Changes by path; see [Programmatic changes](/ribbonmenu/programmatic). `false` when nothing changed.'],
    ['beginUpdate(), endUpdate()', '`void`', 'Holds the changes by path, then applies them at once.'],
    ['controlOf(command)', '`ComponentBase | null`', 'The control made for a command, once its tab has been shown.'],
    ['openOver(open)', '`void`', 'Opens or closes the commands over the page when only the tabs are shown or the menu hides itself.'],
    ['showKeyHints()', '`void`', 'Shows the key hints, as Alt does.'],
    ['refresh()', '`void`', 'Reads the tabs, groups and commands again after they were changed in place.'],
    ['shownKey, isOpenOver, isCompact', 'read-only', 'The tab shown, whether the commands are open over the page, whether the menu is compact.'],
    ['customization', '`RibbonMenuCustomization`', 'What the user changed so far.']
];

const EVENTS = [
    ['onSelecting', '`RibbonTabSelectingEventArgs`', 'Before another tab is shown. Setting `cancel` keeps the tab shown now.'],
    ['onSelectionChanged', '`RibbonTabSelectionChangedEventArgs`', 'After another tab is shown.'],
    ['onCommandClick', '`RibbonCommandClickEventArgs`', 'A command was pressed, after its own `click`.'],
    ['onGroupMore', '`RibbonGroupMoreEventArgs`', 'The button beside a group’s name was pressed.'],
    ['onLayoutChanged', '`RibbonMenuLayoutChangedEventArgs`', 'The user switched the layout.'],
    ['onDisplayChanged', '`RibbonMenuDisplayChangedEventArgs`', 'The user chose another way to show the commands.'],
    ['onCustomized', '`RibbonMenuCustomizedEventArgs`', 'The user hid, moved or added a command, or undid the changes.'],
    ['onItemsChanged', '`RibbonMenuItemsChangedEventArgs`', 'A change by path made a new list of tabs, to keep.'],
    ['onAppButton', '`RibbonAppButtonEventArgs`', 'The button before the tabs was pressed.']
];

const HOOKS = [
    ['.mx-ribbon-menu', 'The menu. `data-layout`, `data-display`, `data-floating`, `data-compact`.'],
    ['__reveal, __frame', 'The strip of a menu hidden automatically, and the frame it opens.'],
    ['__bar, __bar-start, __app, __quick, __picker, __tabs, __tab, __bar-end', 'The row of tabs and its parts. A tab has `data-key` and, of a context, `data-context`.'],
    ['__body, __stage, __panel, __scroll, __switch', 'The surface of the commands, where they scroll, a tab’s groups, the scroll buttons and the layout button.'],
    ['__group, __group-inner, __commands, __group-foot, __group-label, __more, __fold, __drop, __divider', 'A group and its parts. `data-folded`, `data-out`.'],
    ['__command, __row, __content, __separator, __gallery, __tile, __overflow', 'Commands; `data-ribbon-size` is the size drawn.'],
    ['__hints, __hint', 'The key hints.']
];

const TOKENS = [
    ['ribbon-menu.rows, row-height, compact-size, indicator-inset, font-family', 'The rows of a group and their height, the width under which the menu is compact, the inset of the mark of the tab shown, the font.'],
    ['ribbon-menu.large, medium, small, more, switch, scroll, picker, gallery-open', 'Places: the variant, tone and size of the buttons the menu draws.'],
    ['ribbon-menu.tab, indicator, context-band, app, quick, reveal, frame, body, stage', 'Units of the row of tabs and the surfaces.'],
    ['ribbon-menu.panel, group, commands, group-foot, group-label, divider, separator, row, large-face, large-icon', 'Units of the groups and commands.'],
    ['ribbon-menu.gallery, gallery-grid, tile, tile-icon, drop, hint', 'Units of galleries, folded groups and key hints.']
];

export default function RibbonMenuApiPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Everything `RibbonMenu` takes, offers and reports. Every prop is also a settable property, and a function is followed." />
            </p>

            <Section anchor="props" title="Props">
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
            </Section>

            <Section anchor="tab" title="RibbonTab">
                <ApiTable head={['Field', 'Type', 'Description']} rows={TAB} />
            </Section>

            <Section anchor="group" title="RibbonGroup">
                <ApiTable head={['Field', 'Type', 'Description']} rows={GROUP} />
            </Section>

            <Section anchor="command" title="RibbonCommand">
                <ApiTable head={['Field', 'Type', 'Description']} rows={COMMAND} />
                <p>
                    <Rich text="A gallery’s `RibbonGalleryItem` has `key`, `text`, `glyph`, `icon`, `hint`, `enabled` and `data`." />
                </p>
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
