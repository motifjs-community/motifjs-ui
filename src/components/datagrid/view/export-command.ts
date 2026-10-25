/** A command of the toolbar's export button: "Export all data to Excel", "Export selected rows to CSV". */
export interface ExportCommand {
  text: string;
  format: string;
  selected: boolean;
  enabled: boolean;
  run(): void;
}
