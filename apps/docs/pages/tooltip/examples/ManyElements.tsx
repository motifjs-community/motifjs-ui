import { addTooltip, Button, Stack } from '@motifx-community/ui';

const SEATS = ['1', '2', '3', '4', '5', '6'].flatMap((row) =>
  ['A', 'B', 'C', 'D'].map((letter) => ({
    id: `${row}${letter}`,
    note: `Row ${row}, seat ${letter}: ${letter === 'A' || letter === 'D' ? 'window' : 'aisle'}${row === '1' ? ', extra legroom' : ''}`,
  })),
);

/** A tooltip on each of 24 seats, made only when first needed, and one that is removed programmatically. */
export default function ManyElements() {
  let removeGuideTip = () => {};
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Seats">
        {SEATS.map((seat) => (
          <Button
            key={seat.id}
            ref={(b: Button) => {
              addTooltip(b, seat.note);
            }}
            text={seat.id}
            size="sm"
            variant="outline"
          />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button
          ref={(b: Button) => (removeGuideTip = addTooltip(b, { text: 'Opens the guide', placement: 'end' }))}
          text="Guide"
          variant="outline"
        />
        <Button text="Remove the guide's tooltip" variant="ghost" onclick={() => removeGuideTip()} />
      </Stack>
    </>
  );
}
