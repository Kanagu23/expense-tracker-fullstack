import type { Request, Response } from "express";
import type { CreateExpenseRequest } from "../types/expense.types.js";
import { validateCreateExpense } from "../validators/expense.validator.js";

export const expensesHandler = (
  req: Request<{}, {}, CreateExpenseRequest>,
  res: Response
) => {
  const error = validateCreateExpense(req.body);

  if (error) {
    return res.status(400).json({
      error
    });
  }

  console.log(req.body);

  return res.status(201).json({
    message: "Expense endpoint reached"
  });
};