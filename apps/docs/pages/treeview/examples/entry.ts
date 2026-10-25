/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
