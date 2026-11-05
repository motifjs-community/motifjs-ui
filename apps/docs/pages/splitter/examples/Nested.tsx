import { SplitPane, Splitter } from '@motifx-community/ui';

/** A pane may hold another splitter: here the right pane is split the other way. */
export default function Nested() {
    return (
        <Splitter class="sp-nested" style="block-size: 260px">
            <SplitPane size={200} minSize={120} padding="md" text="Navigation">
                <p class="sp-note">Navigation</p>
            </SplitPane>
            <SplitPane minSize={200}>
                <Splitter class="sp-inner" orientation="vertical">
                    <SplitPane minSize={80} padding="md" text="Editor">
                        <p class="sp-note">Editor</p>
                    </SplitPane>
                    <SplitPane size={90} minSize={60} collapsible padding="md" text="Output">
                        <p class="sp-note">Output</p>
                    </SplitPane>
                </Splitter>
            </SplitPane>
        </Splitter>
    );
}
