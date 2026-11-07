import { Chart } from '@motifx-community/ui';

const READINGS = [
    { hour: '08:00', room: 19 },
    { hour: '09:00', room: 20 },
    { hour: '10:00', room: null },
    { hour: '11:00', room: 22 },
    { hour: '12:00', room: 23 },
    { hour: '13:00', room: null },
    { hour: '14:00', room: 24 },
    { hour: '15:00', room: null },
    { hour: '16:00', room: 22 }
];

/** An empty value breaks a line, as nothing was measured. `gaps` can join past it instead. */
export default function Gaps() {
    return (
        <Chart
            class="ch-gaps"
            title="Room temperature"
            data={READINGS}
            xField="hour"
            series={[
                { yField: 'room', name: 'Broken', markers: true },
                { yField: (row: { room: number | null }) => (row.room === null ? null : row.room + 4), name: 'Joined', gaps: 'connect', step: 'middle' }
            ]}
        />
    );
}
