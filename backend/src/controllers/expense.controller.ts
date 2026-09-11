import type { Request, Response } from "express";
import type {CreateExpenseRequest} from "../types/expense.types.js"
export const expensesHandler = (req: Request<{},{},CreateExpenseRequest>, res: Response) => {
  console.log(req.body)
  res.status(201).json({
    message: "Expense endpoint reached"
  });
};