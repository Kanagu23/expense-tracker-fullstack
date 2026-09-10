interface CreateExpenseRequest {
  amount: number;
  category: string;
  shopName?: string;
  date: string;
  notes?: string;
  paymentMethod: string;
}