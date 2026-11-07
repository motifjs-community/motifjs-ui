import { Component, FromService } from '@motifx/core';
import { Button, Card, ColorBox, Gauge, ListBox, Slider, Sparkline, Switch } from '@motifx-community/ui';
import { HomeModel } from '../HomeModel';
import type { Light } from '../home-types';
import { BulbIcon, DropIcon, MinusIcon, PlusIcon } from '../icons';
import { CLIMATE, degrees } from '../look';

/** One room at a time: its climate, its lights and its blinds. */
export default class RoomsScreen extends Component<HTMLDivElement> {
    private readonly model = FromService(HomeModel)!;

    constructor() {
        super('div');
    }

    private light(light: Light) {
        return (
            <div class="sh-light">
                <span class="sh-light-icon" data-on={() => light.on}>
                    <BulbIcon />
                </span>
                <Switch class="sh-light-switch" label={light.name} x-model={() => light.on} />
                <Slider class="sh-light-level" label={`${light.name} brightness`} labelMode="hidden" min={1} max={100} x-model={() => light.level} enabled={() => light.on}
                    format={{ style: 'unit', unit: 'percent' }} showValue="drag" />
                {light.color !== null ? <ColorBox class="sh-light-color" label={`${light.name} color`} labelMode="hidden" x-model={() => light.color} enabled={() => light.on} stretch /> : <span />}
            </div>
        );
    }

    override view() {
        const m = this.model;
        const s = m.state;
        const room = () => m.current;
        return (
            <div class="sh-rooms-screen">
                <Card class="sh-room-picker" title="Rooms">
                    <div class="sh-stack">
                        <ListBox label="Rooms" labelMode="hidden" items={() => s.rooms} textField="name" valueField="id" x-model={() => s.room} />
                    </div>
                </Card>
                <div class="sh-room-detail">
                    <Card class="sh-room-climate" title={() => room().name} subtitle={() => `${room().lights.filter(l => l.on).length} of ${room().lights.length} lights on`}>
                        <div class="sh-stack">
                            <div class="sh-room-climate-body">
                                <Gauge class="sh-room-gauge" value={() => room().temperature} min={10} max={30} ranges={CLIMATE} scale="ticks" tickInterval={5} format={degrees} label="Temperature"
                                    marks={() => [{ value: room().target, label: 'Target' }]} size={170} />
                                <div class="sh-room-facts">
                                    <div class="sh-stepper" role="group" aria-label="Target temperature">
                                        <Button icon={() => <MinusIcon />} variant="outline" hint="Cooler" onclick={() => m.nudge(-0.5, room())} />
                                        <span class="sh-target">
                                            <span class="sh-quiet">Target</span>
                                            <strong>{() => degrees(room().target)}</strong>
                                        </span>
                                        <Button icon={() => <PlusIcon />} variant="outline" hint="Warmer" onclick={() => m.nudge(0.5, room())} />
                                    </div>
                                    <span class="sh-quiet sh-with-icon">
                                        <DropIcon />
                                        {() => `Humidity ${room().humidity}%`}
                                    </span>
                                    <div class="sh-figure sh-figure--wide">
                                        <span class="sh-quiet">Last hours</span>
                                        <Sparkline data={() => room().history} label={() => `${room().name} temperature`} highlight={['min', 'max', 'last']} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card class="sh-room-lights-card" title="Lights">
                        <div class="sh-stack">
                            <div class="sh-lights">{room().lights.map(l => this.light(l))}</div>
                            <div class="sh-actions">
                                <Button text="All on" variant="outline" onclick={() => m.roomLights(room(), true)} />
                                <Button text="All off" variant="outline" onclick={() => m.roomLights(room(), false)} />
                            </div>
                        </div>
                    </Card>
                    <Card class="sh-room-blinds" title="Blinds">
                        <div class="sh-stack">
                            <Slider label="Open" min={0} max={100} step={5} value={() => room().blinds} onValueChanged={e => e.byUser && (room().blinds = e.value as number)}
                                format={{ style: 'unit', unit: 'percent' }} ticks={4} tickLabels stretch />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}
