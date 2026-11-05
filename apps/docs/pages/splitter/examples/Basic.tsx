import { SplitPane, Splitter } from '@motifx-community/ui';

/** Three panes: a fixed one in pixels with a least size, one that takes what is left, and a share. */
export default function Basic() {
    return (
        <Splitter class="sp-basic" style="block-size: 240px">
            <SplitPane size={220} minSize={140} padding="md" text="Folders">
                <p class="sp-note">Folders, 220 px to start, never under 140.</p>
            </SplitPane>
            <SplitPane minSize={120} padding="md" text="Messages">
                <p class="sp-note">Messages take what the others leave.</p>
            </SplitPane>
            <SplitPane size="30%" minSize={100} padding="md" text="Preview">
                <p class="sp-note">Preview, three tenths of the room the shares divide.</p>
            </SplitPane>
        </Splitter>
    );
}
