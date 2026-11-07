import { Sparkline } from '@motifx-community/ui';

const ROWS = [
    { name: 'Visits', now: '12,480', week: [9.1, 9.8, 10.2, 9.7, 11.3, 11.9, 12.5] },
    { name: 'Orders', now: '1,184', week: [1320, 1290, 1250, 1270, 1210, 1190, 1184] },
    { name: 'Returns', now: '38', week: [41, 39, 44, 37, 40, 36, 38] }
];

/** A trend beside each number, in a row of text. The last value is marked. */
export default function Trends() {
    return (
        <table class="sp-table">
            <tbody>
                {ROWS.map((row) => (
                    <tr>
                        <th scope="row">{row.name}</th>
                        <td>{row.now}</td>
                        <td>
                            <Sparkline data={row.week} label={`${row.name} this week`} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
