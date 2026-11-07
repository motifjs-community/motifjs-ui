import { Component, FromService } from '@motifx/core';
import { BarGauge, Card, Chart, Gauge } from '@motifx-community/ui';
import { HomeModel } from '../HomeModel';
import { SunIcon } from '../icons';
import { LOAD, kw, kwh } from '../look';

/** Power now and today, what uses it, and the week. */
export default class EnergyScreen extends Component<HTMLDivElement> {
    private readonly model = FromService(HomeModel)!;

    constructor() {
        super('div');
    }

    override view() {
        const s = this.model.state;
        const share = () => Math.round((s.solarNow / Math.max(0.1, s.solarNow + s.gridNow)) * 100);
        const today = () => s.power.reduce((t, p) => t + p.grid / 4, 0);
        return (
            <div class="sh-energy-screen">
                <div class="sh-three">
                    <Card title="From the grid" subtitle="Now">
                        <div class="sh-stack">
                            <div class="sh-center">
                                <Gauge value={() => s.gridNow} min={0} max={6} ranges={LOAD} marker="needle" scale="ticks" tickInterval={1} format={kw} label="From the grid" size={170} />
                            </div>
                        </div>
                    </Card>
                    <Card title="Solar" subtitle={() => `${kw(s.solarNow)} now`}>
                        <div class="sh-stack">
                            <div class="sh-center">
                                <Gauge type="circle" value={share} format={{ style: 'unit', unit: 'percent' }} label="Of the power used now" size={150} />
                            </div>
                            <span class="sh-quiet sh-with-icon sh-centered">
                                <SunIcon />
                                Panels on the roof
                            </span>
                        </div>
                    </Card>
                    <Card title="Today" subtitle={() => `${kwh(today())} from the grid`}>
                        <div class="sh-stack">
                            <BarGauge class="sh-usage" data={() => s.usage} valueField="kwh" nameField="device" max={8} legend showLabels={false} format={kwh} label="Today by device" size={170} />
                        </div>
                    </Card>
                </div>
                <Card title="Power today">
                    <div class="sh-stack">
                        <Chart class="sh-power" label="Power today" data={() => s.power} xField="time" height={280} legend yAxis={{ min: 0, format: { maximumFractionDigits: 1 } }}
                            series={[
                                { yField: 'grid', name: 'From the grid', type: 'area' },
                                { yField: 'solar', name: 'Solar', type: 'area' }
                            ]} />
                    </div>
                </Card>
                <Card title="This week">
                    <div class="sh-stack">
                        <Chart label="This week" data={() => s.week} xField="day" height={240} stacked="normal" legend
                            series={[
                                { yField: 'grid', name: 'From the grid', type: 'bar' },
                                { yField: 'solar', name: 'Solar', type: 'bar' }
                            ]} />
                    </div>
                </Card>
            </div>
        );
    }
}
