/** A summary item ready to draw: its text, the text that names its column, its alignment and class. */
export interface SummaryPart {
  text: string;
  label: string;
  align: 'start' | 'center' | 'end' | undefined;
  cssClass: string | undefined;
}
