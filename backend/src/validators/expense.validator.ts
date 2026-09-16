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
const paymentMethods = [
  "cash",
  "upi",
  "credit card",
  "debit card",
  "bank transfer",
  "other",
];
const datePattern = /^\d{4}-\d{2}-\d{2}$/; //YYYY-MM-DD
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
  if (body.category == null || body.category == "") {
    return "Please select the valid category";
  }
  if (typeof body.category !== "string") {
    return "Category must be a string";
  }
  if (!categories.includes(body.category.trim().toLowerCase())) {
    return "Please select the valid category";
  }
  if (body.shopName !== undefined) {
    if (typeof body.shopName !== "string") {
      return "shopName must be a string";
    }

    if (body.shopName.trim() === "") {
      return "shopName cannot be empty";
    }
  }
  if (typeof body.date !== "string") {
    return "Date must be a string";
  }

  if (!datePattern.test(body.date)) {
    return "Date must be in YYYY-MM-DD format";
  }

  const [year, month, day] = body.date.split("-").map(Number) as [
    number,
    number,
    number,
  ];

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return "Date must be a valid date";
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate > today) {
    return "Expense date cannot be in the future";
  }
  if (body.paymentMethod == null || body.paymentMethod == "") {
    return "Please select the valid payment method";
  }
  if (typeof body.paymentMethod !== "string") {
    return "paymentMethod must be a string";
  }
  if (!paymentMethods.includes(body.paymentMethod.trim().toLowerCase())) {
    return "Please select the valid payment method";
  }
  return null;
};
