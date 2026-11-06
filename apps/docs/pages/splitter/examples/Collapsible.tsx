import { reactive } from '@motifx/core';
import { SplitPane, Splitter, Stack } from '@motifx-community/ui';

/** The side panes can be collapsed with a button on the handle, Enter on it, or a double-click. The middle pane cannot. */
export default function Collapsible() {
    const s = reactive({ told: '' });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Splitter class="sp-fold" style="block-size: 200px" onCollapsed={e => (s.told = `${e.pane.text} ${e.collapsed ? 'hidden' : 'shown'}`)}>
                <SplitPane size={180} minSize={120} collapsible padding="md" text="Tree">
                    <p class="sp-note">Tree</p>
                </SplitPane>
                <SplitPane minSize={160} padding="md" text="Page">
                    <p class="sp-note">Page</p>
                </SplitPane>
                <SplitPane size={200} minSize={120} collapsible padding="md" text="Properties">
                    <p class="sp-note">Properties</p>
                </SplitPane>
            </Splitter>
            <output class="sp-fold-told">{() => s.told}</output>
        </Stack>
    );
}
