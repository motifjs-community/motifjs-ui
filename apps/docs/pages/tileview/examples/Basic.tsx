import { TileView } from '@motifx-community/ui';

/** Tiles of one, two and four base cells packed down the columns; the view scrolls sideways when they do not fit. */
export default function Basic() {
    return (
        <TileView
            class="tv-board"
            label="Board"
            height={330}
            baseItemWidth={120}
            baseItemHeight={100}
            items={[
                { text: 'Sales today', widthRatio: 2 },
                { text: 'Orders' },
                { text: 'Returns' },
                { text: 'Visitors this week', widthRatio: 2, heightRatio: 2 },
                { text: 'Stock' },
                { text: 'Staff on duty', heightRatio: 2 },
                { text: 'Tickets' },
                { text: 'Deliveries', widthRatio: 2 },
                { text: 'Reviews' },
                { text: 'Costs' }
            ]}
        />
    );
}
