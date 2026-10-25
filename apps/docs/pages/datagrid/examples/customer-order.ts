/** One order of a customer, for the master-detail examples. */
export interface CustomerOrder {
  id: number;
  customerId: number;
  date: string;
  item: string;
  quantity: number;
  amount: number;
}
