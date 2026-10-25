import { Button, Stack } from '@motifx-community/ui';

/** A button that opens a small form instead of a menu. */
export default function DropDown() {
  return (
    <Button
      text="Filter"
      variant="outline"
      dropDown={
        <Stack orientation="horizontal" wrap align="center" padding="sm">
          <label>
            From <input name="from" type="date" />
          </label>
          <label>
            To <input name="to" type="date" />
          </label>
        </Stack>
      }
    />
  );
}
