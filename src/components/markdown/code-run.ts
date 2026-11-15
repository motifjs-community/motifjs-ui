/** A piece of a line of code in one colour: a class of the app's stylesheet, or a colour. */
export interface CodeRun {
  text: string;
  className?: string;
  color?: string;
}
