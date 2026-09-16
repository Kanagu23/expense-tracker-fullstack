import type { CreateExpenseRequest } from "../types/expense.types.js";
const categories = [
  "food",
  "travel",
  "shopping",
  "bills",
  "entertainment",
  "health",
  "education",
  "other",
];
export const validateCreateExpense = (
  body: CreateExpenseRequest,
): string | null => {
  if (typeof body.amount !== "number") {
    return "Amount must be a number";
  }

  if (!Number.isInteger(body.amount)) {
    return "Amount must be an integer";
  }

  if (body.amount <= 0) {
    return "Amount must be greater than 0";
  }
  if (
    body.category == null ||
    body.category == undefined ||
    body.category == ""
  ) {
    return "Please select the valid category";
  }
  if (typeof body.category !== "string") {
    return "Category must be a string";
  }
  if (!categories.includes(body.category.toLowerCase())) {
    return "Please select the valid category";
  }
  if (body.shopName !== null && body.shopName !== "") {
    if (typeof body.shopName !== "string") {
      return "shopName must be a string";
    }
  }

  return null;
};
