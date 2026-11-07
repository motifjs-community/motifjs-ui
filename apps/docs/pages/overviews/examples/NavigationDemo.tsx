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
