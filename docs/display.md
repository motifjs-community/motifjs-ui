# Display

> Display · @motifx-community/ui 0.1.0-beta.11

Display components present content: people, counts and labels, cards, pictures, tiles, events in time, codes to scan, and placeholders while content loads.

## A profile

A card with an avatar and placeholders while it loads, skills as chips to choose, the team as an avatar group, figures as tiles, projects in a gallery, the year on a timeline, codes to share, and a badge with the unread count.

```tsx
import { reactive } from '@motifx/core';
import { Avatar, AvatarGroup, Badge, Barcode, Button, Card, Chip, ChipGroup, Gallery, QRCode, Skeleton, Switch, TileView, Timeline } from '@motifx-community/ui';

/** A picture for the gallery: a coloured scene as a data address, so nothing is fetched. */
function scene(hue: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 58%)"/><stop offset="1" stop-color="hsl(${hue + 40} 60% 32%)"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><circle cx="640" cy="120" r="64" fill="hsl(${hue + 180} 70% 88% / 0.55)"/><path d="M0 330 Q200 250 400 330 T800 330 V450 H0 Z" fill="hsl(${hue + 20} 50% 25% / 0.5)"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const SKILLS = ['Design systems', 'Accessibility', 'Motion', 'Research', 'Prototyping'];

const STATS = [
    { key: 'projects', text: 'Projects', value: '18', wide: 2 },
    { key: 'reviews', text: 'Reviews', value: '124', wide: 1 },
    { key: 'talks', text: 'Talks', value: '6', wide: 1 }
];

/** A profile: a card with an avatar and a badge, skills as chips, figures as tiles, projects in a gallery, the year on a timeline, and codes to share; with placeholders while it loads. */
export default function DisplayDemo() {
    const s = reactive({ loading: false, skills: ['Design systems', 'Accessibility'] as unknown, messages: 3 });
    const tile = (stat: (typeof STATS)[number]) => () => (
        <div class="ov-stat">
            <strong>{stat.value}</strong>
            <span>{stat.text}</span>
        </div>
    );

    return (
        <div class="ov-frame ov-display">
            <div class="ov-bar">
                <Switch label="Show as loading" x-model={() => s.loading} />
                <span style="flex: 1 1 auto" />
                <Button text="Messages" variant="outline" onclick={() => (s.messages = 0)}>
                    <Badge count={() => s.messages} position="top-end" label="Unread messages" />
                </Button>
            </div>
            <div class="ov-grid">
                <Card title="Ada Yılmaz" subtitle="Lead designer, Ankara" avatar={{ name: 'Ada Yılmaz', status: 'online' }}>
                    <Skeleton lines={3} loading={() => s.loading}>
                        <p class="ov-copy">Works on the design system and its five design languages, and leads the accessibility reviews.</p>
                    </Skeleton>
                    <ChipGroup selection="multiple" label="Skills" x-model={() => s.skills}>
                        {SKILLS.map(skill => (
                            <Chip text={skill} />
                        ))}
                    </ChipGroup>
                    <div class="ov-bar">
                        <span class="ov-muted">Works with</span>
                        <AvatarGroup max={3} total={7} label="Team">
                            <Avatar name="Deniz Kaya" />
                            <Avatar name="Elif Demir" />
                            <Avatar name="Mert Şahin" />
                            <Avatar name="Selin Aydın" />
                        </AvatarGroup>
                    </div>
                </Card>
                <div class="ov-stack">
                    <TileView label="Figures" height={150} baseItemWidth={110} baseItemHeight={64} items={STATS.map(st => ({ key: st.key, widthRatio: st.wide, content: tile(st) }))} />
                    <Gallery
                        label="Projects"
                        height={180}
                        items={[
                            { image: scene(205), alt: 'The booking app', text: 'Booking app' },
                            { image: scene(30), alt: 'The new store', text: 'Store' },
                            { image: scene(280), alt: 'The dashboard', text: 'Dashboard' }
                        ]}
                    />
                </div>
                <Timeline
                    label="This year"
                    items={[
                        { date: '2026-02-10', title: 'Joined the design system team', tone: 'info' },
                        { date: '2026-05-21', title: 'Shipped the new color tokens', tone: 'success' },
                        { date: '2026-09-03', title: 'Spoke at the accessibility meetup', glyph: 'person' },
                        { date: '2026-11-07', title: 'Leads the gauge review' }
                    ]}
                />
                <div class="ov-codes">
                    <QRCode value="https://ui.motifjs.com/display" size={120} label="Profile address" />
                    <Barcode value="EMP-20460" format="code128" height={56} label="Staff number" />
                </div>
            </div>
        </div>
    );
}
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[QRCode](qrcode.md)` | A code to scan, drawn as vectors. |
| `[Barcode](barcode.md)` | Code 128, Code 39, EAN, UPC and Interleaved 2 of 5. |
| `[Badge](badge.md)` | A count or a dot on a corner of another control. |
| `[Avatar](avatar.md)` | A person as a picture or initials, alone or in a group. |
| `[Chip](chip.md)` | A small label to choose, remove or press, alone or in a group. |
| `[Card](card.md)` | A summary of one thing, with media, a title, content and actions. |
| `[Gallery](gallery.md)` | Pictures or content one at a time, swiped or played as a slideshow. |
| `[TileView](tileview.md)` | Tiles of different sizes on a grid, chosen and reordered. |
| `[Timeline](timeline.md)` | Events in the order they happened, down or across. |
| `[Skeleton](skeleton.md)` | The shape of content that is still loading. |

## Choosing a component

Several components can do the same job; this table points to the one that reads best for it.

| To | Use |
| --- | --- |
| `Show a count on something` | [Badge](badge.md) |
| `Show a person` | [Avatar](avatar.md) |
| `Show tags or quick filters` | [Chip](chip.md) |
| `Summarize one thing` | [Card](card.md) |
| `Show pictures one at a time` | [Gallery](gallery.md) |
| `Lay out items of different sizes` | [TileView](tileview.md) |
| `Show events in time` | [Timeline](timeline.md) |
| `Give a code to scan` | [QRCode](qrcode.md) or [Barcode](barcode.md) |
| `Keep the layout while content loads` | [Skeleton](skeleton.md) |

## What they share

Content comes as props, as JSX children, or as a function that builds it, so a card or a tile can hold any control of the kit.

Pictures that fail to load fall back to something readable: an avatar to initials, a gallery to its caption.

## Accessibility

| Topic | Details |
| --- | --- |
| `Names` | Codes, avatars and badges have a label that says what they show. |
| `Collections` | A gallery, a tile view and a timeline are one Tab stop, moved through with the arrow keys. |
| `Loading` | A skeleton is marked busy while it waits, and its content is read once it arrives. |

## Feedback

Loading issues…
