import { Component, FromService } from '@motifx/core';
import { Button, ButtonGroup, Card, Chart, Gauge } from '@motifx-community/ui';
import { HomeModel } from '../HomeModel';
import type { Room } from '../home-types';
import { MinusIcon, PlusIcon } from '../icons';
import { AIR, CLIMATE, MODES, degrees } from '../look';

/** Every room's temperature and target, the air, and the last hours. */
export default class ClimateScreen extends Component<HTMLDivElement> {
    private readonly model = FromService(HomeModel)!;

    constructor() {
        super('div');
    }

    private room(room: Room) {
        const m = this.model;
        return (
            <Card class="sh-climate-room" title={room.name}>
                <div class="sh-stack">
                    <div class="sh-center">
                        <Gauge value={() => room.temperature} min={10} max={30} ranges={CLIMATE} format={degrees} label={`${room.name} temperature`} showValue
                            marks={() => [{ value: room.target, label: 'Target' }]} size={120} />
                    </div>
                    <div class="sh-stepper sh-stepper--small" role="group" aria-label={`${room.name} target`}>
                        <Button icon={() => <MinusIcon />} variant="ghost" size="sm" hint="Cooler" onclick={() => m.nudge(-0.5, room)} />
                        <strong>{() => degrees(room.target)}</strong>
                        <Button icon={() => <PlusIcon />} variant="ghost" size="sm" hint="Warmer" onclick={() => m.nudge(0.5, room)} />
                    </div>
                </div>
            </Card>
        );
    }

    override view() {
        const m = this.model;
        const s = m.state;
        // One row an hour, one column a room: the chart's rows, made from the rooms' histories.
        const hours = () =>
            s.rooms[0].history.map((_, i) => {
                const row: Record<string, number> = { hour: i - s.rooms[0].history.length + 1 };
                for (const r of s.rooms) row[r.id] = r.history[i];
                return row;
            });
        return (
            <div class="sh-climate-screen">
                <div class="sh-section-head">
                    <h2 class="sh-section-title">Rooms</h2>
                    <ButtonGroup label="Mode" items={MODES} x-model={() => s.mode} />
                </div>
                <div class="sh-climate-rooms">{s.rooms.map(r => this.room(r))}</div>
                <div class="sh-two">
                    <Card class="sh-air" title="Air" subtitle="Living room sensor">
                        <div class="sh-stack">
                            <div class="sh-center sh-air-gauges">
                                <Gauge angle={180} value={() => s.air} ranges={AIR} marker="needle" fill={false} scale="ticks" tickInterval={25} label="Air quality index" size={170} />
                                <Gauge type="linear" orientation="vertical" size={130} value={() => s.humidity} scale="ends" label="Humidity" format={{ style: 'unit', unit: 'percent' }} />
                            </div>
                        </div>
                    </Card>
                    <Card class="sh-history" title="Last hours">
                        <div class="sh-stack">
                            <Chart class="sh-hours" label="Temperature in the last hours" data={hours} xField="hour" height={320} legend
                                xAxis={{ format: (v: number) => (v === 0 ? 'now' : `${v}h`) }} yAxis={{ format: { maximumFractionDigits: 0 } }}
                                series={s.rooms.map(r => ({ yField: r.id, name: r.name, smooth: true }))} />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}
