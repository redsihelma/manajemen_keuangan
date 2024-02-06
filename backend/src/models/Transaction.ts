export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
}
