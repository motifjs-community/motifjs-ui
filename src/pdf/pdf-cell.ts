/**
 * A cell as the PDF draws it (`PdfCell`): its text and look. `customizeCell` changes it
 * before the rows are measured; sizes are in the units the jsPDF document was made with, the font
 * size in points.
 */
export interface PdfCell {
  text: string;
  font: { size: number; name?: string; style?: 'normal' | 'bold' | 'italic' | 'bolditalic' };
  /** A hex color, such as `'#000000'`. */
  textColor: string;
  /** A hex color; none leaves the cell clear. */
  backgroundColor?: string;
  borderColor: string;
  borderWidth: number;
  drawLeftBorder: boolean;
  drawRightBorder: boolean;
  drawTopBorder: boolean;
  drawBottomBorder: boolean;
  horizontalAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  padding: { top: number; right: number; bottom: number; left: number };
  /** Long text goes on to more lines; off, a line that does not fit ends in "…". */
  wordWrapEnabled: boolean;
}
