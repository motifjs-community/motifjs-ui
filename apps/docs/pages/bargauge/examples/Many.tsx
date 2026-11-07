import { BarGauge } from '@motifx-community/ui';

const SKILLS = [
    { name: 'Reading', value: 82 },
    { name: 'Writing', value: 64 },
    { name: 'Listening', value: 91 },
    { name: 'Speaking', value: 58 },
    { name: 'Grammar', value: 73 },
    { name: 'Vocabulary', value: 69 },
    { name: 'Spelling', value: 77 },
    { name: 'Pronunciation', value: 61 }
];

/** Eight bars: they grow thinner so the middle stays open. */
export default function Many() {
    return <BarGauge class="bg-many" data={SKILLS} valueField="value" nameField="name" size={260} showLabels={false} legend label="Skills" />;
}
