import { Component, FromService, useNavigation } from '@motifx/core';
import { Button, ButtonGroup, Card, Chip, Gauge, Sparkline, Switch, Timeline, toast } from '@motifx-community/ui';
import { HomeModel } from '../HomeModel';
import type { Room, Scene } from '../home-types';
import { DoorIcon, DropIcon, FilmIcon, HomeIcon, LockIcon, MinusIcon, MoonIcon, PlusIcon, SunIcon, UnlockIcon } from '../icons';
import { CLIMATE, LOAD, MODES, degrees, kw } from '../look';

const SCENES: { key: Scene; name: string; note: string; icon: () => unknown }[] = [
    { key: 'home', name: 'At home', note: 'Lights at 80%, 22°', icon: HomeIcon },
    { key: 'away', name: 'Away', note: 'Lights off, 17°, alarm on', icon: DoorIcon },
    { key: 'movie', name: 'Movie', note: 'Lights low, blinds down', icon: FilmIcon },
    { key: 'night', name: 'Night', note: 'Lights off, 19°, alarm on', icon: MoonIcon }
];

/** The home at a glance: scenes, climate, energy, security, the rooms and what happened. */
export default class HomeScreen extends Component<HTMLDivElement> {
    private readonly model = FromService(HomeModel)!;
    private readonly nav = useNavigation();

    constructor() {
        super('div');
    }

    private scene(scene: Scene): void {
        if (scene === this.model.state.scene) return;
        const undo = this.model.setScene(scene);
        toast.info(`${SCENES.find(s => s.key === scene)?.name} is on.`, { action: { text: 'Undo', click: undo } });
    }

    private open(room: Room): void {
        this.model.state.room = room.id;
        void this.nav.navigate('/rooms');
    }

    private roomTile(room: Room) {
        const m = this.model;
        const on = () => room.lights.filter(l => l.on).length;
        return (
            <Card class="sh-room-tile" title={room.name} clickable onclick={() => this.open(room)}>
                <div class="sh-stack">
                    <div class="sh-room-figures">
                        <span class="sh-big">{() => degrees(room.temperature)}</span>
                        <span class="sh-quiet sh-with-icon">
                            <DropIcon />
                            {() => `${room.humidity}%`}
                        </span>
                    </div>
                    <div class="sh-room-lights" onclick={(e: Event) => e.stopPropagation()}>
                        <span class="sh-quiet">{() => `${on()} of ${room.lights.length} lights`}</span>
                        <Switch label={`${room.name} lights`} labelMode="hidden" value={() => on() > 0} onValueChanged={e => e.byUser && m.roomLights(room, e.value === true)} />
                    </div>
                </div>
            </Card>
        );
    }

    override view() {
        const m = this.model;
        const s = m.state;
        return (
            <div class="sh-dash">
                <section class="sh-scenes" aria-label="Scenes">
                    {SCENES.map(scene => {
                        const Icon = scene.icon as () => Node;
                        return (
                            <button class="sh-scene" type="button" aria-pressed={() => s.scene === scene.key} onclick={() => this.scene(scene.key)}>
                                <span class="sh-scene-icon">
                                    <Icon />
                                </span>
                                <span class="sh-scene-name">{scene.name}</span>
                                <span class="sh-quiet">{scene.note}</span>
                            </button>
                        );
                    })}
                </section>

                <Card class="sh-climate" title="Climate" subtitle={() => `Average of ${s.rooms.length} rooms`}>
                    <div class="sh-stack">
                        <div class="sh-center">
                            <Gauge class="sh-indoor" value={() => m.indoor} min={10} max={30} ranges={CLIMATE} scale="ticks" tickInterval={5} format={degrees} label="Indoors"
                                marks={() => [{ value: m.target, label: 'Target' }]} size={180} />
                        </div>
                        <div class="sh-stepper" role="group" aria-label="Target temperature">
                            <Button icon={() => <MinusIcon />} variant="outline" hint="Cooler" onclick={() => m.nudge(-0.5)} />
                            <span class="sh-target">
                                <span class="sh-quiet">Target</span>
                                <strong>{() => degrees(m.target)}</strong>
                            </span>
                            <Button icon={() => <PlusIcon />} variant="outline" hint="Warmer" onclick={() => m.nudge(0.5)} />
                        </div>
                        <ButtonGroup class="sh-modes" label="Mode" items={MODES} x-model={() => s.mode} stretch />
                    </div>
                </Card>

                <Card class="sh-energy" title="Energy" subtitle="Now">
                    <div class="sh-stack">
                        <div class="sh-center">
                            <Gauge value={() => s.gridNow} min={0} max={6} ranges={LOAD} marker="needle" scale="ticks" tickInterval={1} format={kw} label="From the grid" size={180} />
                        </div>
                        <div class="sh-figures">
                            <div class="sh-figure">
                                <SunIcon />
                                <span class="sh-quiet">Solar</span>
                                <strong>{() => kw(s.solarNow)}</strong>
                            </div>
                            <div class="sh-figure sh-figure--wide">
                                <span class="sh-quiet">Today</span>
                                <Sparkline data={() => s.power.map(p => p.grid)} label="From the grid today" type="area" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card class="sh-security" title="Security" subtitle={() => (s.armed ? 'Alarm on: doors and motion are watched' : 'Alarm off')}>
                    <div class="sh-stack">
                        <ul class="sh-doors">
                            {s.locks.map(lock => (
                                <li class="sh-door">
                                    <span class="sh-with-icon">
                                        {lock.locked ? <LockIcon /> : <UnlockIcon />}
                                        {lock.name}
                                    </span>
                                    <Chip text={() => (lock.locked ? 'Locked' : 'Open')} tone={() => (lock.locked ? 'success' : 'caution')} size="sm" />
                                </li>
                            ))}
                        </ul>
                        <div class="sh-actions">
                            <Button text="Lock every door" variant="outline" enabled={() => m.unlocked.length > 0} onclick={() => m.lockAll()} />
                            <Button text={() => (s.armed ? 'Turn the alarm off…' : 'Turn the alarm on')} tone="accent" onclick={() => (s.armed ? void this.nav.navigate('/security') : m.arm(true))} />
                        </div>
                    </div>
                </Card>

                <section class="sh-rooms" aria-labelledby="sh-rooms-title">
                    <div class="sh-section-head">
                        <h2 id="sh-rooms-title" class="sh-section-title">Rooms</h2>
                        <Button text="All lights off" variant="ghost" enabled={() => m.lightsOn > 0} onclick={() => m.allLights(false)} />
                    </div>
                    <div class="sh-room-grid">{s.rooms.map(room => this.roomTile(room))}</div>
                </section>

                <Card class="sh-activity" title="Activity">
                    <div class="sh-stack">
                        <Timeline label="Activity" items={() => s.events.slice(0, 5).map(e => ({ key: e.key, date: e.date, title: e.title, tone: e.tone }))} dateFormat={{ hour: '2-digit', minute: '2-digit' }} />
                    </div>
                </Card>
            </div>
        );
    }
}
