import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import NavigationDemo from './examples/NavigationDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[AppBar](/appbar)', 'The bar at the top of an application.'],
    ['[MenuBar and ContextMenu](/menus)', 'The menus of an application and the menu of an element, with shortcuts, check items and access keys.'],
    ['[Toolbar](/toolbar)', 'A row of commands that moves what does not fit into a menu.'],
    ['[BottomNavigation](/bottomnavigation)', 'The main places of an application at the bottom of a phone screen.'],
    ['[Tabs](/tabs)', 'Views of the same thing, one at a time.'],
    ['[Breadcrumb](/breadcrumb)', 'Where the reader is in a hierarchy.'],
    ['[Pagination](/pagination)', 'Pages of a long list.'],
    ['[Stepper](/stepper) and [Wizard](/wizard)', 'A task in steps, with or without the pages of each step.'],
    ['[Accordion](/accordion)', 'Sections that expand and collapse.'],
    ['[MultiView](/multiview)', 'Pages swiped one after another.'],
    ['[Window](/window), [BottomSheet](/bottomsheet), [Drawer](/drawer), [ActionSheet](/actionsheet)', 'Panels over the page: a window, a sheet from the bottom, a drawer from a side, actions on a phone.'],
    ['[Layout](/layout), [Splitter](/splitter), [Resizable](/resizable)', 'Stacks, grids, docked panels, and panels the reader resizes.'],
    ['[Draggable](/draggable), [Sortable](/sortable), [ScrollView](/scrollview), [FormLayout](/formlayout)', 'Dragging, reordering, scrolling with pull to refresh, and forms laid out from data.'],
];

const CHOOSE = [
    ['Switch between views of the same thing', '[Tabs](/tabs)'],
    ['Show where the reader is', '[Breadcrumb](/breadcrumb)'],
    ['Guide a task in order', '[Wizard](/wizard), or [Stepper](/stepper) for the steps alone'],
    ['Split a long list', '[Pagination](/pagination)'],
    ['Fold away sections', '[Accordion](/accordion)'],
    ['Give an application its menu', '[Drawer](/drawer), or [AppBar](/appbar) with its menu button'],
    ['Offer the commands of a whole application', '[MenuBar](/menus), or [RibbonMenu](/ribbonmenu) for many commands in tabs'],
    ['Keep many commands in one bar at any width', '[Toolbar](/toolbar)'],
    ['Act on what is under the pointer', '[ContextMenu](/menus/context)'],
    ['Reach the main places on a phone', '[BottomNavigation](/bottomnavigation)'],
    ['Offer actions on a phone', '[ActionSheet](/actionsheet)'],
    ['Put content beside content, resizable', '[Splitter](/splitter)'],
];

const A11Y = [
    ['Landmarks', 'Bars are headers and navigation regions; the current place is marked with `aria-current`.'],
    ['Keyboard', 'Tabs, steps and bars are one Tab stop moved with the arrow keys, Home and End.'],
    ['Focus', 'A drawer, a sheet and a window keep focus inside while open and give it back when they close.'],
];

export default function NavigationOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Navigation components move the reader around an application and lay out its screens: bars at the top and bottom, menus and toolbars, tabs, paths, steps and pages, panels that slide in, and the containers that arrange everything." />
            </p>

            <Section anchor="demo" title="A project app">
                <p>
                    <Rich text="A top bar whose menu opens a drawer with the projects, a path, tabs with steps and expanding questions, a members list in pages, and a bar of sections at the bottom." />
                </p>
                <Example stack files={code('NavigationDemo.tsx')}>
                    <NavigationDemo />
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
                    <Rich text="The current place is a value with `x-model`: the selected tab, the step, the page, the open section; the application can set it as well as follow it." />
                </p>
                <p>
                    <Rich text="Panels that slide in work with a pointer, a finger and the keyboard: swipe to close, Escape, and focus kept inside while they are open." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
