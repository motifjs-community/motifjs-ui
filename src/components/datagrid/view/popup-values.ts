/** The edit window's options as the grid reads them: values, not functions. */
export interface PopupValues {
  title: string | undefined;
  showTitle: boolean;
  width: number | string | undefined;
  height: number | string | undefined;
  resizable: boolean;
  movable: boolean;
  showCloseButton: boolean;
  showMaximize: boolean;
  fullScreen: boolean;
}
