import type { IBaseProp } from '@motifx/core';
import { ComboBox } from './ComboBox';
import type { ComboBoxProps } from './combo-box-props';

/**
 * A text field that suggests items during typing. The value is the text itself, picked from the list
 * or typed freely.
 *
 * @example
 * <Autocomplete label="Search" items={recentSearches} x-model={() => this.query} />
 */
export class Autocomplete<T = unknown> extends ComboBox<T, string> {
  constructor(props?: IBaseProp<ComboBoxProps<T, string>>) {
    super(props);
    this.element.classList.add('mx-autocomplete');
    const own = (this.props ?? {}) as ComboBoxProps<T, string>;
    if (own.acceptCustomValue === undefined) this.acceptCustomValue = true;
    if (own.showDropDownButton === undefined) this.showDropDownButton = false;
  }

  protected override emptyValue(): string {
    return '';
  }

  protected override itemValue(item: T): unknown {
    return this.itemText(item);
  }

  protected override customValue(text: string): string {
    return text;
  }

  protected override textOfValue(value: string | null): string {
    return value ?? '';
  }
}
