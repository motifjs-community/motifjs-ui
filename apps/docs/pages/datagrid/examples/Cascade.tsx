import { data } from '@motifx-community/data';
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { DISTRICTS, PROVINCES } from './places';

type Branch = { id: number; name: string; province: string | null; district: number | null };

const branches: Branch[] = [
  { id: 1, name: 'Head office', province: 'AN', district: 1 },
  { id: 2, name: 'Harbour', province: 'IZ', district: 9 },
  { id: 3, name: 'Bridge', province: 'IS', district: 6 },
  { id: 4, name: 'Not placed yet', province: null, district: null },
];

const columns: GridColumn<Branch>[] = [
  { field: 'name', title: 'Branch', width: 160, flex: 1, required: true },
  {
    field: 'province',
    title: 'Province',
    width: 150,
    lookup: { dataSource: PROVINCES, valueField: 'code', textField: 'name' },
    // Another province empties the district.
    setCellValue: (values) => {
      values.district = null;
    },
  },
  {
    field: 'district',
    title: 'District',
    width: 150,
    lookup: {
      dataSource: DISTRICTS,
      valueField: 'id',
      textField: 'name',
      allowClearing: true,
      // The districts of the row's province; every district for the filter lists.
      filter: (row) => (row ? data.where('province', '=', row.province) : null),
    },
  },
];

/** Province and district: a new province clears the district, whose list follows the province and waits for one. */
export default function Cascade() {
  return (
    <DataGrid
      class="dg-cascade"
      style="block-size: 24rem"
      rows={branches}
      rowKey="id"
      columns={columns}
      label="Branches"
      locale="en"
      settings={{ editable: true, addRows: true, filterRow: true, headerFilter: true }}
      newRow={{ create: () => ({ id: Math.max(0, ...branches.map((b) => b.id)) + 1, province: null, district: null }) }}
      onEditorPreparing={(e) => {
        if (e.field === 'district') e.options.enabled = e.row.province !== null;
      }}
    />
  );
}
