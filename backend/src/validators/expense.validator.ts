import type { CreateExpenseRequest } from "../types/expense.types.js";

export const validateCreateExpense = (body: CreateExpenseRequest): string | null => {
  if (typeof body.amount !== "number") {
    return "Amount must be a number";
  }

  if (!Number.isInteger(body.amount)) {
    return "Amount must be an integer";
  }

  if (body.amount <= 0) {
    return "Amount must be greater than 0";
  }

  return null;
};