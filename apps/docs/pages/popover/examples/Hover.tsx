import type { Component } from '@motifx/core';
import { Avatar, Popover, Stack } from '@motifx-community/ui';

/** A card that opens while the pointer rests on a name, or when the name has keyboard focus. */
export default function Hover() {
    let name!: Component<HTMLAnchorElement>;
    return (
        <Stack orientation="horizontal" wrap align="center">
            <span>
                Reviewed by{' '}
                <a href="#ada" class="po-person" ref={(c: Component<HTMLAnchorElement>) => (name = c)} onclick={(e: Event) => e.preventDefault()}>
                    Ada Lovelace
                </a>
            </span>
            <Popover target={() => name} showOn="hover" placement="top" label="Ada Lovelace">
                <Stack orientation="horizontal" align="center">
                    <Avatar name="Ada Lovelace" size="lg" />
                    <Stack>
                        <strong>Ada Lovelace</strong>
                        <span>Analytical Engine, Programs</span>
                    </Stack>
                </Stack>
            </Popover>
        </Stack>
    );
}
