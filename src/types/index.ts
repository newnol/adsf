export type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  user_id: string;
};