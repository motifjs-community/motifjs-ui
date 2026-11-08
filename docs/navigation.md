# Navigation

> Navigation · @motifx-community/ui 0.1.0-beta.7

Navigation components move the reader around an application and lay out its screens: bars at the top and bottom, tabs, paths, steps and pages, panels that slide in, and the containers that arrange everything.

## A project app

A top bar whose menu opens a drawer with the projects, a path, tabs with steps and expanding questions, a members list in pages, and a bar of sections at the bottom.

```tsx
import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, AppBar, BottomNavigation, Breadcrumb, Drawer, ListBox, Pagination, Stepper, Tab, Tabs } from '@motifx-community/ui';

const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;

const PROJECTS = [
    { id: 'web', text: 'Web shop' },
    { id: 'mobile', text: 'Mobile app' },
    { id: 'design', text: 'Design system' }
];

const MEMBERS = Array.from({ length: 46 }, (_, i) => `Member ${i + 1}`);

/** A project app: a top bar with a menu that opens a drawer, a path, tabs with steps, questions and pages, and a bar at the bottom. */
export default function NavigationDemo() {
    const s = reactive({ open: false, project: 'web' as unknown, step: 1, page: 1, place: 'projects' as unknown, told: 'nothing yet' });
    const project = () => PROJECTS.find(p => p.id === s.project)?.text ?? '';
    const pageOf = () => MEMBERS.slice((s.page - 1) * 8, s.page * 8);

    return (
        <div class="ov-frame ov-frame--flush ov-navigation">
            <AppBar
                position="static"
                title={project}
                subtitle="Projects"
                navigation="menu"
                onNavigationClick={() => (s.open = true)}
                actions={[
                    { icon: icon('search'), hint: 'Search', click: () => (s.told = 'search') },
                    { icon: icon('download'), hint: 'Download', click: () => (s.told = 'download') },
                    { icon: icon('trash'), hint: 'Delete', click: () => (s.told = 'delete') }
                ]}
            />
            <Drawer title="Projects" showClose x-model={() => s.open}>
                <ListBox label="Projects" items={PROJECTS} textField="text" valueField="id" x-model={() => s.project} onclick={() => (s.open = false)} />
            </Drawer>
            <div class="ov-body">
                <Breadcrumb label="Path" items={() => [{ text: 'Home' }, { text: 'Projects' }, { text: project() }]} onItemClick={e => (s.told = String((e.item as { text?: string }).text ?? ''))} />
                <Tabs label="Project">
                    <Tab title="&Progress">
                        <div class="ov-stack ov-pad">
                            <Stepper label="Release" items={['Plan', 'Build', 'Test', 'Release']} x-model={() => s.step} clickable />
                            <Accordion>
                                <AccordionItem title="What happens in this step?" expanded>
                                    {() => ['The scope is agreed.', 'The features are built.', 'Every feature is tested.', 'The release goes out.'][s.step]}
                                </AccordionItem>
                                <AccordionItem title="Who signs it off?">The project lead and the product owner.</AccordionItem>
                            </Accordion>
                        </div>
                    </Tab>
                    <Tab title="&Members" badge={MEMBERS.length}>
                        <div class="ov-stack ov-pad">
                            <ul class="ov-file-list">
                                {pageOf().map(m => (
                                    <li>{m}</li>
                                ))}
                            </ul>
                            <Pagination label="Members" total={MEMBERS.length} pageSize={8} x-model={() => s.page} showInfo />
                        </div>
                    </Tab>
                    <Tab title="&Settings">
                        <p class="ov-pad ov-copy">Settings of the project go here.</p>
                    </Tab>
                </Tabs>
            </div>
            <BottomNavigation
                position="static"
                label="Sections"
                x-model={() => s.place}
                items={[
                    { value: 'projects', text: 'Projects', glyph: 'star', activeGlyph: 'star-filled' },
                    { value: 'inbox', text: 'Inbox', glyph: 'file', badge: 4 },
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },
                    { value: 'profile', text: 'Profile', glyph: 'person' }
                ]}
            />
        </div>
    );
}
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[AppBar](appbar.md)` | The bar at the top of an application. |
| `[BottomNavigation](bottomnavigation.md)` | The main places of an application at the bottom of a phone screen. |
| `[Tabs](tabs.md)` | Views of the same thing, one at a time. |
| `[Breadcrumb](breadcrumb.md)` | Where the reader is in a hierarchy. |
| `[Pagination](pagination.md)` | Pages of a long list. |
| `[Stepper](stepper.md) and [Wizard](wizard.md)` | A task in steps, with or without the pages of each step. |
| `[Accordion](accordion.md)` | Sections that expand and collapse. |
| `[MultiView](multiview.md)` | Pages swiped one after another. |
| `[Window](window.md), [BottomSheet](bottomsheet.md), [Drawer](drawer.md), [ActionSheet](actionsheet.md)` | Panels over the page: a window, a sheet from the bottom, a drawer from a side, actions on a phone. |
| `[Layout](layout.md), [Splitter](splitter.md), [Resizable](resizable.md)` | Stacks, grids, docked panels, and panels the reader resizes. |
| `[Draggable](draggable.md), [Sortable](sortable.md), [ScrollView](scrollview.md), [FormLayout](formlayout.md)` | Dragging, reordering, scrolling with pull to refresh, and forms laid out from data. |

## Choosing a component

Several components can do the same job; this table points to the one that reads best for it.

| To | Use |
| --- | --- |
| `Switch between views of the same thing` | [Tabs](tabs.md) |
| `Show where the reader is` | [Breadcrumb](breadcrumb.md) |
| `Guide a task in order` | [Wizard](wizard.md), or [Stepper](stepper.md) for the steps alone |
| `Split a long list` | [Pagination](pagination.md) |
| `Fold away sections` | [Accordion](accordion.md) |
| `Give an application its menu` | [Drawer](drawer.md), or [AppBar](appbar.md) with its menu button |
| `Reach the main places on a phone` | [BottomNavigation](bottomnavigation.md) |
| `Offer actions on a phone` | [ActionSheet](actionsheet.md) |
| `Put content beside content, resizable` | [Splitter](splitter.md) |

## What they share

The current place is a value with `x-model`: the selected tab, the step, the page, the open section; the application can set it as well as follow it.

Panels that slide in work with a pointer, a finger and the keyboard: swipe to close, Escape, and focus kept inside while they are open.

## Accessibility

| Topic | Details |
| --- | --- |
| `Landmarks` | Bars are headers and navigation regions; the current place is marked with `aria-current`. |
| `Keyboard` | Tabs, steps and bars are one Tab stop moved with the arrow keys, Home and End. |
| `Focus` | A drawer, a sheet and a window keep focus inside while open and give it back when they close. |

## Feedback

Loading issues…
