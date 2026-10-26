/** A task of the drag and drop examples. */
export interface Task {
  id: number;
  title: string;
  owner: string;
  priority: string;
  /** Its place in the list, as a server keeps it. */
  order: number;
}
