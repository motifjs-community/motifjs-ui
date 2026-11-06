/**
 * A cell as the PDF draws it: its text and appearance. `customizeCell` changes it before the rows are
 * measured. Sizes are in the units the jsPDF document was created with, and the font size is in points.
 */
export interface PdfCell {
  text: string;
  font: { size: number; name?: string; style?: 'normal' | 'bold' | 'italic' | 'bolditalic' };
  /** A hex color, such as `'#000000'`. */
  textColor: string;
  /** A hex color. When omitted, the cell has no background. */
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
  /** Wraps long text to more lines. When off, a line that does not fit ends in "…". */
  wordWrapEnabled: boolean;
}
