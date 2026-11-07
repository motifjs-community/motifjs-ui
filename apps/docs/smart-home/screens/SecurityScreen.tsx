import { Component, FromService, reactive } from '@motifx/core';
import { Button, Card, Gallery, OtpInput, Switch, Timeline, toast } from '@motifx-community/ui';
import { HomeModel } from '../HomeModel';
import { LockIcon, SecurityIcon, UnlockIcon } from '../icons';

/** A picture for the cameras: a coloured scene as a data address, so nothing is fetched. */
function camera(hue: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 30% 42%)"/><stop offset="1" stop-color="hsl(${hue + 30} 35% 18%)"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><rect x="120" y="180" width="200" height="270" fill="hsl(${hue} 20% 12% / 0.6)"/><rect x="430" y="120" width="250" height="160" fill="hsl(${hue + 180} 40% 80% / 0.25)"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/** The alarm, the doors, the cameras and what happened. */
export default class SecurityScreen extends Component<HTMLDivElement> {
    private readonly model = FromService(HomeModel)!;
    private readonly entry = reactive({ code: '' });

    constructor() {
        super('div');
    }

    private check(code: string): void {
        this.entry.code = '';
        if (code === '1234') {
            this.model.arm(false);
            toast.success('The alarm is off.');
        } else toast.danger('That code is not right.', { title: 'The alarm stays on' });
    }

    override view() {
        const m = this.model;
        const s = m.state;
        return (
            <div class="sh-security-screen">
                <Card class="sh-alarm" title="Alarm">
                    <div class="sh-stack">
                        <div class="sh-alarm-state" data-armed={() => s.armed}>
                            <SecurityIcon />
                            <div>
                                <strong>{() => (s.armed ? 'On' : 'Off')}</strong>
                                <span class="sh-quiet">{() => (s.armed ? 'Doors and motion are watched.' : 'Nothing is watched.')}</span>
                            </div>
                        </div>
                        {s.armed ? (
                            <OtpInput class="sh-code" label="Code to turn it off" length={4} masked x-model={() => this.entry.code} onCompleted={e => this.check(e.value)} helpText="The code of this demo is 1234." />
                        ) : (
                            <Button class="sh-arm" text="Turn the alarm on" tone="accent" onclick={() => m.arm(true)} stretch />
                        )}
                    </div>
                </Card>
                <Card class="sh-locks" title="Doors" subtitle={() => (m.unlocked.length ? `${m.unlocked.length} open` : 'All locked')}>
                    <div class="sh-stack">
                        <ul class="sh-doors">
                            {s.locks.map(lock => (
                                <li class="sh-door">
                                    <span class="sh-with-icon">
                                        {lock.locked ? <LockIcon /> : <UnlockIcon />}
                                        {lock.name}
                                    </span>
                                    <Switch label={`${lock.name} locked`} labelMode="hidden" x-model={() => lock.locked}
                                        onValueChanged={e => e.byUser && m.log(`${lock.name} ${e.value ? 'locked' : 'unlocked'}`, e.value ? 'success' : 'caution')} />
                                </li>
                            ))}
                        </ul>
                        <Button text="Lock every door" variant="outline" enabled={() => m.unlocked.length > 0} onclick={() => m.lockAll()} stretch />
                    </div>
                </Card>
                <Card class="sh-cameras" title="Cameras">
                    <div class="sh-stack">
                        <Gallery label="Cameras" height={300} stretchImages items={[
                            { image: camera(210), alt: 'The front door', text: 'Front door', description: 'No motion' },
                            { image: camera(120), alt: 'The garden', text: 'Garden', description: 'Motion 12 minutes ago' },
                            { image: camera(30), alt: 'The garage', text: 'Garage', description: 'No motion' }
                        ]} />
                    </div>
                </Card>
                <Card class="sh-events" title="What happened">
                    <div class="sh-stack">
                        <Timeline label="What happened" items={() => s.events.map(e => ({ key: e.key, date: e.date, title: e.title, tone: e.tone }))} dateFormat={{ hour: '2-digit', minute: '2-digit' }} />
                    </div>
                </Card>
            </div>
        );
    }
}
