import { AppBar, TextBox } from '@motifx-community/ui';

/** A control between the title and the commands, written as a JSX child. */
export default function WithContent() {
    return (
        <AppBar class="ab-content" position="static" title="Customers" style="inline-size: 100%">
            <TextBox label="Search" labelMode="hidden" placeholder="Search customers" />
        </AppBar>
    );
}
