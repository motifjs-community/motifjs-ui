import { BarGauge } from '@motifx-community/ui';

interface Team {
    team: string;
    done: number;
    planned: number;
}

const TEAMS: Team[] = [
    { team: 'Design', done: 18, planned: 24 },
    { team: 'Web', done: 31, planned: 36 },
    { team: 'Mobile', done: 12, planned: 30 }
];

/** Rows read through fields: the value is worked out by a function, the share of the work done. */
export default function Rows() {
    return (
        <BarGauge<Team> class="bg-rows" data={TEAMS} valueField={t => Math.round((t.done / t.planned) * 100)} nameField="team" legend
            format={{ style: 'unit', unit: 'percent' }} label="Work done" />
    );
}
